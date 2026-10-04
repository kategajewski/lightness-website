# The Lightness of Being Brand Guide

Last updated: July 10, 2026

## Standing Brand Rule

Everything created for The Lightness of Being going forward should stay on brand by default. This applies to website pages, checkout flows, confirmation pages, student portals, emails, PDFs, previews, decks, and any public or client-facing copy/design.

Use the approved fonts, colors, spacing, and tone below unless Kate specifically asks for a different direction. Do not introduce new dominant colors, random fonts, harsh black/white contrast, tech-style UI, or bright/cool palettes without an intentional brand reason.

## Typography

The website uses a soft three-font system that matches the newer Canva direction.

- Body / navigation / forms: `Lato`, with `"Avenir Next", "Helvetica Neue", "Segoe UI", sans-serif` as fallbacks
- Display headings: `Cormorant Garamond`, with `Georgia, "Times New Roman", serif` as fallbacks
- Italic display / signature moments: `Cormorant Garamond Italic`, used sparingly for warmth and intimacy
- Brand accent / wordmark moments: `Belleza`, with `Cormorant Garamond` as fallback

Use the display font for page titles, section titles, testimonial quotes, and moments that should feel more soulful or editorial. Use the body font for navigation, buttons, paragraphs, forms, labels, and practical information. Use Belleza sparingly for the site wordmark or small brand accents so the site feels enchanted without becoming overly decorative.

## Core Colors

| Use | Value | Feel |
| --- | --- | --- |
| Page background | `#f6f0e8` | Warm cream |
| Main text | `#2f2520` | Deep cacao brown |
| Muted text | `#554842` | Warm gray-brown |
| Button / strong border | `#4a3d36` | Grounded brown |
| Email / deep CTA brown | `#4c3a30` | Rich warm brown |
| Secondary accent brown | `#5d5148` | Soft brown |
| Soft label brown | `#7b6c62` | Muted clay-brown |
| Button background | `#fffaf5` | Warm off-white |
| Email/card background | `#fffaf4` | Warm ivory |
| Email inset surface | `#fff4eb` | Peach-cream |
| Soft email/footer surface | `#f8eee4` | Warm blush-cream |
| Email page background | `#f6eee5` | Warm sand-cream |
| Button hover | `#f7efe6` | Pale beige |

## Surface Colors

| Use | Value |
| --- | --- |
| Main card surface | `rgba(255, 252, 248, 0.82)` |
| Warm inset card surface | `rgba(255, 248, 242, 0.86)` |
| Header background | `rgba(249, 244, 238, 0.96)` |
| Footer background | `rgba(235, 223, 210, 0.96)` |
| Light border / divider | `rgba(76, 58, 48, 0.12)` |
| Soft shadow | `rgba(59, 41, 31, 0.08)` |

## Accent Tints

| Accent | Values | Use |
| --- | --- | --- |
| Sage | `rgba(168, 178, 159, 0.18)`, `rgba(168, 178, 159, 0.22)`, `rgba(168, 178, 159, 0.35)` | Calm highlights, small badges, soft background glows |
| Peach | `rgba(230, 194, 162, 0.42)`, `rgba(230, 194, 162, 0.16)`, `rgba(230, 194, 162, 0.06)` | Warm hero/page glow |
| Rose | `rgba(201, 167, 156, 0.18)`, `rgba(223, 154, 150, 0.28)` | Gentle emotional warmth and subtle page accents |

## Current Design Direction

The visual tone is warm, grounded, soft, and calm. The site should feel personal and healing without becoming overly decorative.

Keep using:

- warm cream backgrounds
- deep brown text rather than black
- rounded cards and buttons
- soft shadows
- gentle sage, peach, and rose accents
- Cormorant Garamond for emotional/editorial emphasis
- Belleza for restrained brand accents
- Lato / Avenir Next for clarity and ease

Avoid introducing strong cool colors, bright white blocks, sharp black text, heavy gradients, or overly modern tech-style typography unless the whole system is being intentionally redesigned.

## Implementation Notes

- Website code should prefer existing CSS variables in `src/app/globals.css`: `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, and `--color-line`.
- New reusable UI should use the existing `font-display`, `font-brand`, `display-page-title`, `display-section-title`, `display-card-title`, and `button-pill` patterns before inventing new styles.
- Emails should use `Lato` for details/body/buttons and `Cormorant Garamond` for greeting, headings, or signature moments. Because some email clients block web fonts, always include practical fallbacks.
- When creating previews or local HTML files, load/request the brand fonts so Kate can review the piece as close to final as possible.
