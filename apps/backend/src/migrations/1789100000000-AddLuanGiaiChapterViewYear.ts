import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLuanGiaiChapterViewYear1789100000000 implements MigrationInterface {
  name = 'AddLuanGiaiChapterViewYear1789100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "luan_giai_chapter" ADD "view_year" smallint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "luan_giai_chapter" DROP CONSTRAINT "UQ_luan_giai_chapter_birth_key_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "luan_giai_chapter" ADD CONSTRAINT "UQ_luan_giai_chapter_birth_key_order_view_year" UNIQUE ("birth_key", "chapter_order", "view_year")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "luan_giai_chapter" WHERE "view_year" <> 0`);
    await queryRunner.query(
      `ALTER TABLE "luan_giai_chapter" DROP CONSTRAINT "UQ_luan_giai_chapter_birth_key_order_view_year"`,
    );
    await queryRunner.query(
      `ALTER TABLE "luan_giai_chapter" ADD CONSTRAINT "UQ_luan_giai_chapter_birth_key_order" UNIQUE ("birth_key", "chapter_order")`,
    );
    await queryRunner.query(`ALTER TABLE "luan_giai_chapter" DROP COLUMN "view_year"`);
  }
}
