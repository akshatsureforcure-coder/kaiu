# KAIU — Shopify Theme

A custom Online Store 2.0 Liquid theme. Dark, editorial, brass-accented.
Cormorant Garamond (headings) + DM Sans (body), hairline dividers, no pill
buttons, heavy whitespace, subtle scroll-reveal animation.

## 1. Upload to Shopify

**Option A — Admin (no CLI needed)**
1. Shopify Admin → Online Store → Themes
2. "Add theme" → "Upload zip file" → select `kaiu-shopify-theme.zip`
3. Once uploaded, click "Actions" → "Publish" when you're ready to go live
   (or preview it first — it installs as unpublished by default).

**Option B — Shopify CLI**
```
shopify theme push --path=./kaiu-shopify-theme --development
```

## 2. Required setup after install

These are things Shopify can't pre-fill from a zip — do these in Admin:

- **Main menu** — Online Store → Navigation → make sure a menu with handle
  `main-menu` exists (Shopify creates this by default). This drives the
  header nav. Add a footer menu too and assign it to the footer's "Link
  column" blocks in the theme editor.
- **Pages** — Online Store → Pages → create a page titled "About" (handle
  `about`) and one titled "Contact" (handle `contact`). They'll automatically
  pick up the About and Contact template designs. If you use different
  handles, just set the template manually in the page's "Theme template"
  dropdown on the right side of the page editor.
- **Homepage content** — Theme Editor → Home page → fill in the Hero image,
  pick a Featured Collection, and adjust the Brand Story / Craftsmanship /
  Quote text to match your copy.
- **Logo (optional)** — Theme Editor → Header → upload a logo image, or leave
  blank to use the "KAIU" wordmark in Cormorant Garamond italic.
- **Social links** — Theme Editor → Theme settings → Social media.
- **Colors/spacing** — Theme Editor → Theme settings → Colors / Typography /
  Layout. Everything (background, brass accent, section spacing, heading
  size) is adjustable without touching code.

## 3. What's included

- `layout/theme.liquid` — head, fonts, CSS variables, cart drawer shell
- Sections for: header, footer, cart drawer, hero, featured collection,
  brand story, craftsmanship, quote, newsletter banner, product page,
  collection page, cart page, about page, contact form, plus fallback
  sections for generic pages, blog, search, and 404
- `assets/theme.css` — full design system
- `assets/theme.js` — AJAX add-to-cart, cart drawer, variant switching,
  quantity steppers, mobile nav, scroll-reveal — vanilla JS, no build step
- `config/settings_schema.json` — every color/type/spacing token exposed
  in the theme editor

## 4. Notes

- Customer account pages (login, register, order history) currently use
  Shopify's default styling — say the word if you want those skinned to
  match too.
- Fonts load from Google Fonts via CDN link tags (not Shopify's font
  picker), so they're locked to Cormorant Garamond + DM Sans by design.
- No localStorage/sessionStorage used anywhere — cart state lives in
  Shopify's own cart session, as it should.
