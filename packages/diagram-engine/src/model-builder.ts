import { nanoid } from "nanoid";
import { analyzeDocument, extractPromptConcepts, inferDiagramType } from "./analyzer";
import { getTheme } from "./themes";
import type { DiagramEdge, DiagramGroup, DiagramModel, DiagramNode, GenerateDiagramInput } from "./types";

const PALETTES = ["#dbeafe", "#dcfce7", "#fef3c7", "#ede9fe", "#fce7f3", "#cffafe", "#fee2e2", "#e0e7ff"];

const ARCHETYPE_COMPONENTS: Record<string, string[]> = {
  "aws-architecture": ["CloudFront", "API Gateway", "Lambda Services", "EKS Platform", "Aurora Database", "S3 Data Lake", "CloudWatch", "IAM Guardrails"],
  "azure-architecture": ["Front Door", "API Management", "AKS", "Functions", "Cosmos DB", "Data Lake", "Monitor", "Entra ID"],
  "gcp-architecture": ["Cloud Load Balancer", "Apigee", "Cloud Run", "GKE", "BigQuery", "Cloud Storage", "Cloud Logging", "IAM"],
  "rag-architecture": ["User Channels", "Prompt Orchestrator", "Retrieval Agent", "Vector Database", "Document Store", "LLM Gateway", "Evaluation Service", "Audit Log"],
  "graphrag-architecture": ["User Channels", "Graph Retriever", "Knowledge Graph", "Vector Index", "Corpus Store", "Reasoning Agent", "LLM Gateway", "Governance"],
  "data-architecture": ["Source Systems", "Ingestion", "Lakehouse", "Warehouse", "Semantic Layer", "BI & Analytics", "Data Quality", "Catalog"],
  "security-architecture": ["Users", "Identity Provider", "Policy Engine", "Zero Trust Gateway", "Workloads", "SIEM", "Secrets Vault", "Compliance"],
  "business-process": ["Trigger", "Intake", "Validation", "Approval", "Fulfillment", "Notification", "Reporting", "Controls"],
  "microservices-architecture": ["Channels", "API Gateway", "Service Mesh", "Domain Services", "Event Bus", "Databases", "Observability", "Platform Ops"],
  "devops-architecture": ["Source Control", "Build Pipeline", "Security Scans", "Artifact Registry", "Deploy Pipeline", "Runtime", "Monitoring", "Feedback"],
  "solution-architecture": ["Experience", "API Layer", "Business Services", "Integration", "Data Platform", "AI Services", "Security", "Operations"]
};

export function buildDiagramModel(input: GenerateDiagramInput): DiagramModel {
  const source = [input.prompt, input.documentText].filter(Boolean).join("\n");
  const type = inferDiagramType(source, input.type);
  const theme = getTheme(input.themeId);
  const analysis = input.documentText ? analyzeDocument(input.documentText, input.prompt) : undefined;
  const promptConcepts = extractPromptConcepts(input.prompt);
  const baseline = analysis?.architectureComponents.length ? analysis.architectureComponents : ARCHETYPE_COMPONENTS[type] ?? ARCHETYPE_COMPONENTS["solution-architecture"];
  const concepts = mergeComponents(baseline, promptConcepts).slice(0, 10);
  const groups = createGroups(theme.primary, concepts.length);
  const nodes = concepts.map((label, index) => createNode(label, index, groups[index % groups.length].id));
  const edges = createEdges(nodes, type);
  const title = createTitle(input.prompt, type, analysis?.title);

  return {
    id: `diagram_${nanoid(10)}`,
    title,
    type,
    summary: analysis?.executiveSummary || `AI-generated ${type.replace(/-/g, " ")} with editable enterprise components, labeled integrations, and multi-format export fidelity.`,
    theme,
    nodes,
    edges,
    groups,
    decisions: [
      "Separated experience, orchestration, platform, data, governance, and operations responsibilities into visible layers.",
      "Used labeled connectors so Mermaid, PlantUML, Draw.io, SVG, and PPT exports retain relationship semantics.",
      "Preserved every generated element in the JSON model for drag-and-drop editing and downstream regeneration."
    ],
    recommendations: [
      "Add ownership metadata and criticality tags to each component before architecture review.",
      "Validate integration protocols, data classifications, and non-functional requirements with domain stakeholders.",
      "Run optimization to reduce crossing connectors and identify reusable reference architecture patterns."
    ],
    assumptions: [
      "Generated from the available prompt/document context; unresolved requirements should be reviewed.",
      "Vendor logos are referenced by metadata keys and can be replaced from the enterprise asset catalog."
    ],
    createdAt: new Date().toISOString()
  };
}

