import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  integer,
  numeric,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import {
  usersTable,
  categoriesTable,
  ingredientsTable,
  unitsTable,
} from "@/database";

export const visibilityEnum = pgEnum("visibility", ["private", "public"]);

export const recipesTable = pgTable("recipes", {
  recipeId: serial("recipe_id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  visibility: visibilityEnum("visibility").notNull().default("public"),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => usersTable.userId, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.categoryId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }),
});

export const stepsTable = pgTable(
  "steps",
  {
    stepNumber: integer("step_number").notNull(),
    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipesTable.recipeId, { onDelete: "cascade" }),
    instruction: varchar("instruction", { length: 500 }).notNull(),
  },
  (table) => [
    primaryKey({
      name: "step_recipe",
      columns: [table.stepNumber, table.recipeId],
    }),
  ],
);

export const recipesIngredientsTable = pgTable(
  "recipes_ingredients",
  {
    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipesTable.recipeId, {
        onDelete: "cascade",
      }),
    ingredientId: integer("ingredient_id")
      .notNull()
      .references(() => ingredientsTable.ingredientId, { onDelete: "cascade" }),
    unitId: integer("unit_id")
      .notNull()
      .references(() => unitsTable.unitId, { onDelete: "cascade" }),
    quantity: numeric("quantity", { precision: 5, scale: 2 }).notNull(),
    notes: varchar("notes", { length: 500 }),
  },
  (table) => [
    primaryKey({
      name: "recipe_ingredient",
      columns: [table.recipeId, table.ingredientId],
    }),
  ],
);

export const tagsTable = pgTable("tags", {
  tagId: serial("tag_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export const recipesTagsTable = pgTable(
  "recipes_tags",
  {
    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipesTable.recipeId, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tagsTable.tagId, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "recipe_tag",
      columns: [table.recipeId, table.tagId],
    }),
  ],
);
