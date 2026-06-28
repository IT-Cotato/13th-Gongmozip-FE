# AGENTS.md

## Project

Gongmozip FE is a Next.js App Router frontend project.

## Tech Stack

- Next.js App Router
- TypeScript
- pnpm
- Tailwind CSS
- Zustand
- TanStack Query
- Git / GitHub
- Vercel

## Rules

- Use pnpm only.
- Use TypeScript strict mode.
- Keep changes scoped to the requested task.
- Do not modify unrelated files.
- Follow existing naming and folder conventions.
- Prefer small, reusable components when UI repeats.

## Commands

- Install: `pnpm install`
- Dev: `pnpm dev`
- Lint: `pnpm lint`
- Build: `pnpm build`
- Format: `pnpm format`
- Check formatting: `pnpm format:check`

## Folder Conventions

- App routes live in `src/app`.
- Global styles live in `src/app/globals.css`.
- Shared components should live in `src/components`.
- Zustand stores should live in `src/stores`.
- TanStack Query hooks should live near the related feature or in `src/queries`.
- Shared utilities should live in `src/lib` or `src/utils`.

## Styling

- Use Tailwind CSS.
- Keep class names readable.
- Prefer project-level design consistency over one-off styles.

## Environment

- Use `.env.local` for local secrets and runtime values.
- Keep `.env.example` updated when adding new environment variables.
