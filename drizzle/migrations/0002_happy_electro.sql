ALTER TABLE "refresh_tokens" ADD COLUMN "jti" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP COLUMN "token_hash";--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_jti_unique" UNIQUE("jti");