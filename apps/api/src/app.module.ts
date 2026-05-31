import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AssetsController } from "./modules/assets.controller.js";
import { DiagramsController } from "./modules/diagrams.controller.js";
import { DocumentsController } from "./modules/documents.controller.js";
import { TemplatesController } from "./modules/templates.controller.js";
import { AiOrchestratorService } from "./services/ai-orchestrator.service.js";
import { InfrastructureService } from "./services/infrastructure.service.js";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [DiagramsController, DocumentsController, AssetsController, TemplatesController],
  providers: [AiOrchestratorService, InfrastructureService]
})
export class AppModule {}
