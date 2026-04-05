import { AppError } from "@/errors";

export const checkAdmin = (req: any, res: any, next: any) => {
  const role = req.user.role;
  if (role === "user") {
    throw new AppError(
      "Admin privileges required to access this endpoint.",
      403,
    );
  }
  next();
};

export const checkSuperAdmin = (req: any, res: any, next: any) => {
  const role = req.user.role;
  if (role !== "super-admin") {
    throw new AppError(
      "Super admin privileges required to access this endpoint.",
      403,
    );
  }
  next();
};