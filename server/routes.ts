import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoHighLevelService } from "./utils/ghl";
import { generateReportMarkdown } from "./utils/openai";
import { generatePDF } from "./utils/pdf";
import { StorageService } from "./utils/storage";
import { pdfReportDataSchema, type PdfReportData } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const ghlService = new GoHighLevelService();
  const storageService = new StorageService();

  // POST /api/submit-email - Generate PDF report and trigger email via GHL
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

      const { email, firstName, lastName, diagnosticData, sessionId, utmSource, utmMedium, utmCampaign } = validationResult.data;

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

      // 2-6. Generate PDF and send email in background (don't block response)
      const fileName = `ateam-report-${Date.now()}.pdf`;
      const mockPdfUrl = `https://reports.develop-coaching.co.uk/${fileName}`;
      
      // Start async PDF generation and email sending - don't await
      (async () => {
        try {
          console.log("[API] Starting background PDF generation...");
          const markdown = await generateReportMarkdown({
            ...diagnosticData,
            email,
            builderName: `${firstName} ${lastName}`,
          });
          const pdfPath = await generatePDF(markdown, fileName);
          const pdfUrl = await storageService.uploadPDF(pdfPath, fileName);
          
          await ghlService.updateCustomFields(contactId, {
            pdf_url: pdfUrl,
          });
          
          // Send email via GHL Conversations API with PDF link
          const emailSubject = `Your A-Team Trades Pipeline™ Report - Score: ${diagnosticData.overallScore}/100`;
          const emailHtml = `
            <h1>Your A-Team Trades Pipeline™ Report</h1>
            <p>Hi ${firstName},</p>
            <p>Thank you for completing the A-Team Trades Pipeline diagnostic. Your personalised report is ready!</p>
            <p><strong>Your Overall Score: ${diagnosticData.overallScore}/100</strong></p>
            <p><strong><a href="${pdfUrl}" style="display:inline-block;padding:12px 24px;background-color:#0063FF;color:white;text-decoration:none;border-radius:6px;margin:16px 0;">Download Your Full PDF Report</a></strong></p>
            <p>Your detailed PDF report contains:</p>
            <ul>
              <li>Complete breakdown of your 7 core pipeline areas</li>
              <li>Personalised recommendations for improvement</li>
              <li>Labour leak projection and savings potential</li>
              <li>Action plan prioritised by business impact</li>
            </ul>
            <p>If you'd like help implementing these improvements, book a Scale Session call with us:</p>
            <p><a href="https://developcoaching.co.uk/schedule-a-call" style="display:inline-block;padding:12px 24px;background-color:#00C2C7;color:white;text-decoration:none;border-radius:6px;margin:16px 0;">Book My Scale Session Call</a></p>
            <p>Best regards,<br>The Develop Coaching Team</p>
          `;
          
          try {
            await ghlService.sendEmail(contactId, email, emailSubject, emailHtml);
            console.log("[API] Background email sent successfully:", {
              contactId,
              email,
              pdfUrl,
              subject: emailSubject,
            });
          } catch (emailError) {
            console.error("[API] Failed to send email via GHL:", {
              error: emailError,
              contactId,
              email,
              pdfUrl,
            });
            throw emailError;
          }
        } catch (error) {
          console.error("[API] Background PDF generation/email failed:", {
            error,
            contactId,
            email,
            fileName,
          });
        }
      })();

      // 7. Create diagnostic session in storage with UTM parameters
      await storage.createDiagnosticSession({
        email,
        builderName: `${firstName} ${lastName}`,
        overallScore: diagnosticData.overallScore,
        sectionScores: diagnosticData.sectionScores,
        diagnosticData,
        pdfUrl: mockPdfUrl,
        ghlContactId: contactId,
        sessionId,
        phoneOptIn: "false",
        convertedYn: "false",
        utmSource,
        utmMedium,
        utmCampaign,
      });

      console.log("[API] Email submission processed successfully - PDF generating in background");
      res.json({
        success: true,
        message: "Your report will be sent to your email shortly",
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

      const { phone, email, utmSource, utmMedium, utmCampaign } = validationResult.data;

      console.log("[API] Processing phone submission for:", email);

      // 1. Find existing session
      const session = await storage.getDiagnosticSessionByEmail(email);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
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

        // 4. Send Quick Win Pack SMS via GHL Conversations API
        const smsMessage = `Hi! Your A-Team Trades Quick Win Pack is ready:

#1 RELIABILITY FIX: Text your top 3 subbies this: "Rate yourself 1-10 on reliability. What would make you a 10?"

#2 PIPELINE FIX: Post one Facebook ad: "Reliable tradie needed. £X/day. DM if you show up on time."

#3 RETENTION FIX: Ask your best subbie: "What nearly made you quit? How can I fix it?"

These 3 fixes take 20 mins but save £15K-35K/year in labour leaks.

Want help scaling? Book here: https://developcoaching.co.uk/schedule-a-call

- Develop Coaching Team`;

        try {
          await ghlService.sendSMS(contactId, phone, smsMessage);
          console.log("[API] SMS sent successfully to:", phone);
        } catch (smsError) {
          console.error("[API] Failed to send SMS:", {
            error: smsError,
            contactId,
            phone,
            messageLength: smsMessage.length,
          });
          throw smsError;
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

  const httpServer = createServer(app);

  return httpServer;
}
