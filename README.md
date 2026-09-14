# Snap, Crackle and Pop

Personal site of **Nirav Ramdhanie** — physics, mathematics, and drawings.

[![Deploy to Live Site](https://github.com/vramdhanie/niravweb/actions/workflows/deploy-prod.yml/badge.svg)](https://github.com/vramdhanie/niravweb/actions/workflows/deploy-prod.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r180-000000?logo=three.js&logoColor=white)
![Firebase Hosting](https://img.shields.io/badge/Firebase-Hosting-FFCA28?logo=firebase&logoColor=black)
![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white)

> The name is a physics joke: the **3rd, 4th, 5th, and 6th** derivatives of position with
> respect to time are **jerk, snap, crackle, and pop** — hence the faint "jerk" leading the
> wordmark.

## Overview

A static Next.js site with two parts:

- **Home** — features Nirav's project **_Mapping Chaotic Gravitational Basins_**, including a
  live, client-side **WebGL visualizer** of the 4-D collision basins (a browser port of the
  project's Python/VisPy viewer).
- **`/draws`** — the **NiravDraws** drawings section: an MDX-driven gallery of architectural
  drawings. The header rebrands to "NiravDraws" within this section.

Live at **[niravramdhanie.com](https://niravramdhanie.com)** (Firebase project `niravweb-81163`).

## Stack

- **Next.js 15** (App Router) with **TypeScript**
- **Static export** (`output: 'export'`) — no server runtime
- **Tailwind CSS v4**
- **Three.js** for the interactive basins visualizer
- **MDX** content via `next-mdx-remote` + `gray-matter`
- **Firebase Hosting**, deployed by **GitHub Actions**
- Package manager: **pnpm**

## Development

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Build

```bash
pnpm build:ci     # static export -> ./out  (CI/deploy)
pnpm build        # local build (Turbopack)
```

The exported site lands in `out/`, which is what Firebase Hosting serves.

## Interactive basins visualizer

The home page hosts a client-side Three.js viewer for the n-body collision basins — rotate the
cube, slide through the fourth dimension, isolate coordinate planes, and toggle planets.

Source models are the `.npz` outputs of the [RestrictiveNBodyProblem](https://github.com/vramdhanie/RestrictiveNBodyProblem)
generator (a `50⁴ = 6.25M`-point lattice). They live in the gitignored `basins-src/` folder and
are converted to a compact web payload with:

```bash
pnpm preprocess:basins    # basins-src/*.npz -> public/data/basins/*
```

Because the lattice is row-major, point positions are derivable from the array index, so only the
per-point `hit` array (int8) and a small `meta.json` are shipped — a few MB, loaded on demand when
the visualizer is launched. See `scripts/preprocess-basins.mjs` and `src/components/basins/`.

## Drawings content

Drawings are MDX files in `src/content/drawings/*.mdx`, each with frontmatter:

```yaml
---
title: Big Ben
slug: big_ben
image: /images/drawings/big_ben_bg.jpg   # hero background
thumb: /images/drawings/nirav_01.jpg      # card thumbnail
date: 2019-09-23
author: Nirav Ramdhanie
level: beginner
tags: big ben mdx image
---
```

Images live in `public/images/drawings/`. To add a drawing, drop the images in that folder and
create a new `.mdx` file — it is auto-discovered by `getAllDrawings()` in `src/lib/drawings.ts`
and pre-rendered at `/draws/drawings/<slug>/` via `generateStaticParams`.

## Structure

```
src/
├── app/
│   ├── layout.tsx                 # header/footer shell, fonts, metadata
│   ├── page.tsx                   # home — featured project + visualizer + gallery
│   ├── globals.css                # design tokens + Tailwind
│   └── draws/
│       ├── page.tsx               # NiravDraws landing (hero + featured)
│       └── drawings/
│           ├── page.tsx           # drawings grid
│           └── [slug]/page.tsx    # individual drawing (MDX)
├── components/
│   ├── Header.tsx / Footer.tsx    # path-aware branding
│   ├── basins/                    # BasinsViewer, PlanePicker, VisualizerSection
│   └── …                          # Hero, Banner, Title, DrawingCard, icons
├── constants/                     # nav links, social links
├── content/drawings/*.mdx         # drawing content
└── lib/
    ├── drawings.ts                # build-time content loader
    └── basins.ts                  # visualizer data loader + math
scripts/preprocess-basins.mjs      # .npz -> public/data/basins payload
```

## Deployment

- Push to `main` → `.github/workflows/deploy-prod.yml` builds and deploys to the live Firebase
  Hosting channel.
- Open a PR → `.github/workflows/deploy-preview.yml` deploys a 30-day preview channel.

Requires these GitHub repository secrets:

- `FIREBASE_SERVICE_ACCOUNT_NIRAVWEB` — Firebase service-account JSON
- `PROJECT_ID` — `niravweb-81163`

## License

Released under the [MIT License](LICENSE).
