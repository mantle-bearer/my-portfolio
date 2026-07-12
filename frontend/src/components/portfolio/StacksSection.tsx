import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { TbCopy } from "react-icons/tb";

import { portfolioStacks } from "@/data/portfolio";
import { SectionShell } from "@/components/portfolio/SectionShell";

export function StacksSection() {
  const [activeStack, setActiveStack] = useState(portfolioStacks[0].language);
  const [copiedStack, setCopiedStack] = useState<string | null>(null);

  const selectedStack = useMemo(
    () => portfolioStacks.find((stack) => stack.language === activeStack) ?? portfolioStacks[0],
    [activeStack]
  );

  async function copySnippet() {
    const snippet = selectedStack.snippet.join("\n");

    try {
      await navigator.clipboard?.writeText(snippet);
      setCopiedStack(selectedStack.language);
      window.setTimeout(() => setCopiedStack(null), 1400);
    } catch {
      setCopiedStack(null);
    }
  }

  return (
    <SectionShell id="stacks" className="stacks-section">
      <div className="section-heading">
        <h2>
          Stacks <span>I Use</span>
        </h2>
      </div>

      <div className="stacks-showcase">
        <div className="stacks-showcase-header">
          <div>
            <p className="stacks-kicker">Developer stack</p>
            <h3>Stacks I use to build practical systems</h3>
            <p>
              I choose tools around the job: clear APIs, useful dashboards, automation,
              business workflows, and interfaces that people can actually operate.
            </p>
          </div>
        </div>

        <div className="stacks-tabs" role="tablist" aria-label="Programming language stacks">
          {portfolioStacks.map((stack) => (
            <button
              id={`stack-tab-${stack.language.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="stacks-tab"
              type="button"
              role="tab"
              key={stack.language}
              aria-selected={selectedStack.language === stack.language}
              aria-controls="stack-panel"
              onClick={() => setActiveStack(stack.language)}
            >
              {stack.language}
            </button>
          ))}
        </div>

        <div
          id="stack-panel"
          className="stacks-panel"
          role="tabpanel"
          aria-labelledby={`stack-tab-${selectedStack.language.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        >
          <div className="stacks-panel-copy">
            <p>{selectedStack.language}</p>
            <h3>{selectedStack.summary}</h3>
          </div>

          <div className="stacks-code-wrap">
            <pre className="stacks-code" aria-label={`${selectedStack.language} code snippet`}>
              <code>
                {selectedStack.snippet.map((line, index) => (
                  <span key={`${selectedStack.language}-${index}`}>
                    <span>{String(index + 1)}</span>
                    <span>{line || " "}</span>
                  </span>
                ))}
              </code>
            </pre>
            <button className="stacks-copy-button" type="button" onClick={copySnippet}>
              {copiedStack === selectedStack.language ? (
                <>
                  <span><Check size={17} aria-hidden="true" /></span>
                </>
              ) : (
                <>
                  <span><TbCopy size={17} aria-hidden="true" /></span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="stacks-tool-row" aria-label={`${selectedStack.language} frameworks and tools`}>
          {selectedStack.tools.map((tool) => (
            <span key={tool}>{tool}</span>
          ))}
        </div>

        <div className="stacks-use-grid">
          {selectedStack.useCases.map((useCase) => (
            <article className="stacks-use-card" key={useCase.title}>
              <h3>{useCase.title}</h3>
              <p>{useCase.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
