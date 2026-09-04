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
import {
  ChevronDown,
  GripVertical,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  deleteCategory,
  reorderCategories,
  saveCategory,
  toggleCategoryEnabled,
  type CategoryActionState,
} from "@/app/(admin)/admin/categories/actions";
import { useAdminMutationToast } from "@/components/admin/admin-toast-provider";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { AdminCategory } from "@/lib/data/admin-categories";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/lib/validation/categories";
import { cn } from "@/lib/utils";

type CategoryManagerProps = {
  categories: AdminCategory[];
};

type SortableCategoryProps = {
  category: AdminCategory;
  isBusy: boolean;
  onDelete: (category: AdminCategory) => void;
  onEdit: (category: AdminCategory) => void;
  onToggle: (category: AdminCategory) => void;
};

const blankCategoryValues: CategoryFormValues = {
  enabled: true,
  nameAr: "",
  nameEn: "",
};

function firstError(errors: string[] | undefined): string | undefined {
  return errors?.[0];
}

function SortableCategory({
  category,
  isBusy,
  onDelete,
  onEdit,
  onToggle,
}: SortableCategoryProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "grid gap-3 rounded-xl border bg-background p-3 shadow-xs sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-4",
        isDragging && "relative z-10 border-primary/40 opacity-70 shadow-md",
      )}
    >
      <button
        type="button"
        className="flex min-h-11 w-full cursor-grab items-center justify-center rounded-md border bg-muted text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing sm:size-9 sm:min-h-0 sm:w-9"
        aria-label={`Reorder ${category.nameEn}`}
        disabled={isBusy}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden="true" />
        <span className="sr-only">Use Space then arrow keys to reorder.</span>
      </button>

      <div className="min-w-0">
        <p className="truncate font-medium">{category.nameEn}</p>
        <p
          dir="rtl"
          lang="ar"
          className="mt-1 truncate text-sm text-muted-foreground"
        >
          {category.nameAr}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <div className="flex min-h-8 items-center gap-2 px-1">
          <span
            className={cn(
              "text-xs font-medium",
              category.enabled
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-muted-foreground",
            )}
          >
            {category.enabled ? "Enabled" : "Disabled"}
          </span>
          <Switch
            checked={category.enabled}
            aria-label={`Show ${category.nameEn} on the public menu`}
            disabled={isBusy}
            onCheckedChange={() => onToggle(category)}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${category.nameEn}`}
          disabled={isBusy}
          onClick={() => onEdit(category)}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${category.nameEn}`}
          disabled={isBusy}
          onClick={() => onDelete(category)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [orderedCategories, setOrderedCategories] = useState(categories);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null | undefined>(undefined);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<AdminCategory | null>(null);
  const [saveState, setSaveState] = useState<CategoryActionState>({});
  const [deleteState, setDeleteState] = useState<CategoryActionState>({});
  const { mutation } = useAdminMutationToast();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<CategoryFormValues>({
    defaultValues: blankCategoryValues,
    resolver: zodResolver(categoryFormSchema),
  });

  useEffect(() => {
    if (editingCategory === undefined) {
      return;
    }

    reset(
      editingCategory
        ? {
            enabled: editingCategory.enabled,
            nameAr: editingCategory.nameAr,
            nameEn: editingCategory.nameEn,
          }
        : blankCategoryValues,
    );
  }, [editingCategory, reset]);

  function openNewCategory() {
    setEditingCategory(null);
  }

  function openEditCategory(category: AdminCategory) {
    setEditingCategory(category);
  }

  function closeEditor() {
    setEditingCategory(undefined);
  }

  function submitCategory(values: CategoryFormValues) {
    const formData = new FormData();
    formData.set("enabled", String(values.enabled));
    formData.set("nameAr", values.nameAr);
    formData.set("nameEn", values.nameEn);

    if (editingCategory) {
      formData.set("categoryId", editingCategory.id);
    }

    setSaveState({});
    setDeleteState({});
    setIsSaving(true);
    startTransition(async () => {
      const outcome = await mutation(saveCategory({}, formData), {
        loading: {
          description: "Your category is being saved.",
          title: editingCategory ? "Saving category" : "Creating category",
        },
        success: (result) => ({
          description: result.successMessage ?? "Category saved.",
          title: "Category saved",
        }),
      });

      if (outcome.type === "result") {
        setSaveState(outcome.result);
      } else {
        setSaveState({ formError: "Something went wrong. Please try again." });
      }

      if (outcome.type === "result" && outcome.result.status === "success") {
        setEditingCategory(undefined);
      }

      setIsSaving(false);
    });
  }

  function confirmDeleteCategory() {
    if (!categoryToDelete) {
      return;
    }

    setDeleteState({});
    setIsDeleting(true);
    const formData = new FormData();
    formData.set("categoryId", categoryToDelete.id);
    startTransition(async () => {
      const outcome = await mutation(deleteCategory({}, formData), {
        loading: {
          description: "The category is being removed.",
          title: "Deleting category",
        },
        success: (result) => ({
          description: result.successMessage ?? "Category deleted.",
          title: "Category deleted",
        }),
      });

      if (outcome.type === "result") {
        setDeleteState(outcome.result);
      } else {
        setDeleteState({ formError: "Something went wrong. Please try again." });
      }

      if (outcome.type === "result" && outcome.result.status === "success") {
        setEditingCategory(undefined);
        setCategoryToDelete(null);
      }

      setIsDeleting(false);
    });
  }

  function handleToggle(category: AdminCategory) {
    const previousEnabled = category.enabled;
    const nextEnabled = !previousEnabled;

    setIsToggling(category.id);
    setOrderedCategories((current) =>
      current.map((currentCategory) =>
        currentCategory.id === category.id
          ? { ...currentCategory, enabled: nextEnabled }
          : currentCategory,
      ),
    );

    startTransition(async () => {
      const outcome = await mutation(
        toggleCategoryEnabled(category.id, nextEnabled),
        {
          loading: {
            description: "The public-menu visibility is being updated.",
            title: "Updating category",
          },
          success: (result) => ({
            description: result.successMessage ?? "Category visibility updated.",
            title: "Category updated",
          }),
        },
      );

      if (outcome.type !== "result" || outcome.result.status === "error") {
        setOrderedCategories((current) =>
          current.map((currentCategory) =>
            currentCategory.id === category.id
              ? { ...currentCategory, enabled: previousEnabled }
              : currentCategory,
          ),
        );
      }

      setIsToggling(null);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = orderedCategories.findIndex((category) => category.id === active.id);
    const newIndex = orderedCategories.findIndex((category) => category.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const nextCategories = arrayMove(orderedCategories, oldIndex, newIndex);
    setIsOrdering(true);
    setOrderedCategories(nextCategories);

    startTransition(async () => {
      const outcome = await mutation(
        reorderCategories(nextCategories.map((category) => category.id)),
        {
          loading: {
            description: "The category display order is being saved.",
            title: "Saving category order",
          },
          success: (result) => ({
            description: result.successMessage ?? "Category order saved.",
            title: "Category order saved",
          }),
        },
      );

      if (outcome.type !== "result" || outcome.result.status === "error") {
        setOrderedCategories(categories);
      }

      setIsOrdering(false);
    });
  }

  const nameEnError = errors.nameEn?.message ?? firstError(saveState.fieldErrors?.nameEn);
  const nameArError = errors.nameAr?.message ?? firstError(saveState.fieldErrors?.nameAr);
  const isBusy = isSaving || isDeleting || isOrdering || isToggling !== null;

  return (
    <section aria-labelledby="categories-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Menu setup</p>
          <h1 id="categories-title" className="mt-1 text-3xl font-semibold tracking-tight">
            Categories
          </h1>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            Create bilingual menu sections, choose what appears publicly, and drag categories into order.
          </p>
        </div>
        <Button type="button" size="lg" onClick={openNewCategory} disabled={isBusy}>
          <Plus aria-hidden="true" />
          New category
        </Button>
      </div>

      {saveState.formError ? (
        <p role="alert" className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {saveState.formError}
        </p>
      ) : null}
      {deleteState.formError ? (
        <p role="alert" className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {deleteState.formError}
        </p>
      ) : null}

      {editingCategory !== undefined ? (
        <div className="mt-7 rounded-xl border bg-background p-4 shadow-xs sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                {editingCategory ? "Edit category" : "New category"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                English and Arabic names are both required.
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={closeEditor} disabled={isSaving} aria-label="Close category form">
              <ChevronDown aria-hidden="true" />
            </Button>
          </div>

          <form noValidate onSubmit={handleSubmit(submitCategory)} className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category-name-en" className="text-sm font-medium">
                English name
              </label>
              <input
                {...register("nameEn")}
                id="category-name-en"
                autoComplete="off"
                aria-describedby={nameEnError ? "category-name-en-error" : undefined}
                aria-invalid={Boolean(nameEnError)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                placeholder="e.g. Starters"
              />
              {nameEnError ? <p id="category-name-en-error" className="text-sm text-destructive">{nameEnError}</p> : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="category-name-ar" className="text-sm font-medium">
                Arabic name
              </label>
              <input
                {...register("nameAr")}
                id="category-name-ar"
                dir="rtl"
                lang="ar"
                autoComplete="off"
                aria-describedby={nameArError ? "category-name-ar-error" : undefined}
                aria-invalid={Boolean(nameArError)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                placeholder="مثال: المقبلات"
              />
              {nameArError ? <p id="category-name-ar-error" className="text-sm text-destructive">{nameArError}</p> : null}
            </div>
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium sm:col-span-2">
              <input
                {...register("enabled")}
                type="checkbox"
                className="size-4 rounded border-input text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              Show this category on the public menu
            </label>
            <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={closeEditor} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
                {isSaving ? "Saving…" : editingCategory ? "Save changes" : "Create category"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="font-semibold">Display order</h2>
          {isOrdering ? <span className="text-sm text-muted-foreground">Saving order…</span> : null}
        </div>
        {orderedCategories.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-background px-5 py-10 text-center">
            <h2 className="font-semibold">No categories yet</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Create your first menu section to start organizing the public menu.
            </p>
            <Button type="button" className="mt-5" onClick={openNewCategory}>
              <Plus aria-hidden="true" />
              Create category
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              Drag the handle, or use Space and arrow keys while focused on a handle, to change the public-menu order.
            </p>
            <DndContext
              accessibility={{
                screenReaderInstructions: {
                  draggable: "To pick up a category, press Space or Enter. Use the arrow keys to move it, then press Space or Enter to drop it.",
                },
              }}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext items={orderedCategories.map((category) => category.id)} strategy={verticalListSortingStrategy}>
                <ol className="space-y-3">
                  {orderedCategories.map((category) => (
                    <SortableCategory
                      key={category.id}
                      category={category}
                      isBusy={isBusy}
                      onDelete={setCategoryToDelete}
                      onEdit={openEditCategory}
                      onToggle={handleToggle}
                    />
                  ))}
                </ol>
              </SortableContext>
            </DndContext>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Categories with menu items cannot be deleted. Move or remove their items first.
            </p>
          </>
        )}
      </div>

      <AlertDialog
        open={categoryToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold tracking-tight">
              Delete “{categoryToDelete?.nameEn}”?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
              This category will be permanently removed. Categories with menu
              items cannot be deleted; move or delete their items first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDeleteCategory}
            >
              {isDeleting ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : null}
              {isDeleting ? "Deleting…" : "Delete category"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
