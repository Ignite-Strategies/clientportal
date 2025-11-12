# Client Portal Setup

## Separate App, Shared Database

The Client Portal is a **separate Next.js app** that shares the same database as IgniteBD.

## Setup Steps

1. **Copy Prisma Schema**
   ```bash
   cp ../IgniteBd-Next-combine/prisma/schema.prisma ./prisma/schema.prisma
   ```

2. **Set Environment Variables**
   ```bash
   # Use the SAME DATABASE_URL as IgniteBD
   DATABASE_URL="postgresql://user:password@localhost:5432/ignitebd"
   
   # Firebase (can share or use separate)
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   # ... etc
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Prisma**
   ```bash
   npx prisma generate
   # No migrations needed - using same DB as IgniteBD
   ```

5. **Run Dev Server**
   ```bash
   npm run dev
   ```

## Architecture

- **Separate Next.js App**: Own deployment, own domain
- **Shared Database**: Same Prisma schema, same PostgreSQL database
- **Direct DB Access**: Uses Prisma to read/write directly
- **Self-Contained**: No dependency on IgniteBD API (though can call it if needed)

## Routes

- `/splash` - Auth check
- `/login` - Client login  
- `/welcome` - Welcome screen
- `/dashboard` - Main dashboard (like growth dashboard)
  - Foundational Work
  - Proposals
  - Timeline
  - Settings

## Deployment

Deploy as separate Next.js app:
- Different domain: `portal.ignitegrowth.biz`
- Same database connection string
- Independent scaling

