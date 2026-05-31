import type { DiagramModel } from "@akdia/diagram-engine";
import type { Edge, Node } from "@xyflow/react";

export function toFlow(model: DiagramModel): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: model.nodes.map((node) => ({
      id: node.id,
      position: { x: node.x, y: node.y },
      data: { label: node.label, description: node.description, kind: node.kind, icon: node.icon },
      style: {
        width: node.width,
        height: node.height,
        borderRadius: 18,
        border: `2px solid ${model.theme.primary}`,
        background: node.color,
        color: model.theme.text,
        boxShadow: "0 16px 35px rgba(15,23,42,0.15)",
        fontWeight: 700
      }
    })),
    edges: model.edges.map((edge) => ({
      id: edge.id,
      source: edge.from,
      target: edge.to,
      label: edge.label,
      animated: edge.kind === "async" || edge.kind === "data",
      style: { stroke: model.theme.accent, strokeWidth: 2.5 }
    }))
  };
}
