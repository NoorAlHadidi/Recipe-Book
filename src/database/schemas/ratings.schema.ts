import {
  check,
  integer,
  pgTable,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import { recipesTable, usersTable } from "@/database";
import { sql } from "drizzle-orm";

export const ratingsTable = pgTable(
  "ratings",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.userId, { onDelete: "cascade" }),
    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipesTable.recipeId, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    ratedAt: timestamp("rated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: "user_recipe",
      columns: [table.userId, table.recipeId],
    }),
    check("rating_check", sql`${table.rating} between 1 and 5`),
  ],
);
