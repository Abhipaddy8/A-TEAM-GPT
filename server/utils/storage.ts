// Object Storage integration for uploading and serving PDFs
// Reference: javascript_object_storage blueprint
import { Storage, File } from "@google-cloud/storage";
import { readFile } from "fs/promises";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class StorageService {
  private bucketId: string;
  private publicPath: string;
  private enabled: boolean;

  constructor() {
    this.bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";
    this.publicPath = process.env.PUBLIC_OBJECT_SEARCH_PATHS?.split(",")[0] || "";
    this.enabled = !!(this.bucketId && this.publicPath);

    if (!this.enabled) {
      console.warn(
        "[Storage] Warning: Object Storage not configured. DEFAULT_OBJECT_STORAGE_BUCKET_ID or PUBLIC_OBJECT_SEARCH_PATHS not set. Storage features disabled."
      );
    }
  }

  async uploadPDF(localPath: string, fileName: string): Promise<string> {
    // If storage is not configured, return a mock URL
    if (!this.enabled) {
      console.warn("[Storage] Object Storage disabled - returning mock URL for:", fileName);
      return `https://mock-storage.example.com/pdfs/${fileName}`;
    }

    try {
      // Parse the bucket name from the public path
      // Format: /bucket-name/directory
      const pathParts = this.publicPath.split("/").filter(Boolean);
      const bucketName = pathParts[0];
      const directory = pathParts.slice(1).join("/");

      const bucket = objectStorageClient.bucket(bucketName);
      const destination = directory ? `${directory}/pdfs/${fileName}` : `pdfs/${fileName}`;
      const file = bucket.file(destination);

      // Read the local file
      const fileBuffer = await readFile(localPath);

      // Upload to object storage
      await file.save(fileBuffer, {
        metadata: {
          contentType: "application/pdf",
          metadata: {
            "custom:aclPolicy": JSON.stringify({
              owner: "system",
              visibility: "public",
            }),
          },
        },
      });

      // Generate public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
      
      console.log("[Storage] Uploaded PDF to:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("[Storage] Error uploading PDF:", error);
      throw new Error("Failed to upload PDF to storage");
    }
  }
}
