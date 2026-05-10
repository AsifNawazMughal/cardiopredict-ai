"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "../../lib/api";
import AuthHeader from "./_components/AuthHeader";
import ModeTabs from "./_components/ModeTabs";
import StepIndicator from "./_components/StepIndicator";
import LoginFields from "./_components/LoginFields";
import RegisterStep1 from "./_components/RegisterStep1";
import RegisterStep2 from "./_components/RegisterStep2";
import { ChevronRight, ChevronLeft } from "lucide-react";

const EMPTY_FORM = {
  username: "", email: "", password: "", confirm_password: "",
  first_name: "", last_name: "", specialization: "Cardiology",
  hospital_name: "", phone: "", license_number: "",
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [availability, setAvailability] = useState({ username: null, email: null });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Username format check (no API call needed)
  const usernameFormatError =
    form.username.length === 0 ? null :
    form.username.length < 3   ? "Username must be at least 3 characters" :
    form.username.length > 20  ? "Username must be 20 characters or fewer" :
    !/^[a-zA-Z0-9._]+$/.test(form.username) ? "Only letters, digits, '.' and '_' allowed (no '@')" :
    null;

  // Live username availability (debounced 500ms)
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

  // Live email availability
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

  const passwordsMismatch = mode === "register" && form.confirm_password.length > 0 && form.password !== form.confirm_password;
  const passwordsMatch    = mode === "register" && form.confirm_password.length > 0 && form.password === form.confirm_password;

  const passwordRules = mode === "register" ? [
    { label: "At least 8 characters",         ok: form.password.length >= 8 },
    { label: "Contains an uppercase letter",  ok: /[A-Z]/.test(form.password) },
    { label: "Contains a lowercase letter",   ok: /[a-z]/.test(form.password) },
    { label: "Contains a digit",              ok: /[0-9]/.test(form.password) },
  ] : [];
  const passwordValid = passwordRules.every(r => r.ok);

  const stepBlocked = mode === "register" && step === 1 && (
    availability.username === "taken"    || availability.email === "taken" ||
    availability.username === "checking" || availability.email === "checking" ||
    passwordsMismatch || !passwordValid
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === "register" && step === 1) {
      if (stepBlocked) return;
      setStep(2); return;
    }
    setLoading(true);
    try {
      if (mode === "register") {
        await authApi.register({
          username: form.username, email: form.email, password: form.password,
          first_name: form.first_name, last_name: form.last_name,
          specialization: form.specialization, hospital_name: form.hospital_name,
          phone: form.phone, license_number: form.license_number,
        });
        toast.success("Account created successfully");
        await authApi.login(form.username, form.password);
        toast.success(`Welcome, Dr. ${form.first_name}!`);
      } else {
        const data = await authApi.login(form.username, form.password);
        toast.success(`Welcome back, ${data.user?.first_name || form.username}!`);
      }
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m) { setMode(m); setStep(1); }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <AuthHeader/>
        <div className="p-6">
          <ModeTabs mode={mode} onChange={switchMode}/>
          {mode === "register" && <StepIndicator step={step}/>}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "login" && <LoginFields form={form} set={set}/>}
            {mode === "register" && step === 1 && (
              <RegisterStep1
                form={form} set={set}
                availability={availability}
                usernameFormatError={usernameFormatError}
                passwordsMatch={passwordsMatch}
                passwordsMismatch={passwordsMismatch}
                passwordRules={passwordRules}
                passwordValid={passwordValid}
              />
            )}
            {mode === "register" && step === 2 && <RegisterStep2 form={form} set={set}/>}

            <div className="flex gap-2 pt-1">
              {mode === "register" && step === 2 && (
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4"/> Back
                </button>
              )}
              <button type="submit" disabled={loading || stepBlocked}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : step === 1 ? <><span>Next</span><ChevronRight className="w-4 h-4"/></> : "Create Account"}
              </button>
            </div>
          </form>

          <p className="text-center mt-4 text-sm text-gray-500">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="text-red-600 font-medium hover:underline">
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
