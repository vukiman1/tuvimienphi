import { MigrationInterface, QueryRunner } from 'typeorm';

function bootstrapEmails(): string[] {
  return (process.env.ADMIN_BOOTSTRAP_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export class SeedBootstrapAdmin1786800000000 implements MigrationInterface {
  name = 'SeedBootstrapAdmin1786800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const emails = bootstrapEmails();
    if (emails.length === 0) {
      throw new Error(
        'ADMIN_BOOTSTRAP_EMAILS is empty, so this migration would leave the console with no way in. ' +
          'Set it to the Google address that should own the console, then run the migration again.',
      );
    }

    await queryRunner.query(
      `
      INSERT INTO "users" ("email", "is_email_verified", "role")
      SELECT "email", true, 'SUPER_ADMIN' FROM unnest($1::text[]) AS "email"
      ON CONFLICT ("email") DO UPDATE
        SET "role" = 'SUPER_ADMIN', "updated_at" = now()
        WHERE "users"."role"::text NOT IN ('SUPER_ADMIN', 'ADMIN')
      `,
      [emails],
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
