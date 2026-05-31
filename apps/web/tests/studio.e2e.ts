import { expect, test } from "@playwright/test";

const formatTabs = [
  { id: "mermaid", text: "flowchart LR" },
  { id: "plantUml", text: "@startuml" },
  { id: "drawioXml", text: "<mxfile" },
  { id: "svg", text: "Banking AI Reference Architecture" },
  { id: "pngDataUri", text: "" },
  { id: "json", text: "\"nodes\"" },
  { id: "pptxModel", text: "\"slides\"" }
];

test.describe("AKDIA studio", () => {
  test("generates diagrams and switches every format tab", async ({ page }) => {
    await page.goto("/studio");
    await expect(page.getByTestId("diagram-title")).toContainText(/Banking AI Reference Architecture/i);

    await page.getByTestId("prompt-input").fill("Generate an AWS Landing Zone with IAM, VPC, EKS, S3, CloudWatch, and CI/CD");
    await page.getByTestId("generate-button").click();
    await expect(page.getByTestId("status-message")).toContainText(/Generated \d+ editable objects/);
    await expect(page.getByTestId("diagram-title")).toContainText(/AWS Landing Zone/i);
    await expect(page.getByTestId("diagram-canvas").locator(".react-flow__node")).toHaveCount(9);

    for (const tab of formatTabs) {
      await page.getByTestId(`format-tab-${tab.id}`).click();
      await expect(page.getByTestId(`format-tab-${tab.id}`)).toHaveAttribute("aria-selected", "true");
      await expect(page.getByTestId("format-preview")).toBeVisible();
      if (tab.text) {
        await expect(page.getByTestId("format-preview")).toContainText(tab.text);
      } else {
        await expect(page.getByTestId("format-preview").locator("img")).toBeVisible();
      }
    }
  });

  test("creates a document-derived diagram pack", async ({ page }) => {
    await page.goto("/studio");
    await page.getByTestId("document-input").fill("A claims intake portal integrates with API Gateway, Kafka, Snowflake, IAM, and OpenAI. Users submit claims, reviewers approve exceptions, and operations monitors outcomes.");
    await page.getByTestId("document-generate-button").click();

    await expect(page.getByTestId("status-message")).toContainText(/Generated \d+ editable objects/);
    await expect(page.getByTestId("format-preview")).toContainText("flowchart LR");
    await expect(page.getByTestId("ai-recommendations").locator("li")).toHaveCount(6);
  });

  test("template, asset library, and export controls respond", async ({ page }) => {
    await page.goto("/studio");
    await expect(page.getByTestId("asset-library").locator("svg").first()).toBeVisible();

    await page.getByTestId("template-rag-enterprise-copilot").click();
    await expect(page.getByTestId("diagram-title")).toContainText(/Enterprise RAG Copilot/i);

    await page.getByTestId("format-tab-json").click();
    const download = page.waitForEvent("download");
    await page.getByTestId("export-button").click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/enterprise-rag-copilot.*\.json$/);
  });
});
