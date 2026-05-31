"use client";

import { useMemo, useState } from "react";
import { Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import { Download, FileText, Layers3, MessageSquareText, Palette, Sparkles } from "lucide-react";
import { generateDiagramBundle, themes, type DiagramBundle } from "@akdia/diagram-engine";
import { searchAssets } from "@akdia/asset-library";
import { listTemplates } from "@akdia/templates";
import { toFlow } from "../lib/diagram-adapter";

const defaultPrompt = "Generate a Banking AI Reference Architecture with RAG, Snowflake, OpenAI, APIs, governance, and observability";
const formats = ["mermaid", "plantUml", "drawioXml", "svg", "pngDataUri", "json"] as const;

type FormatKey = (typeof formats)[number];

export function StudioShell() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [documentText, setDocumentText] = useState("Upload or paste BRD / FRD / SOW / RFP / architecture content here to generate multiple views.");
  const [themeId, setThemeId] = useState("enterprise-blue");
  const [bundle, setBundle] = useState<DiagramBundle>(() => generateDiagramBundle({ prompt: defaultPrompt, themeId: "enterprise-blue" }));
  const [format, setFormat] = useState<FormatKey>("mermaid");
  const flow = useMemo(() => toFlow(bundle.model), [bundle.model]);
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);
  const assets = searchAssets(prompt).slice(0, 12);
  const templates = listTemplates(prompt).slice(0, 5);

  function generate(nextPrompt = prompt, withDocument = false) {
    const nextBundle = generateDiagramBundle({ prompt: nextPrompt, themeId, documentText: withDocument ? documentText : undefined });
    const nextFlow = toFlow(nextBundle.model);
    setBundle(nextBundle);
    setNodes(nextFlow.nodes);
    setEdges(nextFlow.edges);
  }

  function readUpload(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDocumentText(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  const formatValue = format === "json" ? JSON.stringify(bundle.model, null, 2) : String(bundle[format]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">AKDIA Studio</p>
            <h1 className="text-2xl font-black">Enterprise AI Diagram & Architecture Studio</h1>
          </div>
          <div className="flex items-center gap-3">
            <select value={themeId} onChange={(event) => setThemeId(event.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm">
              {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
            </select>
            <button onClick={() => generate()} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 font-bold text-slate-950">
              <Sparkles size={18} /> Generate
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1800px] gap-4 p-4 xl:grid-cols-[360px_1fr_420px]">
        <aside className="space-y-4">
          <Panel title="ChatGPT-like design prompt" icon={<MessageSquareText size={18} />}>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-36 w-full rounded-2xl border border-white/10 bg-slate-900 p-3 text-sm outline-none focus:border-cyan-300" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["AWS Landing Zone", "Snowflake Data Platform", "RAG Architecture", "BPMN workflow from this BRD"].map((sample) => (
                <button key={sample} onClick={() => { setPrompt(sample); generate(sample); }} className="rounded-xl border border-white/10 bg-white/5 p-2 text-left text-xs text-slate-300 hover:bg-white/10">
                  {sample}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Document to diagram" icon={<FileText size={18} />}>
            <input type="file" onChange={(event) => readUpload(event.target.files?.[0])} className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900 p-2 text-xs" />
            <textarea value={documentText} onChange={(event) => setDocumentText(event.target.value)} className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-900 p-3 text-xs" />
            <button onClick={() => generate(prompt, true)} className="mt-3 w-full rounded-xl bg-violet-400 px-4 py-2 font-bold text-slate-950">
              Generate document pack
            </button>
          </Panel>

          <Panel title="Reference templates" icon={<Layers3 size={18} />}>
            <div className="space-y-2">
              {templates.map((template) => (
                <button key={template.id} onClick={() => { setPrompt(template.prompt); generate(template.prompt); }} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10">
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
              <h2 className="text-xl font-black">{bundle.model.title}</h2>
              <p className="text-sm text-slate-400">Editable React Flow canvas with generated objects, connectors, and metadata.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"><Download size={16} /> Export</button>
          </div>
          <div className="h-[760px] bg-slate-100 text-slate-950">
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
              <Background />
              <MiniMap />
              <Controls />
            </ReactFlow>
          </div>
        </section>

        <aside className="space-y-4">
          <Panel title="Multi-diagram engine" icon={<Download size={18} />}>
            <div className="mb-3 flex flex-wrap gap-2">
              {formats.map((item) => (
                <button key={item} onClick={() => setFormat(item)} className={`rounded-xl px-3 py-2 text-xs font-bold ${format === item ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-slate-200"}`}>
                  {item}
                </button>
              ))}
            </div>
            <pre className="max-h-[360px] overflow-auto rounded-2xl bg-slate-950 p-3 text-xs text-slate-300">{formatValue}</pre>
          </Panel>

          <Panel title="Visual asset library" icon={<Palette size={18} />}>
            <div className="grid grid-cols-3 gap-2">
              {assets.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-center">
                  <div dangerouslySetInnerHTML={{ __html: asset.svg }} />
                  <p className="mt-1 text-xs font-semibold">{asset.name}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="AI decisions and recommendations" icon={<Sparkles size={18} />}>
            <ul className="space-y-2 text-sm text-slate-300">
              {[...bundle.model.decisions, ...bundle.model.recommendations].map((item) => <li key={item} className="rounded-xl bg-white/5 p-3">{item}</li>)}
            </ul>
          </Panel>
        </aside>
      </main>
    </div>
  );
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
