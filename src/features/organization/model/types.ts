import { z } from "zod";
import {
  createOrganizationSchema,
  deleteOrganizationSchema,
  getAllOrganizationsSchema,
  getOrganizationByIdSchema,
  updateOrganizationSchema,
} from "./schemas";

export type getAllOrganizationsInput = z.infer<
  typeof getAllOrganizationsSchema
>;
export type getOrganizationByIdInput = z.infer<
  typeof getOrganizationByIdSchema
>;
export type createOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type updateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type deleteOrganizationInput = z.infer<typeof deleteOrganizationSchema>;

export type OrganizationInfo = {
  id: string;
  name: string;
  type: string;
  contactEmail: string | null;
  contactPhone: string | null;
};

export type OrganizationsList = {
  organizations: OrganizationInfo[];
  total: number;
  page: number;
  totalPages: number;
};
