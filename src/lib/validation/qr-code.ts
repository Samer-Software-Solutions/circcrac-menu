import { z } from "zod";

import { menuImageSchema } from "@/lib/validation/menu-items";

export const qrDotTypeValues = [
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "square",
  "extra-rounded",
] as const;

export const qrCornerTypeValues = [
  "dot",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "square",
  "extra-rounded",
] as const;

const qrColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Enter a color in the format #RRGGBB.")
  .transform((value) => value.toUpperCase());

const qrLogoSizeSchema = z.coerce
  .number()
  .min(0.1, "Choose a logo size between 10% and 50%.")
  .max(0.5, "Choose a logo size between 10% and 50%.");

export const qrCodeFormSchema = z.object({
  backgroundColor: qrColorSchema,
  cornerDotType: z.enum(qrCornerTypeValues),
  cornerSquareType: z.enum(qrCornerTypeValues),
  dotColor: qrColorSchema,
  dotType: z.enum(qrDotTypeValues),
  logoSize: qrLogoSizeSchema,
  removeLogo: z.boolean(),
});

export const qrCodeFormDataSchema = qrCodeFormSchema.extend({
  removeLogo: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export const qrCodeClientFormSchema = z.object({
  backgroundColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Enter a color in the format #RRGGBB."),
  cornerDotType: z.enum(qrCornerTypeValues),
  cornerSquareType: z.enum(qrCornerTypeValues),
  dotColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Enter a color in the format #RRGGBB."),
  dotType: z.enum(qrDotTypeValues),
  logo: menuImageSchema,
  logoSize: z
    .number()
    .min(0.1, "Choose a logo size between 10% and 50%.")
    .max(0.5, "Choose a logo size between 10% and 50%."),
  removeLogo: z.boolean(),
});

export type QrCodeFormValues = z.infer<typeof qrCodeClientFormSchema>;
