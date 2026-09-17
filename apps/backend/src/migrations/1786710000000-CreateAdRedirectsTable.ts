import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdRedirectsTable1786710000000 implements MigrationInterface {
  name = 'CreateAdRedirectsTable1786710000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ad_redirects" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "label" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "target" character varying(500) NOT NULL,
        "clicks" integer NOT NULL DEFAULT 0,
        "active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_ad_redirects_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ad_redirects"`);
  }
}
