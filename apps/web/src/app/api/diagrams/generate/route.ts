import { NextResponse } from "next/server";
import { generateDiagramBundle, type DiagramType } from "@akdia/diagram-engine";

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

    return NextResponse.json(generateDiagramBundle({
      prompt,
      type: body.type,
      themeId: body.themeId,
      documentText: body.documentText
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate diagram";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
