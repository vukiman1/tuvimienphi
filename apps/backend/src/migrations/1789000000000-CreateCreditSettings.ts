import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCreditSettings1789000000000 implements MigrationInterface {
  name = 'CreateCreditSettings1789000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "credit_settings" (
        "id"                  smallint NOT NULL DEFAULT 1,
        "daily_chapter_quota" integer NOT NULL,
        "updated_at"          timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_credit_settings_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_credit_settings_single_row" CHECK ("id" = 1),
        CONSTRAINT "CHK_credit_settings_daily_chapter_quota_non_negative" CHECK ("daily_chapter_quota" >= 0)
      )
    `);
    await queryRunner.query(
      `INSERT INTO "credit_settings" ("id", "daily_chapter_quota") VALUES (1, 3)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "credit_settings"`);
  }
}
