import { logInSchema, signUpSchema, refreshTokenSchema } from "./auth.schema";
import { authService } from "./auth.service";

class AuthController {

    async signUp(req: any, res: any) {
        try {
            const signUpDto = signUpSchema.parse(req.body); 
            const newUser = await authService.signUp(signUpDto);
            res.status(201).json(newUser);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async logIn(req: any, res: any) {
        try {
            const logInDto = logInSchema.parse(req.body); 
            const tokens = await authService.logIn(logInDto);
            res.status(200).json(tokens);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async logOut(req: any, res: any) {
        try {
            const refreshTokenDTO = refreshTokenSchema.parse(req.body);
            await authService.logOut(refreshTokenDTO);
            res.status(200).json({ message: "Logged out successfully." });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async refreshTokens(req: any, res: any) {
        try {
            const refreshTokenDTO = refreshTokenSchema.parse(req.body);
            const newTokens = await authService.refreshTokens(refreshTokenDTO);
            res.status(200).json(newTokens);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
export const authController = new AuthController();