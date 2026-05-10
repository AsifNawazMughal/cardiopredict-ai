import { FIELD_LABELS, humanize } from "./format";

const RISK_RGB = {
  Low:    { r: 22,  g: 163, b: 74  },
  Medium: { r: 217, g: 119, b: 6   },
  High:   { r: 220, g: 38,  b: 38  },
};

export async function exportPdf(result) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;

  const rc = result.risk_class;
  const rColor = RISK_RGB[rc] || RISK_RGB.High;

  // ── Header bar ──────────────────────────────────────────────
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CardioPredict AI — Prediction Report", margin, 14);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Report ID: #${result.prediction_id}   |   Generated: ${new Date(result.predicted_at).toLocaleString()}`, pageW - margin, 14, { align: "right" });

  let y = 30;

  // ── Risk Result Card ─────────────────────────────────────────
  doc.setFillColor(rColor.r, rColor.g, rColor.b);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("PREDICTION RESULT", margin + 5, y + 8);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`${rc} Risk`, margin + 5, y + 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Confidence: ${result.confidence}%`, pageW - margin - 5, y + 10, { align: "right" });
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(`${result.confidence}%`, pageW - margin - 5, y + 22, { align: "right" });

  y += 34;

  // ── Patient & Model Info (2-column) ──────────────────────────
  const colW = (contentW - 5) / 2;
  const infoBoxH = 28;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, colW, infoBoxH, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, colW, infoBoxH, 2, 2, "S");

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + colW + 5, y, colW, infoBoxH, 2, 2, "F");
  doc.roundedRect(margin + colW + 5, y, colW, infoBoxH, 2, 2, "S");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("PATIENT INFO", margin + 4, y + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(result.patient_name || "—", margin + 4, y + 15);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Prediction Date: ${new Date(result.predicted_at).toLocaleDateString()}`, margin + 4, y + 23);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("MODEL INFO", margin + colW + 9, y + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`${result.model_used} v1.0`, margin + colW + 9, y + 15);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Dataset: UCI Heart Disease (303 samples)", margin + colW + 9, y + 23);

  y += infoBoxH + 8;

  // ── Risk Probability Table ────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Risk Probability Distribution", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Risk Level", "Probability", "Indicator"]],
    body: [
      ["Low Risk",    `${result.probabilities.low}%`,    ""],
      ["Medium Risk", `${result.probabilities.medium}%`, ""],
      ["High Risk",   `${result.probabilities.high}%`,   ""],
    ],
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 2: { cellWidth: 60 } },
    didDrawCell(data) {
      if (data.section === "body" && data.column.index === 2) {
        const { x, y: cy, width, height } = data.cell;
        const vals = [result.probabilities.low, result.probabilities.medium, result.probabilities.high];
        const colors = [[22,163,74],[217,119,6],[220,38,38]];
        const pct = vals[data.row.index] / 100;
        const barH = 4;
        const barY = cy + (height - barH) / 2;
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(x + 2, barY, width - 4, barH, 1, 1, "F");
        doc.setFillColor(...colors[data.row.index]);
        doc.roundedRect(x + 2, barY, (width - 4) * pct, barH, 1, 1, "F");
      }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Health Parameters Table ───────────────────────────────────
  if (result.health_data && Object.keys(result.health_data).length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Patient Health Parameters", margin, y);
    y += 4;

    const paramRows = Object.entries(result.health_data).map(([k, v]) => [
      FIELD_LABELS[k] || k,
      humanize(k, Number(v)),
    ]);

    const half = Math.ceil(paramRows.length / 2);
    const left = paramRows.slice(0, half);
    const right = paramRows.slice(half);
    const merged = left.map((row, i) => [...row, ...(right[i] || ["", ""])]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Parameter", "Value", "Parameter", "Value"]],
      body: merged,
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: { 1: { fontStyle: "bold" }, 3: { fontStyle: "bold" } },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Clinical Recommendations ──────────────────────────────────
  if ((result.recommendations || []).length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Clinical Recommendations", margin, y);
    y += 6;

    result.recommendations.forEach((rec) => {
      doc.setFillColor(rColor.r, rColor.g, rColor.b);
      doc.circle(margin + 2, y - 1.2, 1.5, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);
      const lines = doc.splitTextToSize(rec, contentW - 10);
      doc.text(lines, margin + 7, y);
      y += lines.length * 5 + 2;
    });
  }

  // ── Footer ────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    const footerY = doc.internal.pageSize.getHeight() - 8;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY - 3, pageW - margin, footerY - 3);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("CardioPredict AI — Confidential Medical Report. For clinical use only.", margin, footerY);
    doc.text(`Page ${p} of ${pageCount}`, pageW - margin, footerY, { align: "right" });
  }

  doc.save(`CardioPredict_Report_${result.prediction_id}_${result.patient_name?.replace(/\s+/g,"_") || "Patient"}.pdf`);
}
