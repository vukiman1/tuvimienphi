import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiUsageTracking1787800000000 implements MigrationInterface {
  name = 'AddAiUsageTracking1787800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ai_usage_daily" (
        "day"           date NOT NULL,
        "provider"      varchar(20) NOT NULL,
        "model"         varchar(60) NOT NULL,
        "purpose"       varchar(12) NOT NULL,
        "calls"         integer NOT NULL DEFAULT 0,
        "failed_calls"  integer NOT NULL DEFAULT 0,
        "quota_hits"    integer NOT NULL DEFAULT 0,
        "input_tokens"  bigint NOT NULL DEFAULT 0,
        "output_tokens" bigint NOT NULL DEFAULT 0,
        CONSTRAINT "PK_ai_usage_daily" PRIMARY KEY ("day", "provider", "model", "purpose")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "ai_provider" ADD COLUMN "monthly_budget_usd" numeric(10, 2) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ai_provider" DROP COLUMN "monthly_budget_usd"`);
    await queryRunner.query(`DROP TABLE "ai_usage_daily"`);
  }
}
