import { AppError } from "@/errors";

export const checkAdmin = (req: any, res: any, next: any) => {
  const user = req.user;

  if (!user) {
    throw new AppError("Authentication required.", 401);
  }

  if (user.role !== "admin") {
    throw new AppError(
      "Admin privileges required to access this endpoint.",
      403,
    );
  }

  next();
};
