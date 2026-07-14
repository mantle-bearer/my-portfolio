import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, type ReactNode } from "react";

import { staticPortfolioContent } from "@/data/portfolio";
import { api } from "@/lib/api";
import type { PortfolioContent, PortfolioContentResponse } from "@/types/portfolio";

type PortfolioContentContextValue = {
  content: PortfolioContent;
  source: "published" | "draft" | "static";
  isLoading: boolean;
};

const PortfolioContentContext = createContext<PortfolioContentContextValue | null>(null);

function setMeta(name: string, content: string) {
  const element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    ?? document.createElement("meta");
  element.name = name;
  element.content = content;
  if (!element.parentElement) document.head.appendChild(element);
}

function setProperty(property: string, content: string) {
  const element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    ?? document.createElement("meta");
  element.setAttribute("property", property);
  element.content = content;
  if (!element.parentElement) document.head.appendChild(element);
}

function setCanonical(href: string) {
  const element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?? document.createElement("link");
  element.rel = "canonical";
  element.href = href;
  if (!element.parentElement) document.head.appendChild(element);
}

function setManifest(content: PortfolioContent, title: string, description: string) {
  const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!link) return () => undefined;
  const appRoot = new URL("/", window.location.origin).href;
  const icon = new URL(
    content.branding?.favicon?.src || "/assets/images/brand-mark.svg",
    window.location.origin
  ).href;
  const manifest = {
    id: appRoot,
    name: content.profile.name || title,
    short_name: content.profile.name || title,
    description,
    start_url: appRoot,
    scope: appRoot,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: content.seo.themeColor || "#06245a",
    icons: [{ src: icon, sizes: "any", purpose: "any maskable" }]
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" })
  );
  link.href = url;
  return () => URL.revokeObjectURL(url);
}

export function PortfolioContentProvider({
  children,
  previewContent
}: {
  children: ReactNode;
  previewContent?: PortfolioContent;
}) {
  const published = useQuery({
    queryKey: ["portfolio-publication"],
    queryFn: () => api<PortfolioContentResponse>("/portfolio"),
    enabled: previewContent === undefined,
    retry: false,
    staleTime: 60_000
  });
  const content = previewContent ?? published.data?.content ?? staticPortfolioContent;
  const source = previewContent
    ? "draft"
    : published.data?.content
      ? "published"
      : "static";

  useEffect(() => {
    const seo = content.seo;
    const title = seo.title || content.profile.name;
    const description = seo.description || content.profile.heroSummary;
    document.title = title;
    setMeta("description", description);
    setMeta("robots", seo.robots || "index,follow");
    setMeta("application-name", content.profile.name);
    setMeta("apple-mobile-web-app-title", content.profile.name);
    setMeta("theme-color", seo.themeColor || "#06245a");
    setProperty("og:title", seo.ogTitle || title);
    setProperty("og:description", seo.ogDescription || description);
    setProperty("og:image", seo.image || "");
    setMeta("twitter:card", seo.twitterCard || "summary_large_image");
    setMeta("twitter:title", seo.twitterTitle || title);
    setMeta("twitter:description", seo.twitterDescription || description);
    setMeta("twitter:image", seo.twitterImage || seo.image || "");
    if (seo.canonicalUrl) setCanonical(seo.canonicalUrl);
    const favicon = content.branding?.favicon?.src;
    if (favicon) {
      document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((link) => {
        link.href = favicon;
      });
    }
    return setManifest(content, title, description);
  }, [content]);

  return (
    <PortfolioContentContext.Provider
      value={{ content, source, isLoading: previewContent === undefined && published.isLoading }}
    >
      {children}
    </PortfolioContentContext.Provider>
  );
}

export function usePortfolioContent() {
  const context = useContext(PortfolioContentContext);
  if (!context) {
    throw new Error("usePortfolioContent must be used inside PortfolioContentProvider");
  }
  return context;
}
