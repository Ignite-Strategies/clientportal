# WorkArtifact Architecture

## Overview

The WorkArtifact system enables the client portal to display and manage actual content deliverables (blogs, personas, CLE decks, etc.) that are produced as part of a WorkPackage. This architecture ensures that clients only see "View" or "Review" buttons when content actually exists, preventing broken links and creating a polished user experience.

## Core Models

### WorkArtifact

The `WorkArtifact` model represents actual content that clients can view or review.

```prisma
model WorkArtifact {
  id                String          @id @default(cuid())
  workPackageItemId String
  workPackageItem   WorkPackageItem @relation(fields: [workPackageItemId], references: [id], onDelete: Cascade)

  type        String // BLOG | PERSONA | CLE_DECK | TEMPLATE | ETC
  title       String?
  contentJson Json?

  status String // DRAFT | IN_REVIEW | APPROVED | COMPLETED

  reviewRequestedAt DateTime?
  reviewCompletedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([workPackageItemId])
  @@index([status])
  @@index([type])
  @@map("work_artifacts")
}
```

**Key Fields:**
- `type`: The type of artifact (BLOG, PERSONA, CLE_DECK, TEMPLATE, etc.)
- `title`: Human-readable title for the artifact
- `contentJson`: The actual content stored as JSON (flexible structure)
- `status`: Current status (DRAFT, IN_REVIEW, APPROVED, COMPLETED)
- `reviewRequestedAt`: When review was requested from the client
- `reviewCompletedAt`: When the client completed their review

### WorkPackageItem (Updated)

`WorkPackageItem` now includes a relation to `WorkArtifact[]`:

```prisma
model WorkPackageItem {
  // ... existing fields ...
  artifacts WorkArtifact[]
  // ... rest of model ...
}
```

This allows each deliverable item to have one or many artifacts associated with it.

### WorkPackage (Company-Scoped)

**Important:** WorkPackages are scoped to the **company** (e.g., "BusinessPoint Law"), not the individual contact (e.g., "Joel"). This reflects that work is done for the company, not just one person.

```prisma
model WorkPackage {
  id        String   @id @default(cuid())
  contactId String   // Primary contact associated with the package
  contact   Contact  @relation(...)
  companyId String?  // Company the work is for (BusinessPoint Law)
  company   Company? @relation(...)
  
  // ... rest of model ...
}
```

**Hydration Logic:**
- WorkPackages are fetched by `companyId` (primary) or `contactId` (fallback)
- The company name is displayed prominently in the UI
- The contact is shown as secondary information

## API Routes

### GET /api/work/[artifactId]

Fetches a single artifact for client viewing. Validates that the artifact belongs to the authenticated contact's WorkPackage.

**Request:**
```
GET /api/work/[artifactId]
Headers: Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "success": true,
  "artifact": {
    "id": "...",
    "type": "BLOG",
    "title": "SEO Blog Post",
    "contentJson": { ... },
    "status": "IN_REVIEW",
    "reviewRequestedAt": "2025-01-15T10:00:00Z",
    "reviewCompletedAt": null,
    "createdAt": "2025-01-10T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  },
  "workPackageItem": {
    "id": "...",
    "deliverableLabel": "Blog Posts",
    "deliverableDescription": "5 SEO-optimized blog posts",
    "status": "in_progress"
  }
}
```

**Security:**
- Verifies Firebase token
- Ensures artifact belongs to the contact's WorkPackage
- Returns 403 if unauthorized

### GET /api/client/engagement

Returns stage-based engagement data including work packages, deliverables, and artifacts.

**Request:**
```
GET /api/client/engagement
Headers: Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "success": true,
  "stage": "review", // "onboarding" | "active" | "review"
  "needsReview": true,
  "deliverables": [
    {
      "id": "...",
      "title": "Target Personas",
      "description": "3 persona profiles",
      "status": "in-progress",
      "category": "foundation",
      "artifactId": "artifact-123", // Only included if artifact exists
      "artifactStatus": "IN_REVIEW" // Status of the artifact if exists
    },
    {
      "id": "...",
      "title": "Blog Posts",
      "status": "pending",
      "artifactId": null // No artifact yet
    }
  ],
  "workPackage": {
    "id": "...",
    "title": "IgniteBD Starter Build-Out",
    "description": "Strategic foundation and collateral",
    "company": {
      "id": "...",
      "companyName": "BusinessPoint Law" // Primary identifier
    },
    "contact": {
      "id": "...",
      "name": "Joel Gulick",
      "email": "joel@businesspointlaw.com"
    },
    "items": [
      {
        "id": "...",
        "deliverableLabel": "Target Personas",
        "deliverableDescription": "3 persona profiles",
        "status": "in_progress",
        "artifacts": [
          {
            "id": "artifact-123",
            "type": "PERSONA",
            "title": "Target Persona 1",
            "status": "IN_REVIEW"
          }
        ]
      }
    ]
  }
}
```

**Stage Logic:**
- `onboarding`: No work packages or artifacts exist
- `active`: Work packages exist with artifacts, but none need review
- `review`: At least one artifact has status `IN_REVIEW`

**Artifact ID Rules:**
- `artifactId` is only included if at least one artifact exists for the deliverable
- If no artifacts exist, `artifactId: null` is returned
- This prevents showing broken "View" links

## Dashboard UI Logic

### Conditional Button Display

