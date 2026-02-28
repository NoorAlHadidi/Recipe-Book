import { logInSchema, signUpSchema } from "./auth.schema";
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
}
export const authController = new AuthController();