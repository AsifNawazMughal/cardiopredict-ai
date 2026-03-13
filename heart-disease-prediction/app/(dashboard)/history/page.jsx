"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { predictionsApi } from "../../lib/api";
import { Clock, Search, Eye, GitCompare, Download, Filter } from "lucide-react";

const RISK_BADGE = {
  Low:"bg-green-100 text-green-700 border-green-200",
  Medium:"bg-amber-100 text-amber-700 border-amber-200",
  High:"bg-red-100 text-red-700 border-red-200",
};

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selected, setSelected] = useState([]);

  useEffect(()=>{
    predictionsApi.getHistory().then(setHistory).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const filtered = history.filter(h=>{
    const matchSearch = !search || h.patient_name.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter==="All" || h.risk_class===riskFilter;
    return matchSearch && matchRisk;
  });

  function toggleSelect(id){
    setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id].slice(-2)); // max 2 for compare
  }

  function handleCompare(){
    if(selected.length===2) router.push(`/results/${selected[0]}?compare=${selected[1]}`);
    else if(selected.length===1) router.push(`/results/${selected[0]}`);
  }

  function exportCSV(){
    const rows = [["ID","Patient","Risk","Confidence","Low%","Medium%","High%","Model","Date"]];
    filtered.forEach(h=>rows.push([String(h.id),h.patient_name,h.risk_class,String(h.confidence),String(h.probability_low),String(h.probability_medium),String(h.probability_high),h.model_used,new Date(h.predicted_at).toLocaleDateString()]));
    const csv = rows.map(r=>r.join(",")).join("\n");
    const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="predictions.csv"; a.click();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Clock className="w-6 h-6 text-red-600"/> Prediction History</h1>
          <p className="text-gray-500 text-sm mt-0.5">All past heart disease risk assessments</p>
        </div>
        <div className="flex gap-2">
          {selected.length>0 && (
            <button onClick={handleCompare} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
              <GitCompare className="w-4 h-4"/>
              {selected.length===2?"Compare 2 Results":"View Result"}
            </button>
          )}
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4"/> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"/>
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2">
          <Filter className="w-4 h-4 text-gray-400"/>
          {(["All","Low","Medium","High"] ).map(r=>(
            <button key={r} onClick={()=>setRiskFilter(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${riskFilter===r?"bg-red-600 text-white":"text-gray-600 hover:bg-gray-100"}`}>{r}</button>
          ))}
        </div>
      </div>

      {selected.length>0 && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
          <GitCompare className="w-4 h-4"/>
          {selected.length===1?"1 result selected. Select 1 more to compare, or click \"View Result\"":"2 results selected. Click \"Compare 2 Results\" to compare side-by-side."}
          <button onClick={()=>setSelected([])} className="ml-auto text-xs underline">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-8 px-4 py-3"/>
              {["#","Patient","Risk Class","Confidence","Low%","Medium%","High%","Model","Date","Actions"].map(h=>(
                <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : filtered.length===0 ? (
              <tr><td colSpan={11} className="text-center py-12 text-gray-400">No predictions found</td></tr>
            ) : filtered.map((h,i)=>{
              const rc = h.risk_class ;
              const badge = RISK_BADGE[rc]||"bg-gray-100 text-gray-700 border-gray-200";
              const isSelected = selected.includes(h.id);
              return (
                <tr key={h.id} className={`border-t border-gray-100 transition-colors ${isSelected?"bg-blue-50":"hover:bg-gray-50"}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={isSelected} onChange={()=>toggleSelect(h.id)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"/>
                  </td>
                  <td className="px-3 py-3 text-gray-400 text-xs">#{i+1}</td>
                  <td className="px-3 py-3 font-medium text-gray-900">{h.patient_name}</td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badge}`}>{h.risk_class}</span></td>
                  <td className="px-3 py-3 font-semibold text-gray-900">{h.confidence}%</td>
                  <td className="px-3 py-3 text-green-700">{h.probability_low}%</td>
                  <td className="px-3 py-3 text-amber-700">{h.probability_medium}%</td>
                  <td className="px-3 py-3 text-red-700">{h.probability_high}%</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{h.model_used}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{new Date(h.predicted_at).toLocaleDateString()}</td>
                  <td className="px-3 py-3">
                    <button onClick={()=>router.push(`/results/${h.id}`)} className="flex items-center gap-1 text-xs text-red-600 hover:underline whitespace-nowrap">
                      <Eye className="w-3.5 h-3.5"/> View Full Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length>0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {history.length} predictions · Select up to 2 rows to compare
          </div>
        )}
      </div>
    </div>
  );
}
