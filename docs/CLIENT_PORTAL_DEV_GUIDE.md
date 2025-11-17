# Client Portal Dev Guide

## What This Is

**Client-facing portal** - A separate Next.js app where clients view their engagement, deliverables, and work. This is what **clients see**, not what owners manage.

**Key Principle:** Contact-First (Universal Personhood)
- Contact exists in IgniteBD (funnel, outreach, etc.)
- Same Contact can access Client Portal
- **No new user record needed** - Contact IS the user
- Contact's email = Firebase login username
- Contact's `firebaseUid` = Portal identity

---

## Architecture

### Separate App, Shared Database

- **Standalone Product**: Separate Next.js app (`ignitebd-clientportal`)
- **Shared Database**: Uses same Prisma schema and PostgreSQL database as IgniteBD
- **Direct DB Access**: Reads/writes directly via Prisma (no dependency on IgniteBD API)
- **Independent Deployment**: Own domain (`clientportal.ignitegrowth.biz`)

### Data Sources (What Clients See)

The portal hydrates from **two main sources**:

1. **Proposals** - Engagement plans (phases, milestones, payments)
   - Endpoint: `GET /api/proposals/:proposalId/portal`
   - Shows: Proposal structure, deliverables, payment schedule

2. **WorkPackages** - Actual work artifacts (blogs, personas, templates, etc.)
   - Endpoint: `GET /api/workpackages/client/:contactId`
   - Shows: Published work artifacts organized by package

3. **ConsultantDeliverables** - What we're providing (linked to proposals)
   - Part of proposal portal data
   - Shows: Deliverable status, due dates, completion

---

## User Flow (What Clients Experience)

### 1. Login
```
Contact → /login
  → Enters email + password
  → Firebase authenticates
  → System finds Contact by Firebase UID
  → Stores session in localStorage
  → Redirects to /welcome
```

### 2. Welcome Router (Strategic Routing)
```
/welcome loads
  → GET /api/client/state
  → Checks:
     - Deliverables with workContent? → /dashboard (work started)
     - Proposals exist? → /proposals/[proposalId] (proposal ready)
     - Otherwise → /dashboard (empty state)
  → Routes accordingly
```

**Routing Logic:**
- **First Visit (Proposal Ready)**: Owner sends contact when proposal is ready → Route to proposal view
- **Second Visit (Work Started)**: Owner sends contact when work has started → Route to dashboard with deliverables

### 3. Dashboard
```
/dashboard loads
  → Gets contactId from localStorage
  → Gets proposalId from localStorage or finds via API
  → GET /api/proposals/:proposalId/portal
  → Displays:
     - Welcome message
     - Stats (total/completed deliverables)
     - Deliverables list
     - Invoices (if any)
```

### 4. Proposal View
```
/proposals/[proposalId] loads
  → GET /api/proposals/:proposalId/portal
  → Displays:
     - Proposal purpose
     - Phases and milestones
     - Payment schedule
     - Scope of work
```

---

## Portal Routes

### Core Routes (Implemented)

- **`/splash`** - Auth check (redirects to welcome/login)
- **`/login`** - Contact login (email + password via Firebase)
- **`/welcome`** - **Strategic router** (routes to proposal view or dashboard)
- **`/dashboard`** - Main dashboard (deliverables, stats, invoices)
- **`/proposals/[proposalId]`** - Proposal detail view (when proposal ready)
- **`/settings`** - Settings (password change, billing)

### Missing Routes (Nav buttons exist but not implemented)

- **`/foundational-work`** - Detailed deliverables view
- **`/proposals`** - Proposal list page
- **`/timeline`** - Timeline visualization

---

## Hydration Endpoints

### 1. Client State (Strategic Routing)

**GET /api/client/state**

Determines where to route the user based on their state.

**Returns:**
```javascript
{
  success: true,
  state: {
    contact: {
      id: "contact-123",
      email: "client@example.com",
      contactCompanyId: "company-456",
      companyName: "Acme Corp"
    },
    proposals: [...],
    deliverables: [...],
    workHasStarted: true,  // Has deliverables with workContent or active status
    routing: {
      route: "/dashboard",  // or "/proposals/[id]"
      routeReason: "work_started",  // or "proposal_ready"
      proposalId: "proposal-789"
    }
  }
}
```

**Used by:** `/welcome` page to determine routing

---

### 2. Proposal Portal Data

**GET /api/proposals/:proposalId/portal**

