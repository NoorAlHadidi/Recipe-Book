import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { adminService, addAdminSchema } from "@/admins";

class AdminController {
  addAdmin = asyncErrorHandler(async (req: Request, res: Response) => {
    const addAdminDto = addAdminSchema.parse(req.body);
    const newAdmin = await adminService.addAdminUser(addAdminDto);
    res.status(201).json(newAdmin);
  });
}

export const adminController = new AdminController();