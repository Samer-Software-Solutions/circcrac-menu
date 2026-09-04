import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import type { ComponentProps } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AlertDialogContent({
  children,
  className,
  ...props
}: AlertDialogPrimitive.Popup.Props) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-stone-950/35 backdrop-blur-[1px] transition-opacity duration-150 ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
      <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-3 pt-16 sm:items-center sm:p-6">
        <AlertDialogPrimitive.Popup
          className={cn(
            "w-full max-w-md rounded-xl border bg-background p-5 shadow-xl shadow-stone-950/15 outline-none transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-2 data-[ending-style]:opacity-0 sm:data-[starting-style]:scale-[0.98] sm:data-[starting-style]:translate-y-0 sm:data-[ending-style]:scale-[0.98] sm:data-[ending-style]:translate-y-0",
            className,
          )}
          {...props}
        >
          {children}
        </AlertDialogPrimitive.Popup>
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  );
}

function AlertDialogFooter({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AlertDialogCancel({
  className,
  ...props
}: AlertDialogPrimitive.Close.Props) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogDescription = AlertDialogPrimitive.Description;
const AlertDialogTitle = AlertDialogPrimitive.Title;

export {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
};
