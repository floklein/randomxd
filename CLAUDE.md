# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` — Start Next.js development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint (no test runner configured)

## Tech Stack

- **Next.js 16** with App Router (React 19, server components by default)
- **TypeScript** in strict mode
- **Tailwind CSS v4** via `@tailwindcss/postcss` (uses `@import "tailwindcss"` and `@theme` directive, not a tailwind.config file)
- **Geist** font family (sans + mono) loaded via `next/font/google`
- **ESLint 9** with `eslint-config-next` (no Prettier)

## Architecture

This is a fresh Next.js App Router project. All pages/layouts live in `app/`. The path alias `@/*` maps to the project root.

- `app/layout.tsx` — Root layout, sets up fonts and metadata
- `app/page.tsx` — Home page
- `app/globals.css` — Tailwind import, CSS custom properties for theme colors, dark mode via `prefers-color-scheme`
- `public/` — Static assets (SVGs)

## Conventions

- Tailwind utility-first styling with CSS variable color tokens defined in `globals.css`
- Dark mode uses `dark:` prefix classes
- Mobile-first responsive design (`sm:` breakpoints)
- Next.js `Image` component for optimized images
