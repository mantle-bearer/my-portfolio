import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { MarkdownContent } from "@/components/portfolio/MarkdownContent";
import { PortfolioFooter } from "@/components/portfolio/PortfolioFooter";
import { PortfolioNav } from "@/components/portfolio/PortfolioNav";
import { staticPortfolioContent } from "@/data/portfolio";
import { api } from "@/lib/api";
import { PortfolioContentProvider } from "@/lib/portfolio-content";

type PostDetail = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  href: string;
  body_markdown: string;
  cover_image?: string | null;
};

type ProjectDetail = {
  slug: string;
  title: string;
  summary: string;
  case_study_markdown: string;
  tags: string[];
  image?: string | null;
  live_url?: string | null;
  repository_url?: string | null;
};

function DetailShell({ children }: { children: React.ReactNode }) {
  return (
    <PortfolioContentProvider>
      <main className="portfolio-root portfolio-detail-root">
        <PortfolioNav />
        <div className="portfolio-detail-shell">{children}</div>
        <PortfolioFooter />
      </main>
    </PortfolioContentProvider>
  );
}

export function PostDetailPage() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const post = useQuery({
    queryKey: ["portfolio-post", slug],
    queryFn: () => api<PostDetail>(`/portfolio/posts/${slug}`),
    retry: false
  });
  const fallback = staticPortfolioContent.notes.find((item) => item.slug === slug);
  const detail = post.data ??
    (fallback
      ? {
          ...fallback,
          slug,
          body_markdown: fallback.body_markdown || `# ${fallback.title}\n\n${fallback.excerpt}`
        }
      : null);

  if (!detail && post.isLoading) return <DetailShell><p>Loading article...</p></DetailShell>;
  if (!detail) return <DetailShell><h1>Article not found</h1><Link to="/">Return home</Link></DetailShell>;

  return (
    <DetailShell>
      <article className="portfolio-detail-article">
        <Link to="/" hash="notes" className="portfolio-detail-back">
          <ArrowLeft size={17} />
          Code Chronicles
        </Link>
        <header>
          <p>{detail.category}</p>
          <h1>{detail.title}</h1>
          <time dateTime={detail.date}>{detail.date}</time>
        </header>
        {detail.cover_image ? <img src={detail.cover_image} alt="" /> : null}
        <MarkdownContent markdown={detail.body_markdown} />
      </article>
    </DetailShell>
  );
}

export function ProjectDetailPage() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const project = useQuery({
    queryKey: ["portfolio-project", slug],
    queryFn: () => api<ProjectDetail>(`/portfolio/projects/${slug}`),
    retry: false
  });
  const fallback = staticPortfolioContent.projects.find((item) => item.slug === slug);
  const detail = project.data ??
    (fallback
      ? {
          ...fallback,
          case_study_markdown:
            fallback.case_study_markdown || `# ${fallback.title}\n\n${fallback.summary}`
        }
      : null);

  if (!detail && project.isLoading) return <DetailShell><p>Loading case study...</p></DetailShell>;
  if (!detail) return <DetailShell><h1>Project not found</h1><Link to="/">Return home</Link></DetailShell>;

  return (
    <DetailShell>
      <article className="portfolio-detail-article">
        <Link to="/" hash="projects" className="portfolio-detail-back">
          <ArrowLeft size={17} />
          Portfolio
        </Link>
        <header>
          <p>Case study</p>
          <h1>{detail.title}</h1>
          <div className="project-tags">
            {detail.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </header>
        {detail.image ? <img src={detail.image} alt="" /> : null}
        <MarkdownContent markdown={detail.case_study_markdown} />
        <div className="portfolio-detail-actions">
          {detail.live_url ? <a href={detail.live_url} target="_blank" rel="noopener noreferrer">Live project <ExternalLink size={16} /></a> : null}
          {detail.repository_url ? <a href={detail.repository_url} target="_blank" rel="noopener noreferrer">Repository <ExternalLink size={16} /></a> : null}
        </div>
      </article>
    </DetailShell>
  );
}
