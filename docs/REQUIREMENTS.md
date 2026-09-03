# CricCrac Menu — Product Requirements

## 1. Purpose

CricCrac Menu is a web-based digital restaurant menu accessed primarily through a QR code placed inside the restaurant.

The application is built for one restaurant only.

Customers scan the QR code and immediately access the restaurant menu through their mobile browser.

No application installation or customer account is required.

---

# 2. Public Menu

## 2.1 QR Access

Customers must be able to scan a QR code and open the public menu.

The QR code should point to the restaurant's permanent menu URL.

Example:

`https://menu.example.com`

---

## 2.2 Mobile First

The public menu must be designed mobile-first.

The primary target is a modern smartphone.

The interface must also remain usable on:

* tablets
* laptops
* desktops

Mobile usability takes priority over desktop-specific design.

---

## 2.3 Languages

The public menu must support:

* English
* Arabic

Customers must be able to switch languages easily.

Arabic must use proper right-to-left layout.

The selected language should persist when reasonably possible.

---

## 2.4 Categories

Customers must be able to browse menu categories.

Examples may include:

* Starters
* Main Courses
* Burgers
* Desserts
* Drinks

Categories must support:

* English name
* Arabic name
* ordering
* enabled/disabled state

Only enabled categories should appear publicly.

---

## 2.5 Menu Items

Each menu item may contain:

* English name
* Arabic name
* English description
* Arabic description
* price
* image
* category
* availability
* display order

The public menu should clearly communicate when an item is unavailable.

Unavailable items may remain visible but must not appear normally available.

---

## 2.6 Prices

Prices must be displayed clearly.

The restaurant currency is configured through application settings.

The CMS administrator must be able to modify menu prices.

---

## 2.7 Images

Menu items may contain food images.

Images should:

* load efficiently
* display consistently
* be visually prominent
* maintain a consistent aspect ratio

Missing images must not break the menu layout.

---

## 2.8 Navigation

Customers should be able to move between categories quickly.

The preferred interaction is a mobile-friendly category navigation bar.

Category navigation may remain visible while scrolling if this improves usability.

---

## 2.9 Customer Authentication

Customer authentication is not required.

Anyone with the public menu URL can view the menu.

---

# 3. Admin CMS

## 3.1 Authentication

The CMS must require administrator authentication.

Unauthenticated visitors must not access protected admin functionality.

---

## 3.2 Category Management

Administrators must be able to:

* create categories
* edit categories
* delete categories
* enable categories
* disable categories
* reorder categories

Category fields include:

* English name
* Arabic name
* display order
* enabled state

---

## 3.3 Menu Item Management

Administrators must be able to:

* create menu items
* edit menu items
* delete menu items
* change prices
* change descriptions
* change names
* assign categories
* upload images
* replace images
* remove images
* change availability
* reorder items

---

## 3.4 Bilingual Content

CMS forms must allow administrators to manage English and Arabic content independently.

Required bilingual fields include:

* category names
* item names

Optional bilingual content includes:

* item descriptions

---

## 3.5 Availability

Administrators must be able to mark an item:

* available
* unavailable

Changing availability should not require deleting the item.

---

## 3.6 Ordering

Administrators must be able to define:

* category order
* item order within categories

Drag-and-drop may be used when appropriate.

---

# 4. Restaurant Settings

Administrators must be able to manage basic restaurant settings.

Settings include:

* restaurant English name
* restaurant Arabic name
* logo
* currency
* primary brand color
* default language

Additional branding settings may be added only when needed.

---

# 5. QR Code

The CMS must provide a QR code for the public menu URL.

The QR code should support:

* restaurant logo
* PNG export
* SVG export
* high-resolution output suitable for printing

QR customization must preserve reliable scanning.

The public URL encoded into the QR code should remain stable.

---

# 6. Performance

The public menu should load quickly on mobile connections.

Performance priorities include:

* optimized images
* minimal unnecessary JavaScript
* server rendering where appropriate
* caching where appropriate
* lazy loading content below the fold where useful

---

# 7. Accessibility

The interface should follow common accessibility practices.

Requirements include:

* readable text
* sufficient contrast
* appropriately sized touch targets
* accessible form labels
* keyboard accessibility in the CMS
* meaningful alternative text where appropriate

---

# 8. Out of Scope

The following features are explicitly out of scope:

* online ordering
* shopping cart
* payments
* delivery
* reservations
* customer accounts
* customer loyalty systems
* multiple restaurants
* restaurant branches
* SaaS subscriptions
* restaurant switching
* tenant management
* organization management

These features must not be implemented unless the project requirements explicitly change.
