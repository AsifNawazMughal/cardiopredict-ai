"use client";
import Field from "@/components/Field";
import PhoneField from "./PhoneField";
import { Stethoscope, Building2, BadgeCheck } from "lucide-react";

const SPECIALIZATIONS = ["Cardiology","General Medicine","Internal Medicine","Emergency Medicine","Family Medicine","Other"];

export default function RegisterStep2({ form, set }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
        <div className="relative">
          <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <select value={form.specialization} onChange={e=>set("specialization",e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
            {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <Field icon={<Building2 className="w-4 h-4"/>} label="Hospital / Clinic Name" type="text"
        value={form.hospital_name} onChange={v=>set("hospital_name",v)} placeholder="City General Hospital" required/>

      <PhoneField value={form.phone} onChange={v=>set("phone",v)}/>

      <Field icon={<BadgeCheck className="w-4 h-4"/>} label="Medical License Number" type="text"
        value={form.license_number} onChange={v=>set("license_number",v)} placeholder="PMDC-12345" required/>
    </>
  );
}
