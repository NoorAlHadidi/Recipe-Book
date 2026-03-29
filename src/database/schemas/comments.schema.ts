import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { recipesTable, usersTable } from "@/database";

export const commentsTable = pgTable("comments", {
  commentId: serial("comment_id").primaryKey(),
  commentedBy: integer("commented_by")
    .notNull()
    .references(() => usersTable.userId, { onDelete: "cascade" }),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipesTable.recipeId, { onDelete: "cascade" }),
  content: varchar("content", { length: 500 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedBy: integer("deleted_by")
    .references(() => usersTable.userId, { onDelete: "cascade" }),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const resolutionEnum = pgEnum("resolution", [
  "user_deleted",
  "admin_deleted",
  "kept",
]);

export const reportsTable = pgTable("reports", {
  reportId: serial("report_id").primaryKey(),
  reportedBy: integer("user_id")
    .notNull()
    .references(() => usersTable.userId, { onDelete: "cascade" }),
  commentId: integer("comment_id")
    .notNull()
    .references(() => commentsTable.commentId, { onDelete: "cascade" }),
  content: varchar("content", { length: 500 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  resolution: resolutionEnum("resolution"),
  resolvedAt: timestamp("resolved_at", { mode: "date" }),
});
