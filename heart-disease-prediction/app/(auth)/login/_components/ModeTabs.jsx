"use client";

export default function ModeTabs({ mode, onChange }) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
      {["login","register"].map(m => (
        <button key={m} type="button" onClick={() => onChange(m)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode===m ? "bg-white shadow text-red-600" : "text-gray-500"}`}>
          {m === "login" ? "Sign In" : "Register"}
        </button>
      ))}
    </div>
  );
}
