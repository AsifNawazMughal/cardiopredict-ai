"use client";
import { useState, useEffect } from "react";
import { profileApi } from "../../lib/api";
import { UserCog, User, Save, AlertCircle, CheckCircle2, Stethoscope, Building2, Phone, BadgeCheck, Mail } from "lucide-react";

const SPECIALIZATIONS = ["Cardiology","General Medicine","Internal Medicine","Emergency Medicine","Family Medicine","Radiology","Neurology","Oncology","Other"];

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ first_name:"", last_name:"", specialization:"Cardiology", hospital_name:"", phone:"", license_number:"" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(()=>{
    profileApi.getMe().then(u=>{ setUser(u); setForm({ first_name:u.first_name||"", last_name:u.last_name||"", specialization:u.specialization||"Cardiology", hospital_name:u.hospital_name||"", phone:u.phone||"", license_number:u.license_number||"" }); }).catch(()=>{});
  },[]);

  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  async function handleSave(e){
    e.preventDefault(); setSaving(true); setError(""); setSaved(false);
    try { const u=await profileApi.update(form); setUser(u); setSaved(true); setTimeout(()=>setSaved(false),3000); }
    catch(err){ setError(err instanceof Error?err.message:"Failed to save"); }
    finally{ setSaving(false); }
  }

  const initials = user ? `${(user.first_name||user.username||"D")[0]}${(user.last_name||"")[0]||""}`.toUpperCase() : "DR";

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2"><UserCog className="w-5 h-5 md:w-6 md:h-6 text-red-600"/> Doctor Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Update your professional information</p>
      </div>

      {/* Avatar Card */}
      <div className="bg-linear-to-r from-red-600 to-rose-600 rounded-2xl p-5 md:p-6 mb-5 text-white flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 text-center sm:text-left">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4 border-white/30 shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-xl font-bold">{user?.first_name&&user?.last_name ? `Dr. ${user.first_name} ${user.last_name}` : `Dr. ${user?.username||""}`}</p>
          <p className="text-red-100">{user?.specialization||"Healthcare Professional"}</p>
          <p className="text-red-200 text-sm">{user?.hospital_name||""}</p>
        </div>
      </div>

      {/* Account Info (read-only) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-500">Username</p><p className="text-sm font-medium text-gray-900 mt-0.5">{user?.username}</p></div>
          <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium text-gray-900 mt-0.5 flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gray-400"/>{user?.email}</p></div>
          <div><p className="text-xs text-gray-500">Role</p><p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{user?.role?.replace("_"," ")}</p></div>
          <div><p className="text-xs text-gray-500">Status</p><p className="text-sm font-medium text-green-600 mt-0.5 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/>Active</p></div>
        </div>
      </div>

      {/* Editable Profile */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Stethoscope className="w-4 h-4 text-gray-400"/> Professional Information</h2>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-red-700 text-sm"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0"/>{error}</div>}
        {saved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2 text-green-700 text-sm"><CheckCircle2 className="w-4 h-4 mt-0.5"/>Profile saved successfully!</div>}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field icon={<User className="w-4 h-4"/>} label="First Name" value={form.first_name} onChange={v=>set("first_name",v)} placeholder="John"/>
            <Field label="Last Name" value={form.last_name} onChange={v=>set("last_name",v)} placeholder="Doe"/>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <select value={form.specialization} onChange={e=>set("specialization",e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                {SPECIALIZATIONS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <Field icon={<Building2 className="w-4 h-4"/>} label="Hospital / Clinic Name" value={form.hospital_name} onChange={v=>set("hospital_name",v)} placeholder="City General Hospital"/>
          <Field icon={<Phone className="w-4 h-4"/>} label="Phone Number" value={form.phone} onChange={v=>set("phone",v)} placeholder="+92 300 0000000"/>
          <Field icon={<BadgeCheck className="w-4 h-4"/>} label="Medical License Number" value={form.license_number} onChange={v=>set("license_number",v)} placeholder="PMDC-12345"/>
        </div>

        <div className="flex justify-end mt-5">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-lg text-sm transition-colors">
            <Save className="w-4 h-4"/>{saving?"Saving...":"Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({icon,label,value,onChange,placeholder}){
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {icon&&<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          className={`w-full ${icon?"pl-9":"pl-3"} pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500`}/>
      </div>
    </div>
  );
}
