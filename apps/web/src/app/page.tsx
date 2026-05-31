import Link from "next/link";
import { ArrowRight, BrainCircuit, FileUp, Layers3, WandSparkles } from "lucide-react";

const capabilities = [
  "Prompt-to-Mermaid, PlantUML, Draw.io, SVG, PNG, PPT, and JSON",
  "Document-to-executive summary, architecture, data flow, capability map, and infographic",
  "React Flow editable canvas with enterprise themes and asset palette",
  "AI architecture review, optimization, pattern detection, and reference templates"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1e40af_0,#0f172a_32%,#020617_100%)]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16">
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
          <WandSparkles size={16} /> Enterprise AI diagramming platform
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
              Build consulting-grade architecture visuals from prompts and documents.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              AKDIA combines conversational AI, editable diagram canvases, multi-format export, document analysis, enterprise assets, and reference architecture templates in one studio.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/studio" className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-6 py-3 font-bold text-slate-950 shadow-2xl shadow-cyan-950/30">
                Open Studio <ArrowRight size={18} />
              </Link>
              <a href="#capabilities" className="rounded-2xl border border-white/15 px-6 py-3 font-semibold text-white">
                View capabilities
              </a>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="grid gap-4">
              {[BrainCircuit, FileUp, Layers3].map((Icon, index) => (
                <div key={index} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                  <Icon className="mb-4 text-cyan-300" />
                  <p className="text-sm text-slate-300">{capabilities[index]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div id="capabilities" className="mt-16 grid gap-4 md:grid-cols-2">
          {capabilities.map((capability) => (
            <div key={capability} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-200">
              {capability}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
