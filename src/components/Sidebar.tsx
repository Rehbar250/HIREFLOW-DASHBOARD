"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Briefcase, Target, Mail, Settings as Cog, Zap, LogOut } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/jobs", label: "Job roles", icon: Briefcase },
  { href: "/matching", label: "Match & shortlist", icon: Target },
  { href: "/email", label: "Email", icon: Mail },
];

export default function Sidebar({ company }: { company: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Zap className="h-4 w-4 text-white" /></div>
            <div>
              <div className="font-display text-sm font-semibold leading-tight">HireFlow</div>
              <div className="text-[11px] text-slate-400 leading-tight">{company}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active(n.href) ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}>
                <Icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-3 space-y-1">
          <Link href="/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active("/settings") ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}>
            <Cog className="h-4 w-4" /> Settings
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="md:hidden flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
        {[...NAV, { href: "/settings", label: "Settings", icon: Cog }].map((n) => (
          <Link key={n.href} href={n.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${active(n.href) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
            {n.label}
          </Link>
        ))}
      </div>
    </>
  );
}
