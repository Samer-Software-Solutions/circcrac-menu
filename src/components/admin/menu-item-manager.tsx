"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  ChevronDown,
  GripVertical,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  deleteMenuItem,
  reorderMenuItems,
  saveMenuItem,
  toggleMenuItemAvailability,
  type MenuItemActionState,
} from "@/app/(admin)/admin/items/actions";
import { useAdminMutationToast } from "@/components/admin/admin-toast-provider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type {
  AdminMenuCategory,
  AdminMenuItem,
} from "@/lib/data/admin-menu-items";
import {
  menuItemClientFormSchema,
  type MenuItemFormValues,
  validateMenuImage,
} from "@/lib/validation/menu-items";
import { cn } from "@/lib/utils";

type MenuItemManagerProps = {
  categories: AdminMenuCategory[];
  items: AdminMenuItem[];
};

type SortableItemProps = {
  item: AdminMenuItem;
  isBusy: boolean;
  onDelete: (item: AdminMenuItem) => void;
  onEdit: (item: AdminMenuItem) => void;
  onToggle: (item: AdminMenuItem) => void;
};

const blankMenuItemValues: MenuItemFormValues = {
  available: true,
  categoryId: "",
  descriptionAr: "",
  descriptionEn: "",
  nameAr: "",
  nameEn: "",
  price: "",
  removeImage: false,
  image: null,
};

function firstError(errors: string[] | undefined): string | undefined {
  return errors?.[0];
}

function SortableItem({
  item,
  isBusy,
  onDelete,
  onEdit,
  onToggle,
}: SortableItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "grid gap-3 rounded-xl border bg-background p-3 shadow-xs sm:grid-cols-[auto_auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-4",
        isDragging && "relative z-10 border-primary/40 opacity-70 shadow-md",
      )}
    >
      <button
        type="button"
        className="flex min-h-11 w-full cursor-grab items-center justify-center rounded-md border bg-muted text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing sm:size-9 sm:min-h-0 sm:w-9"
        aria-label={`Reorder ${item.nameEn}`}
        disabled={isBusy}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden="true" />
        <span className="sr-only">Use Space then arrow keys to reorder.</span>
      </button>
      <div className="relative aspect-square w-14 overflow-hidden rounded-lg bg-muted sm:w-16">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <ImagePlus
            className="absolute inset-0 m-auto size-5 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="truncate font-medium">{item.nameEn}</p>
          <span className="font-medium text-muted-foreground">
            {item.price.toFixed(2)}
          </span>
        </div>
        <p
          dir="rtl"
          lang="ar"
          className="mt-1 truncate text-sm text-muted-foreground"
        >
          {item.nameAr}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <div className="flex min-h-8 items-center gap-2 px-1">
          <span
            className={cn(
              "text-xs font-medium",
              item.available
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-muted-foreground",
            )}
          >
            {item.available ? "Available" : "Unavailable"}
          </span>
          <Switch
            checked={item.available}
            aria-label={`${item.nameEn} availability on the public menu`}
            disabled={isBusy}
            onCheckedChange={() => onToggle(item)}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${item.nameEn}`}
          disabled={isBusy}
          onClick={() => onEdit(item)}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${item.nameEn}`}
          disabled={isBusy}
          onClick={() => onDelete(item)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}

