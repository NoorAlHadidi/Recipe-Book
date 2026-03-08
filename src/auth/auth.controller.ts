import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import {
  logInSchema,
  signUpSchema,
  refreshTokenSchema,
  authService,
} from "@/auth";

class AuthController {
  signUp = asyncErrorHandler(async (req: Request, res: Response) => {
    const signUpDto = signUpSchema.parse(req.body);
    const newUser = await authService.signUp(signUpDto);
    res.status(201).json(newUser);
  });

  logIn = asyncErrorHandler(async (req: Request, res: Response) => {
    const logInDto = logInSchema.parse(req.body);
    const tokens = await authService.logIn(logInDto);
    res.status(200).json(tokens);
  });

  logOut = asyncErrorHandler(async (req: Request, res: Response) => {
    const refreshTokenDTO = refreshTokenSchema.parse(req.body);
    await authService.logOut(refreshTokenDTO);
    res.status(204).json({ message: "Logged out successfully." });
  });

  refreshTokens = asyncErrorHandler(async (req: Request, res: Response) => {
    const refreshTokenDTO = refreshTokenSchema.parse(req.body);
    const newTokens = await authService.refreshTokens(refreshTokenDTO);
    res.status(200).json(newTokens);
  });
}

export const authController = new AuthController();