Gets all portal data for a proposal - this is the main hydration endpoint.

**Returns:**
```javascript
{
  success: true,
  portalData: {
    // Client info
    client: {
      name: "Joel Gulick",
      company: "BusinessPoint Law",
      contactEmail: "joel@businesspointlaw.com",
      contactId: "contact-123"
    },
    
    // Contract info
    contract: {
      contractId: "contract-xxx",
      status: "active"
    },
    
    // Deliverables (what we're providing)
    deliverables: [
      {
        id: "del-1",
        title: "3 Target Personas",
        status: "completed",
        category: "foundation",
        dueDate: "2025-11-15",
        completedAt: "2025-11-10",
        hasWorkContent: true  // Indicates work has started
      },
      // ... more deliverables
    ],
    
    // Proposal structure
    proposal: {
      id: "proposal-xxx",
      purpose: "...",
      phases: [/* phase data */],
      milestones: [/* milestone data */],
      status: "active"
    },
    
    // Payment info
    payments: [
      {
        id: "payment-1",
        amount: 500,
        dueDate: "2025-11-15",
        status: "pending",
        description: "Kickoff payment"
      },
      // ... more payments
    ],
    
    // Overall status
    status: {
      overall: "in-progress",
      completedDeliverables: 3,
      totalDeliverables: 8
    }
  }
}
```

**Used by:** `/dashboard` and `/proposals/[proposalId]` pages

---

### 3. Work Packages (Client View)

**GET /api/workpackages/client/:contactId**

Gets work packages for a contact - shows published artifacts only.

**Returns:**
```javascript
{
  success: true,
  workPackages: [
    {
      id: "wp-123",
      title: "Q1 Content Package",
      description: "...",
      status: "ACTIVE",
      contact: { ... },
      contactCompany: { ... },
      items: [
        {
          id: "item-1",
          deliverableName: "Blog Posts",
          type: "BLOG",
          quantity: 5,
          blogIds: ["blog-1", "blog-2"],  // Published artifacts
          progress: 0.4  // 2/5 completed
        },
        // ... more items
      ]
    },
    // ... more work packages
  ]
}
```

**Note:** This endpoint exists in the main app (`IgniteBd-Next-combine`), not the client portal. The client portal would need to call it or have its own version.

**Used by:** (Not yet implemented in portal - potential for "Foundational Work" page)

---

## Session Management

### useClientPortalSession Hook

The `useClientPortalSession` hook manages all session state.

**Storage Keys (localStorage):**
- `clientPortalContactId` - Contact ID
- `clientPortalContactEmail` - Contact email
- `clientPortalContactCompanyId` - Contact's company ID
- `clientPortalCompanyName` - Company name
- `clientPortalProposalId` - **Foundation for everything else** - Current proposal ID
- `firebaseId` - Firebase UID

**Usage:**
```javascript
import { useClientPortalSession } from '@/lib/hooks/useClientPortalSession';

const {
  proposalId,
  setProposalId,
  contactSession,
  setContactSession,
  hasValidSession,
  refreshSession,
} = useClientPortalSession();
```

**See:** `docs/CLIENT_PORTAL_SESSION.md` for full details

---

## Authentication Flow

### 1. Generate Portal Access (Owner Side - IgniteBD)

Owner generates portal access for a contact:
```
POST /api/contacts/:contactId/generate-portal-access
  → Creates Firebase account (passwordless)
  → Stores firebaseUid in Contact.firebaseUid
  → Generates InviteToken (24h expiration)
  → Returns activation link: /activate?token=<token>
```

### 2. Contact Activation

Contact clicks activation link:
```
GET /activate?token=<token>
  → POST /api/activate (verifies token)
  → Redirects to /set-password
  → Contact sets password
  → POST /api/set-password (sets Firebase password)
  → Marks Contact.isActivated = true
  → Redirects to /login?activated=true
```

### 3. Contact Login

Contact logs in:
```
POST /login
  → Firebase signInWithEmailAndPassword()
  → GET /api/contacts/by-firebase-uid
  → Store session in localStorage
  → Redirect to /welcome
```

**See:** `CLIENT_PORTAL_LOGIN_FLOW.md` for detailed login flow

---

## Data Relationships

