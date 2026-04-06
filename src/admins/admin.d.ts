import { ParamsDictionary } from "express-serve-static-core";
import { z } from "zod";
import {
  addAdminSchema,
  changePrivilegeSchema,
  userIdParamSchema,
} from "./admin.schema";

export type AddAdminDTO = z.infer<typeof addAdminSchema>;
export type ChangePrivilegeDTO = z.infer<typeof changePrivilegeSchema>;
export type UserIDParam = ParamsDictionary & z.infer<typeof userIdParamSchema>;
