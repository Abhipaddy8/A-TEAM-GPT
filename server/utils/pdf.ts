// PDF generation using PDFKit (lightweight, no browser dependencies)
import PDFDocument from "pdfkit";
import { join } from "path";
import { mkdir } from "fs/promises";
import { existsSync, createWriteStream } from "fs";

// Brand colors
const BRAND_BLUE = "#0063FF";
const BRAND_TEAL = "#00C2C7";

export async function generatePDF(markdown: string, fileName: string): Promise<string> {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), "temp");
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    const outputPath = join(tempDir, fileName);

    // Create PDF document
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      const stream = createWriteStream(outputPath);
      doc.pipe(stream);

      // Parse and render markdown content
      renderMarkdownToPDF(doc, markdown);

      doc.end();

      stream.on("finish", () => {
        console.log("[PDF] Generated PDF at:", outputPath);
        resolve(outputPath);
      });

      stream.on("error", (error) => {
        console.error("[PDF] Error writing PDF:", error);
        reject(error);
      });
    });
  } catch (error) {
    console.error("[PDF] Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

function renderMarkdownToPDF(doc: PDFKit.PDFDocument, markdown: string) {
  const lines = markdown.split("\n");
  let currentY = doc.y;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for page overflow
    if (currentY > doc.page.height - 100) {
      doc.addPage();
      currentY = 50;
    }

    // H1 - Main title
    if (line.startsWith("# ")) {
      if (currentY > 50) doc.moveDown(1);
      doc
        .fontSize(24)
        .fillColor(BRAND_BLUE)
        .font("Helvetica-Bold")
        .text(line.substring(2), { align: "left" });
      doc
        .moveTo(doc.x, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor(BRAND_TEAL)
        .lineWidth(3)
        .stroke();
      doc.moveDown(0.5);
      currentY = doc.y;
    }
    // H2 - Section headers
    else if (line.startsWith("## ")) {
      if (currentY > 50) doc.moveDown(1.5);
      doc
        .fontSize(18)
        .fillColor(BRAND_BLUE)
        .font("Helvetica-Bold")
        .text(line.substring(3), { align: "left" });
      doc.moveDown(0.5);
      currentY = doc.y;
    }
    // H3 - Subsection headers
    else if (line.startsWith("### ")) {
      if (currentY > 50) doc.moveDown(1);
      doc
        .fontSize(14)
        .fillColor(BRAND_BLUE)
        .font("Helvetica-Bold")
        .text(line.substring(4), { align: "left" });
      doc.moveDown(0.3);
      currentY = doc.y;
    }
    // Bullet list
    else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      if (!inList) {
        doc.moveDown(0.3);
        inList = true;
      }
      const bulletText = line.trim().substring(2);
      doc
        .fontSize(11)
        .fillColor("#1a1a1a")
        .font("Helvetica")
        .list([bulletText], {
          bulletRadius: 2,
          textIndent: 20,
          indent: 20,
        });
      currentY = doc.y;
    }
    // Numbered list
    else if (line.match(/^\d+\.\s/)) {
      if (!inList) {
        doc.moveDown(0.3);
        inList = true;
      }
      const numText = line.trim().replace(/^\d+\.\s/, "");
      doc
        .fontSize(11)
        .fillColor("#1a1a1a")
        .font("Helvetica")
        .text(`${numText}`, {
          indent: 20,
          paragraphGap: 5,
        });
      currentY = doc.y;
    }
    // Horizontal rule
    else if (line.trim() === "---") {
      doc.moveDown(0.5);
      doc
        .moveTo(doc.x, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor("#e0e0e0")
        .lineWidth(1)
        .stroke();
      doc.moveDown(0.5);
      currentY = doc.y;
      inList = false;
    }
    // Bold text handling and regular paragraphs
    else if (line.trim() !== "") {
      inList = false;
      doc.fontSize(11).fillColor("#1a1a1a").font("Helvetica");

      // Simple bold text replacement
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      let textX = doc.x;

      for (const part of parts) {
        if (part.startsWith("**") && part.endsWith("**")) {
          // Bold text
          const boldText = part.substring(2, part.length - 2);
          doc.font("Helvetica-Bold").fillColor(BRAND_BLUE).text(boldText, textX, doc.y, {
            continued: true,
            lineBreak: false,
          });
        } else if (part) {
          // Regular text
          doc.font("Helvetica").fillColor("#1a1a1a").text(part, {
            continued: true,
            lineBreak: false,
          });
        }
      }

      doc.text(""); // End the line
      doc.moveDown(0.3);
      currentY = doc.y;
    }
    // Empty line
    else {
      doc.moveDown(0.5);
      currentY = doc.y;
      inList = false;
    }
  }

  // Add footer
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(9)
      .fillColor("#999999")
      .text(
        "© 2025 Develop Coaching. Built for UK builders and contractors.",
        50,
        doc.page.height - 50,
        {
          align: "center",
          width: doc.page.width - 100,
        }
      );
  }
}
