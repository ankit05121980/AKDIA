import { Injectable } from "@nestjs/common";
import { analyzeDocument, generateDiagramBundle, optimizeLayout, reviewArchitecture, type DiagramBundle, type GenerateDiagramInput } from "@akdia/diagram-engine";

@Injectable()
export class AiOrchestratorService {
  generate(input: GenerateDiagramInput): DiagramBundle {
    return generateDiagramBundle(input);
  }

  analyzeDocument(text: string, title?: string) {
    const analysis = analyzeDocument(text, title);
    const bundle = generateDiagramBundle({ prompt: analysis.title, documentText: text, themeId: "enterprise-blue" });
    return {
      analysis,
      generated: {
        executiveSummary: analysis.executiveSummary,
        architectureDiagram: bundle,
        businessFlowDiagram: generateDiagramBundle({ prompt: `${analysis.title} business flow`, type: "business-process", documentText: text }),
        systemFlowDiagram: generateDiagramBundle({ prompt: `${analysis.title} system flow`, type: "system-architecture", documentText: text }),
        dataFlowDiagram: generateDiagramBundle({ prompt: `${analysis.title} data flow`, type: "data-flow", documentText: text }),
        integrationDiagram: generateDiagramBundle({ prompt: `${analysis.title} integration architecture`, type: "solution-architecture", documentText: text }),
        capabilityMap: generateDiagramBundle({ prompt: `${analysis.title} capability map`, type: "capability-map", documentText: text }),
        implementationRoadmap: analysis.roadmap,
        infographicSummary: bundle.infographic
      }
    };
  }

  review(input: GenerateDiagramInput) {
    return reviewArchitecture(input);
  }

  optimize(input: GenerateDiagramInput) {
    return optimizeLayout(input);
  }
}
