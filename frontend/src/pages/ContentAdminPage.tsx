import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "@tanstack/react-router";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Eye,
  FilePlus2,
  History,
  Plus,
  RotateCcw,
  Save,
  Send,
  Upload
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Modal } from "@/components/Common/Modal";
import { Badge, Button, EmptyState, Field, Input, Select } from "@/components/ui";
import { api, hasRole } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { messageFromError } from "@/lib/errors";
import { PortfolioPage } from "@/pages/PortfolioPage";
import type {
  CmsOrderedRecord,
  ContactSubmissionDraft,
  MediaAssetDraft,
  PortfolioSiteDraft,
  SectionSettingDraft
} from "@/types/cms";
import type {
  PortfolioContentResponse,
  PortfolioPublication
} from "@/types/portfolio";

export type ContentScreen =
  | "profile"
  | "about"
  | "stacks"
  | "services"
  | "projects"
  | "posts"
  | "media"
  | "contact"
  | "seo";

type EditorValue = string | boolean;
type EditorField = {
  key: string;
  label: string;
  kind?: "text" | "textarea" | "checkbox" | "select" | "tags" | "json" | "datetime";
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  defaultValue?: EditorValue;
};

const contentScreens: Array<{ key: ContentScreen; label: string }> = [
  { key: "profile", label: "Profile" },
  { key: "about", label: "About" },
  { key: "stacks", label: "Stacks" },
  { key: "services", label: "Services" },
  { key: "projects", label: "Projects" },
  { key: "posts", label: "Posts" },
  { key: "media", label: "Media" },
  { key: "contact", label: "Contact" },
  { key: "seo", label: "SEO" }
];

const iconOptions = [
  "api",
  "code",
  "database",
  "django",
  "email",
  "fastapi",
  "github",
  "laravel",
  "layers",
  "linkedin",
  "performance",
  "php",
  "python",
  "react",
  "shield",
  "typescript",
  "workflow"
].map((value) => ({ label: value, value }));

function useMediaOptions() {
  const media = useQuery({
    queryKey: ["portfolio-admin", "media"],
    queryFn: () => api<MediaAssetDraft[]>("/admin/portfolio/media")
  });
  return [
    { label: "No image", value: "" },
    ...(media.data ?? []).map((item) => ({ label: item.filename, value: item.id }))
  ];
}

