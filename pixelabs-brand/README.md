# Pixelabs Brand

Canonical source for the Pixelabs brand mark and usage rules. Copy this folder verbatim into any Pixelabs product (guston, future subdomains) to ensure consistent brand presentation.

_Last updated: 2026-04-07_

## The Pixelabs Mark

The Pixelabs mark is a bold, solid uppercase **"P"** set inside a rounded-square badge, with a single pixel dot at the bottom-right as the signature detail — a nod to the "pixel" in Pixelabs. The badge uses a cyan-to-violet linear gradient (`#71e0ff → #a78bfa`) on a transparent background. The master asset lives at [`../assets/pixelabs-icon.png`](../assets/pixelabs-icon.png) (1024x1024 PNG).

## Files in this folder

| File | Purpose | Status |
|---|---|---|
| `pixelabs-icon.png` | 1024x1024 master, gradient, transparent bg. Safe on any background. | Exists (at `../assets/`) |
| `pixelabs-icon-light.png` | Variant optimized for light backgrounds (stronger contrast / subtle border). | TODO — generate on demand |
| `pixelabs-icon-dark.png` | Variant optimized for dark backgrounds. | TODO — generate on demand |
| `pixelabs-icon-mono.png` | Monochrome fallback (single color) for stamps, embroidery, limited-palette print. | TODO — generate on demand |
| `pixelabs-icon.svg` | Vector source of truth. | **Known gap** — generate if illustrator supports SVG output |

If a variant does not yet exist, generate it using the prompt in [Generating new variants](#generating-new-variants).

## Usage rules

- **Minimum size:** 16px. Below this, use the brand wordmark "Pixelabs" as text instead.
- **Clear-space:** maintain at least 0.5x the icon height of empty space around the mark. No other elements inside that margin.
- **Contrast:** always place on a contrasting background. Do not drop the gradient mark onto busy photographs or similar-hue backgrounds.
- **Do not** stretch, skew, or rotate the mark.
- **Do not** change the gradient colors (`#71e0ff → #a78bfa`).
- **Do not** apply effects (drop-shadow, glow, blur) directly to the icon. If ambience is desired, let the host page handle it via a surrounding container.
- **Transparent background always.** Never composite the mark onto a colored square — the rounded-square shape is already part of the mark.

## HTML snippet

Drop-in header link for any Pixelabs subdomain:

```html
<a class="pixelabs-link" href="https://pixelabs.net" aria-label="Pixelabs.net" target="_blank" rel="noopener">
  <img src="/assets/pixelabs-icon.png" alt="Pixelabs" width="28" height="28">
</a>
```

Recommended CSS (hover glow + accessible focus ring):

```css
.pixelabs-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 4px;
  transition: filter 0.2s ease, transform 0.2s ease;
  outline: none;
}

.pixelabs-link:hover {
  filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.55));
  transform: translateY(-1px);
}

.pixelabs-link:focus-visible {
  box-shadow: 0 0 0 2px #a78bfa;
}

.pixelabs-link img {
  display: block;
  width: 28px;
  height: 28px;
}
```

## Theme engine pairing

The Pixelabs mark ships alongside the portable theme engine (`pixelabs-themes.css` + `pixelabs-themes.js`) located at `/assets/themes/`. Any Pixelabs site should link both the theme engine and drop the mark into its header — together they provide consistent brand presentation (color tokens, light/dark switching, and the identity mark) across all products under `*.pixelabs.net`.

## Cross-product reuse

**This folder is the canonical source.** When spinning up a new Pixelabs site:

1. Copy this entire `pixelabs-brand/` folder verbatim into the new project.
2. Reference assets from the copied folder (or from `/assets/` if that is the project convention).
3. **Do not fork or re-draw the icon.** Pull from here. Eventually this will move to a CDN or shared repo — at that point, switch to the remote URL.

## Generating new variants

If an AI illustrator needs to regenerate or add a variant in the future, use this prompt concept:

> Bold uppercase "P" in a rounded-square badge, single pixel dot at bottom-right as signature, cyan-to-violet linear gradient (`#71e0ff → #a78bfa`), transparent background, 1024x1024, no effects, no text outside the badge.

For variants, append:
- **Light:** "optimized for light backgrounds, with a subtle darker border or stronger edge contrast"
- **Dark:** "optimized for dark backgrounds, slightly brighter gradient stops"
- **Mono:** "single solid color (`#a78bfa`), no gradient, for single-color print and embroidery"

Save outputs to this folder using the filenames in the [Files](#files-in-this-folder) table.

## Future

- [ ] Host the SVG source on a CDN or shared repo so it is not duplicated per Pixelabs product.
- [ ] Add `pixelabs-wordmark.svg` — the full word "Pixelabs" in a matching font treatment.
- [ ] Add favicon variants: `favicon.ico`, `apple-touch-icon.png`, `favicon-32x32.png`, `favicon-16x16.png`.
- [ ] Produce true vector `pixelabs-icon.svg` (current master is raster only).
- [ ] Document exact gradient angle and stop positions once SVG source exists.
