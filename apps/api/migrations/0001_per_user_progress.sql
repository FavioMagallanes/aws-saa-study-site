-- Progress becomes per user. Rows from the single-user era have no owner, so they are dropped.
DELETE FROM "read_pages";--> statement-breakpoint
ALTER TABLE "read_pages" DROP CONSTRAINT "read_pages_pkey";--> statement-breakpoint
ALTER TABLE "read_pages" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "read_pages" ADD CONSTRAINT "read_pages_user_id_page_id_pk" PRIMARY KEY("user_id","page_id");
