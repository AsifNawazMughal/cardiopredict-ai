"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getToken, getUser, authApi } from "../lib/api";
import { Heart, LayoutDashboard, Activity, Clock, LogOut, Users, UserCog } from "lucide-react";

const noopSubscribe = () => () => {};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  // useSyncExternalStore reads from localStorage on the client and returns null on the server,
  // avoiding both the hydration mismatch and the React Compiler's set-state-in-effect warning.
  const user = useSyncExternalStore(noopSubscribe, getUser, () => null);
  useEffect(() => {
    if (!getToken()) router.push("/login");
  }, [router]);
  const displayName = user?.first_name && user?.last_name ? `Dr. ${user.first_name} ${user.last_name}` : `Dr. ${user?.username || ""}`;
  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/predict",   icon: Activity,        label: "New Prediction" },
    { href: "/patients",  icon: Users,           label: "Patients" },
    { href: "/history",   icon: Clock,           label: "History" },
    { href: "/profile",   icon: UserCog,         label: "Profile" },
  ];
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" fill="currentColor"/>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">CardioPredict AI</p>
              <p className="text-xs text-gray-400">CS619 — FYP</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active?"bg-red-50 text-red-700":"text-gray-600 hover:bg-gray-100"}`}>
                <Icon className="w-4 h-4"/>{label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="mb-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.specialization || user?.role}</p>
            {user?.hospital_name && <p className="text-xs text-gray-400 truncate">{user.hospital_name}</p>}
          </div>
          <button onClick={() => { authApi.logout(); router.push("/login"); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4"/> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
