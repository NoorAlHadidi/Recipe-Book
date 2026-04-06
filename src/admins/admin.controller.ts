import type { Request, Response } from "express";
import { adminService } from "./admin.service";
import { AddAdminDTO, ChangePrivilegeDTO, UserIDParam } from "./admin.d";

// request is Request<Params, ResBody, ReqBody, Query>, adjust based on type

class AdminController {
  async addAdmin(req: Request<unknown, unknown, AddAdminDTO>, res: Response) {
    const newAdmin = await adminService.addAdminUser(req.body);
    res.status(201).json(newAdmin);
  }

  async changePrivilege(
    req: Request<UserIDParam, unknown, ChangePrivilegeDTO>,
    res: Response,
  ) {
    await adminService.changePrivileges(req.params.userId, req.body);
    res.status(204).send();
  }
}

export const adminController = new AdminController();
