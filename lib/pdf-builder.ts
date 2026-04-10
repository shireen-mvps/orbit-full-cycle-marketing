import PDFDocument from "pdfkit";
import type { OrbitProject } from "@/types/orbit";

type PDFDoc = InstanceType<typeof PDFDocument>;

const TEAL   = "#00d4b4";
const NAVY   = "#0a0f1e";
const MUTED  = "#64748b";
const LIGHT  = "#f1f5f9";
const W      = 595;
const MARGIN = 50;
const COL    = W - MARGIN * 2;

function sectionHeader(doc: PDFDoc, title: string, y: number): number {
  doc.rect(MARGIN, y, 3, 18).fill(TEAL);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text(title, MARGIN + 12, y + 2, { width: COL });
  return y + 30;
}

function label(doc: PDFDoc, text: string, y: number): number {
  doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(8)
    .text(text.toUpperCase(), MARGIN, y, { characterSpacing: 1.2 });
  return y + 14;
}

function bodyText(doc: PDFDoc, text: string, y: number, opts?: object): number {
  doc.fillColor(NAVY).font("Helvetica").fontSize(10).text(text, MARGIN, y, { width: COL, lineGap: 3, ...opts });
  return doc.y + 6;
}

function pillRow(doc: PDFDoc, items: string[], y: number, color = TEAL): number {
  let x = MARGIN;
  const pillH = 16, pillPad = 8, gap = 6;
  items.forEach((item) => {
    const w = doc.widthOfString(item) + pillPad * 2;
    if (x + w > W - MARGIN) { x = MARGIN; y += pillH + gap; }
    doc.roundedRect(x, y, w, pillH, 3).fillAndStroke(color + "1a", color + "66");
    doc.fillColor(color).font("Helvetica").fontSize(8).text(item, x + pillPad, y + 4, { lineBreak: false });
    x += w + gap;
  });
  return y + pillH + 10;
}

function addPageBreak(doc: PDFDoc): void {
  doc.addPage();
}

