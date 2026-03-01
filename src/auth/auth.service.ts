import { databaseClient, usersTable, refreshTokensTable } from "@/database";
import { SignUpDTO, LogInDTO, RefreshTokenDTO } from "@/auth";
import { env } from "@/utils";
import { AppError } from "@/errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";

class AuthService {
  async signUp(signUpDTO: SignUpDTO) {
    const { firstName, lastName, email, password } = signUpDTO;
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
      .where(eq(usersTable.email, email))
      .execute();
    if (user.length === 0) {
      throw new AppError("Invalid credentials.", 401);
    }
    if (!user[0].isActive) {
      throw new AppError("User is not active.", 403);
    }
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials.", 401);
    }
    const accessToken = jwt.sign(
      { userId: user[0].userId, role: user[0].role },
      env!.get("ACCESS_TOKEN_SECRET"),
      { expiresIn: "15m" },
    );
    const jti = randomUUID();
    const refreshToken = jwt.sign(
      { userId: user[0].userId, role: user[0].role, jti },
      env!.get("REFRESH_TOKEN_SECRET"),
      { expiresIn: "7d" },
    );
    await databaseClient.db
      .insert(refreshTokensTable)
      .values({
        userId: user[0].userId,
        jti: jti,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .execute();
    return { accessToken, refreshToken };
  }

  async logOut(refreshTokenDTO: RefreshTokenDTO) {
    const { refreshToken } = refreshTokenDTO;
    const decoded: any = jwt.verify(
      refreshToken,
      env!.get("REFRESH_TOKEN_SECRET"),
    );
    const userTokens = await databaseClient.db
      .select({
        isRevoked: refreshTokensTable.isRevoked,
        expiresAt: refreshTokensTable.expiresAt,
      })
      .from(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.jti, decoded.jti),
          eq(refreshTokensTable.userId, decoded.userId),
        ),
      )
      .execute();
    if (userTokens.length === 0) {
      throw new AppError("Invalid refresh token.", 401);
    }
    if (userTokens[0].isRevoked || userTokens[0].expiresAt < new Date()) {
      throw new AppError("Refresh token is revoked or expired.", 401);
    }
    await databaseClient.db
      .update(refreshTokensTable)
      .set({ isRevoked: true })
      .where(eq(refreshTokensTable.jti, decoded.jti))
      .execute();
  }

  async refreshTokens(refreshTokenDTO: RefreshTokenDTO) {
    const { refreshToken } = refreshTokenDTO;
    const decoded: any = jwt.verify(
      refreshToken,
      env!.get("REFRESH_TOKEN_SECRET"),
    );
    const userTokens = await databaseClient.db
      .select({
        isRevoked: refreshTokensTable.isRevoked,
        expiresAt: refreshTokensTable.expiresAt,
      })
      .from(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.jti, decoded.jti),
          eq(refreshTokensTable.userId, decoded.userId),
        ),
      )
      .execute();
    if (userTokens.length === 0) {
      throw new AppError("Invalid refresh token.", 401);
    }
    if (userTokens[0].isRevoked || userTokens[0].expiresAt < new Date()) {
      throw new AppError("Refresh token is revoked or expired.", 401);
    }
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      env!.get("ACCESS_TOKEN_SECRET"),
      { expiresIn: "15m" },
    );
    await databaseClient.db
      .update(refreshTokensTable)
      .set({ isRevoked: true })
      .where(eq(refreshTokensTable.jti, decoded.jti))
      .execute();
    const newJti = randomUUID();
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role, jti: newJti },
      env!.get("REFRESH_TOKEN_SECRET"),
      { expiresIn: "7d" },
    );
    await databaseClient.db
      .insert(refreshTokensTable)
      .values({
        userId: decoded.userId,
        jti: newJti,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .execute();
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}

export const authService = new AuthService();
