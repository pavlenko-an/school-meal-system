import { z } from "zod";
import { getAllOrganizationsSchema } from "./get-all-organizations.schema";
import { getOrganizationByIdSchema } from "./get-organization-by-id.schema";
import { createOrganizationSchema } from "./create-organization.schema";
import { updateOrganizationSchema } from "./update-organization.schema";
import { deleteOrganizationSchema } from "./delete-organization.schema";

export type getAllOrganizationsInput = z.infer<
  typeof getAllOrganizationsSchema
>;
export type getOrganizationByIdInput = z.infer<
  typeof getOrganizationByIdSchema
>;
export type createOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type updateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type deleteOrganizationInput = z.infer<typeof deleteOrganizationSchema>;
