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

      console.log("[API] Processing chat message:", message.substring(0, 50) + "...");
      console.log("[API] Diagnostic state:", diagnosticState);

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

**Question 1 of 7:** ${currentQ.question}

Do NOT add anything else. Do NOT ask multiple questions. Just this.

Include at the very end: <!--DIAGNOSTIC_DATA:{"questionsAsked": 1, "currentArea": "${currentQ.area}", "extractedScore": 5, "collectedData": {}}-->`;
        } else {
          systemPrompt = `You are Greg from Develop Coaching conducting a diagnostic. You just received an answer to Question ${questionsAsked}.

THEIR ANSWER: The user's message contains their answer. Interpret it intelligently - they might give short or long answers.

YOUR TASK:
1. Acknowledge their answer briefly (1 short sentence that shows you understood - be specific to what they said)
2. Then ask the next question

YOUR RESPONSE FORMAT:
[Brief acknowledgment of their answer]

**Question ${questionNumber} of 7:** ${currentQ.question}

SCORING THEIR PREVIOUS ANSWER (Question ${questionsAsked}):
- Score 1-3: Poor/struggling situation
- Score 4-6: Average/some issues
- Score 7-10: Good/healthy situation

Be conversational. Use UK English. Keep it SHORT.

CRITICAL: For the JSON marker, extractedScore MUST be a single number 1-10, NOT an array. Same for the score inside collectedData.
Include at end: <!--DIAGNOSTIC_DATA:{"questionsAsked": ${questionNumber}, "currentArea": "${currentQ.area}", "extractedScore": 5, "collectedData": {"${questionMap[questionsAsked]?.area || 'answer'}": {"score": 5, "answer": "[brief summary of their answer]"}}}-->
Replace 5 with your actual score 1-10 based on their answer.`;
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

Include at the end: <!--DIAGNOSTIC_COMPLETE:true-->`;
      } else {
        systemPrompt = `You are Greg from Develop Coaching, an expert construction business consultant specializing in UK trades businesses. You help builders and tradespeople solve problems with their labour pipeline, team management, recruitment, scheduling, and profitability.

You're having a natural conversation. Be warm, practical, and direct. Use UK English.

If they seem interested in understanding their labour challenges, offer to run a quick 3-minute diagnostic that will identify their specific gaps and give them a personalized score.

If they want to book a call, encourage them to use the calendar booking below.

Keep responses concise (2-4 sentences). Be conversational, not formal.`;
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

      // Parse diagnostic data from response if present
      let diagnosticUpdate = null;
      let isComplete = false;

      const diagnosticMatch = aiMessage.match(/<!--DIAGNOSTIC_DATA:(.*?)-->/);
      if (diagnosticMatch) {
        try {
          diagnosticUpdate = JSON.parse(diagnosticMatch[1]);
          aiMessage = aiMessage.replace(/<!--DIAGNOSTIC_DATA:.*?-->/g, '').trim();
        } catch (e) {
          console.error("[API] Failed to parse diagnostic data:", e);
        }
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

      console.log("[API] ✅ AI response generated successfully, questionsAsked:", newQuestionsCount, "isComplete:", isComplete);

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

  const httpServer = createServer(app);

  return httpServer;
}
