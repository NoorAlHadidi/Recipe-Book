import {
  check,
  integer,
  pgTable,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import { recipesTable, usersTable } from "@/database"; 

export const favouritesTable = pgTable(
  "favourites",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.userId, { onDelete: "cascade" }),
    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipesTable.recipeId, { onDelete: "cascade" }),
    favouritedAt: timestamp("favourited_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.recipeId],
    }),
  ],
);
