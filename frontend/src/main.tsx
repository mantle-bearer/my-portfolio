import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Navigate,
  Outlet,
  RouterProvider,
  useNavigate
} from "@tanstack/react-router";
import { Briefcase, ChevronDown, Home, MoreVertical, PanelLeft, Plus, Users, X } from "lucide-react";

import { Footer } from "@/components/Common/Footer";
import { Logo } from "@/components/Common/Logo";
import { Modal } from "@/components/Common/Modal";
import { AppearanceButton, ThemeProvider } from "@/components/theme";
import { Badge, Button, EmptyState, Field, Input, PasswordInput, Select } from "@/components/ui";
import { api, hasRole, type ItemList, type ItemRead, type RoleRead, type UserList, type UserRead } from "@/lib/api";
import { AuthProvider, useAuth } from "@/lib/auth";
import "./styles.css";

const queryClient = new QueryClient();

function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function initials(user: UserRead | null) {
  const value = user?.full_name || user?.email || "User";
  return value
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-layout" data-auth-layout>
      <section className="auth-logo-panel" aria-label="FastAPI">
        <Logo variant="full" className="auth-logo" asLink={false} />
      </section>
      <section className="auth-form-panel">
        <div className="auth-theme">
          <AppearanceButton />
        </div>
        <div className="auth-form-wrap">{children}</div>
        <Footer />
      </section>
    </main>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await login({ email, password });
      await navigate({ to: "/" });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit}>
        <h1>Login to your account</h1>
        <Field label="Email">
          <Input
            value={email}
            placeholder="user@example.com"
            type="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field
          label={
            <span className="field-split">
              <span>Password</span>
              <Link to="/recover-password">Forgot your password?</Link>
            </span>
          }
        >
          <PasswordInput
            value={password}
            placeholder="Password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit">Log In</Button>
        <p className="auth-switch">
          Don't have an account yet? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const { signup, user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("The passwords don't match");
      return;
    }
    try {
      await signup({ email, password, full_name: fullName });
      await navigate({ to: "/" });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit}>
        <h1>Create an account</h1>
        <Field label="Full Name">
          <Input value={fullName} placeholder="User" onChange={(event) => setFullName(event.target.value)} />
        </Field>
        <Field label="Email">
          <Input value={email} placeholder="user@example.com" type="email" onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="Password">
          <PasswordInput value={password} placeholder="Password" onChange={(event) => setPassword(event.target.value)} />
        </Field>
        <Field label="Confirm Password">
          <PasswordInput
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </Field>
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit">Sign Up</Button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await api<{ message: string }>("/auth/password-recovery", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setMessage(result.message);
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit}>
        <h1>Password Recovery</h1>
        <Field label="Email">
          <Input value={email} placeholder="user@example.com" type="email" onChange={(event) => setEmail(event.target.value)} />
        </Field>
        {message ? <p className="form-success">{message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit">Recover Password</Button>
        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => new URLSearchParams(window.location.search).get("token") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: password })
      });
      await navigate({ to: "/login" });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit}>
        <h1>Reset Password</h1>
        <Field label="Token">
          <Input value={token} onChange={(event) => setToken(event.target.value)} />
        </Field>
        <Field label="New Password">
          <PasswordInput value={password} placeholder="Password" onChange={(event) => setPassword(event.target.value)} />
        </Field>
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit">Reset Password</Button>
      </form>
    </AuthLayout>
  );
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
          <Link to="/" className="nav-link" activeProps={{ className: "nav-link active" }} onClick={onNavigate}>
            <Home size={17} />
            <span>Dashboard</span>
          </Link>
          <Link to="/items" className="nav-link" activeProps={{ className: "nav-link active" }} onClick={onNavigate}>
            <Briefcase size={17} />
            <span>Items</span>
          </Link>
          {isAdmin ? (
            <Link to="/admin" className="nav-link" activeProps={{ className: "nav-link active" }} onClick={onNavigate}>
              <Users size={17} />
              <span>Admin</span>
            </Link>
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
            <Link to="/settings" onClick={onNavigate}>
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

function AppShell({ children }: { children: React.ReactNode }) {
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
          <span className="topbar-title">Full Stack FastAPI</span>
          <div className="topbar-spacer" />
          <AppearanceButton />
        </header>
        <div className="page-container">{children}</div>
        <Footer />
      </section>
    </main>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  return (
    <AppShell>
      <section className="simple-dashboard">
        <h1>Hi, {user?.full_name || user?.email}</h1>
        <p>Welcome back, nice to see you again!!!</p>
      </section>
    </AppShell>
  );
}

function RowActions({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mobile, setMobile] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function placeMenu() {
      const useMobileSheet = window.matchMedia("(max-width: 760px)").matches;
      setMobile(useMobileSheet);
      if (useMobileSheet) return;
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const menuWidth = 160;
      const menuHeight = Math.max(88, React.Children.count(children) * 38 + 12);
      const top =
        rect.bottom + menuHeight + 8 > window.innerHeight
          ? Math.max(8, rect.top - menuHeight - 4)
          : rect.bottom + 4;
      const left = Math.min(window.innerWidth - menuWidth - 8, Math.max(8, rect.right - menuWidth));
      setPosition({ top, left });
    }

    placeMenu();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [children, open]);

  return (
    <div className="row-actions">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Actions"
        className="row-actions-trigger"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreVertical size={18} />
      </button>
      {open && mobile ? (
        <div className="action-sheet-layer" role="presentation" onMouseDown={() => setOpen(false)}>
          <div
            className="action-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Row actions"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => setOpen(false)}
          >
            {children}
          </div>
        </div>
      ) : null}
      {open && !mobile ? (
        <div className="row-menu" style={{ top: position.top, left: position.left, right: "auto" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function ItemsPage() {
  const queryClient = useQueryClient();
  const items = useQuery({ queryKey: ["items"], queryFn: () => api<ItemList>("/items") });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ItemRead | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function openForm(item?: ItemRead) {
    setEditing(item ?? null);
    setTitle(item?.title ?? "");
    setDescription(item?.description ?? "");
    setError("");
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: () =>
      editing
        ? api(`/items/${editing.id}`, {
            method: "PATCH",
            body: JSON.stringify({ title, description })
          })
        : api("/items", {
            method: "POST",
            body: JSON.stringify({ title, description })
          }),
    onSuccess: async () => {
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (err) => setError(messageFromError(err))
  });

  async function remove(item: ItemRead) {
    await api(`/items/${item.id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["items"] });
  }

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <h1>Items</h1>
          <p>Create and manage your items</p>
        </div>
        <Button type="button" onClick={() => openForm()}>
          <Plus size={16} />
          Add Item
        </Button>
      </div>
      <DataTable
        headers={["ID", "Title", "Description", ""]}
        rows={items.data?.data ?? []}
        empty="No results found."
        renderRow={(item) => (
          <tr key={item.id}>
            <td className="mono">{item.id}</td>
            <td className="strong">{item.title}</td>
            <td className={!item.description ? "muted italic" : "muted"}>{item.description || "No description"}</td>
            <td className="actions-cell">
              <RowActions>
                <button type="button" onClick={() => openForm(item)}>
                  Edit
                </button>
                <button type="button" onClick={() => void remove(item)}>
                  Delete
                </button>
              </RowActions>
            </td>
          </tr>
        )}
        renderMobileRow={(item) => (
          <article className="mobile-row-card" key={item.id}>
            <div className="mobile-row-top">
              <div>
                <h2>{item.title}</h2>
                <p className={!item.description ? "muted italic" : "muted"}>{item.description || "No description"}</p>
              </div>
              <RowActions>
                <button type="button" onClick={() => openForm(item)}>
                  Edit
                </button>
                <button type="button" onClick={() => void remove(item)}>
                  Delete
                </button>
              </RowActions>
            </div>
            <dl className="mobile-row-meta">
              <div>
                <dt>ID</dt>
                <dd className="mono">{item.id}</dd>
              </div>
            </dl>
          </article>
        )}
      />
      <Modal title={editing ? "Edit Item" : "Add Item"} open={open} onClose={() => setOpen(false)}>
        <form
          className="modal-form"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <Field label="Title">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label="Description">
            <Input value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit">{editing ? "Save" : "Create item"}</Button>
        </form>
      </Modal>
    </AppShell>
  );
}

type DataTableProps<T> = {
  headers: string[];
  rows: T[];
  empty: string;
  renderRow: (row: T) => React.ReactNode;
  renderMobileRow: (row: T) => React.ReactNode;
};

function DataTable<T>({ headers, rows, empty, renderRow, renderMobileRow }: DataTableProps<T>) {
  return (
    <section className="table-shell">
      <table className="desktop-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map(renderRow)
          ) : (
            <tr>
              <td colSpan={headers.length}>
                <EmptyState>{empty}</EmptyState>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="mobile-list">
        {rows.length ? rows.map(renderMobileRow) : <EmptyState>{empty}</EmptyState>}
      </div>
    </section>
  );
}

function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => api<UserList>("/admin/users") });
  const roles = useQuery({ queryKey: ["roles"], queryFn: () => api<RoleRead[]>("/admin/roles") });
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  if (!hasRole(user, "admin")) {
    return (
      <AppShell>
        <EmptyState>Admin access required.</EmptyState>
      </AppShell>
    );
  }

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/admin/users", {
        method: "POST",
        body: JSON.stringify({ email, full_name: fullName, password, role_names: [role] })
      });
      setOpen(false);
      setEmail("");
      setFullName("");
      setPassword("");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  async function setActive(target: UserRead, isActive: boolean) {
    await api(`/admin/users/${target.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive })
    });
    await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  }

  async function deleteUser(target: UserRead) {
    await api(`/admin/users/${target.id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  }

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <h1>Users</h1>
          <p>Manage user accounts and permissions</p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Add User
        </Button>
      </div>
      <DataTable
        headers={["Full Name", "Email", "Role", "Status", ""]}
        rows={users.data?.data ?? []}
        empty="No results found."
        renderRow={(target) => {
          const admin = hasRole(target, "admin");
          return (
            <tr key={target.id}>
              <td>
                <span className={!target.full_name ? "muted" : "strong"}>{target.full_name || "N/A"}</span>
                {target.id === user?.id ? <Badge className="you-badge">You</Badge> : null}
              </td>
              <td className="muted">{target.email}</td>
              <td>
                <Badge tone={admin ? "good" : "neutral"}>{admin ? "Superuser" : "User"}</Badge>
              </td>
              <td>
                <span className="status-dot" />
                {target.is_active ? "Active" : "Inactive"}
              </td>
              <td className="actions-cell">
                <RowActions>
                  <button type="button" onClick={() => void setActive(target, !target.is_active)}>
                    {target.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button type="button" disabled={target.id === user?.id} onClick={() => void deleteUser(target)}>
                    Delete
                  </button>
                </RowActions>
              </td>
            </tr>
          );
        }}
        renderMobileRow={(target) => {
          const admin = hasRole(target, "admin");
          return (
            <article className="mobile-row-card" key={target.id}>
              <div className="mobile-row-top">
                <div>
                  <h2>
                    {target.full_name || "N/A"}
                    {target.id === user?.id ? <Badge className="you-badge">You</Badge> : null}
                  </h2>
                  <p className="muted">{target.email}</p>
                </div>
                <RowActions>
                  <button type="button" onClick={() => void setActive(target, !target.is_active)}>
                    {target.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button type="button" disabled={target.id === user?.id} onClick={() => void deleteUser(target)}>
                    Delete
                  </button>
                </RowActions>
              </div>
              <dl className="mobile-row-meta mobile-row-meta-inline">
                <div>
                  <dt>Role</dt>
                  <dd>
                    <Badge tone={admin ? "good" : "neutral"}>{admin ? "Superuser" : "User"}</Badge>
                  </dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <span className="status-dot" />
                    {target.is_active ? "Active" : "Inactive"}
                  </dd>
                </div>
              </dl>
            </article>
          );
        }}
      />
      <Modal title="Add User" open={open} onClose={() => setOpen(false)}>
        <form className="modal-form" onSubmit={createUser}>
          <Field label="Full Name">
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={email} type="email" onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Password">
            <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={(event) => setRole(event.target.value)}>
              {roles.data?.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit">Add User</Button>
        </form>
      </Modal>
    </AppShell>
  );
}

function SettingsPage() {
  const { user, refreshMe, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    await api("/auth/me", { method: "PATCH", body: JSON.stringify({ full_name: fullName, email }) });
    await refreshMe();
    setMessage("Profile updated");
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/auth/me/password", {
        method: "POST",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      });
      await logout();
      await navigate({ to: "/login" });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  async function deleteAccount() {
    try {
      await api("/auth/me", { method: "DELETE" });
      await logout();
      await navigate({ to: "/login" });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  return (
    <AppShell>
      <div className="settings-page">
        <div className="page-heading">
          <div>
            <h1>User Settings</h1>
            <p>Manage your account settings and preferences</p>
          </div>
        </div>
        <div className="tabs">
          <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")} type="button">
            My profile
          </button>
          <button className={tab === "password" ? "active" : ""} onClick={() => setTab("password")} type="button">
            Password
          </button>
          <button className={tab === "danger" ? "active" : ""} onClick={() => setTab("danger")} type="button">
            Danger zone
          </button>
        </div>
        {tab === "profile" ? (
          <form className="settings-card" onSubmit={saveProfile}>
            <Field label="Full Name">
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </Field>
            <Field label="Email">
              <Input value={email} type="email" onChange={(event) => setEmail(event.target.value)} />
            </Field>
            <Button type="submit">Save</Button>
          </form>
        ) : null}
        {tab === "password" ? (
          <form className="settings-card" onSubmit={changePassword}>
            <Field label="Current Password">
              <PasswordInput value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
            </Field>
            <Field label="New Password">
              <PasswordInput value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </Field>
            <Button type="submit">Update Password</Button>
          </form>
        ) : null}
        {tab === "danger" ? (
          <div className="settings-card">
            <h2>Delete account</h2>
            <p className="muted">Permanently remove your account and owned data.</p>
            <Button type="button" variant="danger" onClick={() => void deleteAccount()}>
              Delete Account
            </Button>
          </div>
        ) : null}
        {message ? <p className="form-success narrow-message">{message}</p> : null}
        {error ? <p className="form-error narrow-message">{error}</p> : null}
      </div>
    </AppShell>
  );
}

function NotFoundPage() {
  return (
    <AppShell>
      <EmptyState>Page not found.</EmptyState>
    </AppShell>
  );
}

const rootRoute = createRootRoute({ component: () => <Outlet /> });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: DashboardPage });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginPage });
const signupRoute = createRoute({ getParentRoute: () => rootRoute, path: "/signup", component: SignupPage });
const recoverRoute = createRoute({ getParentRoute: () => rootRoute, path: "/recover-password", component: RecoverPasswordPage });
const resetRoute = createRoute({ getParentRoute: () => rootRoute, path: "/reset-password", component: ResetPasswordPage });
const itemsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/items", component: ItemsPage });
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin", component: AdminPage });
const settingsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/settings", component: SettingsPage });
const notFoundRoute = createRoute({ getParentRoute: () => rootRoute, path: "*", component: NotFoundPage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  recoverRoute,
  resetRoute,
  itemsRoute,
  adminRoute,
  settingsRoute,
  notFoundRoute
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
