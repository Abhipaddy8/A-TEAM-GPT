import {
  type User,
  type InsertUser,
  type DiagnosticSession,
  type InsertDiagnosticSession,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Diagnostic session methods
  createDiagnosticSession(session: InsertDiagnosticSession): Promise<DiagnosticSession>;
  getDiagnosticSession(id: string): Promise<DiagnosticSession | undefined>;
  updateDiagnosticSession(
    id: string,
    updates: Partial<InsertDiagnosticSession>
  ): Promise<DiagnosticSession | undefined>;
  getDiagnosticSessionByEmail(email: string): Promise<DiagnosticSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private diagnosticSessions: Map<string, DiagnosticSession>;

  constructor() {
    this.users = new Map();
    this.diagnosticSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDiagnosticSession(
    insertSession: InsertDiagnosticSession
  ): Promise<DiagnosticSession> {
    const id = randomUUID();
    const session: DiagnosticSession = {
      phone: null,
      builderName: null,
      pdfUrl: null,
      ghlContactId: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      sessionId: null,
      phoneOptIn: "false",
      convertedYn: "false",
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    console.log('[Storage] Creating diagnostic session with UTM:', {
      id,
      email: session.email,
      utmSource: session.utmSource,
      utmMedium: session.utmMedium,
      utmCampaign: session.utmCampaign,
    });
    this.diagnosticSessions.set(id, session);
    return session;
  }

  async getDiagnosticSession(id: string): Promise<DiagnosticSession | undefined> {
    return this.diagnosticSessions.get(id);
  }

  async updateDiagnosticSession(
    id: string,
    updates: Partial<InsertDiagnosticSession>
  ): Promise<DiagnosticSession | undefined> {
    const session = this.diagnosticSessions.get(id);
    if (!session) return undefined;

    // Only update fields that are explicitly provided (not undefined)
    const updatedSession = { ...session };
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updatedSession[key as keyof DiagnosticSession] = value as any;
      }
    });
    
    console.log('[Storage] Updating diagnostic session:', {
      id,
      updates: Object.keys(updates),
      utmPreserved: {
        utmSource: updatedSession.utmSource,
        utmMedium: updatedSession.utmMedium,
        utmCampaign: updatedSession.utmCampaign,
      },
    });
    
    this.diagnosticSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getDiagnosticSessionByEmail(email: string): Promise<DiagnosticSession | undefined> {
    const session = Array.from(this.diagnosticSessions.values()).find(
      (session) => session.email === email
    );
    console.log('[Storage] Retrieved diagnostic session by email:', {
      email,
      found: !!session,
      utmSource: session?.utmSource,
      utmMedium: session?.utmMedium,
      utmCampaign: session?.utmCampaign,
    });
    return session;
  }
}

export const storage = new MemStorage();
