"use client";

import { Toast } from "@base-ui/react/toast";
import {
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

type MutationResult = {
  fieldErrors?: Record<string, string[] | undefined>;
  formError?: string;
  status?: "error" | "success";
};

type ToastCopy = {
  description: string;
  title: string;
};

type MutationToastCopy<Result extends MutationResult> = {
  error?: string;
  loading: ToastCopy;
  success: (result: Result) => ToastCopy;
};

export type AdminMutationOutcome<Result> =
  | { result: Result; type: "result" }
  | { type: "unexpected-error" };

class ResolvedMutationFailure<Result extends MutationResult> extends Error {
  readonly result: Result;

  constructor(result: Result) {
    super(result.formError ?? "Check the highlighted fields and try again.");
    this.name = "ResolvedMutationFailure";
    this.result = result;
  }
}

function failedMutationMessage(result: MutationResult, fallback: string): string {
  if (result.formError) {
    return result.formError;
  }

  if (result.fieldErrors) {
    return "Check the highlighted fields and try again.";
  }

  return fallback;
}

function ToastIcon({ type }: { type: string | undefined }) {
  if (type === "loading") {
    return (
      <LoaderCircle
        className="size-5 animate-spin text-primary"
        aria-hidden="true"
      />
    );
  }

  if (type === "success") {
    return <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />;
  }

  return <CircleAlert className="size-5 text-destructive" aria-hidden="true" />;
}

function AdminToastViewport() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] left-4 z-[100] w-auto sm:left-auto sm:w-[24rem]">
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            toast={toast}
            swipeDirection={["up", "right"]}
            className="[--gap:0.75rem] [--peek:0.7rem] [--scale:calc(max(0,1-(var(--toast-index)*0.04)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))] absolute top-0 right-0 left-0 z-[calc(1000-var(--toast-index))] w-full origin-top rounded-xl border border-stone-200 bg-background text-foreground shadow-lg shadow-stone-950/10 [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))] transition-[transform,opacity,height] duration-300 ease-out motion-reduce:transition-none data-[type=success]:border-emerald-200 data-[type=error]:border-destructive/30 data-[type=loading]:border-primary/25 data-[limited]:pointer-events-none data-[limited]:opacity-0 data-[starting-style]:-translate-y-5 data-[starting-style]:opacity-0 data-[ending-style]:-translate-y-5 data-[ending-style]:opacity-0 data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]"
          >
            <Toast.Content className="flex items-start gap-3 p-4 data-[behind]:opacity-0 data-[expanded]:opacity-100">
              <span className="mt-0.5 shrink-0">
                <ToastIcon type={toast.type} />
              </span>
              <div className="min-w-0 flex-1">
                <Toast.Title className="text-sm font-semibold" />
                <Toast.Description className="mt-0.5 text-sm leading-5 text-muted-foreground" />
              </div>
              <Toast.Close
                aria-label="Dismiss notification"
                className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <X className="size-4" aria-hidden="true" />
              </Toast.Close>
            </Toast.Content>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider limit={3} timeout={5000}>
      {children}
      <AdminToastViewport />
    </Toast.Provider>
  );
}

export function useAdminMutationToast() {
  const toastManager = Toast.useToastManager();

  async function mutation<Result extends MutationResult>(
    action: Promise<Result>,
    copy: MutationToastCopy<Result>,
  ): Promise<AdminMutationOutcome<Result>> {
    const resultPromise = action.then((result) => {
      if (result.status !== "success") {
        throw new ResolvedMutationFailure(result);
      }

      return result;
    });

    try {
      const result = await toastManager.promise(resultPromise, {
        loading: {
          ...copy.loading,
          priority: "low",
        },
        success: (successResult) => ({
          ...copy.success(successResult),
          priority: "low",
        }),
        error: (error: unknown) => ({
          description:
            error instanceof ResolvedMutationFailure
              ? failedMutationMessage(error.result, copy.error ?? "We couldn’t save that change. Please try again.")
              : (copy.error ?? "Something went wrong. Please try again."),
          priority: "high",
          title: "Couldn’t save changes",
        }),
      });
      return { result, type: "result" };
    } catch (error: unknown) {
      if (error instanceof ResolvedMutationFailure) {
        return { result: error.result, type: "result" };
      }

      return { type: "unexpected-error" };
    }
  }

  return { mutation };
}
