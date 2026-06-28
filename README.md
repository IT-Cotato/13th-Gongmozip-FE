# Gongmozip FE

Gongmozip frontend web application.

## Tech Stack

- Framework: Next.js App Router
- Language: TypeScript
- Package manager: pnpm
- Styling: Tailwind CSS
- Client state: Zustand
- Server state: TanStack Query
- Tools: Git / GitHub
- Deployment: Vercel

## Getting Started

```bash
pnpm install
pnpm dev
```

Use `pnpm`, not `npm` or `yarn`, so the lockfile and dependency tree stay consistent.

## Scripts

```bash
pnpm lint
pnpm build
pnpm start
```

## Project Notes

- App routes live in `src/app`.
- Global styles live in `src/app/globals.css`.
- TanStack Query is configured in `src/app/providers.tsx`.
- Add Zustand stores when needed under `src/stores`.
- Keep `pnpm-lock.yaml` committed.

## Environment

Create `.env.local` from `.env.example` when API endpoints or public runtime values are needed.

```bash
NEXT_PUBLIC_API_BASE_URL=
```

## Deployment

Vercel will detect Next.js automatically. Use `pnpm` as the package manager and keep `pnpm-lock.yaml` committed.
