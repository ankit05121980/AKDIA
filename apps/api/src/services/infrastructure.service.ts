import { Injectable, Logger } from "@nestjs/common";
import { Client as ElasticsearchClient } from "@elastic/elasticsearch";
import Redis from "ioredis";
import pg from "pg";

@Injectable()
export class InfrastructureService {
  private readonly logger = new Logger(InfrastructureService.name);
  readonly postgres?: pg.Pool;
  readonly redis?: Redis;
  readonly elasticsearch?: ElasticsearchClient;

  constructor() {
    if (process.env.DATABASE_URL) {
      this.postgres = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    }
    if (process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
    }
    if (process.env.ELASTICSEARCH_NODE) {
      this.elasticsearch = new ElasticsearchClient({ node: process.env.ELASTICSEARCH_NODE });
    }
  }

  health() {
    return {
      postgresConfigured: Boolean(this.postgres),
      redisConfigured: Boolean(this.redis),
      elasticsearchConfigured: Boolean(this.elasticsearch),
      aiProvider: process.env.AI_PROVIDER ?? "mock"
    };
  }

  logStartup() {
    this.logger.log(`Infrastructure configured: ${JSON.stringify(this.health())}`);
  }
}
