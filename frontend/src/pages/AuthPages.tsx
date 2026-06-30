import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";

import { Footer } from "@/components/Common/Footer";
import { Logo } from "@/components/Common/Logo";
import { AppearanceButton } from "@/components/theme";
import { Button, Field, Input, PasswordInput } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { messageFromError } from "@/lib/errors";

function AuthLayout({ children }: { children: ReactNode }) {
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

export function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" />;

  async function submit(event: FormEvent) {
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

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" />;

  async function submit(event: FormEvent) {
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

export function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
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

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => new URLSearchParams(window.location.search).get("token") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
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
