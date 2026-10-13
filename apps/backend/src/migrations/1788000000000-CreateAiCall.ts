import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAiCall1788000000000 implements MigrationInterface {
  name = 'CreateAiCall1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ai_call" (
        "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at"    timestamptz NOT NULL DEFAULT now(),
        "day"           date NOT NULL,
        "provider"      varchar(20) NOT NULL,
        "model"         varchar(60) NOT NULL,
        "purpose"       varchar(12) NOT NULL,
        "status"        varchar(10) NOT NULL,
        "is_quota_hit"  boolean NOT NULL DEFAULT false,
        "input_tokens"  integer NOT NULL DEFAULT 0,
        "output_tokens" integer NOT NULL DEFAULT 0,
        "latency_ms"    integer NULL,
        "error"         varchar(300) NULL,
        "label"         varchar(60) NULL,
        "user_id"       uuid NULL REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_ai_call_drill_down"
        ON "ai_call" ("day", "provider", "model", "purpose", "created_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_ai_call_created_at"
        ON "ai_call" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ai_call"`);
  }
}
