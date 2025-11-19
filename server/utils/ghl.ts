// GoHighLevel API integration
// Handles contact creation, updates, tagging, and triggering email/SMS workflows

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
    }
  }

  async upsertContact(data: GHLContact): Promise<string> {
    this.checkEnabled();
    try {
      // In production, this would call the GHL API
      // For now, we'll simulate the contact creation
      console.log("[GHL] Upserting contact:", {
        email: data.email,
        phone: data.phone,
        tags: data.tags,
        locationId: this.locationId,
        pitId: this.pitId,
        enabled: this.enabled,
      });

      // Simulate API call
      const contactId = `ghl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      return contactId;
    } catch (error) {
      console.error("[GHL] Error upserting contact:", error);
      throw new Error("Failed to upsert contact in GoHighLevel");
    }
  }

  async addTags(contactId: string, tags: string[]): Promise<void> {
    this.checkEnabled();
    try {
      console.log("[GHL] Adding tags to contact:", {
        contactId,
        tags,
        locationId: this.locationId,
      });

      // In production, this would call the GHL API to add tags
      // The GHL API would be:
      // POST /contacts/{contactId}/tags
      // Body: { tags: ["tag1", "tag2"] }
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
      console.log("[GHL] Updating custom fields:", {
        contactId,
        fields,
        locationId: this.locationId,
      });

      // In production, this would call the GHL API to update custom fields
      // The GHL API would be:
      // PUT /contacts/{contactId}
      // Body: { customFields: { field1: "value1", ... } }
    } catch (error) {
      console.error("[GHL] Error updating custom fields:", error);
      throw new Error("Failed to update custom fields in GoHighLevel");
    }
  }

  async triggerEmailWorkflow(contactId: string, pdfUrl: string): Promise<void> {
    this.checkEnabled();
    try {
      console.log("[GHL] Triggering email workflow:", {
        contactId,
        pdfUrl,
        locationId: this.locationId,
        pitId: this.pitId,
      });

      // In production, this would trigger a GHL workflow/campaign
      // that sends the email with the PDF attachment
      // The GHL API would be:
      // POST /workflows/trigger
      // Body: { contactId, workflowId, data: { pdfUrl } }
    } catch (error) {
      console.error("[GHL] Error triggering email workflow:", error);
      throw new Error("Failed to trigger email workflow in GoHighLevel");
    }
  }

  async triggerSMSWorkflow(contactId: string): Promise<void> {
    this.checkEnabled();
    try {
      console.log("[GHL] Triggering SMS workflow:", {
        contactId,
        locationId: this.locationId,
        pitId: this.pitId,
      });

      // In production, this would trigger a GHL SMS workflow/campaign
      // The GHL API would be:
      // POST /workflows/trigger
      // Body: { contactId, workflowId, smsTemplateId }
    } catch (error) {
      console.error("[GHL] Error triggering SMS workflow:", error);
      throw new Error("Failed to trigger SMS workflow in GoHighLevel");
    }
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
