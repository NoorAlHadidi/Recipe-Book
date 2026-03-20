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
  unitId: serial("unit_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export const ingredientsUnitsTable = pgTable(
  "ingredients_units",
  {
    ingredientId: integer("ingredient_id").notNull().references(() => ingredientsTable.ingredientId, { onDelete: "cascade" }),
    unitId: integer("unit_id").notNull().references(() => unitsTable.unitId, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "ingredient_unit",
      columns: [table.ingredientId, table.unitId],
    }),
  ],
);