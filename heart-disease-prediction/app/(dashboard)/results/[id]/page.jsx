"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { predictionsApi } from "../../../lib/api";
import RiskCard, { getRiskConfig } from "./_components/RiskCard";
import ProbabilityCharts from "./_components/ProbabilityCharts";
import HealthParamsGrid from "./_components/HealthParamsGrid";
import FeatureContributions from "./_components/FeatureContributions";
import DiseaseLikelihoods from "./_components/DiseaseLikelihoods";
import { exportPdf } from "./_components/exportPdf";
import { ArrowLeft, Download, AlertCircle, FileText } from "lucide-react";
import ReviewWidget from "@/components/ReviewWidget";
import Loading from "@/components/Loading";

export default function ResultDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);

  function handleExportPdf() {
    if (!result) return;
    exportPdf(result);
    // Pop the review modal a beat after the download dialog
    setTimeout(() => setShowReviewModal(true), 700);
  }

  useEffect(() => {
    predictionsApi.getById(Number(id))
      .then(setResult)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading center size="xl" label="Loading result…" className="h-full p-20"/>;
  if (error)   return <div className="p-10 text-red-600 text-center"><AlertCircle className="w-10 h-10 mx-auto mb-2"/>{error}</div>;
  if (!result) return null;

  const cfg = getRiskConfig(result.risk_class);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 no-print">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium self-start">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => router.push("/history")} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <FileText className="w-4 h-4"/> <span className="hidden sm:inline">View All</span> History
          </button>
          <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
            <Download className="w-4 h-4"/> Export PDF
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">CardioPredict AI — Prediction Report</h1>
        <p className="text-gray-500 text-sm">Report ID: #{result.prediction_id} • Generated: {new Date(result.predicted_at).toLocaleString()}</p>
      </div>

      <RiskCard result={result}/>

      <ProbabilityCharts probabilities={result.probabilities}/>

      <FeatureContributions
        contributions={result.feature_contributions}
        riskClass={result.risk_class}
      />

      <DiseaseLikelihoods probabilities={result.probabilities} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-5">
        {/* Clinical Recommendations */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Clinical Recommendations</h3>
          <ul className="space-y-2">
            {(result.recommendations || []).map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cfg.color }}/>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Model Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Model Info</h3>
          <div className="space-y-2 text-sm">
            <Row label="Model Engine"  value={`${result.model_used} v1.0`}/>
            <Row label="Dataset"        value="UCI Heart Disease (303 samples)"/>
            <Row label="Prediction ID"  value={`#${result.prediction_id}`}/>
            <Row label="Timestamp"      value={new Date(result.predicted_at).toLocaleString()}/>
          </div>
        </div>
      </div>

      <HealthParamsGrid healthData={result.health_data}/>

      <div className="no-print">
        <ReviewWidget mode="inline" predictionId={result.prediction_id} />
      </div>

      {showReviewModal && (
        <ReviewWidget
          mode="modal"
          predictionId={result.prediction_id}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={() => setTimeout(() => setShowReviewModal(false), 1500)}
        />
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
