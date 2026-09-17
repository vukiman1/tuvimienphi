import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVanHanEntriesTable1786730000000 implements MigrationInterface {
  name = 'CreateVanHanEntriesTable1786730000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "van_han_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "year" integer NOT NULL,
        "age" integer NOT NULL,
        "star" character varying(100) NOT NULL,
        "rating" character varying(10) NOT NULL,
        "summary" text NOT NULL,
        "published" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_van_han_entries_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "van_han_entries"`);
  }
}
