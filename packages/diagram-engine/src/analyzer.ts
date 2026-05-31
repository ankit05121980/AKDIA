import type { DiagramType, DocumentAnalysis } from "./types";

const SYSTEM_KEYWORDS = [
  "api",
  "portal",
  "database",
  "warehouse",
  "lakehouse",
  "crm",
  "erp",
  "iam",
  "queue",
  "kafka",
  "service",
  "agent",
  "model",
  "vector",
  "gateway",
  "snowflake",
  "databricks",
  "sap",
  "salesforce"
];

const DIAGRAM_HINTS: Array<{ type: DiagramType; terms: string[] }> = [
  { type: "aws-architecture", terms: ["aws", "landing zone", "vpc", "lambda", "eks"] },
  { type: "azure-architecture", terms: ["azure", "entra", "aks", "resource group"] },
  { type: "gcp-architecture", terms: ["gcp", "google cloud", "bigquery", "cloud run"] },
  { type: "rag-architecture", terms: ["rag", "retrieval", "vector", "embedding", "llm"] },
  { type: "graphrag-architecture", terms: ["graph", "knowledge graph", "graphrag"] },
  { type: "data-architecture", terms: ["data", "etl", "lineage", "warehouse", "lakehouse"] },
  { type: "security-architecture", terms: ["zero trust", "security", "identity", "iam", "policy"] },
  { type: "business-process", terms: ["process", "workflow", "approval", "handoff"] },
  { type: "microservices-architecture", terms: ["microservice", "service mesh", "container", "kubernetes"] },
  { type: "devops-architecture", terms: ["ci/cd", "pipeline", "devops", "deploy"] }
];

export function inferDiagramType(prompt: string, explicit?: DiagramType): DiagramType {
  if (explicit) return explicit;
  const normalized = prompt.toLowerCase();
  return DIAGRAM_HINTS.find((hint) => hint.terms.some((term) => normalized.includes(term)))?.type ?? "solution-architecture";
}

export function analyzeDocument(text: string, fallbackTitle = "Generated Architecture"): DocumentAnalysis {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const title = sentences[0]?.slice(0, 92) || fallbackTitle;
  const words = cleaned.match(/[A-Za-z][A-Za-z0-9+.#-]{2,}/g) ?? [];
  const unique = Array.from(new Set(words.map((word) => normalizeTitle(word)))).slice(0, 60);
  const systems = unique.filter((word) => SYSTEM_KEYWORDS.some((keyword) => word.toLowerCase().includes(keyword))).slice(0, 12);
  const entities = unique.filter((word) => /^[A-Z]/.test(word)).slice(0, 15);
  const workflows = sentences.filter((sentence) => /approve|submit|review|process|trigger|route|generate|deploy|ingest/i.test(sentence)).slice(0, 8);
  const integrations = sentences.filter((sentence) => /integrat|connect|sync|api|event|message|stream|webhook/i.test(sentence)).slice(0, 8);
  const architectureComponents = Array.from(new Set([...systems, ...entities])).slice(0, 14);

  return {
    title,
    executiveSummary: sentences.slice(0, 4).join(" ") || "AI extracted a candidate architecture from the supplied content.",
    entities,
    systems: systems.length ? systems : ["Experience Layer", "Integration Layer", "Domain Services", "Data Platform", "AI Services", "Governance"],
    integrations: integrations.length ? integrations : ["Synchronous API calls", "Event-driven messaging", "Batch data ingestion"],
    workflows: workflows.length ? workflows : ["Capture request", "Validate inputs", "Process through services", "Persist outcomes", "Report insights"],
    architectureComponents: architectureComponents.length ? architectureComponents : ["Channels", "APIs", "Services", "Data Stores", "Analytics", "Security Controls"],
    risks: ["Data quality and ownership", "Integration latency", "Security and regulatory compliance", "Operational observability"],
    roadmap: ["Discover and classify systems", "Model target architecture", "Pilot critical workflow", "Scale platform capabilities"]
  };
}

export function extractPromptConcepts(prompt: string): string[] {
  const matches = prompt.match(/[A-Za-z][A-Za-z0-9+.#-]{2,}/g) ?? [];
  const stop = new Set(["the", "and", "for", "with", "from", "create", "generate", "architecture", "diagram", "workflow"]);
  return Array.from(new Set(matches.map(normalizeTitle).filter((item) => !stop.has(item.toLowerCase())))).slice(0, 10);
}

function normalizeTitle(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}
