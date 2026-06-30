import type { FormEvent } from "react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/Common/Modal";
import { RowActions } from "@/components/RowActions";
import { Badge, Button, EmptyState, Field, Input, PasswordInput, Select } from "@/components/ui";
import { api, hasRole, type RoleRead, type UserList, type UserRead } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { messageFromError } from "@/lib/errors";

export function AdminPage() {
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

  async function createUser(event: FormEvent) {
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
