import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChapterCredits1788400000000 implements MigrationInterface {
  name = 'AddChapterCredits1788400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "chapter_credits" integer NOT NULL DEFAULT 0,
      ADD CONSTRAINT "CHK_users_chapter_credits_non_negative" CHECK ("chapter_credits" >= 0)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT "CHK_users_chapter_credits_non_negative",
      DROP COLUMN "chapter_credits"
    `);
  }
}
