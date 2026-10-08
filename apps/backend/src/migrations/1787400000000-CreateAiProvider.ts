import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAiProvider1787400000000 implements MigrationInterface {
  name = 'CreateAiProvider1787400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ai_provider" (
        "provider"          varchar(20) PRIMARY KEY,
        "api_key"           text NULL,
        "api_key_hint"      varchar(8) NULL,
        "models"            jsonb NOT NULL DEFAULT '[]',
        "is_active"         boolean NOT NULL DEFAULT false,
        "health_status"     varchar(10) NULL,
        "health_checked_at" timestamptz NULL,
        "health_latency_ms" integer NULL,
        "health_model"      varchar(60) NULL,
        "health_error"      text NULL,
        "updated_at"        timestamptz NULL
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_ai_provider_single_active"
        ON "ai_provider" ("is_active")
        WHERE "is_active"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ai_provider"`);
  }
}
