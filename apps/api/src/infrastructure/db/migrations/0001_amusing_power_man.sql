ALTER TABLE "users_table" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD CONSTRAINT "users_table_slug_unique" UNIQUE("slug");