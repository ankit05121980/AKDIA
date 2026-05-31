import { nanoid } from "nanoid";
import { inferDiagramType } from "./analyzer";
import { bundle } from "./generators";
import { getTheme } from "./themes";
import { buildDiagramModel, createTitle, inferIcon, inferKind, titleCase } from "./model-builder";
import type { AiProviderOptions, DiagramBundle, DiagramEdge, DiagramGroup, DiagramModel, DiagramNode, GenerateDiagramInput } from "./types";

interface LlmDiagramResponse {
  title?: string;
  summary?: string;
  groups?: Array<{ id?: string; label?: string }>;
  nodes?: Array<{ id?: string; label?: string; kind?: string; group?: string; description?: string; icon?: string }>;
  edges?: Array<{ from?: string; to?: string; label?: string; kind?: DiagramEdge["kind"] }>;
  decisions?: string[];
  recommendations?: string[];
  assumptions?: string[];
}

interface OpenAiChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

const VALID_EDGE_KINDS = new Set(["sync", "async", "data", "control", "trust", "deployment"]);
const PALETTE = ["#dbeafe", "#dcfce7", "#fef3c7", "#ede9fe", "#fce7f3", "#cffafe", "#fee2e2", "#e0e7ff", "#fae8ff", "#ccfbf1"];

export async function generateDiagramBundleWithAi(input: GenerateDiagramInput, options: AiProviderOptions = {}): Promise<DiagramBundle> {
  if (!shouldUseOpenAi(options)) {
    return bundle(buildDiagramModel(input));
  }

  try {
    const generated = await requestOpenAiDiagram(input, options);
    return bundle(normalizeLlmResponse(input, generated));
  } catch {
    return bundle(buildDiagramModel(input));
  }
}

function shouldUseOpenAi(options: AiProviderOptions): boolean {
  return Boolean(options.apiKey && options.provider !== "mock");
}

async function requestOpenAiDiagram(input: GenerateDiagramInput, options: AiProviderOptions): Promise<LlmDiagramResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 25_000);
  const endpoint = `${options.baseUrl ?? "https://api.openai.com/v1"}/chat/completions`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.apiKey}`
      },
      body: JSON.stringify({
        model: options.model ?? "gpt-4o-mini",
        temperature: 0.45,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "You are an enterprise architecture diagram generation agent.",
              "Think through the user's prompt and produce a consulting-grade editable diagram model.",
              "Do not return Mermaid or SVG. Return strict JSON only.",
              "Use domain-specific components, meaningful layers, and labeled relationships.",
              "Avoid generic repeated boxes unless the prompt is generic."
            ].join(" ")
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Create a diagram model for a multi-format architecture studio.",
              requestedSchema: {
                title: "string",
                summary: "string",
                groups: [{ id: "short-id", label: "layer name" }],
                nodes: [{ id: "short-id", label: "component name", kind: "component type", group: "group id", description: "one sentence", icon: "vendor-or-concept-key" }],
                edges: [{ from: "node id", to: "node id", label: "relationship label", kind: "sync|async|data|control|trust|deployment" }],
                decisions: ["design decision"],
                recommendations: ["improvement recommendation"],
                assumptions: ["assumption"]
              },
              constraints: [
                "Return 8 to 14 nodes.",
                "Return 3 to 5 groups.",
                "Use prompt-specific systems, business capabilities, data stores, integrations, and controls.",
                "Every edge must reference an existing node id.",
                "Every node must belong to an existing group id."
              ],
              prompt: input.prompt,
              documentText: input.documentText,
              diagramType: input.type
            })
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with HTTP ${response.status}`);
    }

    const payload = (await response.json()) as OpenAiChatResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI response did not include content");
    return parseJsonObject(content);
  } finally {
    clearTimeout(timeout);
  }
}

function parseJsonObject(content: string): LlmDiagramResponse {
  const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned) as LlmDiagramResponse;
}

