"use client";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Activity } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ProbabilityCharts({ probabilities }) {
  const values = [probabilities.low, probabilities.medium, probabilities.high];
  const colors = ["#16a34a", "#d97706", "#dc2626"];

  const donutData = {
    labels: ["Low Risk","Medium Risk","High Risk"],
    datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: "#fff" }],
  };
  const barData = {
    labels: ["Low Risk","Medium Risk","High Risk"],
    datasets: [{ label: "Probability %", data: values, backgroundColor: colors, borderRadius: 6 }],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-500"/> Risk Probability Distribution
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-36 h-36 md:w-44 md:h-44 shrink-0">
            <Doughnut data={donutData} options={{ cutout:"65%", plugins:{legend:{display:false}}, maintainAspectRatio:true }}/>
          </div>
          <div className="space-y-2 flex-1">
            {["Low","Medium","High"].map((r, i) => (
              <div key={r}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{r} Risk</span>
                  <span className="font-bold text-gray-900">{values[i]}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${values[i]}%`, backgroundColor: colors[i] }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Model Comparison View</h3>
        <div className="h-44">
          <Bar data={barData} options={{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{ max:100, ticks:{ callback:(v)=>`${v}%` } } } }}/>
        </div>
      </div>
    </div>
  );
}
