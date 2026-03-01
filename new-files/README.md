# Becca's Cakes and Bakes — File Structure

## CSS files
| File | Purpose |
|------|---------|
| `styles.css` | Original base file (navbar shape, banner, buttons — unchanged) |
| `shared.css` | NEW — all shared styles: CSS variables, hero, navbar, footer, typography utilities |
| `our-story.css` | Page-specific styles for our-story.html |
| `allergen-advice.css` | Page-specific styles for allergen-advice.html |
| `upcoming-events.css` | Page-specific styles for upcoming-events.html |
| `gallery.css` | Page-specific styles for gallery.html |
| `contact.css` | Page-specific styles for contact.html |

## JS files
| File | Purpose |
|------|---------|
| `components.js` | Injects the shared navbar + footer HTML into every page |

## How components.js works
Each HTML page has two placeholder divs:
```html
<div id="site-nav"></div>     <!-- navbar goes here -->
<div id="site-footer"></div>  <!-- footer goes here -->
```
And one script tag: `<script src="./components.js"></script>`

The active nav link is set by adding `data-page="pageName"` to the `<body>` tag:
```html
<body data-page="gallery">
```
Valid values: `home` | `our-story` | `allergen-advice` | `upcoming-events` | `gallery` | `contact`

## To update the nav or footer
Edit `components.js` — the `NAV_LINKS` and `SOCIAL_LINKS` arrays at the top.
Changes apply to all 5 pages instantly.

## CSS variable reference (defined in shared.css)
```css
--pink:       #AB1D79   /* brand pink */
--pink-dark:  #7c1457   /* darker pink for hover/gradients */
--pink-light: #e2c4f9   /* lavender */
--cream:      #FFEAFE   /* page background */
--deep:       #2a1a2e   /* dark heading text */
--body-text:  #4a3a52   /* body paragraph text */
--muted:      #5a3a6e   /* muted/secondary text */
--navbar-bg:  rgba(226, 196, 249, 0.85)  /* navbar glass background */
```

## Hero usage
All inner pages use the shared `.page-hero` class — no more per-page hero CSS:
```html
<div class="page-hero">
    <div class="page-hero__content">
        <span class="hero-subtitle">Subtitle text</span>
        <div class="hero-divider"></div>
        <h1>Page Title</h1>
        <p class="hero-body">Optional description paragraph.</p>
    </div>
</div>
```
