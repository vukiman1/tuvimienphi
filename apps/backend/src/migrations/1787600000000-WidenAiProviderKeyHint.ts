import { MigrationInterface, QueryRunner } from 'typeorm';

export class WidenAiProviderKeyHint1787600000000 implements MigrationInterface {
  name = 'WidenAiProviderKeyHint1787600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ai_provider" ALTER COLUMN "api_key_hint" TYPE varchar(16)`,
    );
    await queryRunner.query(`
      UPDATE "ai_provider"
         SET "api_key_hint" = '…' || "api_key_hint"
       WHERE "api_key_hint" IS NOT NULL
         AND position('…' in "api_key_hint") = 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "ai_provider"
         SET "api_key_hint" = right("api_key_hint", 4)
       WHERE "api_key_hint" IS NOT NULL
    `);
    await queryRunner.query(
      `ALTER TABLE "ai_provider" ALTER COLUMN "api_key_hint" TYPE varchar(8)`,
    );
  }
}
