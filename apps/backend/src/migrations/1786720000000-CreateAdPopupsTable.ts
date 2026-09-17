import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdPopupsTable1786720000000 implements MigrationInterface {
  name = 'CreateAdPopupsTable1786720000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ad_popups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying(255) NOT NULL,
        "trigger" character varying(30) NOT NULL,
        "image" character varying(500) NOT NULL,
        "target" character varying(500) NOT NULL,
        "impressions" integer NOT NULL DEFAULT 0,
        "clicks" integer NOT NULL DEFAULT 0,
        "active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_ad_popups_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ad_popups"`);
  }
}
