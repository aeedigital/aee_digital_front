'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  canAccessAbility,
  getPrimaryRole,
  type Ability,
  type UserRole,
} from "@/lib/access-control";

type NavItem = {
  label: string;
  path: string;
  ability: Ability;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Resumo Aliança", path: "/resumo/alianca", ability: "viewAllianceSummary" },
  { label: "Resumo Regional", path: "/resumo/coordenador", ability: "viewRegionalSummary" },
  { label: "Cadastro", path: "/cadastro", ability: "viewCadastro" },
  { label: "Pessoas", path: "/pessoas", ability: "managePeople" },
  { label: "Centros", path: "/centros", ability: "manageCenters" },
  { label: "Usuários", path: "/admin/usuarios", ability: "manageUsers" },
];

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
    const roles = user?.groups?.length ? user.groups : user?.role;
    return NAV_ITEMS.filter((item) => canAccessAbility(roles, item.ability));
  }, [user?.groups, user?.role]);

  const primaryRole = useMemo(
    () => getPrimaryRole(user?.groups?.length ? user.groups : user?.role) as UserRole | undefined,
    [user?.groups, user?.role]
  );

  useEffect(() => {
    // Fecha o menu móvel ao navegar
    setOpen(false);
  }, [pathname]);

  if (!navItems.length) return null;
  if (!primaryRole) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Desktop */}
      <nav className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700">
        {navItems.map((item) => {
          const href = buildHref(item.path, primaryRole, user?.scope);
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
                const href = buildHref(item.path, primaryRole, user?.scope);
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
