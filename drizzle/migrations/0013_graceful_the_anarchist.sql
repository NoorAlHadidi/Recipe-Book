CREATE TYPE "public"."recipe_action" AS ENUM('add', 'edit', 'delete');--> statement-breakpoint
CREATE TYPE "public"."recipe_field" AS ENUM('title', 'description', 'visibility', 'category', 'tag', 'step', 'ingredient');--> statement-breakpoint
CREATE TABLE "recipe_change_logs" (
	"log_id" serial PRIMARY KEY NOT NULL,
	"recipe_id" integer NOT NULL,
	"action" "recipe_action" NOT NULL,
	"field" "recipe_field" NOT NULL,
	"field_id" integer,
	"from" varchar(500),
	"to" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipe_change_logs" ADD CONSTRAINT "recipe_change_logs_recipe_id_recipes_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE no action;