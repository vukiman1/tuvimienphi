import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivityLog1787000000000 implements MigrationInterface {
  name = 'CreateActivityLog1787000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "activity_log" (
        "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "occurred_at" timestamptz  NOT NULL DEFAULT now(),
        "event"       varchar(64)  NOT NULL,
        "user_id"     uuid NULL REFERENCES "users"("id") ON DELETE SET NULL,
        "actor_email" varchar(255) NULL,
        "ip_address"  varchar(255) NULL,
        "user_agent"  text NULL,
        "metadata"    jsonb NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_activity_log_occurred_at"
        ON "activity_log" ("occurred_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_activity_log_user_occurred_at"
        ON "activity_log" ("user_id", "occurred_at" DESC)
    `);
    await queryRunner.query(`
      INSERT INTO "activity_log" ("occurred_at", "event", "user_id", "actor_email", "metadata")
      SELECT
        "history"."viewed_at",
        'la-so.viewed',
        "history"."user_id",
        "users"."email",
        jsonb_build_object(
          'fullName', "history"."full_name",
          'day',      "history"."day",
          'month',    "history"."month",
          'year',     "history"."year"
        )
      FROM "la_so_history" AS "history"
      LEFT JOIN "users" ON "users"."id" = "history"."user_id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "activity_log"`);
  }
}
