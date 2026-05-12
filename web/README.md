# Lightness Platform

Self-hosted platform for `bethelightness.com` using:
- Next.js
- Vercel
- Supabase
- Stripe
- Calendly

## Local Runtime

This workspace uses a project-local Node.js runtime stored in:

`../.tooling/node-v22.14.0-darwin-arm64`

When running commands locally in this workspace, prepend:

```bash
PATH=../.tooling/node-v22.14.0-darwin-arm64/bin:$PATH
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the real values before wiring production services.

For Vercel production, add the same variables in the Vercel project settings and set:

```bash
NEXT_PUBLIC_SITE_URL=https://bethelightness.com
```

Deployment guide:
- [`../DEPLOYMENT.md`](/Users/magicalbeing/Desktop/lightness-platform/DEPLOYMENT.md)

## Current Build Phase

Deployment setup and production readiness.

Reference docs live in the project root:
- `../PRD.md`
- `../BUILD_CHECKLIST.md`
- `../INTAKE_CHECKLIST.md`
- `../homepage-mockup.html`
