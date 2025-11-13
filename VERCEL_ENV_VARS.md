# Client Portal - Vercel Environment Variables

## 🔴 Critical - Required for Build/Deploy

### Database
- `DATABASE_URL` - PostgreSQL connection string (SAME as IgniteBD main app)
  - Example: `postgresql://user:password@host:5432/database?schema=public`
  - ⚠️ **MUST BE SET** - Client portal uses Prisma directly to access database

### Firebase Client SDK (Optional - has fallbacks)
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key (optional, has fallback)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain (optional, has fallback)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID (optional, has fallback)
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket (optional, has fallback)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID (optional, has fallback)
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID (optional, has fallback)

### API Configuration
- `NEXT_PUBLIC_API_URL` - Main app API URL (optional, defaults to `https://app.ignitegrowth.biz`)
  - Client portal calls main app's API routes for some operations
  - Default: `https://app.ignitegrowth.biz`

---

## 📋 Quick Copy-Paste for Vercel

### Production Environment Variables

```bash
# Database (REQUIRED - same as IgniteBD main app)
DATABASE_URL=postgresql://ignitedb_ef0c_user:HeBA6pylnkfG2HCgBtz1FZVWflq8SF9J@dpg-d3sdl46uk2gs73c5f0ig-a.oregon-postgres.render.com/ignitedb_ef0c

# Firebase Client SDK (optional - has fallbacks in code)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDNsO_LnQ7t3L_KWejjCuUQxxkI3r0iRxM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ignite-strategies-313c0.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ignite-strategies-313c0
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ignite-strategies-313c0.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=252461468255
NEXT_PUBLIC_FIREBASE_APP_ID=1:252461468255:web:0d62b1a63e3e8da77329ea

# API Configuration (optional)
NEXT_PUBLIC_API_URL=https://app.ignitegrowth.biz
```

---

## 🔍 What the Client Portal Needs

**Required:**
- ✅ `DATABASE_URL` - For Prisma database access

**Optional (has fallbacks):**
- Firebase Client SDK config (fallbacks in `lib/firebase.js`)
- API URL (defaults to `https://app.ignitegrowth.biz`)

**NOT Needed:**
- ❌ `FIREBASE_SERVICE_ACCOUNT_KEY` - Server-side only, lives in main app
- ❌ Any other server-side secrets

---

## 🚀 After Adding Variables

1. Go to Vercel Dashboard → Client Portal Project → Settings → Environment Variables
2. Add `DATABASE_URL` (REQUIRED)
3. Optionally add Firebase Client SDK vars (or rely on fallbacks)
4. **Redeploy** the application
5. Test login and dashboard

---

## 📝 Notes

- **Shared Database**: Client portal uses the SAME database as IgniteBD main app
- **No Migrations Needed**: Database migrations run in main app, client portal just uses the schema
- **Firebase Fallbacks**: Firebase config has hardcoded fallbacks, so env vars are optional
- **API Calls**: Client portal calls main app's API routes (which have all the server-side config)

