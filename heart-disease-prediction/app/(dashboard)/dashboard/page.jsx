"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { predictionsApi, patientsApi, getUser } from "../../lib/api";
import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";
import RiskBadge from "@/components/RiskBadge";
import Button from "@/components/Button";
import Skeleton from "@/components/Skeleton";
import Loading from "@/components/Loading";
import { Activity, Users, TrendingUp, AlertTriangle, ArrowRight, Plus, Eye } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const noopSubscribe = () => () => {};
const getTodayClient = () => new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
const getTodayServer = () => "";

export default function DashboardPage() {
  const router = useRouter();
  const user = useSyncExternalStore(noopSubscribe, getUser, () => null);
  const today = useSyncExternalStore(noopSubscribe, getTodayClient, getTodayServer);
  const [history, setHistory] = useState([]);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([predictionsApi.getHistory(), patientsApi.getAll()])
      .then(([h,p])=>{ setHistory(h); setPatientCount(p.length); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  const total = history.length;
  const low = history.filter(h=>h.risk_class==="Low").length;
  const med = history.filter(h=>h.risk_class==="Medium").length;
  const high = history.filter(h=>h.risk_class==="High").length;
  const recent = history.slice(0,5);

  const donutData = {
    labels:["Low Risk","Medium Risk","High Risk"],
    datasets:[{ data:[low||1,med||1,high||1], backgroundColor:["#16a34a","#d97706","#dc2626"], borderWidth:2, borderColor:"#fff" }]
  };

  const lineHistory = [...history].reverse().slice(-10);
  const lineData = {
    labels: lineHistory.map(h=>new Date(h.predicted_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})),
    datasets:[{
      label:"Risk Score %", data: lineHistory.map(h=>h.confidence),
      borderColor:"#dc2626", backgroundColor:"rgba(220,38,38,0.08)", fill:true,
      tension:0.4, pointBackgroundColor:"#dc2626", pointRadius:4,
    }]
  };

  const displayName = user?.first_name ? `Dr. ${user.first_name}` : `Dr. ${user?.username||""}`;

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Welcome back, {displayName}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{user?.hospital_name||"Heart Disease Prediction System"}{today ? ` · ${today}` : ""}</p>
        </div>
        <Button onClick={()=>router.push("/predict")}>
          <Plus className="w-4 h-4"/> New Prediction
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          {label:"Total Predictions",value:total,icon:Activity,color:"bg-red-100 text-red-600"},
          {label:"Total Patients",value:patientCount,icon:Users,color:"bg-blue-100 text-blue-600"},
          {label:"High Risk Cases",value:high,icon:AlertTriangle,color:"bg-red-100 text-red-600"},
          {label:"Avg Risk Score",value:total?`${Math.round(history.reduce((s,h)=>s+h.confidence,0)/total)}%`:"—",icon:TrendingUp,color:"bg-green-100 text-green-600"},
        ].map(({label,value,icon:Icon,color})=>(
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-4 h-4 sm:w-5 sm:h-5"/></div>
            <div className="min-w-0 flex-1">
              {loading ? (
                <Skeleton className="h-7 w-16 mb-1.5"/>
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-5">
        {/* Doughnut */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Risk Distribution</h3>
          {loading ? (
            <Loading center size="lg" label="Loading risk distribution…" className="py-16"/>
          ) : total>0 ? (
            <>
              <div className="w-36 h-36 mx-auto"><Doughnut data={donutData} options={{cutout:"65%",plugins:{legend:{display:false}},maintainAspectRatio:true}}/></div>
              <div className="mt-3 space-y-1.5">
                {[["Low",low,"#16a34a"],["Medium",med,"#d97706"],["High",high,"#dc2626"]].map(([l,n,c])=>(
                  <div key={String(l)} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:String(c)}}/>{l} Risk</span>
                    <span className="font-semibold text-gray-900">{n} ({total?Math.round(Number(n)/total*100):0}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="text-center text-gray-400 py-8 text-sm">No predictions yet</div>}
        </div>

        {/* Line chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Risk Score Trend (Last 10 Predictions)</h3>
          {loading ? (
            <Loading center size="lg" label="Loading trend…" className="h-44"/>
          ) : lineHistory.length>0 ? (
            <div className="h-44">
              <Line data={lineData} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{callback:(v)=>`${v}%`}}}}}/>
            </div>
          ) : <div className="text-center text-gray-400 py-8 text-sm">Run predictions to see trend</div>}
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Recent Predictions</h3>
          <button onClick={()=>router.push("/history")} className="text-sm text-red-600 hover:underline flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5"/></button>
        </div>
        {loading ? (
          <Loading center size="lg" label="Loading recent predictions…" className="py-10"/>
        ) : recent.length===0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No predictions yet. <button onClick={()=>router.push("/predict")} className="text-red-600 underline">Run first prediction</button></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50">
                <tr>
                  {["Patient","Risk","Risk Score","Model","Date",""].map(h=>(
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(h=>{
                  return (
                    <tr key={h.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{h.patient_name||"Unknown"}</td>
                      <td className="px-4 py-3"><RiskBadge risk={h.risk_class}/></td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{h.confidence}%</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{h.model_used}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(h.predicted_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={()=>router.push(`/results/${h.id}`)} className="flex items-center gap-1 text-xs text-red-600 hover:underline whitespace-nowrap">
                          <Eye className="w-3.5 h-3.5"/> View Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
