"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
  {
    href: "/tasks",
    label: "Tasks",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/annotate",
    label: "Annotate",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("auth-storage");
    document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
  };

  return (
    <aside className="sidebar w-56 min-h-screen flex flex-col py-6 px-3 shrink-0">
      {/* Logo */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #4f8ef7, #a78bfa)",
            }}
          >
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">TaskFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
          Workspace
        </p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx("nav-link", pathname.startsWith(item.href) && "active")}
          >
            <span className="nav-icon shrink-0">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        <div className="divider" />
        <button
          onClick={handleLogout}
          className="nav-link w-full text-left hover:text-rose-400"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
