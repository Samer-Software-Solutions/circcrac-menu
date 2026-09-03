import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Sign in to manage your restaurant menu.
      </p>
      <div className="mt-7">
        <LoginForm />
      </div>
    </>
  );
}
