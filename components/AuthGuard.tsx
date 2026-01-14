"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useUser } from "@/context/UserContext";

const PUBLIC_PATHS = ["/login", "/about", "/logout", "/favicon.ico", "/_not-found"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [authorized, setAuthorized] = useState(false);

  const isPublic = useMemo(
    () => PUBLIC_PATHS.some((p) => pathname === p || pathname?.startsWith(`${p}/`)),
    [pathname]
  );

  useEffect(() => {
    if (isPublic) {
      setAuthorized(true);
      return;
    }

    const cookieRole = Cookies.get("userType");
    const hasAuth = Boolean(user || cookieRole);

    if (hasAuth) {
      setAuthorized(true);
      return;
    }

    const redirectTo = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }, [isPublic, pathname, router, searchParams, user]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
