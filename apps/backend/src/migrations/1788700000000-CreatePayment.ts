import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayment1788700000000 implements MigrationInterface {
  name = 'CreatePayment1788700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "payment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sepay_transaction_id" bigint NOT NULL,
        "user_id" uuid NULL,
        "amount_vnd" integer NOT NULL,
        "content" text NOT NULL,
        "reference_code" character varying(64) NOT NULL,
        "status" character varying(12) NOT NULL,
        "credits_granted" integer NOT NULL DEFAULT 0,
        "unmatched_reason" character varying(16) NULL,
        "transaction_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payment_sepay_transaction_id" UNIQUE ("sepay_transaction_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_payment_user_id" ON "payment" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_payment_user_id"`);
    await queryRunner.query(`DROP TABLE "payment"`);
  }
}
