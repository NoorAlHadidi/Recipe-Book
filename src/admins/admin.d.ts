// import { ParamsDictionary } from "express-serve-static-core";
import { addAdminSchema, changePrivilegeSchema } from "./admin.schema";

export type AddAdminDTO = z.infer<typeof addAdminSchema>;
export type ChangePrivilegeDTO = z.infer<typeof changePrivilegeSchema>;
// export type UserIDParam = ParamsDictionary & z.infer<typeof userIdParamSchema>;