import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { Briefcase, ChevronDown, FileText, Home, PanelLeft, Users, X } from "lucide-react";

import { Footer } from "@/components/Common/Footer";
import { Logo } from "@/components/Common/Logo";
import { AppearanceButton } from "@/components/theme";
import { hasRole, type UserRead } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function initials(user: UserRead | null) {
  const value = user?.full_name || user?.email || "User";
  return value
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Sidebar({
  className = "",
  onNavigate
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = hasRole(user, "admin");

  async function signOut() {
    onNavigate?.();
    await logout();
    await navigate({ to: "/login" });
  }

  return (
    <aside className={`sidebar ${className}`.trim()}>
      <div>
        <div className="sidebar-logo">
          <Logo />
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link" activeProps={{ className: "nav-link active" }} onClick={onNavigate}>
            <Home size={17} />
            <span>Dashboard</span>
          </Link>
          <Link to="/dashboard/items" className="nav-link" activeProps={{ className: "nav-link active" }} onClick={onNavigate}>
            <Briefcase size={17} />
            <span>Items</span>
          </Link>
          {isAdmin ? (
            <>
              <Link to="/dashboard/content/profile" className="nav-link" activeProps={{ className: "nav-link active" }} onClick={onNavigate}>
                <FileText size={17} />
                <span>Content</span>
              </Link>
              <Link to="/dashboard/users" className="nav-link" activeProps={{ className: "nav-link active" }} onClick={onNavigate}>
                <Users size={17} />
                <span>Users</span>
              </Link>
            </>
          ) : null}
        </nav>
      </div>
      <div className="sidebar-footer">
        <AppearanceButton sidebar />
        <details className="user-menu">
          <summary>
            <span className="avatar">{initials(user)}</span>
            <span className="user-email">{user?.email}</span>
            <ChevronDown size={14} />
          </summary>
          <div className="menu-panel">
            <Link to="/dashboard/settings" onClick={onNavigate}>
              User Settings
            </Link>
            <button type="button" onClick={() => void signOut()}>
              Log Out
            </button>
          </div>
        </details>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [drawerOpen]);

  if (isLoading) return <main className="loading">Loading...</main>;
  if (!user) return <Navigate to="/login" />;

  return (
    <main className="layout">
      <Sidebar className="desktop-sidebar" />
      {drawerOpen ? (
        <div className="mobile-drawer-layer" role="presentation" onMouseDown={() => setDrawerOpen(false)}>
          <aside
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="icon-button drawer-close" type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
              <X size={18} />
            </button>
            <Sidebar className="drawer-sidebar" onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}
      <section className="layout-main">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            type="button"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <PanelLeft size={18} />
          </button>
          <Logo variant="icon" className="topbar-logo" />
          <span className="topbar-title">Goodluck Igbokwe</span>
          <div className="topbar-spacer" />
          <AppearanceButton />
        </header>
        <div className="page-container">{children}</div>
        <Footer />
      </section>
    </main>
  );
}
