import type { DiagramType, GenerateDiagramInput } from "@akdia/diagram-engine";

export interface ArchitectureTemplate {
  id: string;
  title: string;
  type: DiagramType;
  industry: string;
  description: string;
  prompt: string;
  tags: string[];
}

export const templates: ArchitectureTemplate[] = [
  template("banking-ai-reference", "Banking AI Reference Architecture", "ai-architecture", "Financial Services", "Omnichannel AI banking with governance and human review.", ["banking", "ai", "risk", "governance"]),
  template("aws-landing-zone", "AWS Landing Zone", "aws-architecture", "Cross Industry", "Multi-account AWS foundation with network, identity, logging, and guardrails.", ["aws", "cloud", "landing zone"]),
  template("snowflake-data-platform", "Snowflake Data Platform", "data-architecture", "Data", "Modern data platform with ingestion, transformation, semantic, and governance layers.", ["snowflake", "data", "analytics"]),
  template("rag-enterprise-copilot", "Enterprise RAG Copilot", "rag-architecture", "Knowledge Work", "Secure retrieval augmented generation with vector search and evaluation.", ["rag", "llm", "vector"]),
  template("zero-trust-platform", "Zero Trust Security Architecture", "zero-trust-architecture", "Security", "Identity-centric security with policy enforcement and continuous monitoring.", ["security", "iam", "zero trust"]),
  template("claims-bpmn", "Insurance Claims BPMN Workflow", "bpmn", "Insurance", "End-to-end claims intake, triage, adjudication, payment, and exception handling.", ["bpmn", "claims", "workflow"]),
  template("microservices-platform", "Microservices Platform", "microservices-architecture", "Digital", "API gateway, service mesh, domain services, data stores, and observability.", ["microservices", "kubernetes", "api"]),
  template("devops-cicd", "DevOps CI/CD Architecture", "cicd-architecture", "Platform", "Secure software delivery pipeline with scans, artifacts, deployments, and feedback.", ["devops", "ci/cd", "platform"]),
  template("enterprise-capability-map", "Enterprise Capability Map", "capability-map", "Strategy", "Business capability heatmap for executive portfolio planning.", ["capability", "strategy", "operating model"]),
  template("data-lineage", "Regulated Data Lineage", "data-lineage", "Data Governance", "Source-to-report lineage with controls, quality checks, and owners.", ["lineage", "governance", "data"])
];

export function listTemplates(query = ""): ArchitectureTemplate[] {
  const normalized = query.toLowerCase();
  return templates.filter((item) => !normalized || [item.title, item.description, item.industry, ...item.tags].join(" ").toLowerCase().includes(normalized));
}

export function templateToInput(id: string, themeId?: string): GenerateDiagramInput | undefined {
  const found = templates.find((item) => item.id === id);
  if (!found) return undefined;
  return { prompt: found.prompt, type: found.type, themeId };
}

export function getTemplateScalePlan() {
  return {
    targetCapacity: 5000,
    taxonomy: ["industry", "diagram type", "cloud provider", "architecture pattern", "maturity level"],
    authoringFlow: ["draft", "architecture review", "brand review", "publish", "version"],
    marketplaceReady: true
  };
}

function template(id: string, title: string, type: DiagramType, industry: string, description: string, tags: string[]): ArchitectureTemplate {
  return {
    id,
    title,
    type,
    industry,
    description,
    tags,
    prompt: `Generate ${title}. Include professional icons, architecture layers, integrations, governance, data flows, implementation roadmap, and executive visual summary.`
  };
}
