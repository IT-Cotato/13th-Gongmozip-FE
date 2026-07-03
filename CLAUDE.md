# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Gongmozip FE — a Next.js App Router frontend application. This repository is an early-stage scaffold (App Router skeleton, providers, and tooling only); most feature code has not been written yet.

## Tech Stack

- Framework: Next.js (App Router), React 19
- Language: TypeScript (strict mode)
- Package manager: pnpm (required — do not use npm or yarn, to keep the lockfile consistent)
- Styling: Tailwind CSS v4 (CSS-based `@theme` config in `src/app/globals.css`, no `tailwind.config` file)
- Client state: Zustand
- Server state: TanStack Query (`QueryClientProvider` set up in `src/app/providers.tsx`)
- Deployment: Vercel

## Commands

```bash
pnpm install        # install deps
pnpm dev             # start dev server
pnpm build           # production build
pnpm start           # run production build
pnpm lint            # eslint
pnpm format          # prettier --write
pnpm format:check    # prettier --check
```

There is no test suite configured yet.

## Architecture & Conventions

- App routes live in `src/app` (Next.js App Router). `src/app/layout.tsx` is the root layout and wraps `children` in `Providers`.
- `src/app/providers.tsx` is a client component (`"use client"`) that owns the single `QueryClient` instance via `useState`; add any other app-wide client providers here rather than in `layout.tsx`.
- Global styles live in `src/app/globals.css`, importing Tailwind and defining CSS custom properties (`--background`, `--foreground`) with dark-mode overrides via `prefers-color-scheme`.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- Not yet created but expected by convention (create these directories when adding the corresponding code):
  - `src/components` — shared/reusable components
  - `src/stores` — Zustand stores
  - `src/queries` — TanStack Query hooks (or colocate hooks near the feature they belong to)
  - `src/lib` or `src/utils` — shared utilities
- Environment variables: copy `.env.example` to `.env.local` for local values (e.g. `NEXT_PUBLIC_API_BASE_URL`). Keep `.env.example` updated whenever a new env var is introduced.

## Working in this repo

- Follow existing naming and folder conventions rather than introducing new patterns.
- In `src/app/**`, be deliberate about the server/client component boundary — don't add `"use client"` unless the component actually needs it.
- Prefer small, reusable components when UI repeats.
- Prettier config: double quotes off (`"singleQuote": false` → double quotes), semicolons on, trailing commas everywhere, 100-char print width, 2-space indent.

## Git Workflow

**No direct commits to `main` or `develop`.** All changes go through a working branch and are merged only via Pull Request.

- `main` — production / deployed code
- `develop` — pre-release integration branch (all feature branches merge here first)
- `feature/기능명` — one branch per feature, named after the feature being implemented (e.g. `feature/login`, `feature/main`, `feature/auth-api`)
- `fix/버그명` — bug fixes (e.g. `fix/login-redirect`)

Branch naming rules:

- Use the `feature/기능명` or `fix/버그명` format.
- ❌ No personal/initials-based branch names (e.g. `dy_work`).
- ⭕ Name the branch after what it implements or fixes.

After a branch's PR is merged, **delete the branch immediately** — don't leave stale merged branches around.

## Commit Convention

Commit messages are prefixed with a type (capitalized):

| Type       | Use for                                                              |
| ---------- | --------------------------------------------------------------------- |
| `Feat`     | New feature                                                          |
| `Fix`      | Bug fix                                                              |
| `Build`    | Build-related file changes                                          |
| `Util`     | Config file changes                                                  |
| `Ci`       | CI configuration changes                                             |
| `Docs`     | Documentation (add/edit/remove)                                     |
| `Style`    | Code formatting, semicolons, etc. — no business logic change        |
| `Design`   | UI changes (CSS)                                                    |
| `Refactor` | Code refactoring                                                    |
| `Test`     | Test code (add/edit/remove) — no business logic change              |
| `Chore`    | Other changes (e.g. build scripts)                                  |

## Negative Rules (do NOT do these)

- Do not modify the contents of `.env` files without user confirmation.
- Do not use the `any` type — keep TypeScript strict mode intact.
- Do not push directly to `main` (or `develop` — see Git Workflow above).
- Do not submit code that fails required scripts (`pnpm build`, `pnpm lint`).
