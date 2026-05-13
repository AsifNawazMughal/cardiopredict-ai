import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

const RISK_CONFIG = {
  Low:    { color:"#16a34a", bg:"bg-green-50",  border:"border-green-200",  text:"text-green-700",  icon:CheckCircle2,  label:"Low Risk" },
  Medium: { color:"#d97706", bg:"bg-amber-50",  border:"border-amber-200",  text:"text-amber-700",  icon:AlertTriangle, label:"Medium Risk" },
  High:   { color:"#dc2626", bg:"bg-red-50",    border:"border-red-200",    text:"text-red-700",    icon:AlertCircle,   label:"High Risk" },
};

export function getRiskConfig(risk) {
  return RISK_CONFIG[risk] || RISK_CONFIG.High;
}

export default function RiskCard({ result }) {
  const cfg = getRiskConfig(result.risk_class);
  const Icon = cfg.icon;
  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-4 md:p-6 mb-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5`}>
      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center ${cfg.bg} border-2 ${cfg.border} shrink-0`}>
        <Icon className={`w-7 h-7 md:w-8 md:h-8 ${cfg.text}`}/>
      </div>
      <div className="flex-1 min-w-0">
        {result.patient_name && (
          <p className="text-sm text-gray-500 mb-0.5">
            Patient: <span className="font-medium text-gray-800">{result.patient_name}</span>
          </p>
        )}
        <p className="text-xs text-gray-500 uppercase tracking-wide">Prediction Result</p>
        <h2 className={`text-2xl md:text-3xl font-bold mt-0.5 ${cfg.text}`}>{cfg.label}</h2>
        <p className="text-gray-600 text-xs md:text-sm mt-1">
          Confidence: <span className="font-semibold">{result.confidence}%</span> ·
          Model: <span className="font-semibold">{result.model_used}</span> ·
          <span> {new Date(result.predicted_at).toLocaleString()}</span>
        </p>
      </div>
      <div className={`text-right px-4 py-3 md:px-5 md:py-4 rounded-xl ${cfg.bg} border ${cfg.border}`}>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Confidence Score</p>
        <p className={`text-4xl md:text-5xl font-bold ${cfg.text} mt-1`}>{result.confidence}<span className="text-xl md:text-2xl">%</span></p>
      </div>
    </div>
  );
}