The dashboard only shows "View" or "Review" buttons when artifacts actually exist:

```javascript
const hasArtifact = deliverable.artifactId !== null && deliverable.artifactId !== undefined;

if (hasArtifact) {
  if (deliverable.artifactStatus === 'IN_REVIEW') {
    // Show "Review" button → routes to /work/[artifactId]
    <button onClick={() => router.push(`/work/${deliverable.artifactId}`)}>
      Review
    </button>
  } else {
    // Show "View" button → routes to /work/[artifactId]
    <button onClick={() => router.push(`/work/${deliverable.artifactId}`)}>
      View
    </button>
  }
} else {
  // No artifact yet - show "Not Started" text (no button)
  <span>Not Started</span>
}
```

### Status Labels

Status is determined by both deliverable status and artifact status:

- **"Completed"** (green): `deliverable.status === 'completed'` OR `artifactStatus === 'COMPLETED'`
- **"Needs Your Review"** (yellow): `artifactStatus === 'IN_REVIEW'`
- **"In Progress"** (blue): `deliverable.status === 'in-progress'` OR `artifactStatus === 'DRAFT'`
- **"Not Started"** (gray): No artifact exists

### Review CTA

A prominent "Action Required: Review Needed" banner appears at the top of the dashboard when `needsReview === true`:

```javascript
{portalData?.needsReview && (
  <div className="bg-gradient-to-r from-yellow-600 to-amber-500">
    <h3>Action Required: Review Needed</h3>
    <p>You have deliverables waiting for your review.</p>
  </div>
)}
```

### View All Work Button

The "View All Work" button only appears if the work package has at least one artifact:

```javascript
{portalData?.workPackage && 
 portalData.workPackage.items.some(item => item.artifacts.length > 0) && (
  <button onClick={() => router.push(`/workpackages/${portalData.workPackage.id}`)}>
    View All Work
  </button>
)}
```

## Company vs. Contact Emphasis

### Data Model

WorkPackages are primarily associated with companies:

```prisma
model WorkPackage {
  companyId String?  // Primary: Company the work is for
  company   Company? @relation(...)
  contactId String   // Secondary: Primary contact
  contact   Contact  @relation(...)
}
```

### Hydration Query

WorkPackages are fetched by company first:

```javascript
const workPackages = await prisma.workPackage.findMany({
  where: {
    OR: [
      { companyId: contact.contactCompanyId }, // Primary: by company
      { contactId: contact.id },                // Fallback: by contact
    ],
  },
  include: {
    company: { select: { id: true, companyName: true } },
    contact: { select: { id: true, firstName: true, lastName: true, email: true } },
    // ... phases, items, artifacts ...
  },
});
```

### UI Display

The dashboard header emphasizes the company:

```javascript
<h2>
  {portalData.workPackage?.company?.companyName 
    ? `Work Package: ${portalData.workPackage.company.companyName}`
    : `Welcome, ${portalData.client.name}`
  }
</h2>
```

**Example:**
- ✅ "Work Package: BusinessPoint Law" (company-first)
- ❌ "Work Package for Joel Gulick" (contact-first)

## Welcome Page Behavior

The `/welcome` page is a **loader-only** route:

1. Validates Firebase authentication
2. Loads engagement data via `/api/client/engagement`
3. Stores session data
4. Redirects to `/dashboard`

**No routing logic, no stage switching, no UI** - it's purely a hydration and routing step.

## Dashboard as Stage-Based Summary

The dashboard shows:

1. **Current Phase**: Determined by work package phase position
2. **Deliverables**: List with status + conditional View/Review buttons
3. **Review CTA**: If any artifact needs review
4. **View All Work Button**: Only if content exists

**No command center** - just a clean status + actions surface.

## Implementation Status

✅ **Completed:**
- WorkArtifact Prisma model
- WorkPackageItem artifacts relation
- `/api/work/[artifactId]` route
- `/api/client/engagement` route with artifact hydration
- Dashboard conditional View/Review buttons
- Company-first WorkPackage display
- Welcome page as loader-only
- Stage-based dashboard summary

❌ **Not Yet Implemented:**
- Comments on artifacts
- Approval workflow
- Version history
- Artifact editing UI
- Review submission endpoint

## Next Steps

1. **Artifact View Page**: Create `/app/work/[artifactId]/page.jsx` to display artifact content
2. **Review Submission**: Add `PATCH /api/work/[artifactId]/review` to handle client reviews
3. **Status Updates**: Update artifact status when client reviews
4. **Notifications**: Alert clients when artifacts are ready for review

## Database Migration

After updating the Prisma schema, run:

```bash
npx prisma migrate dev --name add_work_artifact_models
npx prisma generate
```

This will:
- Create `work_artifacts` table
- Add `artifacts` relation to `work_package_items`
- Add indexes for performance

## Security Considerations

1. **Token Verification**: All routes verify Firebase token
2. **Ownership Validation**: Artifacts are validated against contact's WorkPackage
3. **Company Scoping**: WorkPackages are scoped to company, not just contact
4. **Read-Only Access**: Clients can view/review but not edit artifacts (for now)

## Related Documentation

- `CLIENT_PORTAL_DEV_GUIDE.md` - Overall client portal architecture
- `CONTEXT_AWARE_HYDRATION.md` - Hydration patterns
- `WELCOME_ROUTER_ARCHITECTURE.md` - Welcome page routing logic

