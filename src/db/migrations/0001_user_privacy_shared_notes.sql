ALTER TABLE "users" ADD COLUMN "username" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_preference" varchar(20) NOT NULL DEFAULT 'anonymous';--> statement-breakpoint
ALTER TABLE "community_pins" ADD COLUMN "shared_notes" text;
