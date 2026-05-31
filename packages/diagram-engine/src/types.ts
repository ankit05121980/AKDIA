export type DiagramType =
  | "business-process"
  | "bpmn"
  | "dfd"
  | "system-architecture"
  | "solution-architecture"
  | "enterprise-architecture"
  | "application-architecture"
  | "microservices-architecture"
  | "cloud-architecture"
  | "aws-architecture"
  | "azure-architecture"
  | "gcp-architecture"
  | "ai-architecture"
  | "agent-architecture"
  | "rag-architecture"
  | "graphrag-architecture"
  | "data-architecture"
  | "etl-architecture"
  | "data-lineage"
  | "data-flow"
  | "network-topology"
  | "security-architecture"
  | "zero-trust-architecture"
  | "identity-architecture"
  | "devops-architecture"
  | "cicd-architecture"
  | "operating-model"
  | "capability-map"
  | "org-structure"
  | "journey-map"
  | "mind-map"
  | "value-stream-map"
  | "uml"
  | "erd"
  | "class-diagram"
  | "sequence-diagram"
  | "deployment-diagram"
  | "component-diagram";

export type DiagramFormat = "mermaid" | "plantuml" | "drawio" | "svg" | "png" | "json" | "ppt";

export interface DiagramNode {
  id: string;
  label: string;
  kind: string;
  group?: string;
  icon?: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  metadata?: Record<string, unknown>;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  kind: "sync" | "async" | "data" | "control" | "trust" | "deployment";
  metadata?: Record<string, unknown>;
}

export interface DiagramGroup {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramTheme {
  id: string;
  name: string;
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
  grid: string;
}

export interface DiagramModel {
  id: string;
  title: string;
  type: DiagramType;
  summary: string;
  theme: DiagramTheme;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: DiagramGroup[];
  decisions: string[];
  recommendations: string[];
  assumptions: string[];
  createdAt: string;
}

export interface DocumentAnalysis {
  title: string;
  executiveSummary: string;
  entities: string[];
  systems: string[];
  integrations: string[];
  workflows: string[];
  architectureComponents: string[];
  risks: string[];
  roadmap: string[];
}

export interface DiagramBundle {
  model: DiagramModel;
  mermaid: string;
  plantUml: string;
  drawioXml: string;
  svg: string;
  pngDataUri: string;
  pptxModel: PptDeckModel;
  executiveSummary: string;
  infographic: InfographicModel;
}

export interface PptDeckModel {
  title: string;
  slides: Array<{
    title: string;
    speakerNotes: string;
    shapes: Array<{
      type: "rect" | "line" | "text";
      text?: string;
      x: number;
      y: number;
      w: number;
      h: number;
      color?: string;
    }>;
  }>;
}

export interface InfographicModel {
  title: string;
  style: "mckinsey" | "deloitte" | "accenture" | "kpmg" | "ey" | "pwc" | "gartner" | "forrester";
  sections: Array<{ heading: string; metric: string; narrative: string }>;
}

export interface GenerateDiagramInput {
  prompt: string;
  type?: DiagramType;
  themeId?: string;
  documentText?: string;
}

export interface AiProviderOptions {
  provider?: "mock" | "openai";
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
}