export function MenuItemManager({ categories, items }: MenuItemManagerProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [editingItem, setEditingItem] = useState<
    AdminMenuItem | null | undefined
  >(undefined);
  const [isOrdering, setIsOrdering] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<MenuItemActionState>({});
  const [deleteState, setDeleteState] = useState<MenuItemActionState>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const { mutation } = useAdminMutationToast();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<MenuItemFormValues>({
    defaultValues: blankMenuItemValues,
    resolver: zodResolver(menuItemClientFormSchema),
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearImagePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  }

  function clearSelectedImage() {
    clearImagePreview();
    setFileInputKey((current) => current + 1);
    setValue("image", null, { shouldValidate: true });
  }

  function selectImage(image: File | null) {
    clearImagePreview();
    if (image) {
      const nextPreviewUrl = URL.createObjectURL(image);
      setPreviewUrl(nextPreviewUrl);
    }
    setValue("image", image, { shouldValidate: true });
  }

  function openNewItem() {
    setWarning(null);
    reset(blankMenuItemValues);
    clearSelectedImage();
    setRemoveImage(false);
    setEditingItem(null);
  }

  function openEditItem(item: AdminMenuItem) {
    setWarning(null);
    reset({
      available: item.available,
      categoryId: item.categoryId,
      descriptionAr: item.descriptionAr ?? "",
      descriptionEn: item.descriptionEn ?? "",
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      price: item.price.toFixed(2),
      removeImage: false,
      image: null,
    });
    clearSelectedImage();
    setRemoveImage(false);
    setEditingItem(item);
  }

  function closeEditor() {
    clearSelectedImage();
    setRemoveImage(false);
    setEditingItem(undefined);
  }

  function submitItem(values: MenuItemFormValues) {
    const imageError = validateMenuImage(values.image ?? null);
    if (imageError) {
      setError("image", { message: imageError });
      return;
    }
    const formData = new FormData();
    formData.set("available", String(values.available));
    formData.set("categoryId", values.categoryId);
    formData.set("descriptionAr", values.descriptionAr);
    formData.set("descriptionEn", values.descriptionEn);
    formData.set("nameAr", values.nameAr);
    formData.set("nameEn", values.nameEn);
    formData.set("price", values.price);
    formData.set("removeImage", String(values.removeImage));
    if (values.image) {
      formData.set("image", values.image);
    }
    if (editingItem) {
      formData.set("itemId", editingItem.id);
    }

    setSaveState({});
    setDeleteState({});
    setIsSaving(true);
    startTransition(async () => {
      const outcome = await mutation(saveMenuItem({}, formData), {
        loading: {
          description: "Your menu item is being saved.",
          title: editingItem ? "Saving menu item" : "Creating menu item",
        },
        success: (result) => ({
          description: result.successMessage ?? "Menu item saved.",
          title: "Menu item saved",
        }),
      });
      if (outcome.type === "result") {
        setSaveState(outcome.result);
      } else {
        setSaveState({ formError: "Something went wrong. Please try again." });
      }
      if (outcome.type === "result" && outcome.result.status === "success") {
        setWarning(outcome.result.warning ?? null);
        clearSelectedImage();
        setEditingItem(undefined);
      }
      setIsSaving(false);
    });
  }

  function handleDelete(item: AdminMenuItem) {
    if (!window.confirm(`Delete “${item.nameEn}”? This cannot be undone.`)) {
      return;
    }
    setWarning(null);
    setDeleteState({});
    setIsDeleting(true);
    const formData = new FormData();
    formData.set("itemId", item.id);
    startTransition(async () => {
      const outcome = await mutation(deleteMenuItem({}, formData), {
        loading: {
          description: "The menu item is being removed.",
          title: "Deleting menu item",
        },
        success: (result) => ({
          description: result.successMessage ?? "Menu item deleted.",
          title: "Menu item deleted",
        }),
      });
      if (outcome.type === "result") {
        setDeleteState(outcome.result);
      } else {
        setDeleteState({ formError: "Something went wrong. Please try again." });
      }
      if (outcome.type === "result" && outcome.result.status === "success") {
        setWarning(outcome.result.warning ?? null);
        clearSelectedImage();
        setEditingItem(undefined);
      }
      setIsDeleting(false);
    });
  }

  function handleToggle(item: AdminMenuItem) {
    const previousAvailable = item.available;
    const nextAvailable = !previousAvailable;
    setWarning(null);
    setIsToggling(item.id);
    setOrderedItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id
          ? { ...currentItem, available: nextAvailable }
          : currentItem,
      ),
    );
    startTransition(async () => {
      const outcome = await mutation(
        toggleMenuItemAvailability(item.id, nextAvailable),
        {
          loading: {
            description: "The public-menu availability is being updated.",
            title: "Updating menu item",
          },
          success: (result) => ({
            description: result.successMessage ?? "Menu item availability updated.",
            title: "Menu item updated",
          }),
        },
      );
      if (outcome.type !== "result" || outcome.result.status === "error") {
        setOrderedItems((current) =>
          current.map((currentItem) =>
            currentItem.id === item.id
              ? { ...currentItem, available: previousAvailable }
              : currentItem,
          ),
        );
      }
      setIsToggling(null);
    });
  }

  function handleDragEnd(categoryId: string, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const categoryItems = orderedItems.filter(
      (item) => item.categoryId === categoryId,
    );
    const oldIndex = categoryItems.findIndex((item) => item.id === active.id);
    const newIndex = categoryItems.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const nextCategoryItems = arrayMove(categoryItems, oldIndex, newIndex);
    const previousItems = orderedItems;
    const nextItems = orderedItems.map(
      (item) =>
        nextCategoryItems.find((nextItem) => nextItem.id === item.id) ?? item,
    );
    // Rebuild the affected category in its exact new order while retaining the
    // category sequence supplied by the server.
    const rebuiltItems = categories.flatMap((category) =>
      category.id === categoryId
        ? nextCategoryItems
        : nextItems.filter((item) => item.categoryId === category.id),
    );
    setWarning(null);
    setIsOrdering(categoryId);
    setOrderedItems(rebuiltItems);
    startTransition(async () => {
      const outcome = await mutation(
        reorderMenuItems(
          categoryId,
          nextCategoryItems.map((item) => item.id),
        ),
        {
          loading: {
            description: "The menu item order is being saved.",
            title: "Saving menu item order",
          },
          success: (result) => ({
            description: result.successMessage ?? "Menu item order saved.",
            title: "Menu item order saved",
          }),
        },
      );
      if (outcome.type !== "result" || outcome.result.status === "error") {
        setOrderedItems(previousItems);
      }
      setIsOrdering(null);
    });
  }

  const fieldError = (
    name:
      | "categoryId"
      | "descriptionAr"
      | "descriptionEn"
      | "nameAr"
      | "nameEn"
      | "price",
  ) => errors[name]?.message ?? firstError(saveState.fieldErrors?.[name]);
  const imageError = errors.image?.message;
  const isBusy =
    isSaving || isDeleting || isOrdering !== null || isToggling !== null;
  const existingPreview = editingItem?.imageUrl ?? null;
  const displayedPreview = previewUrl ?? (removeImage ? null : existingPreview);

  return (
    <section aria-labelledby="items-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Menu setup
          </p>
          <h1
            id="items-title"
            className="mt-1 text-3xl font-semibold tracking-tight"
          >
            Menu items
          </h1>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            Manage bilingual dishes, pricing, images, availability, and order
            within each category.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={openNewItem}
          disabled={isBusy || categories.length === 0}
        >
          <Plus aria-hidden="true" />
          New menu item
        </Button>
      </div>

      {categories.length === 0 ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-foreground"
        >
          Create a category before adding menu items.
        </p>
      ) : null}
      {warning ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-foreground"
        >
          {warning}
        </p>
      ) : null}
      {saveState.formError ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {saveState.formError}
        </p>
      ) : null}
      {deleteState.formError ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {deleteState.formError}
        </p>
      ) : null}

      {editingItem !== undefined ? (
        <div className="mt-7 rounded-xl border bg-background p-4 shadow-xs sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                {editingItem ? "Edit menu item" : "New menu item"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                English and Arabic names are required. Descriptions and an image
                are optional.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={closeEditor}
              disabled={isSaving}
              aria-label="Close menu item form"
            >
              <ChevronDown aria-hidden="true" />
            </Button>
          </div>
          <form
            noValidate
            onSubmit={handleSubmit(submitItem)}
            className="mt-5 grid gap-5 sm:grid-cols-2"
          >
            <div className="space-y-2">
              <label htmlFor="item-name-en" className="text-sm font-medium">
                English name
              </label>
              <input
                {...register("nameEn")}
                id="item-name-en"
                autoComplete="off"
                aria-describedby={
                  fieldError("nameEn") ? "item-name-en-error" : undefined
                }
                aria-invalid={Boolean(fieldError("nameEn"))}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                placeholder="e.g. Truffle burger"
              />
              {fieldError("nameEn") ? (
                <p id="item-name-en-error" className="text-sm text-destructive">
                  {fieldError("nameEn")}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="item-name-ar" className="text-sm font-medium">
                Arabic name
              </label>
              <input
                {...register("nameAr")}
                id="item-name-ar"
                dir="rtl"
                lang="ar"
                autoComplete="off"
                aria-describedby={
                  fieldError("nameAr") ? "item-name-ar-error" : undefined
                }
                aria-invalid={Boolean(fieldError("nameAr"))}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                placeholder="مثال: برغر بالكمأة"
              />
              {fieldError("nameAr") ? (
                <p id="item-name-ar-error" className="text-sm text-destructive">
                  {fieldError("nameAr")}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="item-description-en"
                className="text-sm font-medium"
              >
                English description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                {...register("descriptionEn")}
                id="item-description-en"
                rows={4}
                aria-describedby={
                  fieldError("descriptionEn")
                    ? "item-description-en-error"
                    : undefined
                }
                aria-invalid={Boolean(fieldError("descriptionEn"))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
              />
              {fieldError("descriptionEn") ? (
                <p
                  id="item-description-en-error"
                  className="text-sm text-destructive"
                >
                  {fieldError("descriptionEn")}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="item-description-ar"
                className="text-sm font-medium"
              >
                Arabic description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                {...register("descriptionAr")}
                id="item-description-ar"
                dir="rtl"
                lang="ar"
                rows={4}
                aria-describedby={
                  fieldError("descriptionAr")
                    ? "item-description-ar-error"
                    : undefined
                }
                aria-invalid={Boolean(fieldError("descriptionAr"))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
              />
              {fieldError("descriptionAr") ? (
                <p
                  id="item-description-ar-error"
                  className="text-sm text-destructive"
                >
                  {fieldError("descriptionAr")}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="item-category" className="text-sm font-medium">
                Category
              </label>
              <select
                {...register("categoryId")}
                id="item-category"
                aria-describedby={
                  fieldError("categoryId") ? "item-category-error" : undefined
                }
                aria-invalid={Boolean(fieldError("categoryId"))}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nameEn} — {category.nameAr}
                  </option>
                ))}
              </select>
              {fieldError("categoryId") ? (
                <p
                  id="item-category-error"
                  className="text-sm text-destructive"
                >
                  {fieldError("categoryId")}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="item-price" className="text-sm font-medium">
                Price
              </label>
              <input
                {...register("price")}
                id="item-price"
                inputMode="decimal"
                autoComplete="off"
                aria-describedby={
                  fieldError("price") ? "item-price-error" : "item-price-help"
                }
                aria-invalid={Boolean(fieldError("price"))}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                placeholder="0.00"
              />
              {fieldError("price") ? (
                <p id="item-price-error" className="text-sm text-destructive">
                  {fieldError("price")}
                </p>
              ) : (
                <p
                  id="item-price-help"
                  className="text-xs text-muted-foreground"
                >
                  Use up to two decimal places.
                </p>
              )}
            </div>
            <div className="space-y-3 sm:col-span-2">
              <div className="flex flex-wrap items-center gap-4">
                <label htmlFor="item-image" className="text-sm font-medium">
                  Food image{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <input
                  key={fileInputKey}
                  id="item-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  aria-describedby={
                    imageError ? "item-image-error" : "item-image-help"
                  }
                  aria-invalid={Boolean(imageError)}
                  onChange={(event) => {
                    selectImage(event.target.files?.[0] ?? null);
                  }}
                  className="block max-w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-accent"
                />
              </div>
              <p id="item-image-help" className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, or AVIF only. Maximum 5 MiB.
              </p>
              {imageError ? (
                <p id="item-image-error" className="text-sm text-destructive">
                  {imageError}
                </p>
              ) : null}
              {displayedPreview ? (
                <div className="relative mt-3 aspect-[4/3] max-w-sm overflow-hidden rounded-xl border bg-muted">
                  <Image
                    src={displayedPreview}
                    alt="Selected menu item preview"
                    fill
                    sizes="(max-width: 640px) 100vw, 384px"
                    unoptimized={displayedPreview.startsWith("blob:")}
                    className="object-cover"
                  />
                </div>
              ) : null}
              {editingItem?.imageUrl ? (
                <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(event) => {
                      setRemoveImage(event.target.checked);
                      setValue("removeImage", event.target.checked);
                    }}
                    className="size-4 rounded border-input text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                  Remove current image
                </label>
              ) : null}
            </div>
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium sm:col-span-2">
              <input
                {...register("available")}
                type="checkbox"
                className="size-4 rounded border-input text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              This item is available on the public menu
            </label>
            <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditor}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : null}
                {isSaving
                  ? "Saving…"
                  : editingItem
                    ? "Save changes"
                    : "Create menu item"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="mt-7 space-y-8">
        {items.length === 0 && categories.length > 0 ? (
          <div className="rounded-xl border border-dashed bg-background px-5 py-10 text-center">
            <h2 className="font-semibold">No menu items yet</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Add your first dish, drink, or dessert to start building the menu.
            </p>
            <Button type="button" className="mt-5" onClick={openNewItem}>
              <Plus aria-hidden="true" />
              Create menu item
            </Button>
          </div>
        ) : null}
        {categories.map((category) => {
          const categoryItems = orderedItems.filter(
            (item) => item.categoryId === category.id,
          );
          return (
            <section
              key={category.id}
              aria-labelledby={`category-items-${category.id}`}
            >
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2
                    id={`category-items-${category.id}`}
                    className="text-lg font-semibold"
                  >
                    {category.nameEn}
                  </h2>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="mt-1 text-sm text-muted-foreground"
                  >
                    {category.nameAr}
                  </p>
                </div>
                {isOrdering === category.id ? (
                  <span className="text-sm text-muted-foreground">
                    Saving order…
                  </span>
                ) : null}
              </div>
              {categoryItems.length === 0 ? (
                <p className="rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
                  No items in this category yet.
                </p>
              ) : (
                <>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Drag the handle, or use Space and arrow keys while focused
                    on it, to change this category’s order.
                  </p>
                  <DndContext
                    accessibility={{
                      screenReaderInstructions: {
                        draggable:
                          "To pick up a menu item, press Space or Enter. Use the arrow keys to move it, then press Space or Enter to drop it.",
                      },
                    }}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(category.id, event)}
                    sensors={sensors}
                  >
                    <SortableContext
                      items={categoryItems.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ol className="space-y-3">
                        {categoryItems.map((item) => (
                          <SortableItem
                            key={item.id}
                            item={item}
                            isBusy={isBusy}
                            onDelete={handleDelete}
                            onEdit={openEditItem}
                            onToggle={handleToggle}
                          />
                        ))}
                      </ol>
                    </SortableContext>
                  </DndContext>
                </>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
