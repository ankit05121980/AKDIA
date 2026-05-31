import { IsIn, IsOptional, IsString } from "class-validator";
import type { DiagramType } from "@akdia/diagram-engine";

export class GenerateDiagramDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  type?: DiagramType;

  @IsOptional()
  @IsString()
  themeId?: string;

  @IsOptional()
  @IsString()
  documentText?: string;
}

export class ExportDiagramDto extends GenerateDiagramDto {
  @IsIn(["mermaid", "plantuml", "drawio", "svg", "png", "json", "ppt"])
  format!: "mermaid" | "plantuml" | "drawio" | "svg" | "png" | "json" | "ppt";
}
