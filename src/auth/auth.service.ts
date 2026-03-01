import { databaseClient } from "@/database";
import { usersTable, refreshTokensTable } from "@/database";
import { env } from '@/utils';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SignUpDTO, LogInDTO, RefreshTokenDTO } from "./auth.schema";
import { eq, and, gt } from "drizzle-orm";

class AuthService {

    async signUp(signUpDTO: SignUpDTO){
        const { firstName, lastName, email, password } = signUpDTO;
        const emailLowerCase = email.toLowerCase();
        const existingUser = await databaseClient.db.select().from(usersTable).where(eq(usersTable.email, emailLowerCase));
        if (existingUser.length > 0) {
            throw new Error("User with this email already exists.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await databaseClient.db.insert(usersTable).values({ firstName: firstName, lastName: lastName, email: emailLowerCase, password: hashedPassword })
        .returning({ userId: usersTable.userId, firstName: usersTable.firstName, lastName: usersTable.lastName, email: usersTable.email });
        return newUser[0];
    }

    async logIn(logInDTO: LogInDTO) {
        // TODO: add active user check
        const { email, password } = logInDTO;
        const emailLowerCase = email.toLowerCase();
        const user = await databaseClient.db.select({userId: usersTable.userId, email: usersTable.email, password: usersTable.password, role: usersTable.role }).from(usersTable).where(eq(usersTable.email, emailLowerCase));
        if (user.length === 0) {
            throw new Error("No user with this email found.");
        }
        const isPasswordValid = await bcrypt.compare(password, user[0].password);
        if (!isPasswordValid) {
            throw new Error("Incorrect password.");
        }
        const accessToken = jwt.sign({ userId: user[0].userId, role: user[0].role }, env!.get('ACCESS_TOKEN_SECRET'), { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user[0].userId, role: user[0].role }, env!.get('REFRESH_TOKEN_SECRET'), { expiresIn: '7d' });
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        await databaseClient.db.insert(refreshTokensTable).values({ userId: user[0].userId, tokenHash: hashedToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        return { accessToken, refreshToken };
    }

    async logOut(refreshTokenDTO: RefreshTokenDTO) {
        const { refreshToken } = refreshTokenDTO;
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        const decoded: any = jwt.verify(refreshToken, env!.get('REFRESH_TOKEN_SECRET'));
        await databaseClient.db.update(refreshTokensTable).set({ isRevoked: true }).where(eq(refreshTokensTable.userId, decoded.userId));   
    }

    async refreshTokens(refreshTokenDTO: RefreshTokenDTO) {
        const { refreshToken } = refreshTokenDTO;
        const decoded: any = jwt.verify(refreshToken, env!.get('REFRESH_TOKEN_SECRET'));
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        const storedTokens = await databaseClient.db.select().from(refreshTokensTable).where(and(eq(refreshTokensTable.userId, decoded.userId), eq(refreshTokensTable.isRevoked, false), gt(refreshTokensTable.expiresAt, new Date())));
        const validToken = storedTokens.find(token => bcrypt.compare(hashedRefreshToken, token.tokenHash));
        if (!validToken) {
            throw new Error("Invalid refresh token.");
        }
        const newAccessToken = jwt.sign({ userId: decoded.userId, role: decoded.role }, env!.get('ACCESS_TOKEN_SECRET'), { expiresIn: '15m' });
        return { accessToken: newAccessToken };
    }
}

export const authService = new AuthService();