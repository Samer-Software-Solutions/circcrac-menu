import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type Admin = {
  email: string | null;
};

/**
 * Confirms the authenticated Supabase user against Auth for protected server
 * rendering and actions. Proxy redirects are intentionally not trusted here.
 */
export const getCurrentAdmin = cache(async (): Promise<Admin | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { email: user.email ?? null };
});

export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
