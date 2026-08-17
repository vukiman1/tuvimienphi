import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVanHanTable1786200000000 implements MigrationInterface {
  name = 'CreateVanHanTable1786200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "van_han" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "zodiac" character varying(20) NOT NULL,
        "zodiac_order" integer NOT NULL,
        "year" integer NOT NULL,
        "title" character varying(255) NOT NULL,
        "born_years" jsonb NOT NULL DEFAULT '[]',
        "luu_nien" text NOT NULL,
        "luan_giai" jsonb NOT NULL DEFAULT '[]',
        "tung_tuoi" jsonb NOT NULL DEFAULT '[]',
        "source_url" character varying(500) NOT NULL,
        CONSTRAINT "PK_van_han_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_van_han_order_year" UNIQUE ("zodiac_order", "year")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "van_han"`);
  }
}
