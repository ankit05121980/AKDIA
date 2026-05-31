import { Controller, Get, Param, Query } from "@nestjs/common";
import { getTemplateScalePlan, listTemplates, templateToInput } from "@akdia/templates";
import { AiOrchestratorService } from "../services/ai-orchestrator.service.js";

@Controller("templates")
export class TemplatesController {
  constructor(private readonly ai: AiOrchestratorService) {}

  @Get()
  list(@Query("q") q = "") {
    return listTemplates(q);
  }

  @Get("scale-plan")
  scalePlan() {
    return getTemplateScalePlan();
  }

  @Get(":id/generate")
  generate(@Param("id") id: string, @Query("themeId") themeId?: string) {
    const input = templateToInput(id, themeId);
    return input ? this.ai.generate(input) : { error: "Template not found" };
  }
}
