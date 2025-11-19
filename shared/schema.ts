import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Diagnostic session schema
export const diagnosticSessions = pgTable("diagnostic_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  phone: text("phone"),
  builderName: text("builder_name"),
  overallScore: integer("overall_score").notNull(),
  sectionScores: jsonb("section_scores").notNull(), // { tradingCapacity: 8, reliability: 6, ... }
  diagnosticData: jsonb("diagnostic_data").notNull(), // Full question/answer data
  pdfUrl: text("pdf_url"),
  ghlContactId: text("ghl_contact_id"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  sessionId: text("session_id"),
  phoneOptIn: text("phone_opt_in").default("false"),
  convertedYn: text("converted_yn").default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDiagnosticSessionSchema = createInsertSchema(diagnosticSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertDiagnosticSession = z.infer<typeof insertDiagnosticSessionSchema>;
export type DiagnosticSession = typeof diagnosticSessions.$inferSelect;

// PDF Report data structure
export const pdfReportDataSchema = z.object({
  builderName: z.string().optional(),
  email: z.string().email(),
  overallScore: z.number().min(0).max(100),
  scoreColor: z.enum(['red', 'amber', 'green']),
  sectionScores: z.object({
    tradingCapacity: z.object({
      score: z.number(),
      color: z.enum(['red', 'amber', 'green']),
      commentary: z.string(),
    }),
    reliability: z.object({
      score: z.number(),
      color: z.enum(['red', 'amber', 'green']),
      commentary: z.string(),
    }),
    recruitment: z.object({
      score: z.number(),
      color: z.enum(['red', 'amber', 'green']),
      commentary: z.string(),
    }),
    systems: z.object({
      score: z.number(),
      color: z.enum(['red', 'amber', 'green']),
      commentary: z.string(),
    }),
    profitability: z.object({
      score: z.number(),
      color: z.enum(['red', 'amber', 'green']),
      commentary: z.string(),
    }),
    onboarding: z.object({
      score: z.number(),
      color: z.enum(['red', 'amber', 'green']),
      commentary: z.string(),
    }),
    culture: z.object({
      score: z.number(),
      color: z.enum(['red', 'amber', 'green']),
      commentary: z.string(),
    }),
  }),
  topRecommendations: z.array(z.object({
    title: z.string(),
    explanation: z.string(),
    impact: z.string(),
  })),
  riskProfile: z.object({
    color: z.enum(['red', 'amber', 'green']),
    explanation: z.string(),
  }),
  labourLeakProjection: z.object({
    annualLeak: z.string(),
    improvementRange: z.string(),
    timeHorizon: z.string(),
  }),
});

export type PdfReportData = z.infer<typeof pdfReportDataSchema>;

// User schema (keeping original for auth if needed)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
