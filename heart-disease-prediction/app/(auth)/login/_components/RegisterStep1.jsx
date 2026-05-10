"use client";
import Field from "@/components/Field";
import { User, Mail, Lock, Check, X } from "lucide-react";

export default function RegisterStep1({
  form, set,
  availability, usernameFormatError,
  passwordsMatch, passwordsMismatch,
  passwordRules, passwordValid,
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field icon={<User className="w-4 h-4"/>} label="First Name" type="text" value={form.first_name} onChange={v=>set("first_name",v)} placeholder="John" required/>
        <Field label="Last Name" type="text" value={form.last_name} onChange={v=>set("last_name",v)} placeholder="Doe" required/>
      </div>

      <Field icon={<User className="w-4 h-4"/>} label="Username" type="text"
        value={form.username} onChange={v=>set("username",v)} placeholder="Choose username" required
        status={availability.username}
        statusMessage={
          usernameFormatError ? usernameFormatError :
          availability.username === "taken" ? "Username already taken" :
          availability.username === "available" ? "Username is available" : null
        }/>

      <Field icon={<Mail className="w-4 h-4"/>} label="Email" type="email"
        value={form.email} onChange={v=>set("email",v)} placeholder="doctor@hospital.com" required
        status={availability.email}
        statusMessage={
          availability.email === "taken" ? "Email already registered" :
          availability.email === "available" ? "Email is available" : null
        }/>

      <div>
        <Field icon={<Lock className="w-4 h-4"/>} label="Password" type="password"
          value={form.password} onChange={v=>set("password",v)} placeholder="Min 8 characters" required/>
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

      <Field icon={<Lock className="w-4 h-4"/>} label="Confirm Password" type="password"
        value={form.confirm_password} onChange={v=>set("confirm_password",v)} placeholder="Re-enter password" required
        status={passwordsMismatch ? "taken" : passwordsMatch ? "available" : null}
        statusMessage={passwordsMismatch ? "Passwords do not match" : passwordsMatch ? "Passwords match" : null}/>
    </>
  );
}
