"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Download, ExternalLink, ImagePlus, LoaderCircle, RotateCcw, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import QRCodeStyling, { type CornerDotType, type CornerSquareType, type DotType, type Options } from "qr-code-styling";
import { startTransition, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { saveQrCodeStyle, type QrCodeActionState } from "@/app/(admin)/admin/qr-code/actions";
import { useAdminMutationToast } from "@/components/admin/admin-toast-provider";
import { Button } from "@/components/ui/button";
import { validateMenuImage } from "@/lib/validation/menu-items";
import {
  qrCodeClientFormSchema,
  qrCornerTypeValues,
  qrDotTypeValues,
  type QrCodeFormValues,
} from "@/lib/validation/qr-code";

type QrCodeManagerProps = {
  backgroundColor: string;
  cornerDotType: CornerDotType;
  cornerSquareType: CornerSquareType;
  dotColor: string;
  dotType: DotType;
  logoSize: number;
  logoUrl: string | null;
  publicUrl: string;
  restaurantName: string;
};

const PREVIEW_SIZE = 232;
const OUTPUT_SIZE = 2048;
// A generous quiet zone keeps the code scannable once printed small.
const MARGIN_RATIO = 0.02;
const LOGO_MARGIN_RATIO = 0.00;
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

const dotTypeLabels: Record<(typeof qrDotTypeValues)[number], string> = {
  classy: "Classy",
  "classy-rounded": "Classy rounded",
  dots: "Dots",
  "extra-rounded": "Extra rounded",
  rounded: "Rounded",
  square: "Square",
};

const cornerTypeLabels: Record<(typeof qrCornerTypeValues)[number], string> = {
  classy: "Classy",
  "classy-rounded": "Classy rounded",
  dot: "Dot",
  dots: "Dots",
  "extra-rounded": "Extra rounded",
  rounded: "Rounded",
  square: "Square",
};

type QrStyleValues = {
  backgroundColor: string;
  cornerDotType: CornerDotType;
  cornerSquareType: CornerSquareType;
  dotColor: string;
  dotType: DotType;
  logoSize: number;
  logoSrc: string | null;
};

function buildQrOptions(
  publicUrl: string,
  {
    backgroundColor,
    cornerDotType,
    cornerSquareType,
    dotColor,
    dotType,
    logoSize,
    logoSrc,
  }: QrStyleValues,
  size: number,
  type: "canvas" | "svg",
): Partial<Options> {
  return {
    backgroundOptions: { color: backgroundColor },
    cornersDotOptions: { color: dotColor, type: cornerDotType },
    cornersSquareOptions: { color: dotColor, type: cornerSquareType },
    data: publicUrl,
    dotsOptions: { color: dotColor, type: dotType },
    height: size,
    image: logoSrc ?? undefined,
    imageOptions: {
      crossOrigin: "anonymous",
      hideBackgroundDots: true,
      imageSize: logoSize,
      margin: Math.round(size * LOGO_MARGIN_RATIO),
    },
    margin: Math.round(size * MARGIN_RATIO),
    qrOptions: { errorCorrectionLevel: "H", typeNumber: 5 },
    type,
    width: size,
  };
}

function valuesFor(settings: {
  backgroundColor: string;
  cornerDotType: CornerDotType;
  cornerSquareType: CornerSquareType;
  dotColor: string;
  dotType: DotType;
  logoSize: number;
}): QrCodeFormValues {
  return { ...settings, logo: null, removeLogo: false };
}

function firstError(errors: string[] | undefined): string | undefined {
  return errors?.[0];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function QrCodeManager({
  backgroundColor,
  cornerDotType,
  cornerSquareType,
  dotColor,
  dotType,
  logoSize,
  logoUrl,
  publicUrl,
  restaurantName,
}: QrCodeManagerProps) {
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<QrCodeActionState>({});
  const [removeLogo, setRemoveLogo] = useState(false);
  const [dotColorValue, setDotColorValue] = useState(dotColor);
  const [backgroundColorValue, setBackgroundColorValue] = useState(backgroundColor);
  const { mutation } = useAdminMutationToast();
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewInstanceRef = useRef<QRCodeStyling | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<QrCodeFormValues>({
    defaultValues: valuesFor({
      backgroundColor,
      cornerDotType,
      cornerSquareType,
      dotColor,
      dotType,
      logoSize,
    }),
    resolver: zodResolver(qrCodeClientFormSchema),
  });
  const dotColorField = register("dotColor");
  const backgroundColorField = register("backgroundColor");
  const dotTypeField = register("dotType");
  const cornerSquareTypeField = register("cornerSquareType");
  const cornerDotTypeField = register("cornerDotType");
  const logoSizeField = register("logoSize", { valueAsNumber: true });
  const dotTypeValue = useWatch({ control, name: "dotType" });
  const cornerSquareTypeValue = useWatch({ control, name: "cornerSquareType" });
  const cornerDotTypeValue = useWatch({ control, name: "cornerDotType" });
  const logoSizeValue = useWatch({ control, name: "logoSize" });

  useEffect(() => {
    return () => {
      if (previewLogoUrl) {
        URL.revokeObjectURL(previewLogoUrl);
      }
    };
  }, [previewLogoUrl]);

  function clearSelectedLogo() {
    if (previewLogoUrl) {
      URL.revokeObjectURL(previewLogoUrl);
    }
    setPreviewLogoUrl(null);
    setFileInputKey((value) => value + 1);
    setValue("logo", null, { shouldValidate: true });
  }

  function selectLogo(file: File | null) {
    clearSelectedLogo();
    if (file) {
      setPreviewLogoUrl(URL.createObjectURL(file));
      setValue("removeLogo", false);
      setRemoveLogo(false);
    }
    setValue("logo", file, { shouldValidate: true });
  }

  function removeCurrentLogo() {
    clearSelectedLogo();
    setValue("removeLogo", true, { shouldDirty: true });
    setRemoveLogo(true);
  }

  function resetForm() {
    setActionState({});
    setDownloadError(null);
    clearSelectedLogo();
    reset(
      valuesFor({
        backgroundColor,
        cornerDotType,
        cornerSquareType,
        dotColor,
        dotType,
        logoSize,
      }),
    );
    setRemoveLogo(false);
    setDotColorValue(dotColor);
    setBackgroundColorValue(backgroundColor);
  }

  const displayedLogo = previewLogoUrl ?? (removeLogo ? null : logoUrl);
  const validDotColor = HEX_COLOR_PATTERN.test(dotColorValue);
  const validBackgroundColor = HEX_COLOR_PATTERN.test(backgroundColorValue);
  const previewValues: QrStyleValues = {
    backgroundColor: validBackgroundColor ? backgroundColorValue : backgroundColor,
    cornerDotType: cornerDotTypeValue,
    cornerSquareType: cornerSquareTypeValue,
    dotColor: validDotColor ? dotColorValue : dotColor,
    dotType: dotTypeValue,
    logoSize: logoSizeValue,
    logoSrc: displayedLogo,
  };

  // Mounts the live preview once; the effect below keeps its styling in sync
  // with edits without tearing down and recreating the instance every time.
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) {
      return;
    }
    const instance = new QRCodeStyling(
      buildQrOptions(publicUrl, previewValues, PREVIEW_SIZE, "canvas"),
    );
    instance.append(container);
    previewInstanceRef.current = instance;
    return () => {
      previewInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicUrl]);

  useEffect(() => {
    previewInstanceRef.current?.update(
      buildQrOptions(publicUrl, previewValues, PREVIEW_SIZE, "canvas"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    publicUrl,
    previewValues.backgroundColor,
    previewValues.cornerDotType,
    previewValues.cornerSquareType,
    previewValues.dotColor,
    previewValues.dotType,
    previewValues.logoSize,
    previewValues.logoSrc,
  ]);

  async function downloadAs(extension: "png" | "svg") {
    setDownloadError(null);
    setIsDownloading(true);
    try {
      const exportInstance = new QRCodeStyling(
        buildQrOptions(
          publicUrl,
          previewValues,
          OUTPUT_SIZE,
          extension === "svg" ? "svg" : "canvas",
        ),
      );
      const blob = await exportInstance.getRawData(extension);
      if (blob instanceof Blob) {
        downloadBlob(blob, `criccrac-menu-qr.${extension}`);
      } else {
        setDownloadError("We couldn’t generate the QR code. Please try again.");
      }
    } catch (error) {
      console.error("Failed to export the QR code.", error);
      setDownloadError("We couldn’t generate the QR code. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  function submitQrStyle(values: QrCodeFormValues) {
    const logoError = validateMenuImage(values.logo);
    if (logoError) {
      setError("logo", { message: logoError });
      return;
    }

    const formData = new FormData();
    formData.set("dotColor", values.dotColor);
    formData.set("backgroundColor", values.backgroundColor);
    formData.set("dotType", values.dotType);
    formData.set("cornerSquareType", values.cornerSquareType);
    formData.set("cornerDotType", values.cornerDotType);
    formData.set("logoSize", String(values.logoSize));
    formData.set("removeLogo", String(values.removeLogo));
    if (values.logo) {
      formData.set("logo", values.logo);
    }

    setActionState({});
    setIsSaving(true);
    startTransition(async () => {
      const outcome = await mutation(saveQrCodeStyle({}, formData), {
        loading: {
          description: "Your QR code style is being saved.",
          title: "Saving QR code style",
        },
        success: (result) => ({
          description: result.successMessage ?? "QR code style saved.",
          title: "QR code style saved",
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

  const fieldError = (name: "backgroundColor" | "dotColor") =>
    errors[name]?.message ?? firstError(actionState.fieldErrors?.[name]);

  return (
    <section className="max-w-3xl" aria-labelledby="qr-code-title">
      <p className="text-sm font-medium text-muted-foreground">Public menu</p>
      <h1 id="qr-code-title" className="mt-1 text-3xl font-semibold tracking-tight">
        QR code
      </h1>
      <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
        Style and print this permanent entry point for {restaurantName}. Visitors are sent to their preferred language after scanning.
      </p>

      <div className="mt-7 grid gap-6 rounded-xl border bg-background p-4 shadow-xs sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-start sm:p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium">Public menu URL</p>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="mt-2 flex min-h-11 items-center gap-2 break-all rounded-lg border bg-muted/40 px-3 font-mono text-sm text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
            {publicUrl}
          </a>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The encoded URL stays at the site root, without a locale or CMS path.
          </p>
        </div>
        <div className="grid aspect-square w-full max-w-xs place-items-center justify-self-center rounded-xl border bg-white p-4">
          <div ref={previewContainerRef} className="grid size-full place-items-center [&>canvas]:size-full [&>canvas]:object-contain" />
        </div>
      </div>

      {actionState.formError ? (
        <p role="alert" className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {actionState.formError}
        </p>
      ) : null}
      {actionState.warning ? (
        <p role="alert" className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6">
          {actionState.warning}
        </p>
      ) : null}

      <form noValidate onSubmit={handleSubmit(submitQrStyle)} className="mt-5 space-y-7 rounded-xl border bg-background p-4 shadow-xs sm:p-6">
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="text-base font-semibold">Colors</legend>
          <div className="space-y-2">
            <label htmlFor="qr-dot-color" className="text-sm font-medium">Dot color</label>
            <div className="flex max-w-sm items-center gap-3">
              <input
                type="color"
                aria-label="Choose the dot color"
                value={validDotColor ? dotColorValue : "#000000"}
                onChange={(event) => {
                  const nextValue = event.target.value.toUpperCase();
                  setValue("dotColor", nextValue, { shouldDirty: true, shouldValidate: true });
                  setDotColorValue(nextValue);
                }}
                className="size-10 shrink-0 cursor-pointer rounded-lg border p-0.5 shadow-xs"
              />
              <input
                {...dotColorField}
                id="qr-dot-color"
                autoComplete="off"
                spellCheck={false}
                maxLength={7}
                aria-describedby={fieldError("dotColor") ? "qr-dot-color-error" : undefined}
                aria-invalid={Boolean(fieldError("dotColor"))}
                onChange={(event) => {
                  dotColorField.onChange(event);
                  setDotColorValue(event.target.value);
                }}
                className="h-10 min-w-0 flex-1 rounded-lg border bg-background px-3 font-mono text-sm uppercase shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                placeholder="#E0332D"
              />
            </div>
            {fieldError("dotColor") ? <p id="qr-dot-color-error" className="text-sm text-destructive">{fieldError("dotColor")}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="qr-background-color" className="text-sm font-medium">Background color</label>
            <div className="flex max-w-sm items-center gap-3">
              <input
                type="color"
                aria-label="Choose the background color"
                value={validBackgroundColor ? backgroundColorValue : "#000000"}
                onChange={(event) => {
                  const nextValue = event.target.value.toUpperCase();
                  setValue("backgroundColor", nextValue, { shouldDirty: true, shouldValidate: true });
                  setBackgroundColorValue(nextValue);
                }}
                className="size-10 shrink-0 cursor-pointer rounded-lg border p-0.5 shadow-xs"
              />
              <input
                {...backgroundColorField}
                id="qr-background-color"
                autoComplete="off"
                spellCheck={false}
                maxLength={7}
                aria-describedby={fieldError("backgroundColor") ? "qr-background-color-error" : undefined}
                aria-invalid={Boolean(fieldError("backgroundColor"))}
                onChange={(event) => {
                  backgroundColorField.onChange(event);
                  setBackgroundColorValue(event.target.value);
                }}
                className="h-10 min-w-0 flex-1 rounded-lg border bg-background px-3 font-mono text-sm uppercase shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                placeholder="#242021"
              />
            </div>
            {fieldError("backgroundColor") ? <p id="qr-background-color-error" className="text-sm text-destructive">{fieldError("backgroundColor")}</p> : null}
          </div>
        </fieldset>

        <fieldset className="grid gap-5 border-t pt-6 sm:grid-cols-3">
          <legend className="text-base font-semibold">Shape</legend>
          <div className="space-y-2">
            <label htmlFor="qr-dot-type" className="text-sm font-medium">Dot style</label>
            <select
              {...dotTypeField}
              id="qr-dot-type"
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {qrDotTypeValues.map((value) => (
                <option key={value} value={value}>
                  {dotTypeLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="qr-corner-square-type" className="text-sm font-medium">Corner square style</label>
            <select
              {...cornerSquareTypeField}
              id="qr-corner-square-type"
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {qrCornerTypeValues.map((value) => (
                <option key={value} value={value}>
                  {cornerTypeLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="qr-corner-dot-type" className="text-sm font-medium">Corner dot style</label>
            <select
              {...cornerDotTypeField}
              id="qr-corner-dot-type"
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {qrCornerTypeValues.map((value) => (
                <option key={value} value={value}>
                  {cornerTypeLabels[value]}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <fieldset className="border-t pt-6">
          <legend className="text-base font-semibold">QR code logo <span className="font-normal text-muted-foreground">(optional)</span></legend>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">JPEG, PNG, WebP, or AVIF up to 5 MiB. Shown at the center of the QR code, separate from the restaurant logo in settings.</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-xl border bg-muted">
              {displayedLogo ? <Image src={displayedLogo} alt="QR code logo preview" fill sizes="112px" className="object-contain p-2" /> : <ImagePlus className="size-7 text-muted-foreground" aria-hidden="true" />}
            </div>
            <div className="min-w-0 space-y-3">
              <label htmlFor="qr-logo" className="inline-flex min-h-10 cursor-pointer items-center rounded-md border px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent">
                {logoUrl || previewLogoUrl ? "Replace logo" : "Choose logo"}
              </label>
              <input
                key={fileInputKey}
                id="qr-logo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(event) => selectLogo(event.target.files?.[0] ?? null)}
              />
              {(logoUrl || previewLogoUrl) && !removeLogo ? (
                <Button type="button" variant="ghost" size="sm" onClick={removeCurrentLogo} disabled={isSaving} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 aria-hidden="true" /> Remove logo
                </Button>
              ) : null}
              {errors.logo?.message ? <p className="text-sm text-destructive">{errors.logo.message}</p> : null}
              {removeLogo ? <p className="text-sm text-muted-foreground">The current QR code logo will be removed when you save.</p> : null}
            </div>
          </div>
          <div className="mt-5 max-w-sm space-y-2">
            <label htmlFor="qr-logo-size" className="flex items-center justify-between text-sm font-medium">
              <span>Logo size</span>
              <span className="font-mono text-muted-foreground">{Math.round(logoSizeValue * 100)}%</span>
            </label>
            <input
              {...logoSizeField}
              id="qr-logo-size"
              type="range"
              min={0.1}
              max={0.5}
              step={0.01}
              className="h-2 w-full cursor-pointer accent-foreground"
            />
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>
            <RotateCcw aria-hidden="true" /> Reset changes
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            {isSaving ? "Saving style…" : "Save style"}
          </Button>
        </div>
      </form>

      <div className="mt-7 rounded-xl border bg-background p-4 shadow-xs sm:p-6">
        <p className="text-base font-semibold">Download</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Downloads are 2048 × 2048 pixels with high error correction, using the style shown above even if it hasn’t been saved yet.
        </p>
        {downloadError ? <p role="alert" className="mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{downloadError}</p> : null}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button type="button" disabled={isDownloading} onClick={() => downloadAs("png")}>
            {isDownloading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />} Download PNG
          </Button>
          <Button type="button" variant="outline" disabled={isDownloading} onClick={() => downloadAs("svg")}>
            <Download aria-hidden="true" /> Download SVG
          </Button>
        </div>
      </div>
    </section>
  );
}
