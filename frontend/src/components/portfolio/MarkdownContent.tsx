import type { ReactNode } from "react";

const inlineLinkPattern = /(\[[^\]]+\]\((?:https?:\/\/|mailto:|#|\/)[^)]+\))/g;
const parsedLinkPattern = /^\[([^\]]+)\]\(((?:https?:\/\/|mailto:|#|\/)[^)]+)\)$/;

function inlineContent(value: string): ReactNode[] {
  return value.split(inlineLinkPattern).map((part, index) => {
    const match = part.match(parsedLinkPattern);
    if (!match) return part;
    const [, label, href] = match;
    const external = href.startsWith("http");
    return (
      <a
        key={`${href}-${index}`}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {label}
      </a>
    );
  });
}

export function MarkdownContent({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] | null = null;

  function flushParagraph() {
    if (!paragraph.length) return;
    const value = paragraph.join(" ");
    blocks.push(<p key={`paragraph-${blocks.length}`}>{inlineContent(value)}</p>);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    blocks.push(
      <ul key={`list-${blocks.length}`}>
        {list.map((item, index) => (
          <li key={`${item}-${index}`}>{inlineContent(item)}</li>
        ))}
      </ul>
    );
    list = [];
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushParagraph();
      flushList();
      if (code === null) {
        code = [];
      } else {
        blocks.push(
          <pre key={`code-${blocks.length}`}>
            <code>{code.join("\n")}</code>
          </pre>
        );
        code = null;
      }
      continue;
    }
    if (code !== null) {
      code.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const content = inlineContent(heading[2]);
      if (level === 1) blocks.push(<h1 key={`heading-${blocks.length}`}>{content}</h1>);
      if (level === 2) blocks.push(<h2 key={`heading-${blocks.length}`}>{content}</h2>);
      if (level === 3) blocks.push(<h3 key={`heading-${blocks.length}`}>{content}</h3>);
      continue;
    }
    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      list.push(listItem[1]);
      continue;
    }
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  if (code !== null && code.length) {
    blocks.push(
      <pre key={`code-${blocks.length}`}>
        <code>{code.join("\n")}</code>
      </pre>
    );
  }

  return <div className="markdown-content">{blocks}</div>;
}
