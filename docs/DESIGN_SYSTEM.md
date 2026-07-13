# Design System Audit

> Auto-generated audit of the `new-domy` codebase. All values sourced directly from source files — no code was changed.

---

## Table of Contents
1. [Typography / Font Sizes](#1-typography--font-sizes)
2. [Spacing & Padding](#2-spacing--padding)
3. [Color Palette](#3-color-palette)
4. [Max-Width Values](#4-max-width-values)
5. [Animations & Transitions](#5-animations--transitions)
6. [Emojis in Source Code](#6-emojis-in-source-code)
7. [Responsive / Mobile Issues](#7-responsive--mobile-issues)

---

## 1. Typography / Font Sizes

### Font Families

Defined in `tailwind.config.js` and applied globally via `app/globals.css`.

| Token | Font | Applied to |
|-------|------|-----------|
| `font-sora` / `font-heading` | Sora (var(--font-sora)) | All `h1`–`h6` headings (forced via `!important`) |
| `font-manrope` / `font-sans` | Manrope (var(--font-manrope)) | Body, `p`, `div`, `span`, `a`, `button`, `input`, `select`, `textarea`, `label` (forced via `!important`) |

> **Note:** Both rules use `!important` in `globals.css`, indicating past font-inheritance conflicts.

---

### Tailwind Scale — Usage by File

The table below lists every file that uses a Tailwind `text-{size}` class, along with the count of occurrences. Files are sorted by density.

| Occurrences | File |
|------------:|------|
| 156 | `app/page.jsx` |
| 80 | `app/admin/content/page.js` |
| 50 | `app/process/page.js` |
| 45 | `app/regions/page.js` |
| 35 | `app/about/page.js` |
| 33 | `app/properties/[slug]/page.js` |
| 31 | `app/properties/page.js` |
| 30 | `app/regions/[slug]/page.js` |
| 27 | `app/guides/inspections/page.js` |
| 27 | `app/premium/page.js` |
| 26 | `app/dashboard/intake-form/page.js` |
| 25 | `app/clanky/pruvodce-italii/kolik-stoji-dovolena-v-italii-v-roce-2026/page.js` |
| 25 | `app/clanky/pruvodce-italii/nejkrasnejsi-mala-mesta-v-italii/page.js` |
| 21 | `app/blog/page.js` |
| 21 | `app/dashboard/inquiries/page.js` |
| 21 | `app/admin/intake-forms/page.js` |
| 21 | `components/Footer.jsx` |
| 20 | `app/dashboard/page.js` |
| 20 | `app/clanky/pruvodce-italii/kolik-stoji-jidlo-v-italii-v-roce-2026/page.js` |
| 19 | `app/faq/page.js` |
| 19 | `app/guides/rekonstrukce-domu-v-italii/page.js` |
| 19 | `app/guides/mistakes/page.js` |
| 19 | `app/dashboard/content/page.js` |
| 19 | `app/admin/users/page.js` |
| 18 | `app/clanky/pruvodce-italii/jak-cestovat-po-italii-levne/page.js` |
| 18 | `app/guides/notary/page.js` |
| 17 | `app/clanky/pruvodce-italii/page.js` |
| 16 | `app/guides/costs/page.js` |
| 16 | `app/dashboard/webinars/page.js` |
| 15 | `app/admin/inquiries/page.js` |
| 15 | `app/admin/page.js` |
| 14 | `app/guides/inspections/free-pdf/page.js` |
| 14 | `app/dashboard/searches/page.js` |
| 14 | `app/dashboard/recommendations/page.js` |
| 14 | `components/Navigation.js` |
| 14 | `app/admin/club-content/page.js` |
| 13 | `components/RegionCards.js` |
| 11 | `app/dashboard/profile/page.js` |
| 10 | `app/blog/regions/[slug]/page.js` |
| 10 | `app/dashboard/concierge/page.js` |
| 10 | `components/FreePdfUpsellModal.jsx` |
| 9 | `app/dashboard/documents/page.js` |
| 8 | `app/dashboard/layout.js` |
| 8 | `components/RegionBanner.js` |
| 8 | `components/EmailTester.js` |
| 7 | `app/dashboard/favorites/page.js` |
| 6 | `app/guides/page.js` |
| 6 | `app/guides/real-estate-purchase-system-italy/page.js` |
| 6 | `app/guides/offerta-compromesso-registrazione/page.js` |
| 6 | `app/book-call/page.js` |
| 6 | `app/maintenance/page.js` |
| 4 | `app/gdpr/page.js` |
| 4 | `app/cookies/page.js` |
| 4 | `app/terms/page.js` |
| 3 | `components/legal/InformationalDisclaimer.jsx` |
| 3 | `components/ui/input.jsx` |
| 2 | `app/login/page.js` |
| 2 | `app/premium/success/page.js` |
| 2 | `components/ui/textarea.jsx` |
| 1 | `app/dashboard/notifications/page.js` |

---

### UI Primitive Font Sizes (`components/ui/`)

| Component | Size used |
|-----------|-----------|
| `button.jsx` — default | `text-sm` |
| `button.jsx` — size `sm` | `text-xs` |
| `label.jsx` | `text-sm` |
| `dialog.jsx` / `alert-dialog.jsx` — title | `text-lg` |
| `dialog.jsx` / `alert-dialog.jsx` — description | `text-sm` |
| `tooltip.jsx` | `text-xs` |
| `table.jsx` | `text-sm` |
| `tabs.jsx` — trigger | `text-sm` |
| `toast.jsx` — title | `text-sm` |
| `toast.jsx` — description | `text-xs` |
| `form.jsx` — FormDescription, FormMessage | `text-[0.8rem]` |
| `calendar.jsx` | `text-[0.8rem]` |

---

### Arbitrary / Pixel Font Sizes

These bypass the design-system scale and are harder to maintain consistently.

| Class | File(s) |
|-------|---------|
| `text-[10px]` | `app/page.jsx`, `components/Navigation.js`, `app/clanky/pruvodce-italii/page.js` |
| `text-[11px]` | `app/page.jsx`, `app/premium/page.js` |
| `text-[12px]` | `app/page.jsx`, `app/blog/page.js` |
| `text-[13px]` | `app/clanky/.../kolik-stoji-dovolena.../page.js` |
| `text-[14px]` | `app/agenda/page.js` |
| `text-[16px]` | `app/agenda/page.js` |
| `text-[20px]` | `app/agenda/page.js` |
| `text-[30px]` | `app/agenda/page.js` |
| `text-[0.8rem]` | `components/ui/form.jsx`, `components/ui/calendar.jsx` |

---

### Raw CSS Font Sizes (`app/globals.css`)

Applied via `@media (max-width: 480px)`:

| Element | Value |
|---------|-------|
| `h1` | `1.75rem !important` |
| `h2` | `1.5rem !important` |
| `h3` | `1.25rem !important` |

Other raw sizes:
- `14px`, `12px` — `components/PropertyMap.js` (inline map popup HTML template)
- `11` (SVG `font-size`) — `components/PropertyMap.js` (marker label)
- `12px`, `28px` — `lib/emailService.js` (HTML email template)

---

### Responsive Typography

Marketing pages use responsive text scale patterns like:
- `text-3xl sm:text-4xl md:text-5xl`
- `text-base sm:text-lg md:text-2xl`

Heavy usage in: `app/page.jsx`, `app/contact/page.js`, `app/process/page.js`, `app/clanky/pruvodce-italii/page.js`, `app/regions/[slug]/page.js`.

---

## 2. Spacing & Padding

### Container Padding (from `tailwind.config.js`)

| Breakpoint | Padding |
|-----------|---------|
| DEFAULT | `1rem` (16px) |
| `sm` (640px+) | `2rem` (32px) |
| `lg` (1024px+) | `4rem` (64px) |
| `xl` (1280px+) | `5rem` (80px) |
| `2xl` (1400px+) | `6rem` (96px) |

Overridden on mobile via `globals.css`:
- `≤ 768px`: `padding-left/right: 1rem !important`
- `≤ 480px`: `padding-left/right: 0.75rem !important`

---

### Tailwind Spacing Density by File

Count of `p-`, `px-`, `py-`, `pt-`, `pb-`, `m-`, `mx-`, `my-`, `gap-`, `space-x-`, `space-y-` occurrences per file.

| Occurrences | File |
|------------:|------|
| 118 | `app/process/page.js` |
| 109 | `app/admin/content/page.js` |
| 106 | `app/regions/page.js` |
| 99 | `app/properties/page.js` |
| 97 | `app/guides/inspections/page.js` |
| 93 | `app/properties/[slug]/page.js` |
| 82 | `app/guides/notary/page.js` |
| 80 | `app/regions/[slug]/page.js` |
| 71 | `app/about/page.js` |
| 71 | `app/guides/mistakes/page.js` |
| 71 | `app/dashboard/intake-form/page.js` |
| 66 | `app/dashboard/content/page.js` |
| 63 | `app/dashboard/inquiries/page.js` |
| 62 | `components/Navigation.js` |
| 61 | `app/blog/page.js` |
| 59 | `app/admin/intake-forms/page.js` |
| 57 | `app/contact/page.js` |
| 56 | `app/guides/costs/page.js` |
| 56 | `app/dashboard/page.js` |
| 55 | `app/dashboard/recommendations/page.js` |
| 51 | `app/faq/page.js` |
| 46 | `app/dashboard/webinars/page.js` |
| 46 | `app/blog/regions/[slug]/page.js` |
| 45 | `app/dashboard/searches/page.js` |
| 45 | `app/dashboard/concierge/page.js` |
| 42 | `app/admin/users/page.js` |
| 41 | `app/admin/page.js` |
| 40 | `components/Footer.jsx` |
| 39 | `app/agenda/page.js` |
| 39 | `components/EmailTester.js` |
| 39 | `app/dashboard/favorites/page.js` |
| 37 | `app/admin/club-content/page.js` |
| 37 | `app/dashboard/layout.js` |
| 32 | `app/dashboard/documents/page.js` |
| 31 | `components/ui/sidebar.jsx` |
| 29 | `app/dashboard/profile/page.js` |
| 28 | `app/login/page.js` |
| 24 | `components/RegionCards.js` |
| 23 | `components/AuthModal.js` |
| 21 | `components/ui/dropdown-menu.jsx` |
| 20 | `app/admin/documents/page.js` |
| 17 | `components/ui/command.jsx` |
| 17 | `components/RegionBanner.js` |
| 14 | `components/ui/calendar.jsx` |
| 12 | `components/NotificationPreferences.js` |
| 11 | `components/ui/chart.jsx` |

---

### Notable Arbitrary Spacing Values

| Class | File |
|-------|------|
| `mb-[44px]`, `mb-[88px]` | `app/agenda/page.js` |
| `min-h-[2.8rem]`, `sm:min-h-[4.75rem]` | `app/page.jsx` |
| `min-h-[36px]`, `sm:min-h-[44px]` | `app/page.jsx` |
| `h-[390px] sm:h-[480px]` | `components/ui/premium-card.js` |

---

### Raw CSS Spacing (`app/globals.css`)

| Property | Value | Context |
|----------|-------|---------|
| `.custom-marker` width/height | `20px` | Map pin icon |
| `.custom-marker` border | `2px solid white` | Map pin icon |
| `.price-dot` width/height | `8px` | Price indicator dot |
| `.price-dot` margin | `0 2px` | Price indicator dot |
| `select` background-position | `right 0.5rem center` | Custom select arrow |
| `select` padding-right | `2.5rem` | Custom select arrow |
| `.sidebar-scroll` scrollbar width | `6px` | Sidebar scrollbar |
| `.sidebar-scroll` scrollbar thumb border-radius | `3px` | Sidebar scrollbar |
| `.property-card:hover` transform | `translateY(-4px)` | Card hover effect |
| `.animate-on-scroll` transform | `translateY(30px)` | Scroll reveal initial |
| `.slide-left` transform | `translateX(-50px)` | Scroll reveal slide |
| `.slide-right` transform | `translateX(50px)` | Scroll reveal slide |
| `.scale-in` transform | `scale(0.9)` | Scroll reveal scale |
| `.stagger-children > *` transform | `translateY(20px)` | Stagger initial state |
| `.hover-scale:hover` transform | `scale(1.02)` | Generic hover scale |
| Stagger animation delays | `0.1s`–`0.6s` per nth-child | `.stagger-children` |

---

## 3. Color Palette

### CSS Design Tokens (HSL variables in `app/globals.css`)

#### Light Mode (`:root`)

| Token | HSL Value | Approx. Color |
|-------|-----------|---------------|
| `--background` | `0 0% 100%` | White |
| `--foreground` | `222.2 84% 4.9%` | Very dark navy |
| `--card` | `0 0% 100%` | White |
| `--card-foreground` | `222.2 84% 4.9%` | Very dark navy |
| `--popover` | `0 0% 100%` | White |
| `--popover-foreground` | `222.2 84% 4.9%` | Very dark navy |
| `--primary` | `120 35% 25%` | Dark forest green |
| `--primary-foreground` | `210 40% 98%` | Near-white |
| `--secondary` | `210 40% 96%` | Light blue-gray |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | Dark navy |
| `--muted` | `210 40% 96%` | Light blue-gray |
| `--muted-foreground` | `215.4 16.3% 46.9%` | Medium gray |
| `--accent` | `210 40% 96%` | Light blue-gray |
| `--accent-foreground` | `222.2 47.4% 11.2%` | Dark navy |
| `--destructive` | `0 84.2% 60.2%` | Red |
| `--destructive-foreground` | `210 40% 98%` | Near-white |
| `--border` | `214.3 31.8% 91.4%` | Light gray |
| `--input` | `214.3 31.8% 91.4%` | Light gray |
| `--ring` | `222.2 84% 4.9%` | Very dark navy |
| `--radius` | `0.5rem` | Border radius base |
| `--chart-1` | `12 76% 61%` | Warm orange |
| `--chart-2` | `173 58% 39%` | Teal |
| `--chart-3` | `197 37% 24%` | Dark blue-gray |
| `--chart-4` | `43 74% 66%` | Golden yellow |
| `--chart-5` | `27 87% 67%` | Orange |

#### Dark Mode (`.dark`)

| Token | HSL Value |
|-------|-----------|
| `--background` | `222.2 84% 4.9%` |
| `--foreground` | `210 40% 98%` |
| `--primary` | `120 35% 75%` |
| `--secondary` | `217.2 32.6% 17.5%` |
| `--muted` | `217.2 32.6% 17.5%` |
| `--muted-foreground` | `215 20.2% 65.1%` |
| `--destructive` | `0 62.8% 30.6%` |
| `--border` | `217.2 32.6% 17.5%` |
| `--ring` | `212.7 26.8% 83.9%` |
| `--chart-1` | `220 70% 50%` |
| `--chart-2` | `160 60% 45%` |
| `--chart-3` | `30 80% 55%` |
| `--chart-4` | `280 65% 60%` |
| `--chart-5` | `340 75% 55%` |

---

### Custom Color Scale (`tailwind.config.js`)

#### Copper Scale

| Token | Hex | Approx. |
|-------|-----|---------|
| `copper-50` | `#faf6f3` | Off-white warm |
| `copper-100` | `#f3ece4` | Very light beige |
| `copper-200` | `#e7d9c9` | Light tan |
| `copper-300` | `#d9c0a5` | Warm sand |
| `copper-400` | `#c48759` | Copper / warm amber |
| `copper-500` | `#b8794a` | Medium copper |
| `copper-600` | `#aa6a3f` | Dark copper |
| `copper-700` | `#8e5636` | Brown copper |
| `copper-800` | `#734731` | Deep brown |
| `copper-900` | `#5e3b29` | Very dark brown |

| Token | Hex | Notes |
|-------|-----|-------|
| `customBorder` | `#c7895b` | Custom border accent |

---

### Hard-coded Hex Colors (found across source files)

| Hex | File(s) | Usage |
|-----|---------|-------|
| `#faf8f5` | `app/page.jsx` | Page background |
| `#f7f4ed` | `app/page.jsx` | Section background |
| `#0e152e` / `#0E3A2F` | `app/page.jsx`, `components/Navigation.js` | Dark hero/nav backgrounds |
| `#194D3C` | `app/page.jsx` | Dark green section |
| `#78FAAE` | `app/agenda/page.js` | Neon green accent (SVG fill) |
| `#FAEB67` | `app/agenda/page.js` | Yellow accent (SVG fill) |
| `#1ED4DF` | `app/agenda/page.js` | Cyan accent (SVG fill) |
| `#F7B046` | `app/agenda/page.js` | Orange accent (SVG fill) |
| `#7F7F7F` | Various | Neutral gray |
| `#788E87` | Various | Muted sage green |
| `#c48759` | `app/page.jsx` | Copper accent (inline style) |
| `#3e6343` | `app/globals.css`, `components/PropertyMap.js` | Forest green (price dot, map marker) |
| `#d1d5db` | `app/globals.css`, `app/page.jsx` | Light gray (price dot inactive, scrollbar) |
| `#f0f0f0` / `#e0e0e0` | `app/globals.css` | Skeleton shimmer |
| `#0f172a` | Various | Dark slate |
| `#ffffff` | Various | White |
| `#666` | `components/PropertyMap.js` | Medium gray |
| `#059669` | `components/PropertyMap.js` | Emerald green (map popup) |
| `#ccc` | `components/ui/chart.jsx` | Chart border/separator |
| `#64748b` | `lib/emailService.js` | Slate gray (email body text) |
| `#ef4444` | Various | Red error/destructive |

---

### RGBA / RGB Colors (inline styles and CSS)

| Value | File | Usage |
|-------|------|-------|
| `rgba(199, 137, 91, 0.25)` | `app/globals.css` | Text selection highlight |
| `rgba(199, 137, 91, 0.6)` | `app/globals.css` | Home page border override |
| `rgba(199, 137, 91, 0.7)` | `app/globals.css` | Focus outline color |
| `rgba(199, 137, 91, 0.8)` | `app/globals.css` | Focus ring color |
| `rgba(255, 255, 255, 0.3)` | `app/globals.css` | Sidebar scrollbar thumb |
| `rgba(255, 255, 255, 0.5)` | `app/globals.css` | Sidebar scrollbar thumb:hover |
| `rgba(0, 0, 0, 0.15)` | `app/globals.css` | Property card hover shadow |
| `rgba(14, 21, 46, 0.85–0.97)` | `components/Navigation.js` | Nav background (scroll state) |
| `rgba(0,0,0,0.3–0.4)` | `components/Navigation.js`, `app/properties/[slug]/page.js` | Overlay shadows |
| `rgb(153, 105, 69)` | `app/page.jsx` | Copper text / border |

---

## 4. Max-Width Values

### Tailwind `max-w-*` Classes

| Class | Files |
|-------|-------|
| `max-w-sm` | Various modals / forms |
| `max-w-md` | `components/AuthModal.js`, dialogs |
| `max-w-lg` | Various dialogs |
| `max-w-xl` | Various sections |
| `max-w-2xl` | `app/faq/page.js`, `app/about/page.js`, `app/guides/*/page.js` |
| `max-w-3xl` | Guide pages, blog pages |
| `max-w-4xl` | `app/process/page.js`, `app/about/page.js` |
| `max-w-5xl` | `app/regions/[slug]/page.js`, various pages |
| `max-w-6xl` | `app/page.jsx`, `app/blog/page.js` |
| `max-w-1400` (custom) | `app/page.jsx` — top-level layout wrapper |
| `max-w-none` | Prose sections (`prose max-w-none`) |
| `max-w-full` | Images, responsive wrappers |

### Arbitrary `max-w-[…]` Values

| Class | File | Usage |
|-------|------|-------|
| `max-w-[1200px]` | `app/page.jsx` | Wide content wrapper |
| `max-w-[660px]` | Various guide pages | Article column |
| `max-w-[480px]` | Various | Section / card |
| `max-w-[420px]` | `app/dashboard/` | Panel width |
| `max-w-[393px]` | Various | Card max width |
| `max-w-[380px]` | Various | Card max width |
| `max-w-[350px]` | Various | Card max width |
| `max-w-[320px]` | `components/ui/premium-card.js` | Premium card |
| `max-w-[210px]` | `app/page.jsx` | Partner CTA buttons |
| `max-w-[100px]` | `components/Navigation.js` | Nav text truncation |
| `md:max-w-[70%]` | Various | Responsive prose width |
| `md:max-w-[420px]` | `components/ui/toast.jsx` | Toast notification |
| `md:max-w-2xl` | Dialogs | Responsive dialog width |
| `md:max-w-[22rem]` | `components/Footer.jsx` | Footer column |
| `sm:max-w-[380px]` | Cards | Small responsive card |

### Raw CSS `max-width`

| Value | File | Context |
|-------|------|---------|
| `100vw` | `app/globals.css` | Body overflow guard |
| `100%` | `app/globals.css` | Universal `*` selector |
| `100vw` | `app/globals.css` (media query) | Section/semantic element guard on mobile |
| `600px` | `lib/emailService.js` | HTML email wrapper |
| `767px` | `hooks/use-mobile.jsx` | JS mobile breakpoint (`MOBILE_BREAKPOINT - 1`) |

---

## 5. Animations & Transitions

### Tailwind Config Keyframes & Animations (`tailwind.config.js`)

| Name | Keyframe | Duration | Easing |
|------|----------|----------|--------|
| `accordion-down` | `height: 0 → var(--radix-accordion-content-height)` | `0.2s` | `ease-out` |
| `accordion-up` | `height: var(--radix-accordion-content-height) → 0` | `0.2s` | `ease-out` |
| `fade-up` | `opacity: 0, translateY(12px) → opacity: 1, translateY(0)` | `0.5s` | `ease-out` |
| `fade-in` | `opacity: 0 → 1` | `0.4s` | `ease-out` |

Plugin: `tailwindcss-animate` (adds `animate-in`, `animate-out`, `fade-in-0`, `zoom-in-95`, `slide-in-from-*`, etc.)

---

### CSS Keyframes (`app/globals.css`)

| Name | What it animates | Duration | Easing |
|------|-----------------|----------|--------|
| `shimmer` | `background-position` sweep | `1.5s` | `ease-in-out` infinite |
| `fadeInUp` | `opacity` + `translateY(20px → 0)` | `0.6s` | `ease-out` |
| `slowBounce` | `translateY(0 → -8px → -4px → 0)` | `2s` | `ease-in-out` infinite |
| `fadeIn` | `opacity` + `translateY(20px → 0)` | `0.8s` | `ease-out` |
| `charFadeIn` | `opacity` + `translateY(10px → 0)` | `0.3s` | `ease-out` forwards |
| `keywordPop` | `opacity` + `scale(0 → 1.1 → 1)` | `0.3s` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` forwards |

### CSS Animation Classes (`app/globals.css`)

| Class | Keyframe used | Notes |
|-------|--------------|-------|
| `.loading-skeleton` | `animate-pulse` (Tailwind) | Gray placeholder |
| `.loading-shimmer` | `shimmer` | Gradient sweep |
| `.fade-in-up` | `fadeInUp` | Static trigger |
| `.slow-bounce` | `slowBounce` | Scroll indicator |
| `.animate-fade-in` | `fadeIn` | Loading screen |
| `.animate-char-fade-in` | `charFadeIn` | Hero title characters |
| `.animate-keyword-pop` | `keywordPop` | Keyword badges |
| `.animate-on-scroll` | — | Scroll-reveal (JS-toggled `.animate-in`) |
| `.animate-on-scroll.slide-left` | — | Slides from left on scroll |
| `.animate-on-scroll.slide-right` | — | Slides from right on scroll |
| `.animate-on-scroll.scale-in` | — | Scales in on scroll |
| `.animate-on-scroll.fade-in-only` | — | Fade only on scroll |
| `.animate-on-scroll.stagger-children` | `fadeInUp` | Children animate with `0.1s`–`0.6s` delays |

Scroll-reveal transition when `.animate-in` is applied:
```
transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
```

### Other CSS Transitions

| Property | Value | File | Context |
|----------|-------|------|---------|
| `a` transition | `color 0.2s ease` | `app/globals.css` | Global link color |
| `.property-card` transition | `transform 0.3s, box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)` | `app/globals.css` | Card hover |

---

### Tailwind Transition Classes (used across components)

| Class | Where |
|-------|-------|
| `transition-colors` | `components/Navigation.js`, `app/page.jsx`, `components/ui/*` |
| `transition-all` | Widespread — `app/process/page.js`, `app/contact/page.js` |
| `transition-opacity` | Various page sections |
| `transition-transform` | Various |
| `duration-200` | `components/ui/*` (shadcn primitives) |
| `duration-300` | `components/Navigation.js`, `app/page.jsx` |
| `duration-700` | `app/page.jsx` |
| `duration-1000` | `components/ui/input-otp.jsx` |
| `ease-out` | Various |
| `ease-in-out` | Various |
| `ease-linear` | Various |
| `animate-pulse` | Dashboard / admin loading states, skeletons |
| `animate-spin` | Loading spinners (properties, map, dashboard) |
| `animate-in` / `animate-out` | shadcn dialog, dropdown, popover, tooltip, select |
| `fade-in-0` | shadcn components |
| `zoom-in-95` | shadcn dialog / popover |
| `slide-in-from-top-2` etc. | shadcn dropdown / popover |

---

### JavaScript / Inline Transitions

| File | Technique |
|------|-----------|
| `components/BackgroundImageTransition.js` | `transition: opacity ${fadeDuration}ms ease-in-out` (inline style) |
| `components/NavigationProgress.jsx` | Dynamic `transition` and `boxShadow` on loading bar via inline style |
| `components/ui/image-tiles.jsx` | Framer Motion-style `transition: { … }` objects |

---

## 6. Emojis in Source Code

All emojis found in `.js` / `.jsx` source files (excluding markdown docs):

| Emoji | File | Context |
|-------|------|---------|
| 💰 | `app/page.jsx` | Card/section title (cs/it/en translations) |
| ⚠️ | `app/page.jsx` | Card title |
| 📍 | `app/page.jsx` | Card title |
| ❓ | `app/page.jsx` | Card title |
| ⚠️ | `app/guides/mistakes/page.js` | Inline UI copy |
| ⚠️ | `app/guides/inspections/page.js` | String content |
| 😄 | `app/about/page.js` | Bio text (appears in cs/it/en translations) |

> **Summary:** 5 unique files contain emojis. `⚠️` appears in 3 separate files. All are embedded directly in JSX string content.

---

## 7. Responsive / Mobile Issues

The following issues were identified by static analysis of the source. No runtime testing was performed.

---

### 7.1 Sub-accessible Font Sizes on Mobile

**Files:** `app/page.jsx`, `components/Navigation.js`, various `app/clanky/*/page.js`

Classes like `text-[10px]`, `text-[11px]`, and `text-[12px]` are used without mobile-specific overrides in several places. The WCAG 2.1 minimum recommended body text size is 16px; anything under 12px is a legibility risk. These are not responsive — they stay that size on all viewports.

---

### 7.2 Fixed Widths Without Mobile Fallback

| Element | Class | File | Risk |
|---------|-------|------|------|
| Filter sidebar | `lg:w-80` | `app/properties/page.js` | Disappears on mobile — verify it collapses correctly |
| Pill labels | `w-[120px]` | `app/agenda/page.js` | Fixed width could overflow on very narrow viewports |
| Partner CTA | `max-w-[210px]` | `app/page.jsx` | May be too narrow to read on some devices |
| Horizontal snap cards | `min-w-[188px]` | `app/page.jsx` | Snap scroll OK but verify touch behavior |
| Dashboard sidebar | `w-64` | `app/dashboard/layout.js` | Fixed drawer — verify mobile overlay/toggle works |
| Admin shell | `w-64` | `components/admin/AdminShell.jsx` | Same issue as dashboard sidebar |
| Premium card | `max-w-[320px]` | `components/ui/premium-card.js` | Very constrained on narrow viewports |

---

### 7.3 Touch Target Size

Several interactive elements are below the recommended 44×44px touch target size:

- `h-8` (32px) buttons appear in dashboard tables and admin lists
- `p-0.5` icon buttons used in compact UI
- `text-[10px]` navigation links in some contexts
- `app/page.jsx` uses `min-h-[36px]` on some buttons (below 44px WCAG guideline)

`components/ui/button.jsx` should be audited to ensure its `sm` and `icon` variants meet minimum touch target requirements on mobile.

---

### 7.4 Two Conflicting Mobile Breakpoint Definitions

The codebase has three different "mobile" breakpoints in use simultaneously:

| Definition | Value | Location |
|-----------|-------|----------|
| JS mobile hook | `768px` | `hooks/use-mobile.jsx` (MOBILE_BREAKPOINT = 768) |
| CSS media query | `768px` | `app/globals.css` (`.mobile-hidden`, container overrides) |
| CSS media query | `480px` | `app/globals.css` (extra-small font overrides) |
| Tailwind `sm` | `640px` | `tailwind.config.js` |

This means the JS "is mobile?" hook fires at a different breakpoint than Tailwind's `sm:` prefix, which can cause components that conditionally render based on `use-mobile` to appear inconsistently vs. what CSS shows.

---

### 7.5 `overflow-x-hidden` on `body`

Set in `app/globals.css` (`@apply overflow-x-hidden`). This globally clips any content that extends beyond the viewport horizontally. While this prevents horizontal scroll, it can:
- Clip `position: fixed` dropdowns or modals if their stacking context is incorrect
- Clip focus rings on elements near the viewport edge
- Mask real overflow bugs rather than fix them

---

### 7.6 Universal `max-width: 100%` Rule

```css
/* globals.css */
*, *::before, *::after {
  max-width: 100%;
}
```

This catch-all rule prevents horizontal overflow, but can interact unexpectedly with:
- Flex/grid children that need to shrink independently
- SVG elements that need intrinsic sizing
- Third-party map/chart components that calculate their own widths

---

### 7.7 Navigation Background Not Using Theme Variables

`components/Navigation.js` uses hard-coded `rgba(14, 21, 46, 0.85–0.97)` inline styles for the scrolled-state background, rather than a design token or CSS variable. This:
- Does not respond to dark mode switching
- Is not part of the token system and will diverge from any future color updates

---

### 7.8 Map Popup HTML with Inline Styles

`components/PropertyMap.js` generates HTML strings with inline `font-size: 14px`, `font-size: 12px`, and fixed `px` dimensions for Leaflet popups. These are immune to Tailwind responsive utilities and the design token system entirely.

---

### 7.9 Long-form Guide Pages — Image & Prose Width

`app/regions/[slug]/page.js` mixes `max-w-5xl` sections with inline images using `max-w-full`. On small screens, `rounded-xl` media elements inside a constrained prose column should be verified to not cause reflow or pixel-width overflow.

---

*End of audit — generated 2026-04-26.*
