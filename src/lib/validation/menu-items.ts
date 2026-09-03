import { z } from "zod";

const itemNameSchema = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .max(160, "Use 160 characters or fewer.");

const descriptionSchema = z
  .string()
  .trim()
  .max(1_000, "Use 1,000 characters or fewer.");

// Do not accept exponential notation or more than two fractional digits. This
// is the exact input range representable by PostgreSQL numeric(10,2).
const priceSchema = z
  .string()
  .trim()
  .regex(
    /^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/,
    "Enter a non-negative price with at most two decimal places.",
  );

export const maxMenuImageBytes = 5 * 1024 * 1024;

export const menuImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const menuItemFormSchema = z.object({
  available: z.boolean(),
  categoryId: z.string().uuid("Choose a valid category."),
  descriptionAr: descriptionSchema,
  descriptionEn: descriptionSchema,
  nameAr: itemNameSchema,
  nameEn: itemNameSchema,
  price: priceSchema,
  removeImage: z.boolean(),
});

export const menuItemFormDataSchema = menuItemFormSchema.extend({
  available: z.enum(["true", "false"]).transform((value) => value === "true"),
  removeImage: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export const menuImageSchema = z
  .instanceof(File, { error: "Choose a valid image file." })
  .nullable()
  .superRefine((file, context) => {
    if (!file) {
      return;
    }

    if (
      !menuImageMimeTypes.includes(
        file.type as (typeof menuImageMimeTypes)[number],
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "Choose a JPEG, PNG, WebP, or AVIF image.",
      });
    }

    if (file.size > maxMenuImageBytes) {
      context.addIssue({
        code: "custom",
        message: "Choose an image that is 5 MiB or smaller.",
      });
    }

    if (file.size === 0) {
      context.addIssue({
        code: "custom",
        message: "Choose a non-empty image file.",
      });
    }
  });

export const menuItemClientFormSchema = menuItemFormSchema.extend({
  image: menuImageSchema,
});

export const menuItemIdSchema = z.string().uuid("Invalid menu item.");

export const menuItemAvailabilitySchema = z.object({
  available: z.boolean(),
  itemId: menuItemIdSchema,
});

export const menuItemOrderSchema = z.object({
  categoryId: z.string().uuid("Invalid category."),
  ids: z
    .array(menuItemIdSchema)
    .min(1, "Add at least one menu item to reorder."),
});

export type MenuItemFormValues = z.infer<typeof menuItemClientFormSchema>;

export function validateMenuImage(file: File | null): string | null {
  const result = menuImageSchema.safeParse(file);
  return result.success
    ? null
    : (result.error.issues[0]?.message ?? "Choose a valid image file.");
}