function renderEditorField(
  field: EditorField,
  value: EditorValue,
  update: (value: EditorValue) => void
) {
  if (field.kind === "checkbox") {
    return (
      <label className="cms-check-field" key={field.key}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => update(event.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  }
  if (field.kind === "textarea" || field.kind === "json") {
    return (
      <Field label={field.label} key={field.key}>
        <textarea
          className="input cms-textarea"
          value={String(value ?? "")}
          required={field.required}
          spellCheck={field.kind !== "json"}
          onChange={(event) => update(event.target.value)}
        />
      </Field>
    );
  }
  if (field.kind === "select") {
    return (
      <Field label={field.label} key={field.key}>
        <Select value={String(value ?? "")} onChange={(event) => update(event.target.value)}>
          {(field.options ?? []).map((option) => (
            <option key={`${field.key}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
    );
  }
  return (
    <Field label={field.label} key={field.key}>
      <Input
        type={field.kind === "datetime" ? "datetime-local" : "text"}
        value={String(value ?? "")}
        required={field.required}
        onChange={(event) => update(event.target.value)}
      />
    </Field>
  );
}

function initialEditorValues(fields: EditorField[], record?: CmsOrderedRecord) {
  return Object.fromEntries(
    fields.map((field) => {
      const raw = record?.[field.key];
      if (field.kind === "checkbox") return [field.key, Boolean(raw ?? field.defaultValue)];
      if (field.kind === "json") {
        return [field.key, raw ? JSON.stringify(raw, null, 2) : String(field.defaultValue ?? "[]")];
      }
      if (field.kind === "tags") {
        return [field.key, Array.isArray(raw) ? raw.join(", ") : String(raw ?? field.defaultValue ?? "")];
      }
      if (field.kind === "datetime" && raw) {
        return [field.key, String(raw).slice(0, 16)];
      }
      if (field.kind === "select" && raw === undefined) {
        return [field.key, String(field.defaultValue ?? field.options?.[0]?.value ?? "")];
      }
      return [field.key, String(raw ?? field.defaultValue ?? "")];
    })
  ) as Record<string, EditorValue>;
}

function editorPayload(fields: EditorField[], values: Record<string, EditorValue>) {
  return Object.fromEntries(
    fields.map((field) => {
      const raw = values[field.key];
      if (field.kind === "checkbox") return [field.key, Boolean(raw)];
      if (field.kind === "tags") {
        return [
          field.key,
          String(raw)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        ];
      }
      if (field.kind === "json") return [field.key, JSON.parse(String(raw || "[]"))];
      if (field.kind === "datetime") {
        return [field.key, raw ? new Date(String(raw)).toISOString() : null];
      }
      if (field.kind === "select" && String(raw) === "") return [field.key, null];
      return [field.key, String(raw).trim()];
    })
  );
}

function CollectionEditor({
  endpoint,
  title,
  fields,
  titleKey,
  summaryKey
}: {
  endpoint: string;
  title: string;
  fields: EditorField[];
  titleKey: string;
  summaryKey?: string;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["portfolio-admin", endpoint];
  const records = useQuery({
    queryKey,
    queryFn: () => api<CmsOrderedRecord[]>(`/admin/portfolio/${endpoint}`)
  });
  const [editing, setEditing] = useState<CmsOrderedRecord | null | undefined>();
  const [values, setValues] = useState<Record<string, EditorValue>>(() => initialEditorValues(fields));
  const [error, setError] = useState("");

  function openEditor(record?: CmsOrderedRecord) {
    setEditing(record ?? null);
    setValues(initialEditorValues(fields, record));
    setError("");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const payload = editorPayload(fields, values);
      if (editing?.id) {
        await api(`/admin/portfolio/${endpoint}/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...payload, expected_updated_at: editing.updated_at })
        });
      } else {
        await api(`/admin/portfolio/${endpoint}`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      setEditing(undefined);
      await queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  async function archive(record: CmsOrderedRecord) {
    await api(`/admin/portfolio/${endpoint}/${record.id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey });
  }

  async function move(index: number, direction: -1 | 1) {
    const next = [...(records.data ?? [])];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await api(`/admin/portfolio/${endpoint}/order`, {
      method: "PUT",
      body: JSON.stringify({ ids: next.map((record) => record.id) })
    });
    queryClient.setQueryData(queryKey, next);
  }

  return (
    <section className="cms-panel">
      <header className="cms-panel-heading">
        <h2>{title}</h2>
        <Button type="button" variant="secondary" onClick={() => openEditor()}>
          <Plus size={15} />
          Add
        </Button>
      </header>
      <div className="cms-record-list">
        {records.isLoading ? <p className="loading">Loading {title.toLowerCase()}...</p> : null}
        {records.isError ? <p className="form-error" role="alert">{messageFromError(records.error)}</p> : null}
        {(records.data ?? []).map((record, index) => (
          <article className="cms-record" key={record.id}>
            <div className="cms-record-order">
              <button type="button" aria-label={`Move ${String(record[titleKey])} up`} disabled={index === 0} onClick={() => void move(index, -1)}>
                <ArrowUp size={15} />
              </button>
              <button type="button" aria-label={`Move ${String(record[titleKey])} down`} disabled={index === (records.data?.length ?? 0) - 1} onClick={() => void move(index, 1)}>
                <ArrowDown size={15} />
              </button>
            </div>
            <div className="cms-record-copy">
              <h3>{String(record[titleKey] ?? "Untitled")}</h3>
              {summaryKey && record[summaryKey] ? <p>{String(record[summaryKey])}</p> : null}
            </div>
            <Badge tone={record.is_visible ? "good" : "neutral"}>
              {record.is_visible ? "Visible" : "Hidden"}
            </Badge>
            <div className="cms-record-actions">
              <Button type="button" variant="ghost" onClick={() => openEditor(record)}>Edit</Button>
              <button className="icon-button" type="button" aria-label={`Archive ${String(record[titleKey])}`} onClick={() => void archive(record)}>
                <Archive size={16} />
              </button>
            </div>
          </article>
        ))}
        {!records.isLoading && !records.data?.length ? <EmptyState>No content yet.</EmptyState> : null}
      </div>
      <Modal
        title={`${editing?.id ? "Edit" : "Add"} ${title}`}
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
      >
        <form className="modal-form cms-editor-form" onSubmit={save}>
          {fields.map((field) =>
            renderEditorField(field, values[field.key] ?? "", (value) =>
              setValues((current) => ({ ...current, [field.key]: value }))
            )
          )}
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit">
            <Save size={15} />
            Save
          </Button>
        </form>
      </Modal>
    </section>
  );
}

function SiteEditor({ mode, mediaOptions }: { mode: "profile" | "seo"; mediaOptions: EditorField["options"] }) {
  const queryClient = useQueryClient();
  const site = useQuery({
    queryKey: ["portfolio-admin", "site"],
    queryFn: () => api<PortfolioSiteDraft>("/admin/portfolio/site")
  });
  const fields: EditorField[] = mode === "seo"
    ? [
        { key: "seo_title", label: "Page title", required: true },
        { key: "seo_description", label: "Meta description", kind: "textarea", required: true },
        { key: "canonical_url", label: "Canonical URL" },
        { key: "robots_directive", label: "Robots directive", kind: "select", options: ["index,follow", "index,nofollow", "noindex,follow", "noindex,nofollow"].map((value) => ({ label: value, value })) },
        { key: "og_title", label: "Open Graph title" },
        { key: "og_description", label: "Open Graph description", kind: "textarea" },
        { key: "og_image_media_id", label: "Open Graph image", kind: "select", options: mediaOptions },
        { key: "twitter_card", label: "Twitter card", kind: "select", options: ["summary_large_image", "summary"].map((value) => ({ label: value, value })) },
        { key: "twitter_title", label: "Twitter title" },
        { key: "twitter_description", label: "Twitter description", kind: "textarea" },
        { key: "twitter_image_media_id", label: "Twitter image", kind: "select", options: mediaOptions },
        { key: "theme_color", label: "Theme color" },
        { key: "seo_image_media_id", label: "Legacy share image", kind: "select", options: mediaOptions }
    ]
    : [
        { key: "name", label: "Name", required: true },
        { key: "role", label: "Role", required: true },
        { key: "public_email", label: "Public email", required: true },
        { key: "notification_email", label: "Private notification email", required: true },
        { key: "hero_summary", label: "Hero summary", kind: "textarea", required: true },
        { key: "hero_primary_label", label: "Primary action label", required: true },
        { key: "hero_primary_href", label: "Primary action link", required: true },
        { key: "hero_secondary_label", label: "Secondary action label", required: true },
        { key: "hero_secondary_href", label: "Secondary action link", required: true },
        { key: "hero_portrait_media_id", label: "Hero portrait", kind: "select", options: mediaOptions },
        { key: "profile_media_id", label: "Navigation portrait", kind: "select", options: mediaOptions },
        { key: "about_note_title", label: "About note title", required: true },
        { key: "about_note_summary", label: "About note summary", kind: "textarea", required: true },
        { key: "consultation_label", label: "Consultation action", required: true },
        { key: "consultation_url", label: "Consultation link", required: true },
        { key: "consultation_media_id", label: "Consultation image", kind: "select", options: mediaOptions },
        { key: "footer_text", label: "Footer text" },
        { key: "brand_logo_alt", label: "Logo alt text", required: true },
        { key: "brand_logo_light_media_id", label: "Light full logo", kind: "select", options: mediaOptions },
        { key: "brand_logo_dark_media_id", label: "Dark full logo", kind: "select", options: mediaOptions },
        { key: "brand_mark_light_media_id", label: "Light compact mark", kind: "select", options: mediaOptions },
        { key: "brand_mark_dark_media_id", label: "Dark compact mark", kind: "select", options: mediaOptions },
        { key: "favicon_media_id", label: "Favicon", kind: "select", options: mediaOptions }
      ];
  const [values, setValues] = useState<Record<string, EditorValue>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!site.data) return;
    setValues(
      Object.fromEntries(fields.map((field) => [field.key, String(site.data?.[field.key as keyof PortfolioSiteDraft] ?? "")]))
    );
  }, [site.data, mode]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await api("/admin/portfolio/site", {
        method: "PATCH",
        body: JSON.stringify({ ...editorPayload(fields, values), expected_updated_at: site.data?.updated_at })
      });
      setMessage("Saved");
      await queryClient.invalidateQueries({ queryKey: ["portfolio-admin", "site"] });
    } catch (err) {
      setMessage(messageFromError(err));
    }
  }

  return (
    <section className="cms-panel">
      <header className="cms-panel-heading"><h2>{mode === "seo" ? "Search and sharing" : "Profile and global content"}</h2></header>
      {site.isLoading ? <p className="loading">Loading settings...</p> : null}
      <form className="cms-form-grid" onSubmit={save}>
        {site.isError ? <p className="form-error" role="alert">{messageFromError(site.error)}</p> : null}
        {fields.map((field) => renderEditorField(field, values[field.key] ?? "", (value) => setValues((current) => ({ ...current, [field.key]: value }))))}
        {message ? <p className={message === "Saved" ? "form-success" : "form-error"}>{message}</p> : null}
        <Button type="submit"><Save size={15} />Save changes</Button>
      </form>
    </section>
  );
}

function SectionSettingsEditor() {
  const queryClient = useQueryClient();
  const sections = useQuery({
    queryKey: ["portfolio-admin", "sections"],
    queryFn: () => api<SectionSettingDraft[]>("/admin/portfolio/sections")
  });
  return (
    <section className="cms-panel">
      <header className="cms-panel-heading"><h2>Section labels</h2></header>
      {sections.isLoading ? <p className="loading">Loading section labels...</p> : null}
      {sections.isError ? <p className="form-error" role="alert">{messageFromError(sections.error)}</p> : null}
      <div className="cms-section-grid">
        {(sections.data ?? []).map((section) => (
          <SectionSettingRow
            key={section.key}
            section={section}
            onSaved={() => queryClient.invalidateQueries({ queryKey: ["portfolio-admin", "sections"] })}
          />
        ))}
      </div>
    </section>
  );
}

function SectionSettingRow({ section, onSaved }: { section: SectionSettingDraft; onSaved: () => Promise<unknown> }) {
  const [heading, setHeading] = useState(section.heading);
  const [label, setLabel] = useState(section.navigation_label);
  const [visible, setVisible] = useState(section.is_visible);

  async function save() {
    await api(`/admin/portfolio/sections/${section.key}`, {
      method: "PATCH",
      body: JSON.stringify({
        heading,
        navigation_label: label,
        is_visible: visible,
        expected_updated_at: section.updated_at
      })
    });
    await onSaved();
  }

  return (
    <article className="cms-section-row">
      <strong>{section.key}</strong>
      <Input aria-label={`${section.key} heading`} value={heading} onChange={(event) => setHeading(event.target.value)} />
      <Input aria-label={`${section.key} navigation label`} value={label} onChange={(event) => setLabel(event.target.value)} />
      <label className="cms-check-field"><input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} /><span>Visible</span></label>
      <button className="icon-button" type="button" aria-label={`Save ${section.key} section`} onClick={() => void save()}><Save size={15} /></button>
    </article>
  );
}

function PublicationControls() {
  const queryClient = useQueryClient();
  const history = useQuery({
    queryKey: ["portfolio-admin", "publications"],
    queryFn: () => api<PortfolioPublication[]>("/admin/portfolio/publications")
  });
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  async function publish() {
    setPublishing(true);
    setMessage("");
    try {
      const result = await api<PortfolioPublication>("/admin/portfolio/publish", { method: "POST" });
      setMessage(`Version ${result.version} published`);
      await queryClient.invalidateQueries({ queryKey: ["portfolio-admin", "publications"] });
      await queryClient.invalidateQueries({ queryKey: ["portfolio-publication"] });
    } catch (err) {
      setMessage(messageFromError(err));
    } finally {
      setPublishing(false);
    }
  }

  async function restore(publication: PortfolioPublication) {
    try {
      const result = await api<PortfolioPublication>(`/admin/portfolio/publications/${publication.id}/restore`, { method: "POST" });
      setMessage(`Version ${result.version} restored from ${publication.version}`);
      await queryClient.invalidateQueries({ queryKey: ["portfolio-admin", "publications"] });
      await queryClient.invalidateQueries({ queryKey: ["portfolio-publication"] });
    } catch (err) {
      setMessage(messageFromError(err));
    }
  }

  return (
    <section className="cms-publication-bar" aria-label="Publication controls">
      <div><History size={17} /><span>{history.data?.[0] ? `Version ${history.data[0].version}` : "Not published"}</span></div>
      {history.isLoading ? <p className="loading">Loading publication history...</p> : null}
      {history.isError ? <p className="form-error" role="alert">{messageFromError(history.error)}</p> : null}
      {message ? <p aria-live="polite">{message}</p> : null}
      <details>
        <summary>History</summary>
        <div className="cms-history-menu">
          {(history.data ?? []).map((publication) => (
            <button type="button" key={publication.id} onClick={() => void restore(publication)}>
              <span>Version {publication.version}</span>
              <small>{new Date(publication.published_at).toLocaleString()}</small>
              <RotateCcw size={14} />
            </button>
          ))}
        </div>
      </details>
      <Link className="btn btn-secondary" to="/dashboard/content/preview" target="_blank"><Eye size={15} />Preview</Link>
      <Button type="button" disabled={publishing} onClick={() => void publish()}><Send size={15} />{publishing ? "Publishing..." : "Publish"}</Button>
    </section>
  );
}

function ProfileScreen() {
  const mediaOptions = useMediaOptions();
  return (
    <div className="cms-screen-stack">
      <SiteEditor mode="profile" mediaOptions={mediaOptions} />
      <SectionSettingsEditor />
      <CollectionEditor endpoint="expertise" title="Hero expertise" titleKey="label" fields={[
        { key: "label", label: "Label", required: true },
        { key: "icon_key", label: "Icon", kind: "select", options: iconOptions },
        { key: "is_visible", label: "Visible", kind: "checkbox", defaultValue: true }
      ]} />
      <CollectionEditor endpoint="social-links" title="Social links" titleKey="platform" summaryKey="url" fields={[
        { key: "platform", label: "Platform", required: true },
        { key: "label", label: "Public label", required: true },
        { key: "url", label: "URL", required: true },
        { key: "icon_key", label: "Icon", kind: "select", options: iconOptions },
        { key: "is_visible", label: "Visible", kind: "checkbox", defaultValue: true }
      ]} />
    </div>
  );
}

function AboutScreen() {
  const mediaOptions = useMediaOptions();
  return <CollectionEditor endpoint="about-cards" title="About cards" titleKey="title" summaryKey="summary" fields={[
    { key: "title", label: "Title", required: true },
    { key: "summary", label: "Summary", kind: "textarea", required: true },
    { key: "media_id", label: "Image", kind: "select", options: mediaOptions },
    { key: "image_alt", label: "Image description" },
    { key: "layout", label: "Layout", kind: "select", options: ["small", "wide", "tall"].map((value) => ({ label: value, value })) },
    { key: "tone", label: "Brand tone", kind: "select", options: ["white", "navy", "blue", "orange"].map((value) => ({ label: value, value })) },
    { key: "image_fit", label: "Image fit", kind: "select", options: ["contain", "cover"].map((value) => ({ label: value, value })) },
    { key: "image_ratio", label: "Image ratio", kind: "select", options: [{ label: "Automatic", value: "" }, { label: "Portrait", value: "portrait" }, { label: "Landscape", value: "landscape" }] },
    { key: "is_visible", label: "Visible", kind: "checkbox", defaultValue: true }
  ]} />;
}

function StacksScreen() {
  return <CollectionEditor endpoint="stacks" title="Technology stacks" titleKey="language" summaryKey="summary" fields={[
    { key: "language", label: "Language", required: true },
    { key: "summary", label: "Summary", kind: "textarea", required: true },
    { key: "code_snippet", label: "Code snippet", kind: "textarea", required: true },
    { key: "tools", label: "Tools, comma separated", kind: "tags" },
    { key: "use_cases", label: "Use cases JSON", kind: "json", defaultValue: "[]" },
    { key: "is_visible", label: "Visible", kind: "checkbox", defaultValue: true }
  ]} />;
}

function ServicesScreen() {
  return <CollectionEditor endpoint="services" title="Services" titleKey="title" summaryKey="summary" fields={[
    { key: "title", label: "Title", required: true },
    { key: "summary", label: "Summary", kind: "textarea", required: true },
    { key: "icon_key", label: "Icon", kind: "select", options: iconOptions },
    { key: "is_visible", label: "Visible", kind: "checkbox", defaultValue: true }
  ]} />;
}

function ProjectsScreen() {
  const mediaOptions = useMediaOptions();
  return <CollectionEditor endpoint="projects" title="Projects" titleKey="title" summaryKey="summary" fields={[
    { key: "slug", label: "Slug", required: true },
    { key: "title", label: "Title", required: true },
    { key: "summary", label: "Summary", kind: "textarea", required: true },
    { key: "case_study_markdown", label: "Case study Markdown", kind: "textarea" },
    { key: "tags", label: "Tags, comma separated", kind: "tags" },
    { key: "media_id", label: "Image", kind: "select", options: mediaOptions },
    { key: "external_url", label: "External client URL" },
    { key: "live_url", label: "Live URL" },
    { key: "repository_url", label: "Repository URL" },
    { key: "is_featured", label: "Featured", kind: "checkbox" },
    { key: "seo_title", label: "SEO title" },
    { key: "seo_description", label: "SEO description", kind: "textarea" },
    { key: "is_visible", label: "Visible", kind: "checkbox", defaultValue: true }
  ]} />;
}

function PostsScreen() {
  const mediaOptions = useMediaOptions();
  const categories = useQuery({ queryKey: ["portfolio-admin", "categories"], queryFn: () => api<CmsOrderedRecord[]>("/admin/portfolio/categories") });
  const categoryOptions = (categories.data ?? []).map((category) => ({ label: String(category.name), value: category.id }));
  return (
    <div className="cms-screen-stack">
      <CollectionEditor endpoint="categories" title="Post categories" titleKey="name" fields={[
        { key: "name", label: "Name", required: true },
        { key: "slug", label: "Slug", required: true },
        { key: "is_visible", label: "Visible", kind: "checkbox", defaultValue: true }
      ]} />
      <CollectionEditor endpoint="posts" title="Posts" titleKey="title" summaryKey="excerpt" fields={[
        { key: "category_id", label: "Category", kind: "select", options: categoryOptions, required: true },
        { key: "slug", label: "Slug", required: true },
        { key: "title", label: "Title", required: true },
        { key: "excerpt", label: "Excerpt", kind: "textarea", required: true },
        { key: "body_markdown", label: "Article Markdown", kind: "textarea" },
        { key: "cover_media_id", label: "Cover image", kind: "select", options: mediaOptions },
        { key: "published_on", label: "Display date", kind: "datetime" },
        { key: "seo_title", label: "SEO title" },
        { key: "seo_description", label: "SEO description", kind: "textarea" },
        { key: "is_visible", label: "Visible", kind: "checkbox", defaultValue: true }
      ]} />
    </div>
  );
}

function MediaScreen() {
  const queryClient = useQueryClient();
  const media = useQuery({ queryKey: ["portfolio-admin", "media"], queryFn: () => api<MediaAssetDraft[]>("/admin/portfolio/media") });
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [error, setError] = useState("");

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    body.append("alt_text", altText);
    try {
      await api("/admin/portfolio/media", { method: "POST", body });
      setFile(null);
      setAltText("");
      await queryClient.invalidateQueries({ queryKey: ["portfolio-admin", "media"] });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  async function updateMetadata(item: MediaAssetDraft, filename: string, description: string) {
    setError("");
    try {
      await api(`/admin/portfolio/media/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          filename: filename.trim(),
          alt_text: description.trim(),
          expected_updated_at: item.updated_at
        })
      });
      await queryClient.invalidateQueries({ queryKey: ["portfolio-admin", "media"] });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  async function archive(item: MediaAssetDraft) {
    setError("");
    try {
      await api(`/admin/portfolio/media/${item.id}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["portfolio-admin", "media"] });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  return (
    <section className="cms-panel">
      <header className="cms-panel-heading"><h2>Media library</h2></header>
      {media.isError ? <p className="form-error" role="alert">{messageFromError(media.error)}</p> : null}
      <form className="cms-upload-form" onSubmit={upload}>
        <Field label="Image file"><Input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></Field>
        <Field label="Image description"><Input value={altText} onChange={(event) => setAltText(event.target.value)} /></Field>
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit"><Upload size={15} />Upload image</Button>
      </form>
      <div className="cms-media-grid">
        {media.isLoading ? <p className="loading">Loading media library...</p> : null}
        {(media.data ?? []).map((item) => (
          <MediaLibraryItem
            item={item}
            key={item.id}
            onArchive={archive}
            onSave={updateMetadata}
          />
        ))}
      </div>
    </section>
  );
}

function MediaLibraryItem({
  item,
  onArchive,
  onSave
}: {
  item: MediaAssetDraft;
  onArchive: (item: MediaAssetDraft) => Promise<void>;
  onSave: (item: MediaAssetDraft, filename: string, description: string) => Promise<void>;
}) {
  const [filename, setFilename] = useState(item.filename);
  const [description, setDescription] = useState(item.alt_text);

  useEffect(() => {
    setFilename(item.filename);
    setDescription(item.alt_text);
  }, [item.alt_text, item.filename]);

  return (
    <article className="cms-media-item">
      {item.url ? <img src={item.url} alt={item.alt_text} /> : <div />}
      <div className="cms-media-fields">
        <Input
          aria-label={`Filename for ${item.filename}`}
          value={filename}
          onChange={(event) => setFilename(event.target.value)}
        />
        <Input
          aria-label={`Description for ${item.filename}`}
          placeholder="Image description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <p>{item.width && item.height ? `${item.width} x ${item.height}` : item.storage_kind}</p>
      <div className="cms-media-actions">
        <Badge>{Math.ceil(item.size_bytes / 1024)} KB</Badge>
        <button
          className="icon-button"
          type="button"
          aria-label={`Save ${item.filename} metadata`}
          onClick={() => void onSave(item, filename, description)}
        >
          <Save size={15} />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label={`Archive ${item.filename}`}
          onClick={() => void onArchive(item)}
        >
          <Archive size={15} />
        </button>
      </div>
    </article>
  );
}

function ContactScreen() {
  const queryClient = useQueryClient();
  const contacts = useQuery({ queryKey: ["portfolio-admin", "contacts"], queryFn: () => api<ContactSubmissionDraft[]>("/admin/portfolio/contacts") });
  const [error, setError] = useState("");

  async function update(item: ContactSubmissionDraft, inbox_state: string) {
    try {
      await api(`/admin/portfolio/contacts/${item.id}`, { method: "PATCH", body: JSON.stringify({ inbox_state, expected_updated_at: item.updated_at }) });
      await queryClient.invalidateQueries({ queryKey: ["portfolio-admin", "contacts"] });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  async function retry(item: ContactSubmissionDraft) {
    try {
      await api(`/admin/portfolio/contacts/${item.id}/retry-email`, { method: "POST" });
      await queryClient.invalidateQueries({ queryKey: ["portfolio-admin", "contacts"] });
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  return (
    <section className="cms-panel">
      <header className="cms-panel-heading"><h2>Contact inbox</h2></header>
      {contacts.isError || error ? <p className="form-error" role="alert">{error || messageFromError(contacts.error)}</p> : null}
      <div className="cms-contact-list">
        {contacts.isLoading ? <p className="loading">Loading contact inbox...</p> : null}
        {(contacts.data ?? []).map((item) => (
          <article className="cms-contact-item" key={item.id}>
            <header><div><h3>{item.subject}</h3><p>{item.name} · {item.email}</p></div><Badge tone={item.delivery_state === "sent" ? "good" : item.delivery_state === "failed" ? "danger" : "warn"}>{item.delivery_state}</Badge></header>
            <p>{item.message}</p>
            <dl className="cms-contact-delivery">
              <div><dt>Delivery</dt><dd>{item.delivery_state}</dd></div>
              <div><dt>Attempts</dt><dd>{item.delivery_attempts}</dd></div>
              <div><dt>Last attempt</dt><dd>{item.last_delivery_at ? new Date(item.last_delivery_at).toLocaleString() : "Not attempted"}</dd></div>
              <div><dt>Delivered</dt><dd>{item.delivered_at ? new Date(item.delivered_at).toLocaleString() : "Not delivered"}</dd></div>
            </dl>
            {item.delivery_error ? (
              <div className="cms-contact-delivery-error">
                <strong>Why notification failed</strong>
                <p>{item.delivery_error}</p>
              </div>
            ) : null}
            <footer>
              <Select aria-label={`Status for ${item.subject}`} value={item.inbox_state} onChange={(event) => void update(item, event.target.value)}>
                {['new', 'read', 'replied', 'spam', 'archived'].map((state) => <option key={state} value={state}>{state}</option>)}
              </Select>
              {item.delivery_state === "failed" ? <Button type="button" variant="secondary" onClick={() => void retry(item)}><RotateCcw size={15} />Retry email</Button> : null}
            </footer>
          </article>
        ))}
        {!contacts.isLoading && !contacts.data?.length ? <EmptyState>No enquiries yet.</EmptyState> : null}
      </div>
    </section>
  );
}

function ScreenContent({ screen }: { screen: ContentScreen }) {
  const mediaOptions = useMediaOptions();
  if (screen === "profile") return <ProfileScreen />;
  if (screen === "about") return <AboutScreen />;
  if (screen === "stacks") return <StacksScreen />;
  if (screen === "services") return <ServicesScreen />;
  if (screen === "projects") return <ProjectsScreen />;
  if (screen === "posts") return <PostsScreen />;
  if (screen === "media") return <MediaScreen />;
  if (screen === "contact") return <ContactScreen />;
  return <SiteEditor mode="seo" mediaOptions={mediaOptions} />;
}

export function ContentAdminPage({ screen }: { screen: ContentScreen }) {
  const { user } = useAuth();
  if (!hasRole(user, "admin")) return <AppShell><EmptyState>Admin access required.</EmptyState></AppShell>;

  return (
    <AppShell>
      <div className="page-heading cms-page-heading"><div><h1>Portfolio content</h1><p>{contentScreens.find((item) => item.key === screen)?.label}</p></div><FilePlus2 size={24} /></div>
      <PublicationControls />
      <nav className="cms-screen-nav" aria-label="Portfolio content screens">
        {contentScreens.map((item) => <Link key={item.key} to={`/dashboard/content/${item.key}`} className={item.key === screen ? "active" : ""}>{item.label}</Link>)}
      </nav>
      <ScreenContent screen={screen} />
    </AppShell>
  );
}

export function ContentPreviewPage() {
  const { user, isLoading } = useAuth();
  const preview = useQuery({
    queryKey: ["portfolio-admin", "preview"],
    queryFn: () => api<PortfolioContentResponse>("/admin/portfolio/preview"),
    enabled: hasRole(user, "admin")
  });

  if (isLoading) return <main className="loading">Loading preview...</main>;
  if (!hasRole(user, "admin")) return <Navigate to="/login" />;
  if (preview.isError) return <main className="error-recovery" role="alert"><h1>Preview unavailable</h1><p>{messageFromError(preview.error)}</p><Link className="btn btn-secondary" to="/dashboard/content/profile">Return to content</Link></main>;
  if (!preview.data?.content) return <main className="loading">Preparing preview...</main>;

  return (
    <div className="cms-preview-root">
      <div className="cms-preview-bar"><Badge tone="warn">Draft preview</Badge><Link to="/dashboard/content/profile">Back to content</Link></div>
      <PortfolioPage previewContent={preview.data.content} />
    </div>
  );
}
