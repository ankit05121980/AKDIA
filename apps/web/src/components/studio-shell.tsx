"use client";

import { useMemo, useState } from "react";
import { Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import { Download, FileText, Layers3, MessageSquareText, Palette, Sparkles } from "lucide-react";
import { generateDiagramBundle, themes, type DiagramBundle } from "@akdia/diagram-engine";
import { searchAssets } from "@akdia/asset-library";
import { listTemplates } from "@akdia/templates";
import { toFlow } from "../lib/diagram-adapter";

const defaultPrompt = "Generate a Banking AI Reference Architecture with RAG, Snowflake, OpenAI, APIs, governance, and observability";

type FormatKey = "mermaid" | "plantUml" | "drawioXml" | "svg" | "pngDataUri" | "json" | "pptxModel";

type FormatConfig = {
  key: FormatKey;
  label: string;
  extension: string;
  mime: string;
  toContent: (bundle: DiagramBundle) => string;
};

const formatConfigs: FormatConfig[] = [
  { key: "mermaid", label: "Mermaid", extension: "mmd", mime: "text/plain", toContent: (bundle) => bundle.mermaid },
  { key: "plantUml", label: "PlantUML", extension: "puml", mime: "text/plain", toContent: (bundle) => bundle.plantUml },
  { key: "drawioXml", label: "Draw.io", extension: "drawio", mime: "application/xml", toContent: (bundle) => bundle.drawioXml },
  { key: "svg", label: "SVG", extension: "svg", mime: "image/svg+xml", toContent: (bundle) => bundle.svg },
  { key: "pngDataUri", label: "PNG", extension: "svg", mime: "image/svg+xml", toContent: (bundle) => bundle.pngDataUri },
  { key: "json", label: "JSON", extension: "json", mime: "application/json", toContent: (bundle) => JSON.stringify(bundle.model, null, 2) },
  { key: "pptxModel", label: "PPT", extension: "json", mime: "application/json", toContent: (bundle) => JSON.stringify(bundle.pptxModel, null, 2) }
];

export function StudioShell() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [documentText, setDocumentText] = useState("The customer onboarding portal integrates with an API gateway, IAM, Kafka, Snowflake, and an OpenAI support agent. Users submit an application, operations reviews exceptions, and analytics teams monitor process quality.");
  const [themeId, setThemeId] = useState("enterprise-blue");
  const [bundle, setBundle] = useState<DiagramBundle>(() => generateDiagramBundle({ prompt: defaultPrompt, themeId: "enterprise-blue" }));
  const [format, setFormat] = useState<FormatKey>("mermaid");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("Ready to generate editable enterprise diagrams.");
  const [error, setError] = useState<string | null>(null);
  const flow = useMemo(() => toFlow(bundle.model), [bundle.model]);
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);
  const assets = useMemo(() => {
    const matches = searchAssets(prompt).slice(0, 12);
    return matches.length ? matches : searchAssets("").slice(0, 12);
  }, [prompt]);
  const templates = useMemo(() => {
    const matches = listTemplates(prompt).slice(0, 5);
    return matches.length ? matches : listTemplates().slice(0, 5);
  }, [prompt]);
  const selectedFormat = formatConfigs.find((item) => item.key === format) ?? formatConfigs[0];

  async function generate(nextPrompt = prompt, withDocument = false) {
    setIsGenerating(true);
    setError(null);
    setStatus(withDocument ? "Analyzing document and generating diagram pack..." : "Generating architecture diagram...");

    try {
      const response = await fetch("/api/diagrams/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: nextPrompt, themeId, documentText: withDocument ? documentText : undefined })
      });

      if (!response.ok) {
        throw new Error(`Generation failed with HTTP ${response.status}`);
      }

      const nextBundle = (await response.json()) as DiagramBundle;
      const nextFlow = toFlow(nextBundle.model);
      setBundle(nextBundle);
      setNodes(nextFlow.nodes);
      setEdges(nextFlow.edges);
      setStatus(`Generated ${nextBundle.model.nodes.length} editable objects and ${nextBundle.model.edges.length} connectors.`);
    } catch (generationError) {
      const message = generationError instanceof Error ? generationError.message : "Unknown generation error";
      setError(message);
      setStatus("Generation failed. Using the last successful diagram.");
    } finally {
      setIsGenerating(false);
    }
  }

  function readUpload(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDocumentText(String(reader.result ?? ""));
      setStatus(`Loaded ${file.name}. Click Generate document pack to create the document diagrams.`);
    };
    reader.readAsText(file);
  }

  function exportSelectedFormat() {
    const content = selectedFormat.toContent(bundle);
    const safeTitle = bundle.model.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "diagram";
    const link = document.createElement("a");

    if (format === "pngDataUri") {
      link.href = content;
      link.download = `${safeTitle}.svg`;
    } else {
      link.href = URL.createObjectURL(new Blob([content], { type: selectedFormat.mime }));
      link.download = `${safeTitle}.${selectedFormat.extension}`;
    }

    document.body.appendChild(link);
    link.click();
    link.remove();
    if (format !== "pngDataUri") URL.revokeObjectURL(link.href);
    setStatus(`Exported ${selectedFormat.label} format.`);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">AKDIA Studio</p>
            <h1 className="text-2xl font-black">Enterprise AI Diagram & Architecture Studio</h1>
            <p data-testid="status-message" className="mt-1 text-sm text-slate-400">{status}</p>
            {error ? <p data-testid="error-message" className="mt-1 text-sm text-red-300">{error}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            <select aria-label="Theme" value={themeId} onChange={(event) => setThemeId(event.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm">
              {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
            </select>
            <button data-testid="generate-button" disabled={isGenerating} onClick={() => generate()} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
              <Sparkles size={18} /> {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1800px] gap-4 p-4 xl:grid-cols-[360px_1fr_420px]">
        <aside className="space-y-4">
          <Panel title="ChatGPT-like design prompt" icon={<MessageSquareText size={18} />}>
            <textarea aria-label="Diagram prompt" data-testid="prompt-input" value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-36 w-full rounded-2xl border border-white/10 bg-slate-900 p-3 text-sm outline-none focus:border-cyan-300" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["AWS Landing Zone", "Snowflake Data Platform", "RAG Architecture", "BPMN workflow from this BRD"].map((sample) => (
                <button key={sample} data-testid={`sample-${sample.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} onClick={() => { setPrompt(sample); void generate(sample); }} className="rounded-xl border border-white/10 bg-white/5 p-2 text-left text-xs text-slate-300 hover:bg-white/10">
                  {sample}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Document to diagram" icon={<FileText size={18} />}>
            <input aria-label="Upload document" type="file" onChange={(event) => readUpload(event.target.files?.[0])} className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900 p-2 text-xs" />
            <textarea aria-label="Document text" data-testid="document-input" value={documentText} onChange={(event) => setDocumentText(event.target.value)} className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-900 p-3 text-xs" />
            <button data-testid="document-generate-button" disabled={isGenerating} onClick={() => generate(prompt, true)} className="mt-3 w-full rounded-xl bg-violet-400 px-4 py-2 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
              Generate document pack
            </button>
          </Panel>

          <Panel title="Reference templates" icon={<Layers3 size={18} />}>
            <div className="space-y-2">
              {templates.map((template) => (
                <button key={template.id} data-testid={`template-${template.id}`} onClick={() => { setPrompt(template.prompt); void generate(template.prompt); }} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10">
                  <p className="font-semibold">{template.title}</p>
                  <p className="text-xs text-slate-400">{template.description}</p>
                </button>
              ))}
            </div>
          </Panel>
        </aside>

        <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 data-testid="diagram-title" className="text-xl font-black">{bundle.model.title}</h2>
              <p className="text-sm text-slate-400">Editable React Flow canvas with generated objects, connectors, and metadata.</p>
            </div>
            <button data-testid="export-button" onClick={exportSelectedFormat} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"><Download size={16} /> Export {selectedFormat.label}</button>
          </div>
          <div data-testid="diagram-canvas" className="h-[760px] bg-slate-100 text-slate-950">
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
              <Background />
              <MiniMap />
              <Controls />
            </ReactFlow>
          </div>
        </section>

        <aside className="space-y-4">
          <Panel title="Multi-diagram engine" icon={<Download size={18} />}>
            <div role="tablist" aria-label="Diagram output formats" className="mb-3 flex flex-wrap gap-2">
              {formatConfigs.map((item) => (
                <button key={item.key} role="tab" aria-selected={format === item.key} data-testid={`format-tab-${item.key}`} onClick={() => setFormat(item.key)} className={`rounded-xl px-3 py-2 text-xs font-bold ${format === item.key ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-slate-200"}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <FormatPreview bundle={bundle} selected={selectedFormat} />
          </Panel>

          <Panel title="Visual asset library" icon={<Palette size={18} />}>
            <div data-testid="asset-library" className="grid grid-cols-3 gap-2">
              {assets.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-center">
                  <div dangerouslySetInnerHTML={{ __html: asset.svg }} />
                  <p className="mt-1 text-xs font-semibold">{asset.name}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="AI decisions and recommendations" icon={<Sparkles size={18} />}>
            <ul data-testid="ai-recommendations" className="space-y-2 text-sm text-slate-300">
              {[...bundle.model.decisions, ...bundle.model.recommendations].map((item) => <li key={item} className="rounded-xl bg-white/5 p-3">{item}</li>)}
            </ul>
          </Panel>
        </aside>
      </main>
    </div>
  );
}

function FormatPreview({ bundle, selected }: { bundle: DiagramBundle; selected: FormatConfig }) {
  const content = selected.toContent(bundle);

  if (selected.key === "svg") {
    return <div data-testid="format-preview" className="max-h-[360px] overflow-auto rounded-2xl bg-white p-2 text-slate-950" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  if (selected.key === "pngDataUri") {
    return <div data-testid="format-preview" className="rounded-2xl bg-white p-3"><img alt={`${bundle.model.title} PNG preview`} src={content} className="max-h-[340px] w-full rounded-xl object-contain" /></div>;
  }

  return <pre data-testid="format-preview" className="max-h-[360px] overflow-auto rounded-2xl bg-slate-950 p-3 text-xs text-slate-300">{content}</pre>;
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20">
      <div className="mb-3 flex items-center gap-2 font-bold text-white">
        <span className="text-cyan-300">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  );
}
