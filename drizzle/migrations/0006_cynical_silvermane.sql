CREATE TABLE "ingredients" (
	"ingredient_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "ingredients_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ingredients_unts" (
	"ingredient_id" integer,
	"unit_id" integer,
	CONSTRAINT "ingredient_unit" PRIMARY KEY("ingredient_id","unit_id")
);
--> statement-breakpoint
CREATE TABLE "units" (
	"units_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "units_name_unique" UNIQUE("name")
);
