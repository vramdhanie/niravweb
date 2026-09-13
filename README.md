# Nirav Draws

Nirav draws and designs games. This site showcases his architectural drawings.

## Stack

- **Next.js 15** (App Router) with **TypeScript**
- **Static export** (`output: 'export'`) — no server runtime
- **Tailwind CSS v4**
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

## Content

Drawings are MDX files in `src/content/drawings/*.mdx`. Each has frontmatter:

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

Images live in `public/images/drawings/`. To add a drawing, drop the images in
that folder and create a new `.mdx` file — it is auto-discovered by
`getAllDrawings()` in `src/lib/drawings.ts`, and its page is pre-rendered at
`/drawings/<slug>/` via `generateStaticParams`.

## Structure

```
src/
├── app/
│   ├── layout.tsx              # header/footer shell, fonts, metadata
│   ├── page.tsx                # home (hero + featured)
│   ├── globals.css             # design tokens + Tailwind
│   └── drawings/
│       ├── page.tsx            # drawings grid
│       └── [slug]/page.tsx     # individual drawing (MDX)
├── components/                 # Header, Footer, Hero, Banner, Title, DrawingCard
├── constants/                  # nav links, social links
├── content/drawings/*.mdx      # drawing content
└── lib/drawings.ts             # build-time content loader
```

## Deployment

- Push to `main` → `.github/workflows/deploy-prod.yml` builds and deploys to the
  live Firebase Hosting channel.
- Open a PR → `.github/workflows/deploy-preview.yml` deploys a 30-day preview
  channel.

Requires these GitHub repository secrets:

- `FIREBASE_SERVICE_ACCOUNT_NIRAVWEB` — Firebase service-account JSON
- `PROJECT_ID` — `niravweb-81163`
