import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentCode1788600000000 implements MigrationInterface {
  name = 'AddPaymentCode1788600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "payment_code" char(8) NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_payment_code" UNIQUE ("payment_code")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_payment_code"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "payment_code"`);
  }
}
