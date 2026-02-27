import { databaseClient } from "@/database";
import { usersTable, refreshTokensTable } from "@/database";
import { env } from '@/utils';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SignUpDTO, LogInDTO } from "./auth.schema";
import { eq } from "drizzle-orm";

class AuthService {

    async signUp(signUpDTO: SignUpDTO) {
        const { firstName, lastName, email, password } = signUpDTO;
        const existingUser = await databaseClient.db.select().from(usersTable).where(eq(usersTable.email, email));
        if (existingUser.length > 0) {
            throw new Error("User with this email already exists.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await databaseClient.db.insert(usersTable).values({ firstName: firstName, lastName: lastName, email, password: hashedPassword })
        .returning({ userId: usersTable.userId, firstName: usersTable.firstName, lastName: usersTable.lastName, email: usersTable.email });
        return newUser[0];
    }
}

export const authService = new AuthService();