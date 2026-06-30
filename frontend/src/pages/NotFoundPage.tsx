import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/ui";

export function NotFoundPage() {
  return (
    <AppShell>
      <EmptyState>Page not found.</EmptyState>
    </AppShell>
  );
}
