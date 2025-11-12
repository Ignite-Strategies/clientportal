# Ignite Client Portal

**Separate Product** - Self-contained Next.js app for client-facing proposal and engagement portal.

## Product Model

- **Standalone Product**: Can be sold independently or as an add-on to IgniteBD
- **Self-Contained**: Has its own Next.js app, auth, and deployment
- **Shared Database**: Uses the same Prisma schema and database as IgniteBD
- **Client-Focused**: Clean UX focused on proposals, deliverables, and billing

## Architecture

- **Next.js 14** - App Router
- **Prisma** - Direct database access (shared DB with IgniteBD)
- **Firebase Auth** - Client authentication
- **Self-Contained** - Separate deployment, but shares database

## Routes

- `/splash` - Auth check (mirrors IgniteBD)
- `/login` - Client login
- `/welcome` - Welcome screen
- `/dashboard` - Client portal dashboard (like growth dashboard)
  - Foundational Work (scope of work, deliverables)
  - Proposals
  - Timeline
  - Settings (billing, profile)

## Setup

1. Copy Prisma schema from IgniteBD (already done)
2. Set up environment variables (use same DATABASE_URL as IgniteBD)
3. Run migrations: `npx prisma migrate dev`
4. Generate Prisma client: `npx prisma generate`
5. Deploy separately

## Key Difference from IgniteBD

- **IgniteBD**: BD tools for internal use (`/growth-dashboard`)
- **Client Portal**: Client-facing engagement hub (`/dashboard`)
- **Separate Products**: Can be sold independently
- **Shared Database**: Same Prisma schema, same database

## Database Sharing

Both apps use the same database:
- Same `Proposal` table
- Same `ConsultantDeliverable` table
- Same `Company` and `Contact` tables
- Client Portal reads/writes directly via Prisma

## Deployment

Deploy as separate Next.js app:
- Different domain/subdomain (e.g., `portal.ignitegrowth.biz`)
- Same database connection
- Independent scaling
