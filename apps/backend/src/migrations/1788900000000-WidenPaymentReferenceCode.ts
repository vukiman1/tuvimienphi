import { MigrationInterface, QueryRunner } from 'typeorm';

export class WidenPaymentReferenceCode1788900000000 implements MigrationInterface {
  name = 'WidenPaymentReferenceCode1788900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "reference_code" TYPE text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "reference_code" TYPE character varying(64) USING left("reference_code", 64)`,
    );
  }
}
