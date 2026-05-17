"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/api";

type Branding = {
  header_logo_url: string | null;
  footer_logo_url: string | null;
};

type BrandMarkProps = {
  className?: string;
  height?: number;
  placement?: "header" | "footer";
  width?: number;
};

export default function BrandMark({ className = "", height = 112, placement = "header", width = 390 }: BrandMarkProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const logoClassName = ["brand-logo", className].filter(Boolean).join(" ");

  useEffect(() => {
    let mounted = true;

    fetch(`${API_BASE_URL}/branding`, { headers: { Accept: "application/json" } })
      .then((response) => response.json())
      .then((branding: Branding) => {
        if (!mounted) return;
        setLogoUrl(placement === "footer" ? branding.footer_logo_url : branding.header_logo_url);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [placement]);

  if (logoUrl) {
    return <img className={logoClassName} src={logoUrl} alt="KarryCards logo" width={width} height={height} />;
  }

  return <img className={`${logoClassName} default-brand-logo`} src="/logos/logo.svg" alt="KarryCards logo" width={width} height={height} />;
}