function mergeComponents(primary: string[], secondary: string[]): string[] {
  return Array.from(new Set([...primary, ...secondary])).filter(Boolean);
}

function createGroups(primary: string, componentCount: number): DiagramGroup[] {
  const groupCount = componentCount > 8 ? 4 : 3;
  const labels = ["Experience & Channels", "Core Platform", "Data & AI", "Security & Operations"];
  return Array.from({ length: groupCount }, (_, index) => ({
    id: `group_${index + 1}`,
    label: labels[index],
    color: `${PALETTES[index]}cc`,
    x: 40 + index * 300,
    y: 120,
    width: 270,
    height: 560
  })).map((group, index) => ({ ...group, color: index === 1 ? `${primary}18` : group.color }));
}

function createNode(label: string, index: number, group: string): DiagramNode {
  const column = index % 4;
  const row = Math.floor(index / 4);
  return {
    id: `node_${index + 1}`,
    label,
    kind: inferKind(label),
    group,
    icon: inferIcon(label),
    description: `${label} capability generated by the AI architecture agent.`,
    x: 72 + column * 300,
    y: 190 + row * 170,
    width: 210,
    height: 96,
    color: PALETTES[index % PALETTES.length],
    metadata: {
      editable: true,
      exportable: ["mermaid", "plantuml", "drawio", "svg", "png", "ppt", "json"]
    }
  };
}

function createEdges(nodes: DiagramNode[], type: string): DiagramEdge[] {
  const edges: DiagramEdge[] = [];
  for (let index = 0; index < nodes.length - 1; index += 1) {
    edges.push({
      id: `edge_${index + 1}`,
      from: nodes[index].id,
      to: nodes[index + 1].id,
      label: type.includes("data") || type.includes("rag") ? "data/context" : index % 2 ? "event" : "request",
      kind: type.includes("security") ? "trust" : index % 3 === 0 ? "data" : index % 2 === 0 ? "sync" : "async"
    });
  }
  if (nodes.length > 4) {
    edges.push({ id: "edge_feedback", from: nodes[nodes.length - 1].id, to: nodes[1].id, label: "feedback", kind: "control" });
  }
  return edges;
}

function createTitle(prompt: string, type: string, documentTitle?: string): string {
  if (documentTitle && documentTitle.length > 12) return documentTitle;
  const cleaned = prompt.replace(/^(create|generate|build|make)\s+/i, "").replace(/diagram$/i, "").trim();
  return cleaned.length > 8 ? titleCase(cleaned) : titleCase(type.replace(/-/g, " "));
}

function titleCase(value: string): string {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function inferKind(label: string): string {
  const lower = label.toLowerCase();
  if (/db|database|warehouse|lake|vector|aurora|postgres|snowflake|bigquery/.test(lower)) return "data store";
  if (/api|gateway|apigee|front door/.test(lower)) return "integration";
  if (/iam|identity|policy|security|zero trust|vault|compliance/.test(lower)) return "security";
  if (/agent|llm|model|ai|retrieval|prompt|reasoning/.test(lower)) return "ai service";
  if (/pipeline|deploy|build|registry/.test(lower)) return "devops";
  return "application component";
}

function inferIcon(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("aws") || lower.includes("lambda") || lower.includes("cloudfront")) return "aws";
  if (lower.includes("azure") || lower.includes("entra")) return "azure";
  if (lower.includes("gcp") || lower.includes("bigquery")) return "gcp";
  if (lower.includes("snowflake")) return "snowflake";
  if (lower.includes("databricks")) return "databricks";
  if (lower.includes("kafka") || lower.includes("event")) return "kafka";
  if (lower.includes("kubernetes") || lower.includes("eks") || lower.includes("aks") || lower.includes("gke")) return "kubernetes";
  if (lower.includes("openai") || lower.includes("llm")) return "openai";
  return "generic-component";
}
