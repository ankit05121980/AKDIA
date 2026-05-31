import { describe, expect, it } from "vitest";
import { analyzeDocument, generateDiagramBundle, generateDiagramBundleWithAi, optimizeLayout, reviewArchitecture } from "./index";

describe("diagram engine", () => {
  it("generates all required editable formats from a prompt", () => {
    const bundle = generateDiagramBundle({ prompt: "Generate a Banking AI RAG Architecture with Snowflake and OpenAI", themeId: "modern-ai" });

    expect(bundle.model.nodes.length).toBeGreaterThan(5);
    expect(bundle.mermaid).toContain("flowchart LR");
    expect(bundle.plantUml).toContain("@startuml");
    expect(bundle.drawioXml).toContain("<mxfile");
    expect(bundle.svg).toContain("<svg");
    expect(bundle.pngDataUri).toContain("data:image/svg+xml;base64,");
    expect(bundle.pptxModel.slides.length).toBeGreaterThan(1);
    expect(bundle.infographic.sections).toHaveLength(3);
  });

  it("extracts document analysis and generates review findings", () => {
    const documentText = "The claims portal integrates with an API gateway, Kafka, Snowflake, IAM, and an OpenAI agent. Users submit a claim, reviewers approve it, and analytics teams review data quality.";
    const analysis = analyzeDocument(documentText);
    const review = reviewArchitecture({ prompt: "Create architecture", documentText });

    expect(analysis.systems.join(" ")).toMatch(/Api|Kafka|Snowflake|Iam|Agent/i);
    expect(review.length).toBeGreaterThan(2);
  });

  it("returns optimized layout bundle", () => {
    const optimized = optimizeLayout({ prompt: "Create a zero trust security architecture" });
    expect(optimized.model.nodes[1].x).toBeGreaterThan(optimized.model.nodes[0].x);
  });

  it("varies local fallback components by prompt domain", () => {
    const insurance = generateDiagramBundle({ prompt: "Create an insurance claims processing architecture" });
    const retail = generateDiagramBundle({ prompt: "Create a retail order fulfillment architecture" });

    expect(insurance.model.nodes.map((node) => node.label)).toContain("Claims Portal");
    expect(retail.model.nodes.map((node) => node.label)).toContain("Order Management");
    expect(insurance.mermaid).not.toEqual(retail.mermaid);
  });

  it("uses the AI bundle entrypoint with mock fallback when no OpenAI key is configured", async () => {
    const result = await generateDiagramBundleWithAi(
      { prompt: "Generate a healthcare patient data platform", themeId: "azure" },
      { provider: "mock" }
    );

    expect(result.model.nodes.map((node) => node.label)).toContain("Patient Portal");
    expect(result.plantUml).toContain("@startuml");
  });
});
