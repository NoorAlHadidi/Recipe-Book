import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import {
  adminService,
  grantAdminSchema,
  changePrivilegeSchema,
} from "@/admins";

class AdminController {
  addAdmin = asyncErrorHandler(async (req: Request, res: Response) => {
    const newAdmin = await adminService.addAdminUser(req.body);
    res.status(201).json(newAdmin);
  });

  changePrivilege = asyncErrorHandler(async (req: Request, res: Response) => {
    const { userId } = grantAdminSchema.parse(req.params);
    const changePrivilegeDTO = changePrivilegeSchema.parse(req.body);
    await adminService.changePrivileges(userId, changePrivilegeDTO);
    res.status(204).send();
  });
}

export const adminController = new AdminController();
