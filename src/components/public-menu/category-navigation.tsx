"use client";

import { useEffect, useState } from "react";

export type CategoryNavigationItem = {
  id: string;
  label: string;
};

type CategoryNavigationProps = {
  ariaLabel: string;
  categories: CategoryNavigationItem[];
};

function categorySectionId(id: string) {
  return `category-${id}`;
}

export function CategoryNavigation({
  ariaLabel,
  categories,
}: CategoryNavigationProps) {
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.id ?? null,
  );

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
    </nav>
  );
}
