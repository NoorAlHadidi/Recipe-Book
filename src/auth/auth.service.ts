import { databaseClient } from "@/database";
import { usersTable, refreshTokensTable } from "@/database";
import { env } from "@/utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SignUpDTO, LogInDTO, RefreshTokenDTO } from "./auth.schema";
import { eq, and, gt, is } from "drizzle-orm";

class AuthService {
  async signUp(signUpDTO: SignUpDTO) {
    const { firstName, lastName, email, password } = signUpDTO;
    const existingUser = await databaseClient.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (existingUser.length > 0) {
      throw new Error("User with this email already exists.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await databaseClient.db
      .insert(usersTable)
      .values({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
      })
      .returning({
        userId: usersTable.userId,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
      });
    return newUser[0];
  }

  async logIn(logInDTO: LogInDTO) {
    const { email, password } = logInDTO;
    const user = await databaseClient.db
      .select({
        userId: usersTable.userId,
        email: usersTable.email,
        password: usersTable.password,
        role: usersTable.role,
        isActive: usersTable.isActive,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (user.length === 0) {
      throw new Error("No user with this email found.");
    }
    if (!user[0].isActive) {
      throw new Error("User is not active.");
    }
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      throw new Error("Incorrect password.");
    }
    const accessToken = jwt.sign(
      { userId: user[0].userId, role: user[0].role },
      env!.get("ACCESS_TOKEN_SECRET"),
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { userId: user[0].userId, role: user[0].role },
      env!.get("REFRESH_TOKEN_SECRET"),
      { expiresIn: "7d" },
    );
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await databaseClient.db.insert(refreshTokensTable).values({
      userId: user[0].userId,
      tokenHash: hashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return { accessToken, refreshToken };
  }

  async logOut(refreshTokenDTO: RefreshTokenDTO) {
    const { refreshToken } = refreshTokenDTO;
    const decoded: any = jwt.verify(
      refreshToken,
      env!.get("REFRESH_TOKEN_SECRET"),
    );
    const userTokens = await databaseClient.db
      .select()
      .from(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.userId, decoded.userId),
          eq(refreshTokensTable.isRevoked, false),
          gt(refreshTokensTable.expiresAt, new Date()),
        ),
      )
      .execute();
    let validToken = null;
    for (const userToken of userTokens) {
      const isCorrect = await bcrypt.compare(refreshToken, userToken.tokenHash);
      if (isCorrect) {
        validToken = userToken;
        break;
      }
    }
    if (!validToken) {
      throw new Error("Invalid refresh token.");
    }
    await databaseClient.db
      .update(refreshTokensTable)
      .set({ isRevoked: true })
      .where(eq(refreshTokensTable.id, validToken.id));
  }

  async refreshTokens(refreshTokenDTO: RefreshTokenDTO) {
    const { refreshToken } = refreshTokenDTO;
    const decoded: any = jwt.verify(
      refreshToken,
      env!.get("REFRESH_TOKEN_SECRET"),
    );
    const userTokens = await databaseClient.db
      .select()
      .from(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.userId, decoded.userId),
          eq(refreshTokensTable.isRevoked, false),
          gt(refreshTokensTable.expiresAt, new Date()),
        ),
      )
      .execute();
    let validToken = null;
    for (const userToken of userTokens) {
      const isCorrect = await bcrypt.compare(refreshToken, userToken.tokenHash);
      if (isCorrect) {
        validToken = userToken;
        break;
      }
    }
    if (!validToken) {
      throw new Error("Invalid refresh token.");
    }
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      env!.get("ACCESS_TOKEN_SECRET"),
      { expiresIn: "15m" },
    );
    await databaseClient.db
      .update(refreshTokensTable)
      .set({ isRevoked: true })
      .where(eq(refreshTokensTable.id, validToken.id));
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      env!.get("REFRESH_TOKEN_SECRET"),
      { expiresIn: "7d" },
    );
    const hashedToken = await bcrypt.hash(newRefreshToken, 10);
    await databaseClient.db.insert(refreshTokensTable).values({
      userId: decoded.userId,
      tokenHash: hashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}

export const authService = new AuthService();
