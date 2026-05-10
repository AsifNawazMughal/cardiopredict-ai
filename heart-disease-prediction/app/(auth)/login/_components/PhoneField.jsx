"use client";
import { useState } from "react";
import { Phone } from "lucide-react";

const COUNTRIES = [
  { dial:"+92",  flag:"🇵🇰", name:"Pakistan",     len:10, placeholder:"300 1234567" },
  { dial:"+91",  flag:"🇮🇳", name:"India",        len:10, placeholder:"98765 43210" },
  { dial:"+1",   flag:"🇺🇸", name:"USA / Canada", len:10, placeholder:"555 123 4567" },
  { dial:"+44",  flag:"🇬🇧", name:"UK",           len:10, placeholder:"7700 900123" },
  { dial:"+971", flag:"🇦🇪", name:"UAE",          len:9,  placeholder:"50 123 4567" },
  { dial:"+966", flag:"🇸🇦", name:"Saudi Arabia", len:9,  placeholder:"50 123 4567" },
  { dial:"+93",  flag:"🇦🇫", name:"Afghanistan",  len:9,  placeholder:"70 123 4567" },
  { dial:"+880", flag:"🇧🇩", name:"Bangladesh",   len:10, placeholder:"1712 345678" },
];

export default function PhoneField({ value, onChange }) {
  const initialDial = COUNTRIES.find(c => value?.startsWith(c.dial))?.dial || "+92";
  const [dial, setDial] = useState(initialDial);
  const country = COUNTRIES.find(c => c.dial === dial) || COUNTRIES[0];
  const local = (value && value.startsWith(dial)) ? value.slice(dial.length).replace(/\D/g, "") : "";

  const formatDisplay = (digits) => {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0,3)} ${digits.slice(3)}`;
    return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
  };

  const handleLocal = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, country.len);
    onChange(digits ? `${dial}${digits}` : "");
  };
  const handleDial = (newDial) => {
    setDial(newDial);
    const c = COUNTRIES.find(x => x.dial === newDial);
    const trimmed = local.slice(0, c.len);
    onChange(trimmed ? `${newDial}${trimmed}` : "");
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
      <div className="flex gap-2">
        <select value={dial} onChange={e=>handleDial(e.target.value)} aria-label="Country code"
          className="px-2 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 w-28">
          {COUNTRIES.map(c => <option key={c.dial} value={c.dial}>{c.flag} {c.dial}</option>)}
        </select>
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input type="tel" inputMode="numeric" value={formatDisplay(local)} onChange={e=>handleLocal(e.target.value)}
            placeholder={country.placeholder}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"/>
        </div>
      </div>
    </div>
  );
}
