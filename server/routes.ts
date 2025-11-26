import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoHighLevelService } from "./utils/ghl";
import { generateReportEmailHTML } from "./utils/email-templates";
import { pdfReportDataSchema, type PdfReportData } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const ghlService = new GoHighLevelService();

  // POST /api/submit-email - Send beautiful HTML email report via GHL
  app.post("/api/submit-email", async (req, res) => {
    try {
      // Validate request body
      const bodySchema = z.object({
        email: z.string().email(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        diagnosticData: pdfReportDataSchema,
        sessionId: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
      });

      const validationResult = bodySchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.format(),
        });
      }

      let { email, firstName, lastName, diagnosticData, sessionId, utmSource, utmMedium, utmCampaign } = validationResult.data;

      // Normalize email to lowercase for consistent session lookup
      email = email.trim().toLowerCase();

      console.log("[API] Processing email submission for:", email, firstName, lastName);

      // 1. Create/update GHL contact
      const customFields: Record<string, any> = {
        score: diagnosticData.overallScore,
        session_id: sessionId || crypto.randomUUID(),
      };

      // Add UTM parameters if present
      if (utmSource) customFields.utm_source = utmSource;
      if (utmMedium) customFields.utm_medium = utmMedium;
      if (utmCampaign) customFields.utm_campaign = utmCampaign;

      const contactId = await ghlService.upsertContact({
        email,
        firstName,
        lastName,
        tags: ["Ateam-GPT"],
        customFields,
      });

      console.log("[API] Contact created/updated successfully:", contactId);

      // 2. Generate beautiful HTML email with full report
      console.log("[API] Generating HTML email report...");
      const reportWithNames = {
        ...diagnosticData,
        email,
        builderName: `${firstName} ${lastName}`,
      };

      const emailSubject = `Your A-Team Trades Pipeline™ Report - Score: ${diagnosticData.overallScore}/100`;
      const emailHtml = generateReportEmailHTML(reportWithNames);

      console.log("[API] HTML email report generated successfully");

      // 3. Send beautiful HTML email via GHL
      try {
        await ghlService.sendEmail(contactId, email, emailSubject, emailHtml);
        console.log("[API] ✅ Email sent successfully via GHL:", {
          contactId,
          email,
          subject: emailSubject,
        });
      } catch (emailError) {
        console.error("[API] ❌ Failed to send email via GHL:", {
          error: emailError,
          contactId,
          email,
        });
        throw emailError; // Throw so user knows email failed
      }

      // 4. Create diagnostic session in storage with UTM parameters
      await storage.createDiagnosticSession({
        email,
        builderName: `${firstName} ${lastName}`,
        overallScore: diagnosticData.overallScore,
        sectionScores: diagnosticData.sectionScores,
        diagnosticData,
        pdfUrl: "N/A - HTML Email Report",
        ghlContactId: contactId,
        sessionId,
        phoneOptIn: "false",
        convertedYn: "false",
        utmSource,
        utmMedium,
        utmCampaign,
      });

      console.log("[API] ✅ Email submission processed successfully - Report sent!");
      res.json({
        success: true,
        message: "Your report has been sent to your email",
      });
    } catch (error) {
      console.error("[API] Error in submit-email:", error);
      res.status(500).json({
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // POST /api/submit-phone - Update contact with phone and trigger SMS via GHL
  app.post("/api/submit-phone", async (req, res) => {
    try {
      // Validate request body
      const bodySchema = z.object({
        phone: z.string().min(10),
        email: z.string().email(),
        sessionId: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
      });

      const validationResult = bodySchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.format(),
        });
      }

      let { phone, email, utmSource, utmMedium, utmCampaign } = validationResult.data;

      // Normalize email to lowercase for consistent session lookup
      email = email.trim().toLowerCase();

      console.log("[API] Processing phone submission for:", email);

      // 1. Find existing session by normalized email
      const session = await storage.getDiagnosticSessionByEmail(email);
      if (!session) {
        return res.status(404).json({
          error: "Session not found",
          details: "Email not found in system. Please complete the email step first.",
          email
        });
      }

      // 2. Build merged UTM parameters (stored session UTMs + fresh request UTMs)
      const customFields: Record<string, any> = {};
      
      // First, use stored session UTMs as fallback
      if (session.utmSource) customFields.utm_source = session.utmSource;
      if (session.utmMedium) customFields.utm_medium = session.utmMedium;
      if (session.utmCampaign) customFields.utm_campaign = session.utmCampaign;
      
      // Then override with fresh request UTMs if present (priority)
      if (utmSource) customFields.utm_source = utmSource;
      if (utmMedium) customFields.utm_medium = utmMedium;
      if (utmCampaign) customFields.utm_campaign = utmCampaign;

      // 3. Update GHL contact with phone number and UTM parameters (via upsertContact to update standard phone field)
      if (session.ghlContactId) {

        // Lookup contact to get firstName/lastName for upsert
        const contactId = await ghlService.upsertContact({
          email,
          phone,
          tags: ["Ateam-SMS-OK"],
          customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
        });

        // 4. Send training + bonus pack SMS via GHL Conversations API
        const smsMessage = `Hi! Your exclusive "Attract The Best™" training + bonus pack is ready.

Access the proven framework to:
✓ Attract top talent consistently
✓ Build a team that shows up on time
✓ Save £15K-£35K+ in labour leaks

Get your training: https://developcoaching.co.uk/attract-the-best/

Your bonus pack reveals the exact system successful builders use.

- Develop Coaching Team`;

        console.log("[API] Attempting to send SMS:", {
          contactId,
          phone,
          messageLength: smsMessage.length,
        });

        try {
          await ghlService.sendSMS(contactId, phone, smsMessage);
          console.log("[API] ✅ SMS sent successfully to:", phone);
        } catch (smsError: any) {
          console.error("[API] ❌ Failed to send SMS:", {
            error: smsError.message,
            stack: smsError.stack,
            contactId,
            phone,
            messageLength: smsMessage.length,
          });
          // Non-blocking: Log error but continue processing
          // User phone is still saved even if SMS delivery failed
          console.warn("[API] ⚠️  Phone number saved to GHL. SMS delivery will be retried or handled separately.");
        }
      }

      // 5. Update session with phone and persist merged UTM values
      await storage.updateDiagnosticSession(session.id, {
        phone,
        phoneOptIn: "true",
        utmSource: customFields.utm_source || session.utmSource || undefined,
        utmMedium: customFields.utm_medium || session.utmMedium || undefined,
        utmCampaign: customFields.utm_campaign || session.utmCampaign || undefined,
      });

      res.json({
        success: true,
        message: "Phone updated and SMS sent",
      });
    } catch (error) {
      console.error("[API] Error in submit-phone:", error);
      res.status(500).json({
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // GET /api/visit - Track CTA click and redirect to booking page
  app.get("/api/visit", async (req, res) => {
    try {
      const { cid, utm_source, utm_medium, utm_campaign } = req.query as {
        cid?: string;
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
      };

      console.log("[API] Processing visit tracking for CID:", cid);

      // Extract session ID from cid parameter
      const sessionId = cid;

      if (sessionId) {
        // Find session and update GHL
        const sessions = Array.from(
          (storage as any).diagnosticSessions.values()
        ).filter((s: any) => s.sessionId === sessionId);

        if (sessions.length > 0) {
          const session: any = sessions[0];
          if (session.ghlContactId) {
            await ghlService.markConverted(session.ghlContactId, {
              utm_source,
              utm_medium,
              utm_campaign,
            });

            await storage.updateDiagnosticSession(session.id, {
              convertedYn: "true",
              utmSource: utm_source,
              utmMedium: utm_medium,
              utmCampaign: utm_campaign,
            });
          }
        }
      }

      // Redirect to booking page
      res.redirect("https://developcoaching.co.uk/schedule-a-call");
    } catch (error) {
      console.error("[API] Error in visit tracking:", error);
      // Still redirect even if tracking fails
      res.redirect("https://developcoaching.co.uk/schedule-a-call");
    }
  });

  // POST /api/chat - AI-powered conversation for general chat and diagnostics
  app.post("/api/chat", async (req, res) => {
    try {
      const bodySchema = z.object({
        message: z.string().min(1),
        conversationHistory: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).optional(),
        diagnosticState: z.object({
          isActive: z.boolean(),
          questionsAsked: z.number(),
          collectedData: z.record(z.any()),
        }).optional(),
      });

      const validationResult = bodySchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.format(),
        });
      }

      const { message, conversationHistory = [], diagnosticState } = validationResult.data;

      console.log("[API] ═══════════════════════════════════════════════════════════════");
      console.log("[API] Processing chat message:", message.substring(0, 50) + "...");
      console.log("[API] Incoming diagnosticState:", JSON.stringify(diagnosticState, null, 2));
      console.log("[API] Questions asked so far:", diagnosticState?.questionsAsked);
      console.log("[API] Collected data keys received:", Object.keys(diagnosticState?.collectedData || {}));
      console.log("[API] ───────────────────────────────────────────────────────────────");

      // Build conversation history for context
      const historyMessages = conversationHistory.slice(-10).map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      // Determine system prompt based on diagnostic state
      const isDiagnosticMode = diagnosticState?.isActive;
      const questionsAsked = diagnosticState?.questionsAsked || 0;
      
      let systemPrompt: string;
      
      if (isDiagnosticMode && questionsAsked < 7) {
        const questionNumber = questionsAsked + 1;
        
        const questionMap: Record<number, { area: string; question: string }> = {
          1: { area: "turnover", question: "What's your annual turnover? (GBP £ is fine)" },
          2: { area: "projects", question: "How many projects do you normally run at the same time?" },
          3: { area: "reliability", question: "How reliable are your subbies? Do they show up on time and finish work properly?" },
          4: { area: "recruitment", question: "How easy is it for you to find skilled tradespeople when you need them?" },
          5: { area: "systems", question: "What systems do you use to manage scheduling and projects?" },
          6: { area: "timeSpent", question: "How many hours per week do you spend dealing with labour issues?" },
          7: { area: "culture", question: "How's the morale and culture in your team?" },
        };
        
        const currentQ = questionMap[questionNumber];
        
        if (questionsAsked === 0) {
          systemPrompt = `You are Greg from Develop Coaching. The user wants to start the diagnostic.

YOUR EXACT RESPONSE (copy this exactly):
Here we go! Let's run your fast 7-question Trades Pipeline Diagnostic.

Question 1 of 7: ${currentQ.question}

Do NOT add anything else. Do NOT ask multiple questions. Just this.
Do NOT use markdown formatting like **bold** or *italics*. Use plain text only.

Include at the very end: <!--DIAGNOSTIC_DATA:{"questionsAsked": 1, "currentArea": "${currentQ.area}", "collectedData": {}}-->`;
        } else {
          const prevQuestion = questionMap[questionsAsked];
          systemPrompt = `You are Greg from Develop Coaching conducting a diagnostic. The user just answered Question ${questionsAsked}: "${prevQuestion?.question}"

THEIR EXACT ANSWER: ${message}

YOUR TASK:
1. Acknowledge their answer briefly (1 short sentence that shows you understood - be specific)
2. Score their answer from 1-10 based on the guidelines below
3. Ask Question ${questionNumber} of 7

SCORING GUIDELINES FOR THEIR ANSWER TO QUESTION ${questionsAsked}:
- Score 1-3: Poor/struggling situation (major issues, lots of challenges)
- Score 4-6: Average/some issues (mixed challenges, some good, some bad)
- Score 7-10: Good/healthy situation (strong area, few issues)

QUESTION AREA: ${prevQuestion?.area}
- If turnover/projects: Low = 1-3, Medium = 4-6, High/Good = 7-10
- If reliability: Unreliable = 1-3, Sometimes = 4-6, Very reliable = 7-10
- If recruitment: Difficult = 1-3, Moderate = 4-6, Easy = 7-10
- If systems: None = 1-3, Basic = 4-6, Organized = 7-10
- If time spent: 15+ hours = 1-3, 5-15 hours = 4-6, <5 hours = 7-10
- If culture: Low morale = 1-3, Mixed = 4-6, Great = 7-10

YOUR RESPONSE MUST BE:
[1-2 sentence acknowledgment of their answer]

Question ${questionNumber} of 7: ${currentQ.question}

[DIAGNOSTIC_SCORE: X] where X is a number 1-10
[DIAGNOSTIC_AREA: ${prevQuestion?.area}]
[DIAGNOSTIC_ANSWER: brief 1-line summary]

IMPORTANT:
- Always include [DIAGNOSTIC_SCORE: X] with an actual score 1-10 based on their answer
- Always include [DIAGNOSTIC_AREA: ...] with the previous question's area
- Always include [DIAGNOSTIC_ANSWER: ...] with their answer summary
- This score MUST match their actual situation, NOT be a default like 5
- Do NOT use markdown formatting like **bold** or *italics*. Use plain text only.`;
        }
      } else if (isDiagnosticMode && questionsAsked >= 7) {
        systemPrompt = `You are Greg from Develop Coaching. The diagnostic is now COMPLETE.

COLLECTED DATA: ${JSON.stringify(diagnosticState?.collectedData || {})}

YOUR TASK:
1. Thank them warmly for completing the diagnostic
2. Give a brief, insightful summary of what you've learned about their situation (2-3 sentences)
3. Tease the value of the full report they'll receive
4. Encourage them to enter their email to get the detailed PDF report with personalised recommendations

Keep it conversational and warm. Make them feel understood and excited about the insights coming their way.
Do NOT use markdown formatting like **bold** or *italics*. Use plain text only.

Include at the end: <!--DIAGNOSTIC_COMPLETE:true-->`;
      } else {
        systemPrompt = `You are Greg from Develop Coaching, an expert construction business consultant specializing in UK trades businesses. You help builders and tradespeople solve problems with their labour pipeline, team management, recruitment, scheduling, and profitability.

You're having a natural conversation. Be warm, practical, and direct. Use UK English.

If they seem interested in understanding their labour challenges, offer to run a quick 3-minute diagnostic that will identify their specific gaps and give them a personalized score.

If they want to book a call, encourage them to use the calendar booking below.

Keep responses concise (2-4 sentences). Be conversational, not formal.
Do NOT use markdown formatting like **bold**, *italics*, or numbered lists. Use plain text only.`;
      }

      const openaiResponse = await fetch(`${process.env.AI_INTEGRATIONS_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AI_INTEGRATIONS_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...historyMessages,
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (!openaiResponse.ok) {
        const error = await openaiResponse.json();
        console.error("[API] OpenAI error:", error);
        return res.status(500).json({
          error: "Failed to generate response",
          message: error.error?.message || "Unknown error",
        });
      }

      const data = await openaiResponse.json();
      let aiMessage = data.choices?.[0]?.message?.content || "";

      if (!aiMessage) {
        return res.status(500).json({
          error: "No response from AI",
        });
      }

      // Parse diagnostic data from response using new format
      let diagnosticUpdate = null;
      let isComplete = false;

      console.log("[API] Looking for diagnostic markers in AI response...");

      // Try new format first: [DIAGNOSTIC_SCORE: X]
      const scoreMatch = aiMessage.match(/\[DIAGNOSTIC_SCORE:\s*(\d+)\]/);
      const areaMatch = aiMessage.match(/\[DIAGNOSTIC_AREA:\s*(\w+)\]/);
      const answerMatch = aiMessage.match(/\[DIAGNOSTIC_ANSWER:\s*([^\]]+)\]/);

      if (scoreMatch || areaMatch || answerMatch) {
        console.log("[API] ✅ Found new format diagnostic markers");
        const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 5;
        const area = areaMatch ? areaMatch[1] : null;

        if (area) {
          diagnosticUpdate = {
            questionsAsked: (diagnosticState?.questionsAsked || 0) + 1,
            collectedData: {
              [area]: {
                score: score,
                answer: answerMatch ? answerMatch[1].trim() : "User's answer"
              }
            }
          };
          console.log("[API] ✅ Parsed diagnostic data:", diagnosticUpdate);

          // Remove diagnostic markers from message
          aiMessage = aiMessage
            .replace(/\[DIAGNOSTIC_SCORE:[^\]]*\]/g, '')
            .replace(/\[DIAGNOSTIC_AREA:[^\]]*\]/g, '')
            .replace(/\[DIAGNOSTIC_ANSWER:[^\]]*\]/g, '')
            .trim();
        }
      } else {
        console.log("[API] ⚠️  No diagnostic markers found in response");
        console.log("[API] Full AI response:", aiMessage.substring(0, 300) + "...");
      }

      const completeMatch = aiMessage.match(/<!--DIAGNOSTIC_COMPLETE:true-->/);
      if (completeMatch) {
        isComplete = true;
        aiMessage = aiMessage.replace(/<!--DIAGNOSTIC_COMPLETE:true-->/g, '').trim();
      }

      // Auto-increment questionsAsked if in diagnostic mode and no diagnosticUpdate provided
      if (isDiagnosticMode && !diagnosticUpdate) {
        diagnosticUpdate = {
          questionsAsked: questionsAsked + 1,
          collectedData: {},
        };
      }

      // Force completion if we've reached 7 questions
      const newQuestionsCount = diagnosticUpdate?.questionsAsked || questionsAsked + 1;
      if (isDiagnosticMode && newQuestionsCount >= 7 && !isComplete) {
        console.log("[API] Auto-completing diagnostic after 7 questions");
        isComplete = true;
      }

      console.log("[API] ═══════════════════════════════════════════════════════════════");
      console.log("[API] ✅ AI response generated successfully");
      console.log("[API] Outgoing questionsAsked:", newQuestionsCount);
      console.log("[API] Outgoing diagnosticUpdate:", JSON.stringify(diagnosticUpdate, null, 2));
      console.log("[API] isComplete:", isComplete);
      console.log("[API] ═══════════════════════════════════════════════════════════════");

      res.json({
        success: true,
        message: aiMessage,
        diagnosticUpdate,
        isComplete,
      });
    } catch (error) {
      console.error("[API] Error in chat:", error);
      res.status(500).json({
        error: "Failed to process chat message",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // POST /api/track-booking - Track calendar booking with UTM parameters
  app.post("/api/track-booking", async (req, res) => {
    try {
      const bodySchema = z.object({
        event: z.string(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        timestamp: z.string().optional(),
      });

      const validationResult = bodySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.format(),
        });
      }

      const { event, utmSource, utmMedium, utmCampaign, timestamp } = validationResult.data;

      console.log("[API] Tracking booking event:", {
        event,
        utmSource,
        utmMedium,
        utmCampaign,
        timestamp,
      });

      // Log booking event for analytics (could be extended to store in database)
      console.log("[API] 📅 Booking tracked:", {
        event,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        timestamp,
      });

      res.json({
        success: true,
        message: "Booking tracked successfully",
      });
    } catch (error) {
      console.error("[API] Error tracking booking:", error);
      res.status(500).json({
        error: "Failed to track booking",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
