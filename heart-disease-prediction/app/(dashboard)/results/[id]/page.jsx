"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { predictionsApi } from "../../../lib/api";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { ArrowLeft, Printer, Download, AlertTriangle, CheckCircle2, AlertCircle, Activity, FileText, RefreshCw } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const RISK_CONFIG = {
  Low:    { color:"#16a34a", bg:"bg-green-50",  border:"border-green-200",  text:"text-green-700",  icon:CheckCircle2,  label:"Low Risk" },
  Medium: { color:"#d97706", bg:"bg-amber-50",  border:"border-amber-200",  text:"text-amber-700",  icon:AlertTriangle, label:"Medium Risk" },
  High:   { color:"#dc2626", bg:"bg-red-50",    border:"border-red-200",    text:"text-red-700",    icon:AlertCircle,   label:"High Risk" },
};

const FIELD_LABELS = {
  age:"Age (years)", sex:"Sex", chest_pain_type:"Chest Pain Type", resting_bp:"Resting BP (mmHg)",
  cholesterol:"Cholesterol (mg/dl)", fasting_blood_sugar:"Fasting Blood Sugar >120", resting_ecg:"Resting ECG",
  max_heart_rate:"Max Heart Rate (bpm)", exercise_angina:"Exercise Angina", st_depression:"ST Depression",
  st_slope:"ST Slope", vessels_count:"Major Vessels", thalassemia:"Thalassemia",
};

function humanize(key, val) {
  if(key==="sex") return val===1?"Male":"Female";
  if(key==="fasting_blood_sugar") return val===1?"Yes (>120)":"No (≤120)";
  if(key==="exercise_angina") return val===1?"Yes":"No";
  if(key==="chest_pain_type") return ["Typical Angina","Atypical Angina","Non-Anginal","Asymptomatic"][val]||String(val);
  if(key==="resting_ecg") return ["Normal","ST-T Abnormality","LV Hypertrophy"][val]||String(val);
  if(key==="st_slope") return ["Upsloping","Flat","Downsloping"][val]||String(val);
  if(key==="thalassemia") return ["Normal","Fixed Defect","Reversible Defect","Unknown"][val]||String(val);
  return String(val);
}

export default function ResultDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(()=>{
    predictionsApi.getById(Number(id))
      .then(r => setResult(r))
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false));
  },[id]);

  function handlePrint(){ window.print(); }

  async function handleExportPDF(){
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentW = pageW - margin * 2;

    const riskColors = {
      Low:    { r: 22,  g: 163, b: 74  },
      Medium: { r: 217, g: 119, b: 6   },
      High:   { r: 220, g: 38,  b: 38  },
    };
    const rc = result.risk_class;
    const rColor = riskColors[rc] || riskColors.High;

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

      // Split into 2 side-by-side columns
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

      (result.recommendations).forEach((rec, i) => {
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

    doc.save(`CardioPredict_Report_${result.prediction_id}_${result.patient_name?.replace(/\s+/g,"_")||"Patient"}.pdf`);
  }

  if(loading) return <div className="flex items-center justify-center h-full text-gray-400 p-20"><RefreshCw className="w-8 h-8 animate-spin mr-3"/>Loading result...</div>;
  if(error) return <div className="p-10 text-red-600 text-center"><AlertCircle className="w-10 h-10 mx-auto mb-2"/>{error}</div>;
  if(!result) return null;

  const rc = result.risk_class;
  const cfg = RISK_CONFIG[rc] || RISK_CONFIG["High"];
  const Icon = cfg.icon;

  const donutData = {
    labels: ["Low Risk","Medium Risk","High Risk"],
    datasets:[{ data:[result.probabilities.low, result.probabilities.medium, result.probabilities.high], backgroundColor:["#16a34a","#d97706","#dc2626"], borderWidth:2, borderColor:"#fff" }]
  };
  const barData = {
    labels:["Low Risk","Medium Risk","High Risk"],
    datasets:[{ label:"Probability %", data:[result.probabilities.low, result.probabilities.medium, result.probabilities.high], backgroundColor:["#16a34a","#d97706","#dc2626"], borderRadius:6 }]
  };

  const patientName = result.patient_name;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button onClick={()=>router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <div className="flex gap-2">
          <button onClick={()=>router.push("/history")} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <FileText className="w-4 h-4"/> View All History
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Printer className="w-4 h-4"/> Print
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
            <Download className="w-4 h-4"/> Export PDF
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">CardioPredict AI — Prediction Report</h1>
        <p className="text-gray-500 text-sm">Report ID: #{result.prediction_id} • Generated: {new Date(result.predicted_at).toLocaleString()}</p>
      </div>

      {/* Risk Result Card */}
      <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-6 mb-5 flex items-center gap-5`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${cfg.bg} border-2 ${cfg.border}`}>
          <Icon className={`w-8 h-8 ${cfg.text}`}/>
        </div>
        <div className="flex-1">
          {patientName && <p className="text-sm text-gray-500 mb-0.5">Patient: <span className="font-medium text-gray-800">{patientName}</span></p>}
          <p className="text-xs text-gray-500 uppercase tracking-wide">Prediction Result</p>
          <h2 className={`text-3xl font-bold mt-0.5 ${cfg.text}`}>{cfg.label}</h2>
          <p className="text-gray-600 text-sm mt-1">Confidence: <span className="font-semibold">{result.confidence}%</span> · Model: <span className="font-semibold">{result.model_used}</span> · <span>{new Date(result.predicted_at).toLocaleString()}</span></p>
        </div>
        <div className={`text-right px-5 py-4 rounded-xl ${cfg.bg} border ${cfg.border}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Confidence Score</p>
          <p className={`text-5xl font-bold ${cfg.text} mt-1`}>{result.confidence}<span className="text-2xl">%</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Doughnut Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-red-500"/> Risk Probability Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="w-44 h-44"><Doughnut data={donutData} options={{cutout:"65%",plugins:{legend:{display:false}},maintainAspectRatio:true}}/></div>
            <div className="space-y-2 flex-1">
              {["Low","Medium","High"].map((r,i)=>{
                const val = [result.probabilities.low, result.probabilities.medium, result.probabilities.high][i];
                const color = ["bg-green-500","bg-amber-500","bg-red-500"][i];
                return (
                  <div key={r}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{r} Risk</span>
                      <span className="font-bold text-gray-900">{val}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{width:`${val}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Model Comparison View</h3>
          <div className="h-44">
            <Bar data={barData} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{max:100,ticks:{callback:(v)=>`${v}%`}}}}}/>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Clinical Recommendations */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Clinical Recommendations</h3>
          <ul className="space-y-2">
            {(result.recommendations||[]).map((r,i)=>(
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{backgroundColor:cfg.color}}/>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Model Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Model Info</h3>
          <div className="space-y-2 text-sm">
            <Row label="Model Engine" value={`${result.model_used} v1.0`}/>
            <Row label="Dataset" value="UCI Heart Disease (303 samples)"/>
            <Row label="Prediction ID" value={`#${result.prediction_id}`}/>
            <Row label="Timestamp" value={new Date(result.predicted_at).toLocaleString()}/>
          </div>
        </div>
      </div>

      {/* Health Parameters Table */}
      {result.health_data && Object.keys(result.health_data).length>0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Patient Health Parameters Used</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(result.health_data).map(([k,v])=>(
              <div key={k} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{FIELD_LABELS[k]||k}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{humanize(k,Number(v))}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({label,value}){
  return <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0"><span className="text-gray-500">{label}</span><span className="font-medium text-gray-900">{value}</span></div>;
}
