'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/app/actions/permitions";
import { useUser } from "@/context/UserContext";

type NavItem = {
  label: string;
  path: string;
};

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Resumo Aliança", path: "/resumo/alianca" },
    { label: "Pessoas", path: "/pessoas" },
    { label: "Centros", path: "/centros" },
    { label: "Usuários", path: "/admin/usuarios" },
    { label: "Respostas públicas", path: "/respostas" },
  ],
  coord_geral: [
    { label: "Resumo Aliança", path: "/resumo/alianca" },
    { label: "Pessoas", path: "/pessoas" },
    { label: "Centros", path: "/centros" },
    { label: "Respostas públicas", path: "/respostas" },
  ],
  coord_regional: [
    { label: "Resumo Regional", path: "/resumo/coordenador" },
    { label: "Centros", path: "/centros" },
    { label: "Respostas públicas", path: "/respostas" },
  ],
  presidente: [
    { label: "Cadastro", path: "/cadastro" },
    { label: "Centros", path: "/centros" },
    { label: "Respostas públicas", path: "/respostas" },
  ],
};

function buildHref(path: string, role: UserRole, scope?: string) {
  if (!scope) return path;

  // Preservar escopo quando o usuário tem escopo específico.
  if (role === "coord_regional" && path.startsWith("/resumo/coordenador")) {
    return `${path}?regionalId=${scope}`;
  }

  if (role === "presidente" && path.startsWith("/cadastro")) {
    return `${path}?centroId=${scope}`;
  }

  return path;
}

export default function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => {
    const role = user?.role as UserRole | undefined;
    if (!role || !(role in NAV_BY_ROLE)) return [];
    return NAV_BY_ROLE[role];
  }, [user?.role]);

  useEffect(() => {
    // Fecha o menu móvel ao navegar
    setOpen(false);
  }, [pathname]);

  if (!navItems.length) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Desktop */}
      <nav className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700">
        {navItems.map((item) => {
          const href = buildHref(item.path, user!.role as UserRole, user?.scope);
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={href}
              className={`px-3 py-1 rounded-full transition ${isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "hover:bg-white hover:text-slate-900"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile */}
      <div className="relative md:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-800 shadow-sm"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          Menu
          <span className="inline-block h-3 w-3 rotate-45 border-b-2 border-r-2 border-slate-500" />
        </button>
        {open && (
          <div className="absolute left-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-30">
            <ul className="py-1 text-sm text-slate-800">
              {navItems.map((item) => {
                const href = buildHref(item.path, user!.role as UserRole, user?.scope);
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      href={href}
                      className={`block px-4 py-2 ${isActive
                        ? "bg-slate-900 text-white"
                        : "hover:bg-slate-100"
                        }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
