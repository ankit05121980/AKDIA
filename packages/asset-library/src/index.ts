export type AssetCategory = "cloud" | "database" | "ai" | "security" | "network" | "devops" | "language" | "business" | "vendor";

export interface VisualAsset {
  id: string;
  name: string;
  vendor: string;
  category: AssetCategory;
  tags: string[];
  formats: Array<"svg" | "png" | "vector">;
  editable: boolean;
  license: "vendor" | "open" | "enterprise";
  sourceUrl?: string;
  svg: string;
}

const cloudSvg = (label: string, color: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="22" fill="${color}"/><text x="48" y="55" text-anchor="middle" font-size="18" font-family="Arial" font-weight="700" fill="white">${label}</text></svg>`;

export const seedAssets: VisualAsset[] = [
  asset("aws", "AWS", "Amazon", "cloud", ["amazon", "cloud", "ec2", "lambda", "landing zone"], "#ff9900"),
  asset("azure", "Azure", "Microsoft", "cloud", ["microsoft", "cloud", "aks", "entra"], "#0078d4"),
  asset("gcp", "GCP", "Google", "cloud", ["google", "cloud", "bigquery", "gke"], "#4285f4"),
  asset("snowflake", "Snowflake", "Snowflake", "database", ["warehouse", "data", "analytics"], "#29b5e8"),
  asset("databricks", "Databricks", "Databricks", "database", ["lakehouse", "spark", "ml"], "#ff3621"),
  asset("openai", "OpenAI", "OpenAI", "ai", ["llm", "gpt", "agent"], "#111827"),
  asset("anthropic", "Anthropic", "Anthropic", "ai", ["claude", "llm", "agent"], "#5b4636"),
  asset("gemini", "Gemini", "Google", "ai", ["llm", "model", "ai"], "#7c3aed"),
  asset("oracle", "Oracle", "Oracle", "vendor", ["database", "erp"], "#f80000"),
  asset("sap", "SAP", "SAP", "vendor", ["erp", "business"], "#0a6ed1"),
  asset("salesforce", "Salesforce", "Salesforce", "vendor", ["crm", "sales"], "#00a1e0"),
  asset("servicenow", "ServiceNow", "ServiceNow", "vendor", ["itsm", "workflow"], "#81b5a1"),
  asset("mongodb", "MongoDB", "MongoDB", "database", ["document", "nosql"], "#47a248"),
  asset("postgresql", "PostgreSQL", "PostgreSQL", "database", ["relational", "sql"], "#336791"),
  asset("mysql", "MySQL", "Oracle", "database", ["relational", "sql"], "#4479a1"),
  asset("redis", "Redis", "Redis", "database", ["cache", "in-memory"], "#dc382d"),
  asset("kafka", "Kafka", "Apache", "devops", ["streaming", "events"], "#231f20"),
  asset("kubernetes", "Kubernetes", "CNCF", "devops", ["container", "orchestration"], "#326ce5"),
  asset("docker", "Docker", "Docker", "devops", ["container", "image"], "#2496ed"),
  asset("terraform", "Terraform", "HashiCorp", "devops", ["iac", "cloud"], "#844fba"),
  asset("github", "GitHub", "GitHub", "devops", ["source", "repository", "actions"], "#181717"),
  asset("gitlab", "GitLab", "GitLab", "devops", ["source", "ci"], "#fc6d26"),
  asset("jenkins", "Jenkins", "Jenkins", "devops", ["ci", "automation"], "#d24939"),
  asset("jira", "Jira", "Atlassian", "business", ["agile", "work"], "#0052cc"),
  asset("confluence", "Confluence", "Atlassian", "business", ["docs", "knowledge"], "#172b4d"),
  asset("cisco", "Cisco", "Cisco", "network", ["network", "router"], "#1ba0d7"),
  asset("fortinet", "Fortinet", "Fortinet", "security", ["firewall", "security"], "#ee3124"),
  asset("paloalto", "Palo Alto", "Palo Alto Networks", "security", ["firewall", "zero trust"], "#fa582d")
];

export function searchAssets(query: string, category?: AssetCategory): VisualAsset[] {
  const normalized = query.toLowerCase();
  return seedAssets.filter((candidate) => {
    const haystack = [candidate.name, candidate.vendor, candidate.category, ...candidate.tags].join(" ").toLowerCase();
    return (!category || candidate.category === category) && (!normalized || haystack.includes(normalized));
  });
}

export function getAsset(id: string): VisualAsset | undefined {
  return seedAssets.find((assetItem) => assetItem.id === id);
}

export function getEnterpriseAssetPlan() {
  return {
    targetCapacity: 100000,
    storage: "Object storage for SVG/PNG/vector originals plus CDN renditions",
    index: "Elasticsearch metadata index with tags, vendor, category, license, and semantic aliases",
    ingestionSources: ["Vendor icon packs", "Cloud provider architecture centers", "Internal brand portals", "Commercial vector libraries", "Design system repositories"],
    governance: ["License validation", "Brand usage constraints", "Versioned asset lineage", "Approval workflow"]
  };
}

function asset(id: string, name: string, vendor: string, category: AssetCategory, tags: string[], color: string): VisualAsset {
  return {
    id,
    name,
    vendor,
    category,
    tags,
    formats: ["svg", "png", "vector"],
    editable: true,
    license: "vendor",
    svg: cloudSvg(name.length > 9 ? name.slice(0, 3).toUpperCase() : name, color)
  };
}
