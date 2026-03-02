import { ZodError } from "zod";
import { AppError } from "@/errors";
import { Request, Response } from "express";
import { logInSchema, signUpSchema, refreshTokenSchema, authService } from "@/auth";

class AuthController {
  async signUp(req: Request, res: Response) {
    try {
      const signUpDto = signUpSchema.parse(req.body);
      const newUser = await authService.signUp(signUpDto);
      res.status(201).json(newUser);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else if (error instanceof ZodError) {
        const flattened = error.flatten();
        res
          .status(400)
          .json({ error: "Invalid input data.", details: flattened });
      } else {
        res.status(500).json({ error: "Internal server error." });
      }
    }
  }

  async logIn(req: Request, res: Response) {
    try {
      const logInDto = logInSchema.parse(req.body);
      const tokens = await authService.logIn(logInDto);
      res.status(200).json(tokens);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else if (error instanceof ZodError) {
        const flattened = error.flatten();
        res
          .status(400)
          .json({ error: "Invalid input data.", details: flattened });
      } else {
        res.status(500).json({ error: "Internal server error." });
      }
    }
  }

  async logOut(req: Request, res: Response) {
    try {
      const refreshTokenDTO = refreshTokenSchema.parse(req.body);
      await authService.logOut(refreshTokenDTO);
      res.status(204).json({ message: "Logged out successfully." });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else if (error instanceof ZodError) {
        const flattened = error.flatten();
        res
          .status(400)
          .json({ error: "Invalid input data.", details: flattened });
      } else {
        res.status(500).json({ error: "Internal server error." });
      }
    }
  }

  async refreshTokens(req: Request, res: Response) {
    try {
      const refreshTokenDTO = refreshTokenSchema.parse(req.body);
      const newTokens = await authService.refreshTokens(refreshTokenDTO);
      res.status(200).json(newTokens);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else if (error instanceof ZodError) {
        const flattened = error.flatten();
        res
          .status(400)
          .json({ error: "Invalid input data.", details: flattened });
      } else {
        res.status(500).json({ error: "Internal server error." });
      }
    }
  }
}

export const authController = new AuthController();
