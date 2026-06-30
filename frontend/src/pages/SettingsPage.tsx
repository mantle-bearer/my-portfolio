import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { Button, Field, Input, PasswordInput } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { messageFromError } from "@/lib/errors";

export function SettingsPage() {
  const { user, refreshMe, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    await api("/auth/me", { method: "PATCH", body: JSON.stringify({ full_name: fullName, email }) });
    await refreshMe();
    setMessage("Profile updated");
  }

  async function changePassword(event: FormEvent) {
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
