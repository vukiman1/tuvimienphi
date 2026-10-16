import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGiftCode1788800000000 implements MigrationInterface {
  name = 'CreateGiftCode1788800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "gift_code" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(32) NOT NULL,
        "credits" integer NOT NULL,
        "max_redemptions" integer NOT NULL,
        "redeemed_count" integer NOT NULL DEFAULT 0,
        "expires_at" TIMESTAMP WITH TIME ZONE NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_by_email" character varying(255) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gift_code_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_gift_code_code" UNIQUE ("code"),
        CONSTRAINT "CHK_gift_code_credits_positive" CHECK ("credits" > 0),
        CONSTRAINT "CHK_gift_code_max_redemptions_positive" CHECK ("max_redemptions" > 0)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "gift_code_redemption" (
        "gift_code_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "redeemed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gift_code_redemption" PRIMARY KEY ("gift_code_id", "user_id"),
        CONSTRAINT "FK_gift_code_redemption_gift_code_id" FOREIGN KEY ("gift_code_id")
          REFERENCES "gift_code"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_gift_code_redemption_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "gift_code_redemption"`);
    await queryRunner.query(`DROP TABLE "gift_code"`);
  }
}
