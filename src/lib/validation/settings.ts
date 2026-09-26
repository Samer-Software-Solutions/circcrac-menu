import { z } from "zod";

import { menuImageSchema } from "@/lib/validation/menu-items";

const restaurantNameSchema = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .max(160, "Use 160 characters or fewer.");

const taglineSchema = z
  .string()
  .trim()
  .max(160, "Use 160 characters or fewer.");

const currencySchema = z
  .string()
  .regex(/^[A-Z]{3}$/, "Enter a three-letter uppercase currency code.");

const primaryColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Enter a color in the format #RRGGBB.")
  .transform((value) => value.toUpperCase());

const googleReviewUrlSchema = z
  .string()
  .trim()
  .max(2048, "Use 2048 characters or fewer.")
  .refine(
    (value) => value === "" || /^https:\/\/\S+$/.test(value),
    "Enter a full link starting with https://.",
  );

export const settingsFormSchema = z.object({
  currency: currencySchema,
  defaultLanguage: z.enum(["en", "ar"]),
  googleReviewUrl: googleReviewUrlSchema
    .transform((value) => (value === "" ? null : value)),
  primaryColor: primaryColorSchema.nullable(),
  removeBanner: z.boolean(),
  removeLogo: z.boolean(),
  restaurantNameAr: restaurantNameSchema,
  restaurantNameEn: restaurantNameSchema,
  taglineAr: taglineSchema.nullable(),
  taglineEn: taglineSchema.nullable(),
});

export const settingsFormDataSchema = settingsFormSchema.extend({
  primaryColor: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .pipe(primaryColorSchema.nullable()),
  removeBanner: z.enum(["true", "false"]).transform((value) => value === "true"),
  removeLogo: z.enum(["true", "false"]).transform((value) => value === "true"),
  taglineAr: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .pipe(taglineSchema.nullable()),
  taglineEn: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .pipe(taglineSchema.nullable()),
});

export const settingsClientFormSchema = z.object({
  currency: currencySchema,
  defaultLanguage: z.enum(["en", "ar"]),
  googleReviewUrl: googleReviewUrlSchema,
  // Native text inputs use an empty string for an unset value. The server
  // converts that intentionally to null before it reaches PostgreSQL.
  primaryColor: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^#[0-9A-Fa-f]{6}$/.test(value),
      "Enter a color in the format #RRGGBB.",
    ),
  removeBanner: z.boolean(),
  removeLogo: z.boolean(),
  restaurantNameAr: restaurantNameSchema,
  restaurantNameEn: restaurantNameSchema,
  taglineAr: taglineSchema,
  taglineEn: taglineSchema,
  banner: menuImageSchema,
  logo: menuImageSchema,
});

export type SettingsFormValues = z.infer<typeof settingsClientFormSchema>;
