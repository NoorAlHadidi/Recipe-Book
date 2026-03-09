import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { adminService, addAdminSchema, grantAdminSchema } from "@/admins";

class AdminController {
  addAdmin = asyncErrorHandler(async (req: Request, res: Response) => {
    const addAdminDto = addAdminSchema.parse(req.body);
    const newAdmin = await adminService.addAdminUser(addAdminDto);
    res.status(201).json(newAdmin);
  });

  grantAdmin = asyncErrorHandler(async (req: Request, res: Response) => {
    const { userId } = grantAdminSchema.parse(req.params);
    await adminService.grantAdminPrivileges(userId);
    res.status(204).send();
  });
}

export const adminController = new AdminController();