export async function buildProjectPDF(project: OrbitProject): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: `${project.name} — Orbit Report` } });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));

  // ── COVER HEADER ──────────────────────────────────────────────
  doc.rect(0, 0, W, 110).fill(NAVY);
  doc.rect(0, 0, W, 4).fill(TEAL);
  doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(28).text("ORBIT", MARGIN, 24, { lineBreak: false });
  doc.fillColor("#ffffff").font("Helvetica").fontSize(10).text("Market Strategy Report", MARGIN + 82, 30, { lineBreak: false });
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(16).text(project.name, MARGIN, 56, { width: COL * 0.75 });
  const dateStr = new Date(project.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.fillColor(TEAL).font("Helvetica").fontSize(9).text(`Generated ${dateStr}`, MARGIN, 92);

  let y = 128;

  // ── MODULE 1: MARKET INTELLIGENCE ─────────────────────────────
  if (project.market_intel) {
    const mi = project.market_intel;
    y = sectionHeader(doc, "Market Intelligence", y);

    if (mi.summary) {
      y = label(doc, "Overview", y);
      doc.rect(MARGIN, y, COL, 0.5).fill(LIGHT);
      y += 6;
      y = bodyText(doc, mi.summary, y);
      y += 4;
    }

    if (mi.marketGaps?.length) {
      y = label(doc, "Market Gaps", y);
      mi.marketGaps.filter(Boolean).forEach((gap, i) => {
        if (doc.y > 750) { addPageBreak(doc); y = MARGIN; }
        doc.rect(MARGIN, y, 18, 14).fill(LIGHT);
        doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(8).text(`${i + 1}`, MARGIN + 5, y + 3, { lineBreak: false });
        doc.fillColor(NAVY).font("Helvetica").fontSize(9.5)
          .text(gap, MARGIN + 24, y + 2, { width: COL - 24, lineGap: 2 });
        y = doc.y + 5;
      });
      y += 4;
    }

    if (mi.whitespaceOpportunities?.length) {
      if (y > 700) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Whitespace Opportunities", y);
      mi.whitespaceOpportunities.filter(Boolean).forEach((opp) => {
        doc.circle(MARGIN + 4, y + 5, 3).fill(TEAL);
        doc.fillColor(NAVY).font("Helvetica").fontSize(9.5)
          .text(opp, MARGIN + 14, y + 1, { width: COL - 14, lineGap: 2 });
        y = doc.y + 5;
      });
      y += 4;
    }

    if (mi.competitorMap?.length) {
      if (y > 620) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Competitor Breakdown", y);
      mi.competitorMap.forEach((c) => {
        if (y > 700) { addPageBreak(doc); y = MARGIN; }
        doc.rect(MARGIN, y, COL, 1).fill(LIGHT);
        y += 5;
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(c.name, MARGIN, y);
        if (c.description) {
          doc.fillColor(MUTED).font("Helvetica").fontSize(8.5)
            .text(c.description, MARGIN, doc.y + 1, { width: COL, lineGap: 2 });
        }
        const colW = (COL - 10) / 2;
        const colY = doc.y + 6;
        doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(8).text("STRENGTHS", MARGIN, colY, { characterSpacing: 0.8 });
        doc.fillColor(NAVY).font("Helvetica").fontSize(8.5)
          .text(c.strengths.slice(0, 2).map(s => `+ ${s}`).join("\n"), MARGIN, doc.y + 2, { width: colW, lineGap: 2 });
        const afterStrengths = doc.y;
        doc.fillColor("#ef4444").font("Helvetica-Bold").fontSize(8).text("WEAKNESSES", MARGIN + colW + 10, colY, { characterSpacing: 0.8 });
        doc.fillColor(NAVY).font("Helvetica").fontSize(8.5)
          .text(c.weaknesses.slice(0, 2).map(w => `- ${w}`).join("\n"), MARGIN + colW + 10, colY + 12, { width: colW, lineGap: 2 });
        y = Math.max(afterStrengths, doc.y) + 12;
      });
    }
  }

  // ── MODULE 2: BRAND FOUNDATION ────────────────────────────────
  if (project.brand_foundation) {
    if (y > 600) { addPageBreak(doc); y = MARGIN; }
    else { y += 10; doc.rect(MARGIN, y, COL, 0.75).fill(LIGHT); y += 14; }
    const bf = project.brand_foundation;
    y = sectionHeader(doc, "Brand Foundation", y);

    if (bf.positioningStatement) {
      doc.rect(MARGIN, y, 3, 36).fill(TEAL);
      doc.fillColor(NAVY).font("Helvetica-BoldOblique").fontSize(10.5)
        .text(bf.positioningStatement, MARGIN + 12, y + 2, { width: COL - 12, lineGap: 3 });
      y = doc.y + 12;
    }

    if (bf.valueProp) {
      y = label(doc, "Value Proposition", y);
      y = bodyText(doc, bf.valueProp, y);
    }

    if (bf.messagingPillars?.length) {
      if (y > 680) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Messaging Pillars", y);
      bf.messagingPillars.forEach((p) => {
        doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(9.5).text(`${p.icon ?? "·"} ${p.title}`, MARGIN, y);
        doc.fillColor(MUTED).font("Helvetica").fontSize(8.5)
          .text(p.description, MARGIN + 12, doc.y + 2, { width: COL - 12, lineGap: 2 });
        y = doc.y + 8;
      });
    }

    if (bf.brandVoice?.length) {
      if (y > 720) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Brand Voice", y);
      y = pillRow(doc, bf.brandVoice, y);
    }

    const tagline = bf.selectedTagline || bf.taglines?.[0];
    if (tagline) {
      if (y > 730) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Tagline", y);
      doc.rect(MARGIN, y, COL, 28).fill(TEAL + "12");
      doc.rect(MARGIN, y, COL, 1).fill(TEAL + "44");
      doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(12)
        .text(`"${tagline}"`, MARGIN + 12, y + 8, { width: COL - 24 });
      y = doc.y + 16;
    }
  }

  // ── MODULE 3: AUDIENCE STUDIO ─────────────────────────────────
  if (project.audience_studio?.personas?.length) {
    if (y > 580) { addPageBreak(doc); y = MARGIN; }
    else { y += 10; doc.rect(MARGIN, y, COL, 0.75).fill(LIGHT); y += 14; }
    y = sectionHeader(doc, "Audience Studio", y);

    project.audience_studio.personas.forEach((p, i) => {
      if (y > 650) { addPageBreak(doc); y = MARGIN; }
      const dotColors = ["#00d4b4", "#7c6ef8", "#f59e0b"];
      const color = dotColors[i % dotColors.length];
      doc.rect(MARGIN, y, COL, 1).fill(color);
      y += 6;
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11).text(`${p.name}`, MARGIN, y, { continued: true });
      doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(`  ${p.role} · ${p.ageRange}`, { lineBreak: false });
      y = doc.y + 5;
      if (p.psychographicSummary) {
        doc.fillColor(MUTED).font("Helvetica").fontSize(8.5)
          .text(p.psychographicSummary, MARGIN, y, { width: COL, lineGap: 2 });
        y = doc.y + 6;
      }
      const half = (COL - 10) / 2;
      const colY = y;
      doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(7.5).text("BUYING TRIGGERS", MARGIN, colY, { characterSpacing: 0.8 });
      p.buyingTriggers?.slice(0, 2).forEach((t) => {
        doc.fillColor(NAVY).font("Helvetica").fontSize(8.5)
          .text(`+ ${t}`, MARGIN, doc.y + 2, { width: half, lineGap: 2 });
      });
      const afterLeft = doc.y;
      doc.fillColor("#ef4444").font("Helvetica-Bold").fontSize(7.5).text("OBJECTIONS", MARGIN + half + 10, colY, { characterSpacing: 0.8 });
      p.objections?.slice(0, 2).forEach((o) => {
        doc.fillColor(NAVY).font("Helvetica").fontSize(8.5)
          .text(`- ${o}`, MARGIN + half + 10, doc.y + 2, { width: half, lineGap: 2 });
      });
      y = Math.max(afterLeft, doc.y) + 6;
      if (p.sampleAdHook) {
        doc.rect(MARGIN, y, COL, 22).fill(color + "12");
        doc.fillColor(color).font("Helvetica-BoldOblique").fontSize(9)
          .text(`"${p.sampleAdHook}"`, MARGIN + 8, y + 6, { width: COL - 16 });
        y = doc.y + 12;
      } else {
        y += 8;
      }
    });
  }

  // ── FOOTER (last page) ────────────────────────────────────────
  const pageCount = (doc as unknown as { _pageBuffer?: unknown[] })._pageBuffer?.length ?? 1;
  doc.rect(0, 810, W, 32).fill(NAVY);
  doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(8).text("ORBIT", MARGIN, 819, { lineBreak: false, characterSpacing: 1 });
  doc.fillColor("#ffffff").font("Helvetica").fontSize(8).text(`  ·  Generated with Claude  ·  Page ${pageCount}`, MARGIN + 32, 819, { lineBreak: false });

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}
