# CricCrac Menu — Design System

## Status

This document defines baseline design rules.

It should evolve as visual references and real restaurant branding become available.

Do not treat placeholder colors or styling as permanent restaurant branding.

---

# Design Goal

The customer-facing menu should feel like a polished modern restaurant menu rather than a generic web application.

The food and restaurant identity should be the visual focus.

The design should be:

- clean
- premium
- modern
- visually appetizing
- simple to navigate
- fast
- mobile-first

Avoid making the menu look like:

- a SaaS dashboard
- an admin interface
- an e-commerce marketplace
- a generic shadcn demo

---

# Mobile First

Design the public interface at approximately 375–430px width first.

Then adapt it upward.

Desktop should be an enhanced version of the mobile experience rather than the primary design target.

Avoid desktop-first assumptions.

---

# Touch Targets

Interactive controls should generally provide at least approximately 44px of usable touch area.

Important controls include:

- category selectors
- language switcher
- navigation controls
- buttons

---

# Public Menu Layout

The public menu should generally contain:

1. restaurant branding/header
2. language switcher
3. optional search if later required
4. category navigation
5. menu sections/items

Category navigation should be optimized for quick mobile browsing.

Horizontal scrolling is acceptable for categories.

---

# Food Photography

Food images are an important part of the design.

Images should:

- use consistent ratios
- use `object-fit: cover`
- avoid distortion
- load efficiently
- receive enough visual space to be appetizing

Avoid tiny thumbnail imagery where a stronger visual treatment would work better.

Do not allow images with different dimensions to produce inconsistent card layouts.

---

# Menu Item Hierarchy

The hierarchy should generally be:

1. image
2. item name
3. description
4. price
5. availability information

The item name and price should be quickly scannable.

Descriptions should not overpower item names.

---

# Cards

Avoid excessive boxed UI.

Do not automatically wrap every piece of content inside a bordered card.

Use:

- whitespace
- typography
- image treatment
- subtle separation

before adding borders and shadows.

Where cards are used:

- corner radius should be consistent
- shadows should remain subtle
- unnecessary decoration should be avoided

---

# Typography

English currently uses Geist as the application baseline.

The final Arabic font should be selected specifically for Arabic readability and restaurant branding.

Arabic and English typography do not need to use the same font family.

Priorities:

- readability
- strong menu item names
- comfortable descriptions
- visible pricing
- proper Arabic rendering

Avoid excessive font weights and sizes.

---

# Arabic / RTL

Arabic is a first-class interface, not an afterthought.

When Arabic is active:

- page direction becomes RTL
- appropriate text aligns according to RTL conventions
- layout ordering mirrors where appropriate
- directional icons mirror where appropriate
- spacing remains visually balanced

Do not simply translate strings and keep an English LTR layout.

Arabic should feel intentionally designed.

---

# Language Switching

Switching between English and Arabic should be obvious and fast.

Avoid a complicated language selector.

Examples:

English interface:
`العربية`

Arabic interface:
`English`

or another similarly clear treatment.

---

# Colors

Restaurant branding colors will be defined later.

Until branding is finalized:

- use neutral foundations
- maintain strong text contrast
- use one primary accent
- avoid unnecessary rainbow color usage

Do not hard-code branding colors throughout components.

Use CSS variables/design tokens.

---

# Icons

Use Lucide icons.

Icons should support comprehension rather than decoration.

Do not place icons everywhere simply because they are available.

Directional icons must behave correctly in RTL.

---

# Animation

Animations should feel subtle and responsive.

Good candidates include:

- category transitions
- dialogs
- availability changes in CMS
- lightweight image/content entrance where appropriate

Avoid:

- excessive page animations
- long transitions
- distracting movement
- animation that delays interaction

---

# Loading States

Avoid blank screens.

Appropriate loading states may include:

- skeleton menu items
- image placeholders
- compact loading indicators

Prevent major layout shifting while images load.

---

# Empty States

CMS empty states should explain the next action.

Example:

"No menu items yet."

followed by:

"Add menu item"

Do not show technical database-oriented language to restaurant administrators.

---

# Admin CMS

The admin application prioritizes usability over visual experimentation.

Use shadcn/ui extensively here.

The CMS should feel:

- structured
- clean
- fast
- predictable

Typical UI elements include:

- sidebar/navigation
- tables or item lists
- forms
- dialogs
- dropdown menus
- switches
- tabs where appropriate
- toast notifications

Do not force the public restaurant design language onto every CMS screen.

---

# Forms

Form fields need persistent labels.

Do not rely only on placeholders.

Validation messages should clearly explain what needs correction.

English and Arabic content fields should be easy to distinguish.

---

# Responsive Admin

The CMS should primarily work well on desktop and tablet.

It should remain usable on mobile, but mobile CMS usage is secondary to customer mobile menu quality.

---

# Accessibility

Maintain:

- sufficient contrast
- keyboard-accessible CMS controls
- focus indicators
- semantic markup
- accessible labels
- suitable touch sizes
- meaningful image alternative text

---

# Design QA

When implementing major customer-facing UI:

1. inspect the page at mobile width
2. inspect Arabic RTL
3. inspect English LTR
4. inspect a long item name
5. inspect a long description
6. inspect missing images
7. inspect unavailable items
8. inspect multiple categories
9. inspect loading states
10. inspect desktop layout

A design task is not complete merely because the page compiles.