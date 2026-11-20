import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLearningProgress1789300000000 implements MigrationInterface {
  name = 'CreateLearningProgress1789300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "learning_progress" (
        "user_id"     uuid NOT NULL,
        "lesson_slug" character varying(80) NOT NULL,
        "read_at"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_learning_progress" PRIMARY KEY ("user_id", "lesson_slug")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "learning_progress"
      ADD CONSTRAINT "FK_learning_progress_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "learning_progress" DROP CONSTRAINT "FK_learning_progress_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "learning_progress"`);
  }
}
