"use client";

import { useState, useRef } from "react";

const INDUSTRIES = [
  "Banking & Financial Services",
  "Healthcare",
  "Retail & E-Commerce",
  "Insurance",
  "Manufacturing",
  "Logistics & Supply Chain",
  "Telecommunications",
  "Education",
  "Real Estate",
  "Legal",
  "Other",
];

const INDUSTRY_PLACEHOLDERS: Record<string, string> = {
  "Banking & Financial Services":
    "e.g., Reduce customer support load and improve response time for retail banking inquiries across online and mobile channels...",
  Healthcare:
    "e.g., Automate patient intake and triage so clinicians spend less time on paperwork and more time on care...",
  "Retail & E-Commerce":
    "e.g., Personalize product recommendations at scale and reduce cart abandonment rates during checkout...",
  Insurance:
    "e.g., Speed up claims processing and reduce manual review time for standard auto insurance claims...",
  Manufacturing:
    "e.g., Predict equipment failures before they happen and reduce unplanned downtime on the production line...",
  "Logistics & Supply Chain":
    "e.g., Optimize route planning and provide real-time shipment visibility to reduce delivery delays...",
  Telecommunications:
    "e.g., Reduce churn by identifying at-risk customers early and automating targeted retention outreach...",
  Education:
    "e.g., Create adaptive learning paths that adjust to each student's pace and identify knowledge gaps early...",
  "Real Estate":
    "e.g., Automate property valuation analysis and match buyers to listings based on lifestyle preferences, not just filters...",
  Legal:
    "e.g., Accelerate contract review by extracting key clauses, flagging risks, and comparing against standard terms...",
};

export default function Home() {
  const [industry, setIndustry] = useState("Banking & Financial Services");
  const [customIndustry, setCustomIndustry] = useState("");
  const [problem, setProblem] = useState(
    "Reduce customer support load and improve response time"
  );
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const effectiveIndustry =
    industry === "Other" ? customIndustry : industry;

  async function handleGenerate() {
    if (!effectiveIndustry.trim() || !problem.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setError("");
    setOutput("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: effectiveIndustry.trim(),
          problem: problem.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setOutput(data.output);
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          AI Solutions Architect
        </h1>
        <p className="mt-2 text-[var(--foreground)]/60 text-base">
          Simulates how a Solutions Engineer maps business problems to AI
          solutions using OpenAI
        </p>
      </header>

      <section className="space-y-5">
        <div>
          <label
            htmlFor="industry"
            className="block text-sm font-medium mb-1.5"
          >
            Industry
          </label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full rounded-lg border border-[var(--foreground)]/15 bg-transparent px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
          >
            <option value="">Select an industry...</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
          {industry === "Other" && (
            <input
              type="text"
              placeholder="Enter your industry..."
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--foreground)]/15 bg-transparent px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
            />
          )}
        </div>

        <div>
          <label
            htmlFor="problem"
            className="block text-sm font-medium mb-1.5"
          >
            Business Problem
          </label>
          <textarea
            suppressHydrationWarning
            id="problem"
            rows={4}
            placeholder={
              INDUSTRY_PLACEHOLDERS[industry] ||
              "e.g., Describe the business problem you want to solve with AI..."
            }
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="w-full rounded-lg border border-[var(--foreground)]/15 bg-transparent px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 resize-vertical"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-lg bg-[var(--foreground)] text-[var(--background)] py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Generating Solution...
            </span>
          ) : (
            "Generate Solution"
          )}
        </button>
      </section>

      {output && (
        <section ref={outputRef} className="mt-12">
          <p className="text-sm text-[var(--foreground)]/50 mb-4">
            Based on your problem, here&apos;s how I would approach this as a
            Solutions Engineer.
          </p>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Solution Proposal</h2>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-md border border-[var(--foreground)]/15 hover:bg-[var(--foreground)]/5 transition-colors"
            >
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
          </div>
          <div className="space-y-4">
            <RenderedMarkdown content={output} />
          </div>
        </section>
      )}
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function RenderedMarkdown({ content }: { content: string }) {
  const sections = content.split(/(?=^## )/m);

  return (
    <>
      {sections.map((section, i) => {
        if (!section.trim()) return null;
        return (
          <div
            key={i}
            className="rounded-xl border border-[var(--foreground)]/10 p-5"
          >
            <FormattedSection text={section.trim()} />
          </div>
        );
      })}
    </>
  );
}

function FormattedSection({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${codeIndex++}`}
            className="bg-[var(--foreground)]/5 rounded-lg p-4 text-sm font-mono overflow-x-auto my-3"
          >
            {codeLines.join("\n")}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={i}
          className="text-lg font-semibold mb-3"
        >
          {line.replace("## ", "")}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex gap-2 text-sm leading-relaxed ml-1">
          <span className="text-[var(--foreground)]/40 select-none shrink-0">
            &bull;
          </span>
          <span>
            <InlineFormat text={line.slice(2)} />
          </span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed">
          <InlineFormat text={line} />
        </p>
      );
    }
  }

  return <>{elements}</>;
}

function InlineFormat({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="bg-[var(--foreground)]/5 px-1.5 py-0.5 rounded text-xs font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
