import { Body, Controller, Get, Header, Post } from "@nestjs/common";
import { themes } from "@akdia/diagram-engine";
import { ExportDiagramDto, GenerateDiagramDto } from "../dto.js";
import { AiOrchestratorService } from "../services/ai-orchestrator.service.js";

@Controller("diagrams")
export class DiagramsController {
  constructor(private readonly ai: AiOrchestratorService) {}

  @Get("themes")
  themes() {
    return themes;
  }

  @Post("generate")
  generate(@Body() body: GenerateDiagramDto) {
    return this.ai.generate(body);
  }

  @Post("review")
  review(@Body() body: GenerateDiagramDto) {
    return { findings: this.ai.review(body) };
  }

  @Post("optimize")
  optimize(@Body() body: GenerateDiagramDto) {
    return this.ai.optimize(body);
  }

  @Post("export")
  @Header("Content-Type", "application/json")
  export(@Body() body: ExportDiagramDto) {
    const bundle = this.ai.generate(body);
    const map = {
      mermaid: bundle.mermaid,
      plantuml: bundle.plantUml,
      drawio: bundle.drawioXml,
      svg: bundle.svg,
      png: bundle.pngDataUri,
      json: bundle.model,
      ppt: bundle.pptxModel
    };
    return { format: body.format, content: map[body.format] };
  }
}
