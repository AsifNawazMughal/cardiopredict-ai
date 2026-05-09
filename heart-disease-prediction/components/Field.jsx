"use client";
import { useState } from "react";
import { Check, X, Loader2, Eye, EyeOff } from "lucide-react";

export default function Field({
  label, type = "text", value, onChange,
  icon, placeholder, hint, required,
  status, statusMessage,
  min, max, step,
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  const borderColor =
    status === "taken" ? "border-red-400 focus:ring-red-500" :
    status === "available" ? "border-green-400 focus:ring-green-500" :
    "border-gray-300 focus:ring-red-500";
  const messageColor =
    status === "taken" ? "text-red-600" :
    status === "available" ? "text-green-600" :
    "text-gray-500";
  const rightPad =
    isPassword && status ? "pr-16" :
    (isPassword || status) ? "pr-9" :
    "pr-3";
  const statusRight = isPassword ? "right-9" : "right-3";

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
        {hint && <span className="text-gray-400 ml-1 font-normal">{hint}</span>}
      </label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          min={min} max={max} step={step}
          className={`w-full ${icon ? "pl-9" : "pl-3"} ${rightPad} py-2.5 border ${borderColor} rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2`}
        />
        {status === "checking" && <Loader2 className={`absolute ${statusRight} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin`} />}
        {status === "available" && <Check className={`absolute ${statusRight} top-1/2 -translate-y-1/2 w-4 h-4 text-green-500`} />}
        {status === "taken" && <X className={`absolute ${statusRight} top-1/2 -translate-y-1/2 w-4 h-4 text-red-500`} />}
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {statusMessage && <p className={`text-xs mt-1 ${messageColor}`}>{statusMessage}</p>}
    </div>
  );
}
