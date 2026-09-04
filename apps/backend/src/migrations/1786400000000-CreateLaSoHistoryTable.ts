import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLaSoHistoryTable1786400000000 implements MigrationInterface {
  name = 'CreateLaSoHistoryTable1786400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "la_so_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "user_id" uuid NOT NULL,
        "birth_key" character varying(40) NOT NULL,
        "full_name" character varying(60),
        "day" smallint NOT NULL,
        "month" smallint NOT NULL,
        "year" smallint NOT NULL,
        "calendar" character varying(10) NOT NULL,
        "hour_index" smallint NOT NULL,
        "gender" character varying(5) NOT NULL,
        "viewed_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_la_so_history_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_la_so_history_user_birth_key" UNIQUE ("user_id", "birth_key"),
        CONSTRAINT "FK_la_so_history_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_la_so_history_user_viewed_at"
        ON "la_so_history" ("user_id", "viewed_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_la_so_history_user_viewed_at"`);
    await queryRunner.query(`DROP TABLE "la_so_history"`);
  }
}
