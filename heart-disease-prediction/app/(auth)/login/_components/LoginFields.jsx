"use client";
import Field from "@/components/Field";
import { User, Lock } from "lucide-react";

export default function LoginFields({ form, set }) {
  return (
    <>
      <Field icon={<User className="w-4 h-4"/>} label="Username or Email" type="text"     value={form.username} onChange={v=>set("username",v)} placeholder="Enter username or email" required/>
      <Field icon={<Lock className="w-4 h-4"/>} label="Password"           type="password" value={form.password} onChange={v=>set("password",v)} placeholder="Enter password"           required/>
    </>
  );
}
