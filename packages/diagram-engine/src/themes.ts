import type { DiagramTheme } from "./types";

export const themes: DiagramTheme[] = [
  {
    id: "microsoft",
    name: "Microsoft",
    background: "#f8fbff",
    surface: "#ffffff",
    primary: "#2563eb",
    secondary: "#60a5fa",
    accent: "#7c3aed",
    text: "#111827",
    muted: "#64748b",
    grid: "#dbeafe"
  },
  {
    id: "aws",
    name: "AWS",
    background: "#111827",
    surface: "#1f2937",
    primary: "#ff9900",
    secondary: "#fbbf24",
    accent: "#38bdf8",
    text: "#f9fafb",
    muted: "#9ca3af",
    grid: "#374151"
  },
  {
    id: "azure",
    name: "Azure",
    background: "#f5fbff",
    surface: "#ffffff",
    primary: "#0078d4",
    secondary: "#50e6ff",
    accent: "#742774",
    text: "#1f2937",
    muted: "#64748b",
    grid: "#dbeafe"
  },
  {
    id: "google",
    name: "Google",
    background: "#ffffff",
    surface: "#f8fafc",
    primary: "#4285f4",
    secondary: "#34a853",
    accent: "#fbbc05",
    text: "#202124",
    muted: "#5f6368",
    grid: "#e8eaed"
  },
  {
    id: "snowflake",
    name: "Snowflake",
    background: "#eef9ff",
    surface: "#ffffff",
    primary: "#29b5e8",
    secondary: "#0f4c81",
    accent: "#7dd3fc",
    text: "#0f172a",
    muted: "#475569",
    grid: "#bae6fd"
  },
  {
    id: "databricks",
    name: "Databricks",
    background: "#fff7ed",
    surface: "#ffffff",
    primary: "#ff3621",
    secondary: "#f97316",
    accent: "#111827",
    text: "#111827",
    muted: "#64748b",
    grid: "#fed7aa"
  },
  {
    id: "enterprise-blue",
    name: "Enterprise Blue",
    background: "#eef4ff",
    surface: "#ffffff",
    primary: "#1d4ed8",
    secondary: "#0f766e",
    accent: "#4338ca",
    text: "#0f172a",
    muted: "#475569",
    grid: "#bfdbfe"
  },
  {
    id: "consulting-dark",
    name: "Consulting Dark",
    background: "#0f172a",
    surface: "#111827",
    primary: "#22d3ee",
    secondary: "#a78bfa",
    accent: "#f59e0b",
    text: "#f8fafc",
    muted: "#94a3b8",
    grid: "#1e293b"
  },
  {
    id: "modern-ai",
    name: "Modern AI",
    background: "#111827",
    surface: "#171923",
    primary: "#8b5cf6",
    secondary: "#06b6d4",
    accent: "#f472b6",
    text: "#f9fafb",
    muted: "#a1a1aa",
    grid: "#27272a"
  },
  {
    id: "executive-boardroom",
    name: "Executive Boardroom",
    background: "#fafaf9",
    surface: "#ffffff",
    primary: "#1c1917",
    secondary: "#78716c",
    accent: "#b45309",
    text: "#1c1917",
    muted: "#57534e",
    grid: "#e7e5e4"
  }
];

export function getTheme(themeId?: string): DiagramTheme {
  return themes.find((theme) => theme.id === themeId) ?? themes[6];
}
