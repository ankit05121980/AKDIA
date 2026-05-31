import type { DiagramBundle, DiagramModel, InfographicModel, PptDeckModel } from "./types";

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const escapeMermaid = (value: string) => value.replace(/["<>]/g, "");
const escapePlant = (value: string) => value.replace(/"/g, "'");

export function toMermaid(model: DiagramModel): string {
  const lines = ["flowchart LR", `  %% ${escapeMermaid(model.title)}`];
  for (const group of model.groups) {
    lines.push(`  subgraph ${safeId(group.id)}[${escapeMermaid(group.label)}]`);
    for (const node of model.nodes.filter((candidate) => candidate.group === group.id)) {
      lines.push(`    ${safeId(node.id)}[\"${escapeMermaid(node.label)}\"]`);
    }
    lines.push("  end");
  }
  for (const node of model.nodes.filter((candidate) => !candidate.group)) {
    lines.push(`  ${safeId(node.id)}[\"${escapeMermaid(node.label)}\"]`);
  }
  for (const edge of model.edges) {
    const arrow = edge.kind === "async" || edge.kind === "data" ? "-.->" : "-->|" + escapeMermaid(edge.label) + "|";
    lines.push(edge.kind === "async" || edge.kind === "data" ? `  ${safeId(edge.from)} ${arrow}|${escapeMermaid(edge.label)}| ${safeId(edge.to)}` : `  ${safeId(edge.from)} ${arrow} ${safeId(edge.to)}`);
  }
  lines.push(`  classDef primary fill:${model.theme.primary},stroke:${model.theme.accent},color:${model.theme.text};`);
  lines.push(`  class ${model.nodes.map((node) => safeId(node.id)).join(",")} primary;`);
  return lines.join("\n");
}

export function toPlantUml(model: DiagramModel): string {
  const lines = ["@startuml", `title ${escapePlant(model.title)}`, "left to right direction", "skinparam shadowing true", `skinparam backgroundColor ${model.theme.background}`];
  for (const group of model.groups) {
    lines.push(`package \"${escapePlant(group.label)}\" {`);
    for (const node of model.nodes.filter((candidate) => candidate.group === group.id)) {
      lines.push(`  component \"${escapePlant(node.label)}\" as ${safeId(node.id)}`);
    }
    lines.push("}");
  }
  for (const node of model.nodes.filter((candidate) => !candidate.group)) {
    lines.push(`component \"${escapePlant(node.label)}\" as ${safeId(node.id)}`);
  }
  for (const edge of model.edges) {
    const connector = edge.kind === "async" || edge.kind === "data" ? "..>" : "-->";
    lines.push(`${safeId(edge.from)} ${connector} ${safeId(edge.to)} : ${escapePlant(edge.label)}`);
  }
  lines.push("@enduml");
  return lines.join("\n");
}

export function toDrawioXml(model: DiagramModel): string {
  const cells = [
    '<mxCell id="0"/>',
    '<mxCell id="1" parent="0"/>'
  ];
  for (const group of model.groups) {
    cells.push(`<mxCell id="${escapeXml(group.id)}" value="${escapeXml(group.label)}" style="swimlane;whiteSpace=wrap;html=1;fillColor=${group.color};strokeColor=${model.theme.primary};" vertex="1" parent="1"><mxGeometry x="${group.x}" y="${group.y}" width="${group.width}" height="${group.height}" as="geometry"/></mxCell>`);
  }
  for (const node of model.nodes) {
    cells.push(`<mxCell id="${escapeXml(node.id)}" value="${escapeXml(node.label)}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=${node.color};strokeColor=${model.theme.primary};fontColor=${model.theme.text};" vertex="1" parent="${node.group ?? "1"}"><mxGeometry x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" as="geometry"/></mxCell>`);
  }
  for (const edge of model.edges) {
    cells.push(`<mxCell id="${escapeXml(edge.id)}" value="${escapeXml(edge.label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=${model.theme.accent};" edge="1" parent="1" source="${escapeXml(edge.from)}" target="${escapeXml(edge.to)}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
  }
  return `<mxfile host="AKDIA" modified="${model.createdAt}"><diagram name="${escapeXml(model.title)}"><mxGraphModel dx="1280" dy="720" grid="1" gridSize="10"><root>${cells.join("")}</root></mxGraphModel></diagram></mxfile>`;
}

export function toSvg(model: DiagramModel): string {
  const width = 1280;
  const height = 760;
  const groups = model.groups.map((group) => `<rect x="${group.x}" y="${group.y}" width="${group.width}" height="${group.height}" rx="24" fill="${group.color}" stroke="${model.theme.grid}"/><text x="${group.x + 24}" y="${group.y + 36}" font-family="Inter, Arial" font-size="18" font-weight="700" fill="${model.theme.text}">${escapeXml(group.label)}</text>`).join("");
  const defs = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${model.theme.accent}"/></marker><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.14"/></filter></defs>`;
  const nodeById = new Map(model.nodes.map((node) => [node.id, node]));
  const edges = model.edges.map((edge) => {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    if (!from || !to) return "";
    const x1 = from.x + from.width;
    const y1 = from.y + from.height / 2;
    const x2 = to.x;
    const y2 = to.y + to.height / 2;
    const mx = (x1 + x2) / 2;
    return `<path d="M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}" fill="none" stroke="${model.theme.accent}" stroke-width="2.5" marker-end="url(#arrow)"/><text x="${mx - 36}" y="${(y1 + y2) / 2 - 8}" font-family="Inter, Arial" font-size="12" fill="${model.theme.muted}">${escapeXml(edge.label)}</text>`;
  }).join("");
  const nodes = model.nodes.map((node) => `<g filter="url(#shadow)"><rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="18" fill="${node.color}" stroke="${model.theme.primary}" stroke-width="2"/><circle cx="${node.x + 28}" cy="${node.y + 32}" r="12" fill="${model.theme.primary}"/><text x="${node.x + 52}" y="${node.y + 36}" font-family="Inter, Arial" font-size="16" font-weight="700" fill="${model.theme.text}">${escapeXml(node.label)}</text><text x="${node.x + 20}" y="${node.y + 66}" font-family="Inter, Arial" font-size="12" fill="${model.theme.muted}">${escapeXml(node.kind)}</text></g>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(model.title)}">${defs}<rect width="100%" height="100%" fill="${model.theme.background}"/><text x="48" y="54" font-family="Inter, Arial" font-size="28" font-weight="800" fill="${model.theme.text}">${escapeXml(model.title)}</text><text x="48" y="82" font-family="Inter, Arial" font-size="14" fill="${model.theme.muted}">${escapeXml(model.summary)}</text>${groups}${edges}${nodes}</svg>`;
}

export function toPngDataUri(model: DiagramModel): string {
  const svg = toSvg(model);
  return `data:image/svg+xml;base64,${encodeBase64(svg)}`;
}

export function toPptModel(model: DiagramModel): PptDeckModel {
  return {
    title: model.title,
    slides: [
      {
        title: model.title,
        speakerNotes: model.summary,
        shapes: [
          { type: "text", text: model.title, x: 0.5, y: 0.3, w: 12, h: 0.4, color: model.theme.text },
          ...model.nodes.map((node) => ({ type: "rect" as const, text: node.label, x: node.x / 100, y: node.y / 100, w: node.width / 100, h: node.height / 100, color: node.color })),
          ...model.edges.map((edge) => ({ type: "line" as const, text: edge.label, x: 0, y: 0, w: 0, h: 0, color: model.theme.accent }))
        ]
      },
      {
        title: "Architecture Decisions",
        speakerNotes: "AI-generated design rationale and improvement opportunities.",
        shapes: model.decisions.map((decision, index) => ({ type: "text" as const, text: decision, x: 0.7, y: 1 + index * 0.55, w: 11, h: 0.4, color: model.theme.text }))
      }
    ]
  };
}

export function toInfographic(model: DiagramModel): InfographicModel {
  return {
    title: `${model.title} Executive Visual Summary`,
    style: "mckinsey",
    sections: [
      { heading: "Architecture Scope", metric: `${model.nodes.length} components`, narrative: "Core enterprise capabilities are grouped into editable architectural layers." },
      { heading: "Integration Surface", metric: `${model.edges.length} flows`, narrative: "System interactions are represented as labeled, convertible connectors." },
      { heading: "Improvement Backlog", metric: `${model.recommendations.length} actions`, narrative: "AI recommendations highlight modernization and governance opportunities." }
    ]
  };
}

export function bundle(model: DiagramModel): DiagramBundle {
  return {
    model,
    mermaid: toMermaid(model),
    plantUml: toPlantUml(model),
    drawioXml: toDrawioXml(model),
    svg: toSvg(model),
    pngDataUri: toPngDataUri(model),
    pptxModel: toPptModel(model),
    executiveSummary: model.summary,
    infographic: toInfographic(model)
  };
}

function safeId(id: string): string {
  return id.replace(/[^A-Za-z0-9_]/g, "_");
}

function encodeBase64(value: string): string {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(unescape(encodeURIComponent(value)));
  }

  const runtime = globalThis as typeof globalThis & {
    Buffer?: { from(input: string): { toString(encoding: "base64"): string } };
  };
  return runtime.Buffer?.from(value).toString("base64") ?? "";
}
