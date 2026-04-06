import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { adminService } from "./admin.service";
import { AddAdminDTO, ChangePrivilegeDTO } from "./admin.d";

// request is Request<Params, ResBody, ReqBody, Query>, adjust based on type

class AdminController {
  addAdmin = asyncErrorHandler(
    async (req: Request<any, any, AddAdminDTO>, res: Response) => {
      const newAdmin = await adminService.addAdminUser(req.body);
      res.status(201).json(newAdmin);
    },
  );

  changePrivilege = asyncErrorHandler(
    async (req: Request<any, any, ChangePrivilegeDTO>, res: Response) => {
      await adminService.changePrivileges(req.params.userId, req.body);
      res.status(204).send();
    },
  );
}

export const adminController = new AdminController();
