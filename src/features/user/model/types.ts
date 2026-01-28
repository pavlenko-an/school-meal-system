import { z } from "zod";
import { OrgType, Role } from "@/generated/prisma/enums";
import {
  deleteUserSchema,
  getAllUsersSchema,
  getUserByIdSchema,
  updateUserSchema,
} from "./schemas";

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
