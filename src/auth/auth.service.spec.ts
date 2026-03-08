import { authService } from "@/auth";
import { databaseClient } from "@/database";
import { AppError } from "@/errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

jest.mock("@/database", () => ({
  databaseClient: {
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    },
  },
  usersTable: {},
  refreshTokensTable: {},
}));

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("crypto", () => ({
  randomUUID: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AuthService", () => {
  describe("SignUp", () => {
    const signUpDTO = {
      firstName: "User",
      lastName: "Name",
      email: "user@example.com",
      password: "password123",
    };

    it("should create a new user successfully", async () => {
      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([]),
          }),
        }),
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

      (databaseClient.db.insert as jest.Mock).mockReturnValue({
        values: () => ({
          returning: () => ({
            execute: () =>
              Promise.resolve([
                {
                  userId: 1,
                  firstName: "User",
                  lastName: "Name",
                  email: "user@example.com",
                },
              ]),
          }),
        }),
      });

      const result = await authService.signUp(signUpDTO);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(databaseClient.db.insert).toHaveBeenCalled();
      expect(result).toEqual({
        userId: 1,
        firstName: "User",
        lastName: "Name",
        email: "user@example.com",
      });
    });

    it("should throw AppError if email already exists", async () => {
      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([{ userId: 1 }]),
          }),
        }),
      });

      await expect(authService.signUp(signUpDTO)).rejects.toThrow(AppError);
      await expect(authService.signUp(signUpDTO)).rejects.toMatchObject({
        statusCode: 409,
      });

      expect(databaseClient.db.insert).not.toHaveBeenCalled();
    });
  });

  describe("LogIn", () => {
    const logInDTO = {
      email: "user@example.com",
      password: "password123",
    };

    it("should return access and refresh tokens on successful login", async () => {
      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () =>
              Promise.resolve([
                {
                  userId: 1,
                  email: "user@example.com",
                  password: "hashedPassword",
                  role: "user",
                  isActive: true,
                },
              ]),
          }),
        }),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      (jwt.sign as jest.Mock)
        .mockReturnValueOnce("accessToken")
        .mockReturnValueOnce("refreshToken");

      (randomUUID as jest.Mock).mockReturnValue("mocked-jti");

      (databaseClient.db.insert as jest.Mock).mockReturnValue({
        values: () => ({
          execute: () => Promise.resolve(),
        }),
      });

      const result = await authService.logIn(logInDTO);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword",
      );

      expect(result).toEqual({
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });
    });

    it("should throw 401 if user does not exist", async () => {
      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([]),
          }),
        }),
      });

      await expect(authService.logIn(logInDTO)).rejects.toThrow(AppError);
      await expect(authService.logIn(logInDTO)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it("should throw 403 if user is not active", async () => {
      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () =>
              Promise.resolve([
                {
                  userId: 1,
                  email: "user@example.com",
                  password: "hashedPassword",
                  role: "user",
                  isActive: false,
                },
              ]),
          }),
        }),
      });

      await expect(authService.logIn(logInDTO)).rejects.toThrow(AppError);
      await expect(authService.logIn(logInDTO)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it("should throw 401 if password is incorrect", async () => {
      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () =>
              Promise.resolve([
                {
                  userId: 1,
                  email: "user@example.com",
                  password: "hashedPassword",
                  role: "user",
                  isActive: true,
                },
              ]),
          }),
        }),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.logIn(logInDTO)).rejects.toThrow(AppError);
      await expect(authService.logIn(logInDTO)).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  describe("LogOut", () => {
    const refreshTokenDTO = {
      refreshToken: "validToken",
    };

    it("should revoke refresh token successfully", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        jti: "jti",
        sub: 1,
        role: "user",
      });

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () =>
              Promise.resolve([
                {
                  isRevoked: false,
                  expiresAt: new Date(Date.now() + 10000),
                },
              ]),
          }),
        }),
      });

      (databaseClient.db.update as jest.Mock).mockReturnValue({
        set: () => ({
          where: () => ({
            execute: () => Promise.resolve(),
          }),
        }),
      });

      await authService.logOut(refreshTokenDTO);

      expect(databaseClient.db.update).toHaveBeenCalled();
    });

    it("should throw 401 if refresh token cannot be verified", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      await expect(authService.logOut(refreshTokenDTO)).rejects.toThrow(
        AppError,
      );
      await expect(authService.logOut(refreshTokenDTO)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it("should throw 401 if refresh token not found", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        jti: "jti",
        sub: 1,
        role: "user",
      });

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([]),
          }),
        }),
      });

      await expect(authService.logOut(refreshTokenDTO)).rejects.toThrow(
        AppError,
      );
      await expect(authService.logOut(refreshTokenDTO)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it("should throw 401 if refresh token is already revoked", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        jti: "jti",
        sub: 1,
        role: "user",
      });

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () =>
              Promise.resolve([
                {
                  isRevoked: true,
                  expiresAt: new Date(Date.now() + 10000),
                },
              ]),
          }),
        }),
      });

      await expect(authService.logOut(refreshTokenDTO)).rejects.toThrow(
        AppError,
      );
      await expect(authService.logOut(refreshTokenDTO)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it("should throw 401 if refresh token is expired", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        jti: "jti",
        sub: 1,
        role: "user",
      });

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () =>
              Promise.resolve([
                {
                  isRevoked: false,
                  expiresAt: new Date(Date.now() - 10000),
                },
              ]),
          }),
        }),
      });

      await expect(authService.logOut(refreshTokenDTO)).rejects.toThrow(
        AppError,
      );
      await expect(authService.logOut(refreshTokenDTO)).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  describe("RefreshTokens", () => {
    const refreshTokenDTO = {
      refreshToken: "validToken",
    };

    it("should rotate refresh token successfully", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        jti: "old-jti",
        sub: 1,
        role: "user",
      });

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () =>
              Promise.resolve([
                {
                  isRevoked: false,
                  expiresAt: new Date(Date.now() + 10000),
                },
              ]),
          }),
        }),
      });

      (jwt.sign as jest.Mock)
        .mockReturnValueOnce("newAccessToken")
        .mockReturnValueOnce("newRefreshToken");

      (randomUUID as jest.Mock).mockReturnValue("new-jti");

      (databaseClient.db.update as jest.Mock).mockReturnValue({
        set: () => ({
          where: () => ({
            execute: () => Promise.resolve(),
          }),
        }),
      });

      (databaseClient.db.insert as jest.Mock).mockReturnValue({
        values: () => ({
          execute: () => Promise.resolve(),
        }),
      });

      const result = await authService.refreshTokens(refreshTokenDTO);

      expect(result).toEqual({
        accessToken: "newAccessToken",
        refreshToken: "newRefreshToken",
      });

      expect(databaseClient.db.update).toHaveBeenCalled();
      expect(databaseClient.db.insert).toHaveBeenCalled();
    });

    it("should throw 401 if refresh token cannot be verified", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      await expect(authService.refreshTokens(refreshTokenDTO)).rejects.toThrow(
        AppError,
      );
      await expect(
        authService.refreshTokens(refreshTokenDTO),
      ).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it("should throw 401 if token not found", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        jti: "jti",
        sub: 1,
        role: "user",
      });

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([]),
          }),
        }),
      });

      await expect(authService.refreshTokens(refreshTokenDTO)).rejects.toThrow(
        AppError,
      );
      await expect(
        authService.refreshTokens(refreshTokenDTO),
      ).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it("should throw 401 if token is revoked", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        jti: "jti",
        sub: 1,
        role: "user",
      });

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () =>
              Promise.resolve([
                {
                  isRevoked: true,
                  expiresAt: new Date(Date.now() + 10000),
                },
              ]),
          }),
        }),
      });

      await expect(authService.refreshTokens(refreshTokenDTO)).rejects.toThrow(
        AppError,
      );
      await expect(
        authService.refreshTokens(refreshTokenDTO),
      ).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it("should throw 401 if token is expired", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        jti: "jti",
        sub: 1,
        role: "user",
      });

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () =>
              Promise.resolve([
                {
                  isRevoked: false,
                  expiresAt: new Date(Date.now() - 10000),
                },
              ]),
          }),
        }),
      });

      await expect(authService.refreshTokens(refreshTokenDTO)).rejects.toThrow(
        AppError,
      );
      await expect(
        authService.refreshTokens(refreshTokenDTO),
      ).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });
});
