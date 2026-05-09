"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "../../lib/api";
import Field from "@/components/Field";
import { Heart, Lock, User, Mail, Phone, Building2, Stethoscope, BadgeCheck, ChevronRight, ChevronLeft, Check, X } from "lucide-react";

const SPECIALIZATIONS = ["Cardiology","General Medicine","Internal Medicine","Emergency Medicine","Family Medicine","Other"];

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

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username:"", email:"", password:"", confirm_password:"", first_name:"", last_name:"", specialization:"Cardiology", hospital_name:"", phone:"", license_number:"" });
  const [availability, setAvailability] = useState({ username: null, email: null });

  const set = (k, v) => setForm(p => ({...p, [k]: v}));

  // Username format + availability (registration only, debounced 500ms)
  const usernameFormatError =
    form.username.length === 0 ? null :
    form.username.length < 3 ? "Username must be at least 3 characters" :
    form.username.length > 20 ? "Username must be 20 characters or fewer" :
    !/^[a-zA-Z0-9._]+$/.test(form.username) ? "Only letters, digits, '.' and '_' allowed (no '@')" :
    null;

  useEffect(() => {
    if (mode !== "register" || !form.username) {
      setAvailability(a => ({ ...a, username: null }));
      return;
    }
    if (usernameFormatError) {
      setAvailability(a => ({ ...a, username: "taken" }));
      return;
    }
    setAvailability(a => ({ ...a, username: "checking" }));
    const t = setTimeout(async () => {
      try {
        const r = await authApi.checkAvailability({ username: form.username });
        setAvailability(a => ({ ...a, username: r.username_taken ? "taken" : "available" }));
      } catch { setAvailability(a => ({ ...a, username: null })); }
    }, 500);
    return () => clearTimeout(t);
  }, [form.username, mode, usernameFormatError]);

  // Live email availability check
  useEffect(() => {
    if (mode !== "register" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setAvailability(a => ({ ...a, email: null }));
      return;
    }
    setAvailability(a => ({ ...a, email: "checking" }));
    const t = setTimeout(async () => {
      try {
        const r = await authApi.checkAvailability({ email: form.email });
        setAvailability(a => ({ ...a, email: r.email_taken ? "taken" : "available" }));
      } catch { setAvailability(a => ({ ...a, email: null })); }
    }, 500);
    return () => clearTimeout(t);
  }, [form.email, mode]);

  const passwordsMismatch = mode==="register" && form.confirm_password.length > 0 && form.password !== form.confirm_password;
  const passwordsMatch = mode==="register" && form.confirm_password.length > 0 && form.password === form.confirm_password;

  const passwordRules = mode==="register" ? [
    { label: "At least 8 characters", ok: form.password.length >= 8 },
    { label: "Contains an uppercase letter", ok: /[A-Z]/.test(form.password) },
    { label: "Contains a lowercase letter", ok: /[a-z]/.test(form.password) },
    { label: "Contains a digit", ok: /[0-9]/.test(form.password) },
  ] : [];
  const passwordValid = passwordRules.every(r => r.ok);

  const stepBlocked = mode==="register" && step===1 &&
    (availability.username==="taken" || availability.email==="taken" ||
     availability.username==="checking" || availability.email==="checking" ||
     passwordsMismatch || !passwordValid);

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode==="register" && step===1) {
      if (availability.username==="taken" || availability.email==="taken" || passwordsMismatch || !passwordValid) return;
      setStep(2); return;
    }
    setLoading(true);
    try {
      if (mode==="register") {
        await authApi.register({ username:form.username, email:form.email, password:form.password, first_name:form.first_name, last_name:form.last_name, specialization:form.specialization, hospital_name:form.hospital_name, phone:form.phone, license_number:form.license_number });
        toast.success("Account created successfully");
        await authApi.login(form.username, form.password);
        toast.success(`Welcome, Dr. ${form.first_name}!`);
      } else {
        const data = await authApi.login(form.username, form.password);
        toast.success(`Welcome back, ${data.user?.first_name || form.username}!`);
      }
      router.push("/dashboard");
    } catch(err){ toast.error(err.message || "Something went wrong"); }
    finally{ setLoading(false); }
  }

  function switchMode(m){ setMode(m); setStep(1); }

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
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode==="login" && <>
              <Field icon={<User className="w-4 h-4"/>} label="Username" type="text" value={form.username} onChange={v=>set("username",v)} placeholder="Enter username" required/>
              <Field icon={<Lock className="w-4 h-4"/>} label="Password" type="password" value={form.password} onChange={v=>set("password",v)} placeholder="Enter password" required/>
            </>}
            {mode==="register" && step===1 && <>
              <div className="grid grid-cols-2 gap-3">
                <Field icon={<User className="w-4 h-4"/>} label="First Name" type="text" value={form.first_name} onChange={v=>set("first_name",v)} placeholder="John" required/>
                <Field label="Last Name" type="text" value={form.last_name} onChange={v=>set("last_name",v)} placeholder="Doe" required/>
              </div>
              <Field icon={<User className="w-4 h-4"/>} label="Username" type="text" value={form.username} onChange={v=>set("username",v)} placeholder="Choose username" required
                status={availability.username}
                statusMessage={
                  usernameFormatError ? usernameFormatError :
                  availability.username==="taken" ? "Username already taken" :
                  availability.username==="available" ? "Username is available" : null
                }/>
              <Field icon={<Mail className="w-4 h-4"/>} label="Email" type="email" value={form.email} onChange={v=>set("email",v)} placeholder="doctor@hospital.com" required
                status={availability.email} statusMessage={availability.email==="taken" ? "Email already registered" : availability.email==="available" ? "Email is available" : null}/>
              <div>
                <Field icon={<Lock className="w-4 h-4"/>} label="Password" type="password" value={form.password} onChange={v=>set("password",v)} placeholder="Min 8 characters" required/>
                {form.password.length > 0 && !passwordValid && (
                  <ul className="mt-1.5 space-y-0.5">
                    {passwordRules.map(r => (
                      <li key={r.label} className={`text-xs flex items-center gap-1.5 ${r.ok ? "text-green-600" : "text-gray-500"}`}>
                        {r.ok ? <Check className="w-3 h-3"/> : <X className="w-3 h-3"/>}
                        {r.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Field icon={<Lock className="w-4 h-4"/>} label="Confirm Password" type="password" value={form.confirm_password} onChange={v=>set("confirm_password",v)} placeholder="Re-enter password" required
                status={passwordsMismatch ? "taken" : passwordsMatch ? "available" : null}
                statusMessage={passwordsMismatch ? "Passwords do not match" : passwordsMatch ? "Passwords match" : null}/>
            </>}
            {mode==="register" && step===2 && <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <select value={form.specialization} onChange={e=>set("specialization",e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                    {SPECIALIZATIONS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <Field icon={<Building2 className="w-4 h-4"/>} label="Hospital / Clinic Name" type="text" value={form.hospital_name} onChange={v=>set("hospital_name",v)} placeholder="City General Hospital" required/>
              <PhoneField value={form.phone} onChange={v=>set("phone",v)}/>
              <Field icon={<BadgeCheck className="w-4 h-4"/>} label="Medical License Number" type="text" value={form.license_number} onChange={v=>set("license_number",v)} placeholder="PMDC-12345" required/>
            </>}
            <div className="flex gap-2 pt-1">
              {mode==="register" && step===2 && (
                <button type="button" onClick={()=>setStep(1)} className="flex items-center gap-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4"/> Back
                </button>
              )}
              <button type="submit" disabled={loading || stepBlocked} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
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

function PhoneField({ value, onChange }) {
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

