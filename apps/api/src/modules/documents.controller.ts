import { Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import { AiOrchestratorService } from "../services/ai-orchestrator.service.js";

@Controller("documents")
export class DocumentsController {
  constructor(private readonly ai: AiOrchestratorService) {}

  @Post("analyze")
  analyzeText(@Body() body: { text: string; title?: string }) {
    return this.ai.analyzeDocument(body.text, body.title);
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  upload(@UploadedFile() file: Express.Multer.File) {
    const extractedText = file.buffer.toString("utf8");
    return this.ai.analyzeDocument(extractedText || file.originalname, file.originalname);
  }
}
