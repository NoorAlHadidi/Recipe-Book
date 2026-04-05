import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  categoryId: serial("category_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: varchar("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