function normalizeLlmResponse(input: GenerateDiagramInput, generated: LlmDiagramResponse): DiagramModel {
  const source = [input.prompt, input.documentText].filter(Boolean).join("\n");
  const type = inferDiagramType(source, input.type);
  const theme = getTheme(input.themeId);
  const rawGroups = generated.groups?.filter((group) => group.label).slice(0, 5) ?? [];
  const groups = (rawGroups.length ? rawGroups : defaultGroups(type)).map((group, index) => ({
    id: sanitizeId(group.id || `group_${index + 1}`),
    label: titleCase(group.label || `Layer ${index + 1}`),
    color: `${PALETTE[index % PALETTE.length]}cc`,
    x: 40 + index * 300,
    y: 120,
    width: 270,
    height: 560
  }));
  const groupIds = new Set(groups.map((group) => group.id));
  const rawNodes = generated.nodes?.filter((node) => node.label).slice(0, 14) ?? [];
  const nodes = rawNodes.length >= 4 ? rawNodes : defaultNodes(input.prompt, groups);
  const normalizedNodes = nodes.map((node, index) => normalizeNode(node, index, groups, groupIds));
  const nodeIds = new Set(normalizedNodes.map((node) => node.id));
  const normalizedEdges = normalizeEdges(generated.edges ?? [], normalizedNodes, nodeIds);

  return {
    id: `diagram_${nanoid(10)}`,
    title: generated.title?.trim() || createTitle(input.prompt, type),
    type,
    summary: generated.summary?.trim() || `OpenAI generated ${type.replace(/-/g, " ")} tailored to the supplied prompt.`,
    theme,
    nodes: normalizedNodes,
    edges: normalizedEdges,
    groups,
    decisions: ensureList(generated.decisions, [
      "Used prompt-specific components and relationship labels instead of a static reference pattern.",
      "Kept the model editable so every AI-generated object can be moved, exported, and converted.",
      "Grouped components into architecture layers to preserve intent across Mermaid, PlantUML, Draw.io, SVG, and PPT outputs."
    ]),
    recommendations: ensureList(generated.recommendations, [
      "Review generated assumptions with stakeholders before implementation.",
      "Add ownership, SLA, security classification, and operational runbook metadata.",
      "Run layout optimization after adding any missing integration details."
    ]),
    assumptions: ensureList(generated.assumptions, ["Generated from the current prompt and optional document context."]),
    createdAt: new Date().toISOString()
  };
}

function normalizeNode(
  node: { id?: string; label?: string; kind?: string; group?: string; description?: string; icon?: string },
  index: number,
  groups: DiagramGroup[],
  groupIds: Set<string>
): DiagramNode {
  const group = node.group && groupIds.has(sanitizeId(node.group)) ? sanitizeId(node.group) : groups[index % groups.length].id;
  const column = index % Math.max(groups.length, 1);
  const row = Math.floor(index / Math.max(groups.length, 1));
  const label = titleCase(node.label || `Component ${index + 1}`);

  return {
    id: sanitizeId(node.id || `node_${index + 1}`),
    label,
    kind: node.kind || inferKind(label),
    group,
    icon: node.icon || inferIcon(label),
    description: node.description || `${label} generated by the AI diagram agent.`,
    x: 72 + column * 300,
    y: 190 + row * 155,
    width: 210,
    height: 96,
    color: PALETTE[index % PALETTE.length],
    metadata: { editable: true, aiGenerated: true }
  };
}

function normalizeEdges(rawEdges: LlmDiagramResponse["edges"], nodes: DiagramNode[], nodeIds: Set<string>): DiagramEdge[] {
  const edges = (rawEdges ?? [])
    .filter((edge): edge is Required<NonNullable<LlmDiagramResponse["edges"]>[number]> => Boolean(edge.from && edge.to && nodeIds.has(sanitizeId(edge.from)) && nodeIds.has(sanitizeId(edge.to))))
    .slice(0, 18)
    .map((edge, index) => ({
      id: `edge_${index + 1}`,
      from: sanitizeId(edge.from),
      to: sanitizeId(edge.to),
      label: edge.label || "integrates",
      kind: VALID_EDGE_KINDS.has(edge.kind) ? edge.kind : "sync"
    }));

  if (edges.length) return edges;
  return nodes.slice(0, -1).map((node, index) => ({
    id: `edge_${index + 1}`,
    from: node.id,
    to: nodes[index + 1].id,
    label: index % 2 ? "event" : "request",
    kind: index % 3 === 0 ? "data" : "sync"
  }));
}

function defaultGroups(type: string): Array<{ id: string; label: string }> {
  if (type.includes("rag") || type.includes("ai")) return [{ id: "experience", label: "Experience" }, { id: "orchestration", label: "AI Orchestration" }, { id: "knowledge", label: "Knowledge" }, { id: "governance", label: "Governance" }];
  if (type.includes("data")) return [{ id: "sources", label: "Sources" }, { id: "processing", label: "Processing" }, { id: "serving", label: "Serving" }, { id: "governance", label: "Governance" }];
  return [{ id: "channels", label: "Channels" }, { id: "platform", label: "Platform" }, { id: "data", label: "Data" }, { id: "operations", label: "Operations" }];
}

function defaultNodes(prompt: string, groups: DiagramGroup[]) {
  return prompt.split(/\s+/).filter((word) => word.length > 4).slice(0, 8).map((word, index) => ({
    id: `node_${index + 1}`,
    label: titleCase(word.replace(/[^a-z0-9+#.-]/gi, "")),
    group: groups[index % groups.length].id
  }));
}

function sanitizeId(value: string): string {
  const sanitized = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return sanitized || `id_${nanoid(6)}`;
}

function ensureList(values: string[] | undefined, fallback: string[]): string[] {
  const cleaned = values?.map((value) => value.trim()).filter(Boolean).slice(0, 6) ?? [];
  return cleaned.length ? cleaned : fallback;
}
