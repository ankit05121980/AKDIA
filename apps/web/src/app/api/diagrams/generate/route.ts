import { NextResponse } from "next/server";
import { generateDiagramBundleWithAi, type DiagramType } from "@akdia/diagram-engine";

interface GenerateRequestBody {
  prompt?: string;
  type?: DiagramType;
  themeId?: string;
  documentText?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    return NextResponse.json(await generateDiagramBundleWithAi(
      {
        prompt,
        type: body.type,
        themeId: body.themeId,
        documentText: body.documentText
      },
      {
        provider: process.env.AI_PROVIDER === "mock" ? "mock" : "openai",
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL,
        baseUrl: process.env.OPENAI_BASE_URL
      }
    ));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate diagram";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
