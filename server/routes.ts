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
          // Don't throw - we still want to save the phone number even if SMS fails
          console.warn("[API] Phone number saved but SMS delivery failed. User may need manual follow-up.");
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
