// GoHighLevel API integration
// Handles contact creation, updates, tagging, and email/SMS via Conversations API

const GHL_BASE_URL = "https://services.leadconnectorhq.com";

interface GHLContact {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

interface GHLContactResponse {
  contact: {
    id: string;
    email: string;
    phone?: string;
  };
}

export class GoHighLevelService {
  private locationId: string;
  private pitId: string;
  private enabled: boolean;

  constructor() {
    this.locationId = process.env.GHL_DEVELOP_LOCATION_ID || "";
    this.pitId = process.env.GHL_DEVELOP_PIT_ID || "";
    this.enabled = !!(this.locationId && this.pitId);

    if (!this.enabled) {
      console.warn("[GHL] Warning: GHL_DEVELOP_LOCATION_ID and GHL_DEVELOP_PIT_ID not set. GHL integration disabled.");
    }
  }

  private checkEnabled() {
    if (!this.enabled) {
      console.warn("[GHL] GHL integration is disabled - missing credentials");
      throw new Error("GHL integration is disabled - missing credentials");
    }
  }

  private async ghlRequest(method: string, endpoint: string, body?: any): Promise<any> {
    this.checkEnabled();
    
    const url = `${GHL_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${this.pitId}`,
        "Content-Type": "application/json",
        "Version": "2021-07-28",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error("[GHL] API error:", { status: response.status, data });
      throw new Error(`GHL API error: ${response.status}`);
    }

    return data;
  }

  private async lookupContactByEmail(email: string): Promise<string | null> {
    try {
      const data = await this.ghlRequest(
        "GET",
        `/contacts/?locationId=${this.locationId}&query=${encodeURIComponent(email)}`
      );

      if (data?.contacts?.length > 0) {
        return data.contacts[0].id;
      }

      return null;
    } catch (error) {
      console.error("[GHL] Error looking up contact:", error);
      return null;
    }
  }

  async upsertContact(data: GHLContact): Promise<string> {
    this.checkEnabled();
    try {
      console.log("[GHL] Upserting contact:", data.email);

      // Step 1: Lookup existing contact
      let contactId = await this.lookupContactByEmail(data.email);

      if (contactId) {
        console.log("[GHL] Contact exists, updating:", contactId);
        
        // Update existing contact
        const updatePayload: any = {};
        if (data.firstName) updatePayload.firstName = data.firstName;
        if (data.lastName) updatePayload.lastName = data.lastName;
        if (data.phone) updatePayload.phone = data.phone;
        
        // Add custom fields if provided
        if (data.customFields && Object.keys(data.customFields).length > 0) {
          updatePayload.customFields = Object.entries(data.customFields).map(([key, value]) => ({
            key,
            value: String(value),
          }));
        }

        await this.ghlRequest("PUT", `/contacts/${contactId}`, updatePayload);

        // Add tags if provided
        if (data.tags && data.tags.length > 0) {
          await this.addTags(contactId, data.tags);
        }
      } else {
        console.log("[GHL] Contact not found, creating new");
        
        // Create new contact
        const createPayload: any = {
          locationId: this.locationId,
          email: data.email,
          firstName: data.firstName || data.email.split("@")[0],
          lastName: data.lastName || "Contact",
        };

        if (data.phone) createPayload.phone = data.phone;
        
        // Add custom fields if provided
        if (data.customFields && Object.keys(data.customFields).length > 0) {
          createPayload.customFields = Object.entries(data.customFields).map(([key, value]) => ({
            key,
            value: String(value),
          }));
        }

        // Add tags if provided
        if (data.tags && data.tags.length > 0) {
          createPayload.tags = data.tags;
        }

        const result = await this.ghlRequest("POST", "/contacts/", createPayload);
        contactId = result?.contact?.id;

        if (!contactId) {
          throw new Error("No contact ID returned from GHL");
        }

        console.log("[GHL] Contact created:", contactId);
      }

      return contactId;
    } catch (error) {
      console.error("[GHL] Error upserting contact:", error);
      throw new Error("Failed to upsert contact in GoHighLevel");
    }
  }

  async addTags(contactId: string, tags: string[]): Promise<void> {
    this.checkEnabled();
    try {
      console.log("[GHL] Adding tags to contact:", { contactId, tags });

      await this.ghlRequest("POST", `/contacts/${contactId}/tags`, { tags });
    } catch (error) {
      console.error("[GHL] Error adding tags:", error);
      throw new Error("Failed to add tags in GoHighLevel");
    }
  }

  async updateCustomFields(
    contactId: string,
    fields: Record<string, any>
  ): Promise<void> {
    this.checkEnabled();
    try {
      console.log("[GHL] Updating custom fields:", { contactId, fields });

      const customFields = Object.entries(fields).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      await this.ghlRequest("PUT", `/contacts/${contactId}`, { customFields });
    } catch (error) {
      console.error("[GHL] Error updating custom fields:", error);
      throw new Error("Failed to update custom fields in GoHighLevel");
    }
  }

  async sendEmail(
    contactId: string,
    email: string,
    subject: string,
    htmlContent: string,
    attachments?: any[]
  ): Promise<void> {
    this.checkEnabled();
    try {
      console.log("[GHL] Sending email via Conversations API:", { contactId, email, subject });

      const payload = {
        type: "Email",
        locationId: this.locationId,
        contactId,
        emailFrom: "greg@mail.develop-coaching.com",
        emailTo: email,
        subject,
        html: htmlContent,
        attachments: attachments || [],
      };

      await this.ghlRequest("POST", "/conversations/messages", payload);
      console.log("[GHL] Email sent successfully");
    } catch (error) {
      console.error("[GHL] Error sending email:", error);
      throw new Error("Failed to send email via GoHighLevel");
    }
  }

  async triggerEmailWorkflow(contactId: string, pdfUrl: string): Promise<void> {
    // Deprecated: Use sendEmail instead
    console.warn("[GHL] triggerEmailWorkflow is deprecated, use sendEmail instead");
  }

  async sendSMS(contactId: string, phone: string, message: string): Promise<void> {
    this.checkEnabled();
    try {
      console.log("[GHL] Sending SMS via Conversations API:", { contactId, phone });

      const payload = {
        type: "SMS",
        locationId: this.locationId,
        contactId,
        phone,
        message,
      };

      await this.ghlRequest("POST", "/conversations/messages", payload);
      console.log("[GHL] SMS sent successfully");
    } catch (error) {
      console.error("[GHL] Error sending SMS:", error);
      throw new Error("Failed to send SMS via GoHighLevel");
    }
  }

  async triggerSMSWorkflow(contactId: string): Promise<void> {
    // Deprecated: Use sendSMS instead
    console.warn("[GHL] triggerSMSWorkflow is deprecated, use sendSMS instead");
  }

  async markConverted(contactId: string, utmParams?: any): Promise<void> {
    this.checkEnabled();
    try {
      console.log("[GHL] Marking contact as converted:", {
        contactId,
        utmParams,
        locationId: this.locationId,
      });

      // Update custom field converted_YN to "true"
      // Add tag: Ateam-Visited-Scale-Session
      await this.updateCustomFields(contactId, {
        converted_YN: "true",
        ...utmParams,
      });

      await this.addTags(contactId, ["Ateam-Visited-Scale-Session"]);
    } catch (error) {
      console.error("[GHL] Error marking as converted:", error);
      throw new Error("Failed to mark contact as converted in GoHighLevel");
    }
  }
}
