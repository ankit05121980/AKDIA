import { Injectable } from "@nestjs/common";
import { analyzeDocument, generateDiagramBundle, generateDiagramBundleWithAi, optimizeLayout, reviewArchitecture, type DiagramBundle, type GenerateDiagramInput } from "@akdia/diagram-engine";

@Injectable()
export class AiOrchestratorService {
  async generate(input: GenerateDiagramInput): Promise<DiagramBundle> {
    return generateDiagramBundleWithAi(input, {
      provider: process.env.AI_PROVIDER === "mock" ? "mock" : "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
      baseUrl: process.env.OPENAI_BASE_URL
    });
  }

  async analyzeDocument(text: string, title?: string) {
    const analysis = analyzeDocument(text, title);
    const bundle = await this.generate({ prompt: analysis.title, documentText: text, themeId: "enterprise-blue" });
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
