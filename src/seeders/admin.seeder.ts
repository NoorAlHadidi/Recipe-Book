import { databaseClient, usersTable } from "@/database";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function seedAdmin() {
  const existingAdmin = await databaseClient.db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, "admin"))
    .execute();

  if (existingAdmin.length > 0) {
    console.log("Admin already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash("SuperAdminPassword", 10);

  await databaseClient.db.insert(usersTable).values({
    firstName: "Super",
    lastName: "Admin",
    email: "super.admin@system.com",
    password: hashedPassword,
    role: "admin",
    passwordReset: true,
  });

  console.log("Succesfully seeded super admin user.");
}

export async function clearAdmin() {
  await databaseClient.db
    .delete(usersTable)
    .where(eq(usersTable.role, "admin"))
    .execute();

  console.log("Cleared admin users.");
}
