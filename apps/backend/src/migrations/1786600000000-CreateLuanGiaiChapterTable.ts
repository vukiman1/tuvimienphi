import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLuanGiaiChapterTable1786600000000 implements MigrationInterface {
  name = 'CreateLuanGiaiChapterTable1786600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "luan_giai_chapter" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "birth_key" character varying(40) NOT NULL,
        "chapter_order" character varying(2) NOT NULL,
        "article" jsonb NOT NULL,
        "model" character varying(60) NOT NULL,
        "attempts" smallint NOT NULL,
        CONSTRAINT "PK_luan_giai_chapter_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_luan_giai_chapter_birth_key_order" UNIQUE ("birth_key", "chapter_order")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "luan_giai_chapter"`);
  }
}
