import { z } from "zod";
import { getAllUsersSchema } from "./get-all-users.schema";
import { getUserByIdSchema } from "./get-user-by-id.schema";
import { updateUserSchema } from "./update-user.schema";
import { deleteUserSchema } from "./delete-user.schema";
import { OrgType, Role } from "@/generated/prisma/enums";

export type getAllUsersInput = z.infer<typeof getAllUsersSchema>;
export type getUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type updateUserInput = z.infer<typeof updateUserSchema>;
export type deleteUserInput = z.infer<typeof deleteUserSchema>;

export type UserInfo = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  organization: {
    id: string;
    name: string;
    type: OrgType;
    contactEmail: string | null;
    contactPhone: string | null;
  } | null;
};
