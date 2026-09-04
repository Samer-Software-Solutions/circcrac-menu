"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export type CategoryNavigationItem = {
  id: string;
  label: string;
};

type CategoryNavigationProps = {
  ariaLabel: string;
  categories: CategoryNavigationItem[];
  closeQuickJumpLabel: string;
  openQuickJumpLabel: string;
  quickJumpTitle: string;
};

function categorySectionId(id: string) {
  return `category-${id}`;
}

export function CategoryNavigation({
  ariaLabel,
  categories,
  closeQuickJumpLabel,
  openQuickJumpLabel,
  quickJumpTitle,
}: CategoryNavigationProps) {
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.id ?? null,
  );
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState(false);

  useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(categorySectionId(category.id)))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);

        const visibleSection = visibleSections[0];

        if (visibleSection) {
          setActiveCategory(
            visibleSection.target.id.replace(/^category-/, ""),
          );
        }
      },
      { rootMargin: "-112px 0px -30% 0px", threshold: 0 },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [categories]);

  function selectCategory(id: string) {
    setActiveCategory(id);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document
      .getElementById(categorySectionId(id))
      ?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
  }

  return (
    <nav aria-label={ariaLabel} className="menu-category-nav">
      <div className="menu-category-bar">
        <DialogPrimitive.Root open={isQuickJumpOpen} onOpenChange={setIsQuickJumpOpen}>
          <DialogPrimitive.Trigger
            aria-label={openQuickJumpLabel}
            className="inline-flex size-11 flex-none items-center justify-center rounded-full border border-stone-900/10 bg-white/85 text-stone-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
          >
            <Menu className="size-5" aria-hidden="true" />
          </DialogPrimitive.Trigger>

          <DialogPrimitive.Portal>
            <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-[1px] transition-opacity duration-200 ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
            <DialogPrimitive.Popup className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl shadow-stone-950/20 outline-none transition-transform duration-200 ease-out motion-reduce:transition-none data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full">
              <div
                className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-stone-300"
                aria-hidden="true"
              />
              <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
                <DialogPrimitive.Title className="text-base font-semibold tracking-[-0.01em] text-stone-900">
                  {quickJumpTitle}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  aria-label={closeQuickJumpLabel}
                  className="inline-flex size-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
                >
                  <X className="size-5" aria-hidden="true" />
                </DialogPrimitive.Close>
              </div>
              <ul className="overflow-y-auto px-3 pb-3">
                {categories.map((category) => {
                  const isActive = activeCategory === category.id;

                  return (
                    <li key={category.id}>
                      <button
                        type="button"
                        aria-current={isActive ? "location" : undefined}
                        className={`flex min-h-12 w-full items-center rounded-xl px-3 text-start text-[0.95rem] font-medium transition-colors ${
                          isActive
                            ? "bg-stone-100 text-[var(--menu-brand)]"
                            : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                        }`}
                        onClick={() => {
                          selectCategory(category.id);
                          setIsQuickJumpOpen(false);
                        }}
                      >
                        {category.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </DialogPrimitive.Popup>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

        <div className="menu-category-scroll">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;

            return (
              <a
                key={category.id}
                href={`#${categorySectionId(category.id)}`}
                aria-current={isActive ? "location" : undefined}
                className="menu-category-link"
                onClick={(event) => {
                  event.preventDefault();
                  selectCategory(category.id);
                }}
              >
                {category.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
