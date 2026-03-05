import { NextFunction, Request, Response } from "express";
import {
  logInSchema,
  signUpSchema,
  refreshTokenSchema,
  authService,
} from "@/auth";

class AuthController {
  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const signUpDto = signUpSchema.parse(req.body);
      const newUser = await authService.signUp(signUpDto);
      res.status(201).json(newUser);
    } catch (error: any) {
      next(error);
    }
  }

  async logIn(req: Request, res: Response, next: NextFunction) {
    try {
      const logInDto = logInSchema.parse(req.body);
      const tokens = await authService.logIn(logInDto);
      res.status(200).json(tokens);
    } catch (error: any) {
      next(error);
    }
  }

  async logOut(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshTokenDTO = refreshTokenSchema.parse(req.body);
      await authService.logOut(refreshTokenDTO);
      res.status(204).json({ message: "Logged out successfully." });
    } catch (error: any) {
      next(error);
    }
  }

  async refreshTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshTokenDTO = refreshTokenSchema.parse(req.body);
      const newTokens = await authService.refreshTokens(refreshTokenDTO);
      res.status(200).json(newTokens);
    } catch (error: any) {
      next(error);
    }
  }
}

export const authController = new AuthController();
