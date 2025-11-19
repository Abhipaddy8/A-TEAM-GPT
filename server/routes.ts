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
        diagnosticData: pdfReportDataSchema,
        sessionId: z.string().optional(),
      });

      const validationResult = bodySchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.format(),
        });
      }

      const { email, diagnosticData, sessionId } = validationResult.data;

      console.log("[API] Processing email submission for:", email);

      // 1. Create/update GHL contact
      const contactId = await ghlService.upsertContact({
        email,
        firstName: diagnosticData.builderName?.split(" ")[0],
        lastName: diagnosticData.builderName?.split(" ").slice(1).join(" "),
        tags: ["Ateam-GPT"],
        customFields: {
          score: diagnosticData.overallScore,
          session_id: req.body.sessionId || crypto.randomUUID(),
        },
      });

      // 2. Generate Markdown content using GPT-5
      const markdown = await generateReportMarkdown({
        ...diagnosticData,
        email,
      });

      // 3. Convert Markdown to PDF
      const fileName = `ateam-report-${Date.now()}.pdf`;
      const pdfPath = await generatePDF(markdown, fileName);

      // 4. Upload PDF to Object Storage
      const pdfUrl = await storageService.uploadPDF(pdfPath, fileName);

      // 5. Update GHL with PDF URL
      await ghlService.updateCustomFields(contactId, {
        pdf_url: pdfUrl,
      });

      // 6. Trigger email workflow in GHL (with PDF attachment)
      await ghlService.triggerEmailWorkflow(contactId, pdfUrl);

      // 7. Create diagnostic session in storage
      await storage.createDiagnosticSession({
        email,
        builderName: diagnosticData.builderName,
        overallScore: diagnosticData.overallScore,
        sectionScores: diagnosticData.sectionScores,
        diagnosticData,
        pdfUrl,
        ghlContactId: contactId,
        sessionId,
        phoneOptIn: "false",
        convertedYn: "false",
      });

      res.json({
        success: true,
        pdf_url: pdfUrl,
        message: "Report generated and email triggered",
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
      });

      const validationResult = bodySchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.format(),
        });
      }

      const { phone, email } = validationResult.data;

      console.log("[API] Processing phone submission for:", email);

      // 1. Find existing session
      const session = await storage.getDiagnosticSessionByEmail(email);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // 2. Update GHL contact with phone
      if (session.ghlContactId) {
        await ghlService.updateCustomFields(session.ghlContactId, { phone });
        await ghlService.addTags(session.ghlContactId, ["Ateam-SMS-OK"]);

        // 3. Trigger SMS workflow in GHL
        await ghlService.triggerSMSWorkflow(session.ghlContactId);
      }

      // 4. Update session
      await storage.updateDiagnosticSession(session.id, {
        phone,
        phoneOptIn: "true",
      });

      res.json({
        success: true,
        message: "Phone updated and SMS triggered",
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
          const session = sessions[0];
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
