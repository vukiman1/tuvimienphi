import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunnelDaily1789200000000 implements MigrationInterface {
  name = 'CreateFunnelDaily1789200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "funnel_daily" (
        "day"                  date NOT NULL,
        "chart_casts"          integer NOT NULL DEFAULT 0,
        "chapter_unlocks"      integer NOT NULL DEFAULT 0,
        "paid_chapter_unlocks" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_funnel_daily_day" PRIMARY KEY ("day")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "funnel_daily"`);
  }
}
