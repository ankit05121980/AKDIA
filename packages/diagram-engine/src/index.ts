export * from "./types";
export * from "./themes";
export * from "./analyzer";
export * from "./model-builder";
export * from "./generators";
export * from "./ai-generator";

import { buildDiagramModel } from "./model-builder";
import { bundle } from "./generators";
import type { DiagramBundle, GenerateDiagramInput } from "./types";

export function generateDiagramBundle(input: GenerateDiagramInput): DiagramBundle {
  return bundle(buildDiagramModel(input));
}

export function reviewArchitecture(input: GenerateDiagramInput): string[] {
  const { model } = generateDiagramBundle(input);
  const checks = [
    model.nodes.some((node) => node.kind === "security") ? "Security controls are visible in the architecture." : "Add explicit identity, policy, and compliance controls.",
    model.edges.length >= model.nodes.length - 1 ? "Primary integration paths are connected." : "Some components are isolated; validate missing dependencies.",
    model.nodes.some((node) => node.kind === "data store") ? "Data persistence is represented." : "Add data stores, lineage, and retention policies.",
    "Confirm resilience, observability, deployment topology, and ownership metadata before sign-off."
  ];
  return checks;
}

export function optimizeLayout(input: GenerateDiagramInput): DiagramBundle {
  const model = buildDiagramModel(input);
  const nodes = model.nodes.map((node, index) => ({
    ...node,
    x: 90 + (index % 3) * 380,
    y: 180 + Math.floor(index / 3) * 150
  }));
  return bundle({ ...model, nodes });
}
