"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { ImagePlus, LoaderCircle, RotateCcw, Save, Trash2 } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  saveSettings,
  type SettingsActionState,
} from "@/app/(admin)/admin/settings/actions";
import { useAdminMutationToast } from "@/components/admin/admin-toast-provider";
import { Button } from "@/components/ui/button";
import type { AdminSettings } from "@/lib/data/admin-settings";
import { cn } from "@/lib/utils";
import {
  settingsClientFormSchema,
  type SettingsFormValues,
} from "@/lib/validation/settings";
import { validateMenuImage } from "@/lib/validation/menu-items";

type SettingsManagerProps = {
  settings: AdminSettings;
};

function valuesFor(settings: AdminSettings): SettingsFormValues {
  return {
    currency: settings.currency,
    defaultLanguage: settings.defaultLanguage,
    logo: null,
    primaryColor: settings.primaryColor ?? "",
    removeLogo: false,
    restaurantNameAr: settings.restaurantNameAr,
    restaurantNameEn: settings.restaurantNameEn,
  };
}

function firstError(errors: string[] | undefined): string | undefined {
  return errors?.[0];
}

export function SettingsManager({ settings }: SettingsManagerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [actionState, setActionState] = useState<SettingsActionState>({});
  const [removeLogo, setRemoveLogo] = useState(false);
  const [primaryColorValue, setPrimaryColorValue] = useState(
    settings.primaryColor ?? "",
  );
  const { mutation } = useAdminMutationToast();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<SettingsFormValues>({
    defaultValues: valuesFor(settings),
    resolver: zodResolver(settingsClientFormSchema),
  });
  const primaryColorField = register("primaryColor");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearSelectedLogo() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileInputKey((value) => value + 1);
    setValue("logo", null, { shouldValidate: true });
  }

  function selectLogo(file: File | null) {
    clearSelectedLogo();
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setValue("removeLogo", false);
      setRemoveLogo(false);
    }
    setValue("logo", file, { shouldValidate: true });
  }

  function resetForm() {
    setActionState({});
    clearSelectedLogo();
    reset(valuesFor(settings));
    setRemoveLogo(false);
    setPrimaryColorValue(settings.primaryColor ?? "");
  }

  function removeCurrentLogo() {
    clearSelectedLogo();
    setValue("removeLogo", true, { shouldDirty: true });
    setRemoveLogo(true);
  }

  function submitSettings(values: SettingsFormValues) {
    const logoError = validateMenuImage(values.logo);
    if (logoError) {
      setError("logo", { message: logoError });
      return;
    }

    const formData = new FormData();
    formData.set("currency", values.currency);
    formData.set("defaultLanguage", values.defaultLanguage);
    formData.set("primaryColor", values.primaryColor);
    formData.set("removeLogo", String(values.removeLogo));
    formData.set("restaurantNameAr", values.restaurantNameAr);
    formData.set("restaurantNameEn", values.restaurantNameEn);
    if (values.logo) {
      formData.set("logo", values.logo);
    }

    setActionState({});
    setIsSaving(true);
    startTransition(async () => {
      const outcome = await mutation(saveSettings({}, formData), {
        loading: {
          description: "Your restaurant settings are being saved.",
          title: "Saving settings",
        },
        success: (result) => ({
          description: result.successMessage ?? "Restaurant settings saved.",
          title: "Settings saved",
        }),
      });
      if (outcome.type === "result") {
        setActionState(outcome.result);
      } else {
        setActionState({ formError: "Something went wrong. Please try again." });
      }
      if (outcome.type === "result" && outcome.result.status === "success") {
        clearSelectedLogo();
      }
      setIsSaving(false);
    });
  }

  const fieldError = (
    name:
      | "currency"
      | "defaultLanguage"
      | "primaryColor"
      | "restaurantNameAr"
      | "restaurantNameEn",
  ) => errors[name]?.message ?? firstError(actionState.fieldErrors?.[name]);
  const displayedLogo = previewUrl ?? (removeLogo ? null : settings.logoUrl);
  const validPrimaryColor = /^#[0-9A-Fa-f]{6}$/.test(primaryColorValue);

  return (
    <section className="max-w-3xl" aria-labelledby="settings-title">
      <p className="text-sm font-medium text-muted-foreground">Restaurant setup</p>
      <h1 id="settings-title" className="mt-1 text-3xl font-semibold tracking-tight">
        Restaurant settings
      </h1>
      <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
        Set the bilingual restaurant identity and public-menu preferences.
      </p>

      {actionState.warning ? (
        <p role="alert" className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6">
          {actionState.warning}
        </p>
      ) : null}
      {actionState.formError ? (
        <p role="alert" className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {actionState.formError}
        </p>
      ) : null}

      <form noValidate onSubmit={handleSubmit(submitSettings)} className="mt-7 space-y-7 rounded-xl border bg-background p-4 shadow-xs sm:p-6">
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="text-base font-semibold">Restaurant identity</legend>
          <div className="space-y-2">
            <label htmlFor="restaurant-name-en" className="text-sm font-medium">English name</label>
            <input
              {...register("restaurantNameEn")}
              id="restaurant-name-en"
              autoComplete="organization"
              aria-describedby={fieldError("restaurantNameEn") ? "restaurant-name-en-error" : undefined}
              aria-invalid={Boolean(fieldError("restaurantNameEn"))}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
            />
            {fieldError("restaurantNameEn") ? <p id="restaurant-name-en-error" className="text-sm text-destructive">{fieldError("restaurantNameEn")}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="restaurant-name-ar" className="text-sm font-medium">Arabic name</label>
            <input
              {...register("restaurantNameAr")}
              id="restaurant-name-ar"
              dir="rtl"
              lang="ar"
              autoComplete="organization"
              aria-describedby={fieldError("restaurantNameAr") ? "restaurant-name-ar-error" : undefined}
              aria-invalid={Boolean(fieldError("restaurantNameAr"))}
              className="h-10 w-full rounded-lg border bg-background px-3 text-right shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
            />
            {fieldError("restaurantNameAr") ? <p id="restaurant-name-ar-error" className="text-sm text-destructive">{fieldError("restaurantNameAr")}</p> : null}
          </div>
        </fieldset>

        <fieldset className="border-t pt-6">
          <legend className="text-base font-semibold">Logo</legend>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">JPEG, PNG, WebP, or AVIF up to 5 MiB. The logo appears on the public menu and QR code.</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-xl border bg-muted">
              {displayedLogo ? <Image src={displayedLogo} alt="Current restaurant logo preview" fill sizes="112px" className="object-contain p-2" /> : <ImagePlus className="size-7 text-muted-foreground" aria-hidden="true" />}
            </div>
            <div className="min-w-0 space-y-3">
              <label htmlFor="restaurant-logo" className="inline-flex min-h-10 cursor-pointer items-center rounded-md border px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent">
                {settings.logoUrl || previewUrl ? "Replace logo" : "Choose logo"}
              </label>
              <input
                key={fileInputKey}
                id="restaurant-logo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(event) => selectLogo(event.target.files?.[0] ?? null)}
              />
              {(settings.logoUrl || previewUrl) && !removeLogo ? (
                <Button type="button" variant="ghost" size="sm" onClick={removeCurrentLogo} disabled={isSaving} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 aria-hidden="true" /> Remove logo
                </Button>
              ) : null}
              {errors.logo?.message ? <p className="text-sm text-destructive">{errors.logo.message}</p> : null}
              {removeLogo ? <p className="text-sm text-muted-foreground">The current logo will be removed when you save.</p> : null}
            </div>
          </div>
        </fieldset>

        <fieldset className="grid gap-5 border-t pt-6 sm:grid-cols-2">
          <legend className="text-base font-semibold">Public menu preferences</legend>
          <div className="space-y-2">
            <label htmlFor="restaurant-currency" className="text-sm font-medium">Currency</label>
            <input
              {...register("currency")}
              id="restaurant-currency"
              maxLength={3}
              autoCapitalize="characters"
              autoComplete="off"
              aria-describedby={fieldError("currency") ? "restaurant-currency-error" : "restaurant-currency-help"}
              aria-invalid={Boolean(fieldError("currency"))}
              className="h-10 w-full rounded-lg border bg-background px-3 font-mono text-sm uppercase shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
              placeholder="QAR"
            />
            {fieldError("currency") ? <p id="restaurant-currency-error" className="text-sm text-destructive">{fieldError("currency")}</p> : <p id="restaurant-currency-help" className="text-xs text-muted-foreground">Use a three-letter uppercase code, such as QAR.</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="default-language" className="text-sm font-medium">Default language</label>
            <select
              {...register("defaultLanguage")}
              id="default-language"
              aria-describedby={fieldError("defaultLanguage") ? "default-language-error" : "default-language-help"}
              aria-invalid={Boolean(fieldError("defaultLanguage"))}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
            {fieldError("defaultLanguage") ? <p id="default-language-error" className="text-sm text-destructive">{fieldError("defaultLanguage")}</p> : <p id="default-language-help" className="text-xs text-muted-foreground">Used only when a visitor has no language preference.</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="primary-color" className="text-sm font-medium">Primary brand color <span className="font-normal text-muted-foreground">(optional)</span></label>
            <div className="flex max-w-sm items-center gap-3">
              <span className={cn("size-10 shrink-0 rounded-lg border shadow-xs", !validPrimaryColor && "bg-muted")} style={validPrimaryColor ? { backgroundColor: primaryColorValue } : undefined} aria-hidden="true" />
              <input
                {...primaryColorField}
                id="primary-color"
                autoComplete="off"
                spellCheck={false}
                aria-describedby={fieldError("primaryColor") ? "primary-color-error" : "primary-color-help"}
                aria-invalid={Boolean(fieldError("primaryColor"))}
                onChange={(event) => {
                  primaryColorField.onChange(event);
                  setPrimaryColorValue(event.target.value);
                }}
                className="h-10 min-w-0 flex-1 rounded-lg border bg-background px-3 font-mono text-sm uppercase shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                placeholder="#8B1E2D"
              />
            </div>
            {fieldError("primaryColor") ? <p id="primary-color-error" className="text-sm text-destructive">{fieldError("primaryColor")}</p> : <p id="primary-color-help" className="text-xs text-muted-foreground">Leave blank to use the menu’s standard accent color.</p>}
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>
            <RotateCcw aria-hidden="true" /> Reset changes
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            {isSaving ? "Saving settings…" : "Save settings"}
          </Button>
        </div>
      </form>
    </section>
  );
}
