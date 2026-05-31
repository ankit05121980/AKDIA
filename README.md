# AKDIA Enterprise AI Diagram & Architecture Studio

AKDIA is a working monorepo scaffold for an enterprise-grade AI diagramming studio that combines conversational diagram generation, document-to-diagram extraction, editable architecture canvases, and multi-format export.

## What is included

- **Next.js + TypeScript + Tailwind web studio** with prompt-to-diagram chat, upload panel, multi-format preview, React Flow editable canvas, asset palette, template gallery, and export controls.
- **NestJS API** with diagram generation, document analysis, asset search, template listing, review, optimization, and export endpoints.
- **Shared diagram engine** that creates a normalized editable JSON model and emits Mermaid, PlantUML, Draw.io XML, SVG, PNG data URI, PPT slide model, and executive summaries from prompts or uploaded document text.
- **Asset library package** with vendor/logo/icon metadata, theme tokens, search helpers, and ingestion guidance for scaling to large enterprise asset catalogs.
- **Template package** with reference architectures and diagram templates across cloud, data, AI, security, BPMN, UML, and operating-model use cases.
- **Infrastructure compose file** for PostgreSQL, Redis, and Elasticsearch.

The default AI provider is deterministic and local (`AI_PROVIDER=mock`) so the app works without external API keys. The NestJS agent interfaces are ready for OpenAI, Anthropic, or private model adapters.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the studio. To run the API separately:

```bash
npm run dev:api
```

Optional infrastructure:

```bash
docker compose up -d postgres redis elasticsearch
```

## Core workflows

1. **Prompt-to-diagram**: Enter a prompt such as "Generate a Banking AI Reference Architecture" and receive Mermaid, PlantUML, Draw.io XML, SVG, PNG, PPT model, and JSON outputs.
2. **Document-to-diagram**: Upload architecture documents, BRDs, FRDs, SOWs, RFPs, markdown, spreadsheets, and images. The mock analyzer extracts entities, systems, integrations, workflows, risks, and roadmap items.
3. **Editable canvas**: Generated JSON models map to React Flow nodes/edges and remain editable in the browser.
4. **Asset palette**: Search technology, cloud, database, security, AI, and networking icons/logos.
5. **Template gallery**: Start from prebuilt architecture patterns and reference diagrams.

## Repository layout

```text
apps/web                 Next.js studio
apps/api                 NestJS API and AI agent orchestration
packages/diagram-engine  Multi-format diagram generation
packages/asset-library   Asset metadata, search, themes
packages/templates       Reference architecture templates
```

## Scripts

- `npm run dev` - start the web studio
- `npm run dev:api` - start the NestJS API
- `npm run build` - build all workspaces
- `npm run typecheck` - TypeScript checks
- `npm run test` - unit tests

## Notes on enterprise asset scale

This repository ships with a curated seed catalog and an ingestion-ready registry. A production deployment can sync licensed SVG/PNG/vector packs from vendor design systems, cloud provider icon sets, internal brand portals, and commercial icon libraries into object storage while indexing metadata in Elasticsearch.
