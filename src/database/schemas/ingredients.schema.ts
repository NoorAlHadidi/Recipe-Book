import {
  pgTable,
  serial,
  varchar,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

export const ingredientsTable = pgTable("ingredients", {
  ingredientId: serial("ingredient_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export const unitsTable = pgTable("units", {
  unitId: serial("units_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export const ingredientsUnitsTable = pgTable(
  "ingredients_unts",
  {
    ingredientId: integer("ingredient_id"),
    unitId: integer("unit_id"),
  },
  (table) => [
    primaryKey({
      name: "ingredient_unit",
      columns: [table.ingredientId, table.unitId],
    }),
  ],
);
