import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/Common/Modal";
import { RowActions } from "@/components/RowActions";
import { Button, Field, Input } from "@/components/ui";
import { api, type ItemList, type ItemRead } from "@/lib/api";
import { messageFromError } from "@/lib/errors";

export function ItemsPage() {
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
          onSubmit={(event: FormEvent) => {
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
