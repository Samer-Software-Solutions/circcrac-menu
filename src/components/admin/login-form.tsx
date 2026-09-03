"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, LogIn } from "lucide-react";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";

import {
  login,
  type LoginActionState,
} from "@/app/(auth)/admin/login/actions";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

function firstError(errors: string[] | undefined) {
  return errors?.[0];
}

const initialLoginActionState: LoginActionState = {};

export function LoginForm() {
  const [actionState, formAction, pending] = useActionState(
    login,
    initialLoginActionState,
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const emailError = errors.email?.message ?? firstError(actionState.fieldErrors?.email);
  const passwordError =
    errors.password?.message ?? firstError(actionState.fieldErrors?.password);

  function submit(values: LoginValues) {
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);

    startTransition(() => formAction(formData));
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address
        </label>
        <input
          {...register("email")}
          id="email"
          type="email"
          autoComplete="email"
          aria-describedby={emailError ? "email-error" : undefined}
          aria-invalid={Boolean(emailError)}
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
          placeholder="you@example.com"
        />
        {emailError ? (
          <p id="email-error" className="text-sm text-destructive">
            {emailError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <input
          {...register("password")}
          id="password"
          type="password"
          autoComplete="current-password"
          aria-describedby={passwordError ? "password-error" : undefined}
          aria-invalid={Boolean(passwordError)}
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        />
        {passwordError ? (
          <p id="password-error" className="text-sm text-destructive">
            {passwordError}
          </p>
        ) : null}
      </div>

      {actionState.formError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {actionState.formError}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <LogIn aria-hidden="true" />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
