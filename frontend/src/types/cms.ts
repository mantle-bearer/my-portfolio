export type CmsOrderedRecord = {
  id: string;
  sort_order: number;
  is_visible: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

export type PortfolioSiteDraft = {
  id: string;
  name: string;
  role: string;
  public_email: string;
  notification_email: string;
  hero_summary: string;
  hero_primary_label: string;
  hero_primary_href: string;
  hero_secondary_label: string;
  hero_secondary_href: string;
  hero_portrait_media_id: string | null;
  profile_media_id: string | null;
  about_note_title: string;
  about_note_summary: string;
  consultation_label: string;
  consultation_url: string;
  consultation_media_id: string | null;
  footer_text: string;
  seo_title: string;
  seo_description: string;
  seo_image_media_id: string | null;
  brand_logo_light_media_id: string | null;
  brand_logo_dark_media_id: string | null;
  brand_mark_light_media_id: string | null;
  brand_mark_dark_media_id: string | null;
  favicon_media_id: string | null;
  brand_logo_alt: string;
  canonical_url: string;
  robots_directive: string;
  og_title: string;
  og_description: string;
  og_image_media_id: string | null;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image_media_id: string | null;
  theme_color: string;
  updated_at: string;
};

export type SectionSettingDraft = {
  key: string;
  heading: string;
  navigation_label: string;
  summary: string | null;
  is_visible: boolean;
  updated_at: string;
};

export type MediaAssetDraft = {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  checksum: string;
  alt_text: string;
  storage_kind: string;
  static_path: string | null;
  local_path: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  url: string | null;
};

export type ContactSubmissionDraft = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inbox_state: "new" | "read" | "replied" | "spam" | "archived";
  delivery_state: "pending" | "sent" | "failed";
  delivery_attempts: number;
  last_delivery_at: string | null;
  delivered_at: string | null;
  delivery_error: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};
