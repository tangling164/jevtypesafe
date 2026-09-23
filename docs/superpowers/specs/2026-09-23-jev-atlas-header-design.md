# Jev Atlas header and naming design

Date: 2026-09-23

## Goal

Rename the public site from “Jev Builds Directory” / “Jev / builds” to “Jev Atlas”, remove the empty band between the navigation and homepage hero, and disable Astro’s development toolbar.

## Naming

“Jev Atlas” is the single public product name in English and Chinese. Keep the existing domain, project scope, generated technology mark, and independent-site positioning. Update the central site configuration, header, footer, browser titles, SEO breadcrumb labels, About copy, configuration fallback, and relevant tests or public metadata. Historical evidence and changelog entries retain the former name when they describe past work.

The header wordmark displays “Jev Atlas” as one name. Supporting copy should describe it as an independent directory or atlas of traceable Jev projects without implying affiliation with TypeSafe AI.

## Homepage spacing

Give the homepage main container a dedicated class and remove its generic top padding. Reduce the hero’s desktop and mobile top padding so its first visible content begins close to the header while retaining enough breathing room for focus and animation. Other routes keep their existing main padding.

Verify the header-to-hero distance at 375px and 1440px and confirm there is no horizontal overflow.

## Development toolbar

Set Astro’s `devToolbar.enabled` configuration to `false`. This removes the local development Settings, Audit, and related controls without affecting site content or production output.

## Validation

Run configuration/type checks and a production build. Use browser checks on English and Chinese homepages at mobile and desktop widths to verify the renamed wordmark and title, reduced hero gap, absence of the Astro toolbar, and preserved navigation/language behavior.
