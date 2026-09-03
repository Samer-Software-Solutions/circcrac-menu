"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

export type LoginActionState = {
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
  formError?: string;
};

export async function login(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsedValues = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedValues.success) {
    return { fieldErrors: parsedValues.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsedValues.data.email,
    password: parsedValues.data.password,
  });

  if (error) {
    return {
      formError: "We couldn’t sign you in with that email and password.",
    };
  }

  redirect("/admin");
}
