CREATE TABLE "read_pages" (
	"page_id" text PRIMARY KEY NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);
