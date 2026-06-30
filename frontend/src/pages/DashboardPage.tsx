import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";

export function DashboardPage() {
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
