export default function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {[1,2].map(s => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${step>=s ? "bg-red-600 text-white" : "bg-gray-200 text-gray-500"}`}>{s}</div>
          <span className={`text-xs ${step>=s ? "text-red-600 font-medium" : "text-gray-400"}`}>{s===1 ? "Account" : "Doctor Profile"}</span>
          {s < 2 && <div className={`h-px flex-1 ${step>s ? "bg-red-400" : "bg-gray-200"}`}/>}
        </div>
      ))}
    </div>
  );
}
