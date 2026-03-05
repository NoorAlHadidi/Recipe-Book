import { pgTable, serial, varchar, pgEnum, timestamp, boolean, integer, uuid } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('role', ['user', 'admin']);

export const usersTable = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  role: roleEnum("role").notNull().default('user'),
  isActive: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const refreshTokensTable = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.userId, { onDelete: "cascade" }),
  jti: uuid("jti").unique().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  isRevoked: boolean("revoked").notNull().default(false), 
});

