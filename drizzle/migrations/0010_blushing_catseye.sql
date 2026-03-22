CREATE TYPE "public"."visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "recipes_ingredients" (
	"recipe_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"quantity" numeric(5, 2) NOT NULL,
	"notes" varchar(500),
	CONSTRAINT "recipe_ingredient" PRIMARY KEY("recipe_id","ingredient_id")
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"recipe_id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" varchar(500),
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"created_by" integer NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "recipes_tags" (
	"recipe_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "recipe_tag" PRIMARY KEY("recipe_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "steps" (
	"step_number" integer NOT NULL,
	"recipe_id" integer NOT NULL,
	"instruction" varchar(500) NOT NULL,
	CONSTRAINT "step_recipe" PRIMARY KEY("step_number","recipe_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"tag_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "recipes_ingredients" ADD CONSTRAINT "recipes_ingredients_recipe_id_recipes_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes_ingredients" ADD CONSTRAINT "recipes_ingredients_ingredient_id_ingredients_ingredient_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("ingredient_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes_ingredients" ADD CONSTRAINT "recipes_ingredients_unit_id_units_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("unit_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes_tags" ADD CONSTRAINT "recipes_tags_recipe_id_recipes_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes_tags" ADD CONSTRAINT "recipes_tags_tag_id_tags_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("tag_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "steps" ADD CONSTRAINT "steps_recipe_id_recipes_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE no action;