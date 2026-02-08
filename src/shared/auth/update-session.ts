"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";

export type SessionUpdateData = {
  name?: string | null;
  email?: string;
  image?: string | null;
  role?: "employee" | "admin";
  organizationId?: string | null;
  organizationType?: "school" | "supplier" | null;
};

export function useUpdateSession() {
  const { update } = useSession();

  return useCallback(
    async (data: SessionUpdateData) => {
      await update(data);
    },
    [update],
  );
}
