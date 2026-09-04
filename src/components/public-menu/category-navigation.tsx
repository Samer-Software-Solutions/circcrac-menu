"use client";

import { useEffect, useRef, useState } from "react";

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

function toIndexLabel(position: number) {
  return String(position).padStart(2, "0");
}

export function CategoryNavigation({
  ariaLabel,
  categories,
}: CategoryNavigationProps) {
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.id ?? null,
  );
  const progressRef = useRef<HTMLDivElement>(null);

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

  // Reading-progress fill: written straight to the DOM via a ref rather than
  // React state, since it changes on every scroll tick and doesn't need to
  // trigger a render.
  useEffect(() => {
    let frame = 0;

    function updateProgress() {
      frame = 0;
      const root = document.documentElement;
      const scrollable = root.scrollHeight - root.clientHeight;
      const progress = scrollable > 0 ? (root.scrollTop / scrollable) * 100 : 0;

      if (progressRef.current) {
        progressRef.current.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(updateProgress);
    }

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

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
    <nav aria-label={ariaLabel} className="menu-nav">
      <div ref={progressRef} className="menu-nav-progress" aria-hidden="true" />
      <div className="menu-nav-scroll">
        {categories.map((category, index) => {
          const isActive = activeCategory === category.id;

          return (
            <a
              key={category.id}
              href={`#${categorySectionId(category.id)}`}
              aria-current={isActive ? "location" : undefined}
              className="menu-nav-item"
              onClick={(event) => {
                event.preventDefault();
                selectCategory(category.id);
              }}
            >
              <span className="menu-nav-index" aria-hidden="true">
                {toIndexLabel(index + 1)}
              </span>
              <span className="menu-nav-label">{category.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
