import { prisma } from "@/shared/db/prisma";
import { getCurrentUser } from "@/shared/auth/current-user";
import { deleteOrganizationInput } from "../model/organization.types";
import { deleteOrganizationSchema } from "../model/delete-organization.schema";

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function deleteOrganization(
  prevState: ActionResult | null = null,
  formData: FormData | deleteOrganizationInput,
) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Відмовлено в доступі",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = deleteOrganizationSchema.parse(rawData);
    const organizationId = data.id ?? currentUser.organizationId;
    if (!organizationId) {
      return {
        success: false,
        error: "ID організації не вказано",
      };
    }
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Відмовлено в доступі",
      };
    }
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization)
      return {
        success: false,
        error: "Організація не знайдена",
      };
    await prisma.organization.delete({
      where: { id: organizationId },
    });
    return { success: true, message: "Організацію успішно видалено" };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося видалити організацію",
    };
  }
}
