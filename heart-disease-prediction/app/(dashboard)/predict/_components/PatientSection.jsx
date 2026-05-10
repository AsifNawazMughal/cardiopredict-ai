"use client";
import { useState } from "react";
import Field from "@/components/Field";
import { Search, User, CheckCircle2, UserPlus } from "lucide-react";

export default function PatientSection({
  patients,
  search, setSearch,
  selectedPatient, setSelectedPatient,
  newPatient, setNewPatient,
  form, set,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const setNew = (k, v) => setNewPatient(p => ({ ...p, [k]: v }));

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <User className="w-4 h-4 text-red-500"/> Patient Information
      </h2>

      <div className="relative mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Search & Select Patient <span className="text-gray-400">(optional — for new patient leave blank)</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input
            value={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : search}
            onChange={e => { setSearch(e.target.value); setSelectedPatient(null); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Type name to search patients..."
            readOnly={!!selectedPatient}
            className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {selectedPatient && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500"/>}
        </div>
        {showDropdown && !selectedPatient && filtered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-auto">
            {filtered.map(p => (
              <button key={p.id} type="button" onClick={() => { setSelectedPatient(p); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm flex items-center justify-between text-gray-900">
                <span className="font-medium">{p.first_name} {p.last_name}</span>
                <span className="text-gray-900 text-xs">{p.gender} • {p.date_of_birth}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between text-sm mb-2">
          <div>
            <span className="font-medium text-green-800">{selectedPatient.first_name} {selectedPatient.last_name}</span>
            <span className="text-green-600 ml-3">{selectedPatient.gender} • DOB: {selectedPatient.date_of_birth} • Age auto-filled</span>
          </div>
          <button type="button" onClick={() => { setSelectedPatient(null); setSearch(""); }}
            className="text-green-600 hover:text-red-600 text-xs underline">Remove</button>
        </div>
      )}

      {!selectedPatient && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-red-500"/>
            New Patient Details <span className="text-gray-400 font-normal">(filled-in details will be saved as a new patient record)</span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="First Name"    type="text" value={newPatient.first_name} onChange={v=>setNew("first_name",v)} placeholder="John" required/>
            <Field label="Last Name"     type="text" value={newPatient.last_name}  onChange={v=>setNew("last_name",v)}  placeholder="Doe"  required/>
            <Field label="Date of Birth" type="date" value={newPatient.date_of_birth} onChange={v=>setNew("date_of_birth",v)} hint="(optional)"/>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Field label="Age (years)" type="number" value={form.age} onChange={v=>set("age",v)} min="1" max="120" placeholder="e.g. 55" required/>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Gender<span className="text-red-600 ml-0.5">*</span></label>
          <select value={form.sex} onChange={e=>set("sex",e.target.value)} required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500">
            <option value="1">Male</option><option value="0">Female</option>
          </select>
        </div>
        <Field label="Resting BP (mmHg)" type="number" value={form.resting_bp} onChange={v=>set("resting_bp",v)} min="50" max="250" placeholder="e.g. 120" required/>
      </div>
    </div>
  );
}
