import { Link } from "@tanstack/react-router";

import { useTheme } from "@/components/theme";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "full" | "icon";
  className?: string;
  asLink?: boolean;
};

export function Logo({ variant = "full", className, asLink = true }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const src =
    variant === "full"
      ? isDark
        ? "/assets/images/fastapi-logo-light.svg"
        : "/assets/images/fastapi-logo.svg"
      : isDark
        ? "/assets/images/fastapi-icon-light.svg"
        : "/assets/images/fastapi-icon.svg";

  const image = (
    <img
      src={src}
      alt="FastAPI"
      className={cn(variant === "full" ? "logo-full" : "logo-icon", className)}
    />
  );

  if (!asLink) return image;
  return <Link to="/">{image}</Link>;
}
