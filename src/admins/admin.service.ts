import { databaseClient, usersTable } from "@/database";
import { AddAdminDTO, ChangePrivilegeDTO } from "@/admins";
import { AppError } from "@/errors";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

class AdminService {
  async addAdminUser(addAdminDTO: AddAdminDTO) {
    const { firstName, lastName, email, password } = addAdminDTO;
    const existingUser = await databaseClient.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .execute();
    if (existingUser.length > 0) {
      throw new AppError("User with this email already exists.", 409);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await databaseClient.db
      .insert(usersTable)
      .values({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        role: "admin",
      })
      .returning({
        userId: usersTable.userId,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
      })
      .execute();
    return newUser[0];
  }

  async changePrivileges(userId: number, changePrivilegeDTO: ChangePrivilegeDTO) {
    const exisitingUser = await databaseClient.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userId, userId))
      .execute();
    if (exisitingUser.length === 0) {
      throw new AppError("No user with that ID exists.", 404);
    }
    const { role } = changePrivilegeDTO;
    await databaseClient.db
      .update(usersTable)
      .set({ role })
      .where(eq(usersTable.userId, userId))
      .execute();
  }
}

export const adminService = new AdminService();