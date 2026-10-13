import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVanHanPublishedYear1787200000000 implements MigrationInterface {
  name = 'CreateVanHanPublishedYear1787200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "van_han_published_year" (
        "year"         integer PRIMARY KEY,
        "published_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      INSERT INTO "van_han_published_year" ("year")
      SELECT DISTINCT "year"
      FROM "van_han"
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "van_han_published_year"`);
  }
}
