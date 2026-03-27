ALTER TABLE "recipes" RENAME COLUMN "created_by" TO "creator_id";--> statement-breakpoint
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_created_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_creator_id_users_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;