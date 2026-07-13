import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/components/theme";
import { staticPortfolioContent } from "@/data/portfolio";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { PortfolioContentResponse } from "@/types/portfolio";

type LogoProps = {
  variant?: "full" | "icon";
  className?: string;
  asLink?: boolean;
};

export function Logo({ variant = "full", className, asLink = true }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const branding = useQuery({
    queryKey: ["portfolio-publication"],
    queryFn: () => api<PortfolioContentResponse>("/portfolio"),
    retry: false,
    staleTime: 60_000
  }).data?.content?.branding ?? staticPortfolioContent.branding;
  const isDark = resolvedTheme === "dark";
  const asset = variant === "full"
    ? (isDark ? branding?.logoDark : branding?.logoLight)
    : (isDark ? branding?.markDark : branding?.markLight);
  const src = asset?.src || "/assets/images/brand-mark.svg";

  const image = (
    asset?.src ? (
      <img
        src={src}
        alt={asset.alt || branding?.logoAlt || "Goodluck Igbokwe"}
        className={cn(variant === "full" ? "logo-full" : "logo-icon", className)}
      />
    ) : (
      <span className={cn("brand-lockup", variant === "icon" && "brand-lockup-icon", className)}>
        <span className="brand-mark" aria-hidden="true">GI</span>
        {variant === "full" ? <span className="brand-wordmark">Goodluck Igbokwe</span> : null}
      </span>
    )
  );

  if (!asLink) return image;
  return <Link to="/">{image}</Link>;
}