**What Clients See:**
```
Contact (Client)
  ├── Proposal[] (Engagements)
  │     ├── ConsultantDeliverable[] (What we're providing)
  │     ├── Phases (Work structure)
  │     ├── Milestones (Timeline)
  │     └── Compensation (Payment schedule)
  │
  └── WorkPackage[] (Work artifacts)
        └── WorkPackageItem[] (Blogs, Personas, Templates, etc.)
```

**Key Links:**
- `Contact.firebaseUid` → Firebase Auth (universal personhood)
- `Contact.contactCompanyId` → `Company.id` (Contact works for Company)
- `Proposal.companyId` → `Company.id` (Proposal is for Company)
- `ConsultantDeliverable.contactId` → `Contact.id` (Deliverable is for Contact)
- `ConsultantDeliverable.proposalId` → `Proposal.id` (Deliverable from Proposal)
- `WorkPackage.contactId` → `Contact.id` (Work package is for Contact)

---

## API Endpoints (Client Portal)

### Client Portal Endpoints

**GET /api/client/state**
- Get contact state for strategic routing
- Returns: proposals, deliverables, routing decision
- Auth: Required (Firebase token)

**GET /api/proposals/:proposalId/portal**
- Get portal data for proposal
- Returns: client info, deliverables, payments, status
- Auth: Optional (scoped by proposalId)

**GET /api/contacts/:contactId/proposals**
- Get all proposals for contact
- Auth: Optional (scoped by contactId)

**GET /api/contacts/by-email?email=xxx**
- Find contact by email
- Used during login
- Auth: Optional

**GET /api/contacts/by-firebase-uid**
- Get contact by Firebase UID
- Returns contact info including role
- Auth: Required (Firebase token)

**GET /api/invoices**
- Get invoices for current contact/proposal
- Auth: Required (Firebase token)

---

## What Clients Can Do

✅ **View Engagement Data:**
- See all proposals for their company
- View proposal details (phases, milestones)
- Track deliverables (what we're providing)
- Monitor engagement status

✅ **Track Deliverables:**
- See list of deliverables
- View deliverable status
- See due dates and completion dates
- Filter by category

✅ **View Payments:**
- See payment schedule
- View payment status
- See upcoming payments
- Pay invoices (Stripe integration)

✅ **Manage Account:**
- Change password
- Update profile (future)

---

## What Clients Cannot Do

❌ **Create/Edit Proposals:**
- Read-only view
- Cannot modify proposals
- Cannot create new proposals

❌ **Update Deliverables:**
- Cannot change deliverable status
- Cannot add deliverables
- Read-only view

❌ **Access Other Tenants:**
- Cannot see other clients' data
- Scoped to their own company
- Tenant isolation enforced

---

## Development Notes

### Strategic Routing Logic

The welcome page routes based on work state:

```javascript
// Work has started if:
// 1. Deliverables with workContent (JSON field with actual work artifacts)
// 2. OR deliverables with status "in-progress" or "completed"

if (workHasStarted) {
  route = '/dashboard';  // Show work view
} else if (primaryProposal) {
  route = `/proposals/${primaryProposal.id}`;  // Show proposal view
} else {
  route = '/dashboard';  // Fallback: Empty state
}
```

### Suspense Boundaries

**Important:** Any component using `useSearchParams()` must be wrapped in `<Suspense>`:

```javascript
import { Suspense } from 'react';

function MyComponent() {
  return (
    <Suspense fallback={null}>
      <ComponentUsingSearchParams />
    </Suspense>
  );
}
```

**See:** `app/dashboard/page.jsx` for example with `PaymentSuccessHandler`

### Session Persistence

Session data persists in `localStorage`:
- ✅ Persists across page refreshes
- ✅ Persists across browser sessions
- ⚠️ Cleared when user clears browser data
- ⚠️ Not shared across devices/browsers

---

## Related Documentation

- **`CLIENT_PORTAL_SESSION.md`** - Session management hook details
- **`CLIENT_PORTAL_LOGIN_FLOW.md`** - Detailed login flow
- **`WELCOME_ROUTER_ARCHITECTURE.md`** - Welcome router details
- **`PROPOSAL_STRUCTURE.md`** - Proposal data structure
- **`ACTIVATION_FLOW.md`** - Account activation flow

---

**Last Updated**: November 2025  
**Focus**: Client-facing portal (what clients see)  
**Architecture**: Contact-First (Universal Personhood)  
**Hydration**: Proposals + WorkPackages + Deliverables  
**Routing**: Strategic (proposal ready vs work started)  
**Authentication**: Contact.email + Firebase

