import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlogPostsTable1786700000000 implements MigrationInterface {
  name = 'CreateBlogPostsTable1786700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "blog_posts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "title" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "category" character varying(100) NOT NULL,
        "author" character varying(255) NOT NULL,
        "status" character varying(20) NOT NULL,
        "views" integer NOT NULL DEFAULT 0,
        "published_at" TIMESTAMP,
        CONSTRAINT "PK_blog_posts_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_posts_slug" UNIQUE ("slug")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "blog_posts"`);
  }
}
