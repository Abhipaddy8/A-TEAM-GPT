// PDF generation using md-to-pdf (no Puppeteer)
import { mdToPdf } from "md-to-pdf";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

export async function generatePDF(markdown: string, fileName: string): Promise<string> {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), "temp");
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    const outputPath = join(tempDir, fileName);

    // Generate PDF from Markdown
    const pdf = await mdToPdf(
      { content: markdown },
      {
        dest: outputPath,
        pdf_options: {
          format: "A4",
          margin: {
            top: "20mm",
            right: "15mm",
            bottom: "20mm",
            left: "15mm",
          },
          printBackground: true,
        },
        stylesheet: `
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
          }
          h1 {
            color: #0063FF;
            font-size: 24pt;
            margin-top: 0;
            border-bottom: 3px solid #00C2C7;
            padding-bottom: 10px;
          }
          h2 {
            color: #0063FF;
            font-size: 18pt;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          h3 {
            color: #333;
            font-size: 14pt;
            margin-top: 20px;
          }
          strong {
            color: #0063FF;
          }
          a {
            color: #00C2C7;
            text-decoration: none;
          }
          hr {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
        `,
      }
    );

    console.log("[PDF] Generated PDF at:", outputPath);
    return outputPath;
  } catch (error) {
    console.error("[PDF] Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}
