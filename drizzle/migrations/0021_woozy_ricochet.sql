ALTER TYPE "public"."role" ADD VALUE 'super-admin';--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_reset";