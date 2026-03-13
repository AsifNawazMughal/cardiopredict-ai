"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../../lib/api";
import { Heart, Lock, User, Mail, Phone, Building2, Stethoscope, BadgeCheck, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";

const SPECIALIZATIONS = ["Cardiology","General Medicine","Internal Medicine","Emergency Medicine","Family Medicine","Other"];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username:"", email:"", password:"", confirm_password:"", first_name:"", last_name:"", specialization:"Cardiology", hospital_name:"", phone:"", license_number:"" });

  const set = (k, v) => setForm(p => ({...p, [k]: v}));

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode==="register" && step===1) { setStep(2); return; }
    if (mode==="register" && form.password !== form.confirm_password) { setError("Passwords do not match"); return; }
    setError(""); setLoading(true);
    try {
      if (mode==="register") {
        await authApi.register({ username:form.username, email:form.email, password:form.password, first_name:form.first_name, last_name:form.last_name, specialization:form.specialization, hospital_name:form.hospital_name, phone:form.phone, license_number:form.license_number });
        await authApi.login(form.username, form.password);
      } else {
        await authApi.login(form.username, form.password);
      }
      router.push("/dashboard");
    } catch(err){ setError(err.message || "Something went wrong"); }
    finally{ setLoading(false); }
  }

  function switchMode(m){ setMode(m); setStep(1); setError(""); }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-center text-white">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-3">
            <Heart className="w-7 h-7" fill="currentColor"/>
          </div>
          <h1 className="text-xl font-bold">CardioPredict AI</h1>
          <p className="text-red-100 text-sm mt-0.5">Heart Disease Risk Assessment System</p>
        </div>
        <div className="p-6">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
            {["login","register"].map(m => (
              <button key={m} onClick={()=>switchMode(m)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode===m?"bg-white shadow text-red-600":"text-gray-500"}`}>
                {m==="login"?"Sign In":"Register"}
              </button>
            ))}
          </div>
          {mode==="register" && (
            <div className="flex items-center gap-2 mb-4">
              {[1,2].map(s=>(
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${step>=s?"bg-red-600 text-white":"bg-gray-200 text-gray-500"}`}>{s}</div>
                  <span className={`text-xs ${step>=s?"text-red-600 font-medium":"text-gray-400"}`}>{s===1?"Account":"Doctor Profile"}</span>
                  {s<2 && <div className={`h-px flex-1 ${step>s?"bg-red-400":"bg-gray-200"}`}/>}
                </div>
              ))}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode==="login" && <>
              <Field icon={<User className="w-4 h-4"/>} label="Username" type="text" value={form.username} onChange={v=>set("username",v)} placeholder="Enter username"/>
              <Field icon={<Lock className="w-4 h-4"/>} label="Password" type="password" value={form.password} onChange={v=>set("password",v)} placeholder="Enter password"/>
            </>}
            {mode==="register" && step===1 && <>
              <div className="grid grid-cols-2 gap-3">
                <Field icon={<User className="w-4 h-4"/>} label="First Name" type="text" value={form.first_name} onChange={v=>set("first_name",v)} placeholder="John"/>
                <Field label="Last Name" type="text" value={form.last_name} onChange={v=>set("last_name",v)} placeholder="Doe"/>
              </div>
              <Field icon={<User className="w-4 h-4"/>} label="Username" type="text" value={form.username} onChange={v=>set("username",v)} placeholder="Choose username"/>
              <Field icon={<Mail className="w-4 h-4"/>} label="Email" type="email" value={form.email} onChange={v=>set("email",v)} placeholder="doctor@hospital.com"/>
              <Field icon={<Lock className="w-4 h-4"/>} label="Password" type="password" value={form.password} onChange={v=>set("password",v)} placeholder="Min 8 characters"/>
              <Field icon={<Lock className="w-4 h-4"/>} label="Confirm Password" type="password" value={form.confirm_password} onChange={v=>set("confirm_password",v)} placeholder="Re-enter password"/>
            </>}
            {mode==="register" && step===2 && <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <select value={form.specialization} onChange={e=>set("specialization",e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                    {SPECIALIZATIONS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <Field icon={<Building2 className="w-4 h-4"/>} label="Hospital / Clinic Name" type="text" value={form.hospital_name} onChange={v=>set("hospital_name",v)} placeholder="City General Hospital"/>
              <Field icon={<Phone className="w-4 h-4"/>} label="Phone Number" type="tel" value={form.phone} onChange={v=>set("phone",v)} placeholder="+92 300 0000000"/>
              <Field icon={<BadgeCheck className="w-4 h-4"/>} label="Medical License Number" type="text" value={form.license_number} onChange={v=>set("license_number",v)} placeholder="PMDC-12345"/>
            </>}
            <div className="flex gap-2 pt-1">
              {mode==="register" && step===2 && (
                <button type="button" onClick={()=>setStep(1)} className="flex items-center gap-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4"/> Back
                </button>
              )}
              <button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading ? "Please wait..." : mode==="login" ? "Sign In" : step===1 ? <><span>Next</span><ChevronRight className="w-4 h-4"/></> : "Create Account"}
              </button>
            </div>
          </form>
          <p className="text-center mt-4 text-sm text-gray-500">
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>switchMode(mode==="login"?"register":"login")} className="text-red-600 font-medium hover:underline">
              {mode==="login"?"Register":"Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} required placeholder={placeholder}
          className={`w-full ${icon?"pl-9":"pl-3"} pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500`}/>
      </div>
    </div>
  );
}
