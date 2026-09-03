import { z } from "zod";

const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .max(120, "Use 120 characters or fewer.");

export const categoryFormSchema = z.object({
  enabled: z.boolean(),
  nameAr: categoryNameSchema,
  nameEn: categoryNameSchema,
});

export const categoryFormDataSchema = categoryFormSchema.extend({
  enabled: z
    .enum(["true", "false"], {
      error: "Choose whether this category is enabled.",
    })
    .transform((value) => value === "true"),
});

export const categoryIdSchema = z.string().uuid("Invalid category.");

export const categoryOrderSchema = z.object({
  ids: z.array(categoryIdSchema).min(1, "Add at least one category to reorder."),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
