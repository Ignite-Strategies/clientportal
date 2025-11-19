# Architecture Audit: CLIENT_PORTAL_ARCHITECTURE.md vs Current Implementation

## 🔍 WHAT WELCOME PAGE ACTUALLY CALLS

**Welcome Page Calls:**
```javascript
GET /api/client
```

**What `/api/client` Route Actually Does:**
1. ✅ Gets contact by `firebaseUid`
2. ✅ Returns contact with `contactCompanyId`
3. ❌ **ALSO looks up workPackageId** (NOT in architecture - we added this)
4. ❌ **Returns extra fields**: `role`, `ownerId`, `crmId`, `isActivated`, `company`, `workPackageId`, `firebaseUid`

**What Welcome Stores:**
- ✅ `clientPortalContactId`
- ✅ `clientPortalContactCompanyId`
- ✅ `clientPortalContactEmail`
- ✅ `firebaseId`
- ❌ `clientPortalWorkPackageId` (NOT in architecture - we added this)

**Architecture Says:**
- `/api/client` should ONLY return: `contactId`, `contactCompanyId`, basic contact fields
- Should NOT return `workPackageId` (should be derived server-side on dashboard)

---

## 🚨 CRITICAL MISMATCHES

### 1. **WorkCollateral vs WorkArtifact**

**Architecture Doc Says:**
- ❌ **`Collateral` model** - Deprecated, replaced by `WorkArtifact`
- ⚠️ **`WorkArtifact`** - FUTURE FEATURE: Not yet implemented
- Items should have `artifacts: WorkArtifact[]` relation

**What We Actually Have:**
- ✅ Using `workCollateral` in `/api/client/work` route
- ❌ Querying `workCollateral` instead of `artifacts`
- ❌ Architecture doc says artifacts don't exist yet, but we're using workCollateral

**Verdict:** We're using the wrong model! Architecture says Collateral is deprecated, but WorkArtifact doesn't exist yet. We need to clarify which one to use.

---

### 2. **`/api/client` Route - Extra Fields**

**Architecture Doc Says:**
```javascript
// Should return:
{
  success: true,
  data: {
    contact: {
      id: "contact-123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      contactCompanyId: "company-456"
    }
  }
}
```

**What We Actually Have:**
```javascript
// Returns EXTRA fields:
{
  success: true,
  data: {
    contact: {
      id: "contact-123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      contactCompanyId: "company-456",
      role: "contact",           // ❌ NOT IN ARCHITECTURE
      ownerId: "...",            // ❌ NOT IN ARCHITECTURE
      crmId: "...",              // ❌ NOT IN ARCHITECTURE (doc says we DON'T use this!)
      isActivated: true,         // ❌ NOT IN ARCHITECTURE
      companyName: "..."         // ❌ NOT IN ARCHITECTURE
    },
    company: {...},              // ❌ NOT IN ARCHITECTURE
    workPackageId: "...",        // ❌ NOT IN ARCHITECTURE (we added this)
    firebaseUid: "..."          // ❌ NOT IN ARCHITECTURE
  }
}
```

**Verdict:** We're returning way more than the architecture specifies. Should strip down to just what's needed.

---

### 3. **`/api/client/work` Route - Query Params**

**Architecture Doc Says:**
- Flow: `firebaseUid → contact → contactCompanyId → company → workPackages[0]`
- Optional query param: `?workPackageId={id}` (for loading specific package)
- Should derive workPackageId from `company.workPackages[0].id`
- Should include `artifacts: WorkArtifact[]` (but they don't exist yet)

**What We Actually Have:**
- ✅ Gets contact by firebaseUid
- ✅ Gets company by contactCompanyId
- ✅ Gets workPackages from company
- ❌ Has `?minimal=true` query param (NOT IN ARCHITECTURE)
- ❌ Uses `workCollateral` instead of `artifacts`
- ❌ Has fallback to `contactId` lookup (architecture says use company.workPackages)
- ❌ Authorization check: `workPackage.contactId !== contact.id` (should check companyId too)

**Verdict:** We added `minimal` param and fallback logic that's not in architecture. Also using wrong model (workCollateral vs artifacts).

---

### 4. **`/api/client/work/dashboard` Route**

**Architecture Doc Says:**
- ❌ **DOES NOT EXIST** - No mention of dashboard-specific route

**What We Actually Have:**
- ✅ Just deleted it (good!)
- Was trying to compute stats server-side
- Dashboard should use `/api/client/work` and compute stats client-side

**Verdict:** ✅ Fixed - we deleted it. Dashboard should use `/api/client/work`.

---

### 5. **Dashboard Page - What It Calls**

**Architecture Doc Says:**
- Should call: `GET /api/client/work` (no params, or `?workPackageId={id}`)
- Server derives workPackageId from company.workPackages[0]

**What We Actually Have:**
- ✅ Calls: `GET /api/client/work?minimal=true`
- ❌ Uses `minimal` param (not in architecture)
- ✅ Computes stats client-side (correct)

**Verdict:** Should remove `minimal` param or document why it exists.

---

### 6. **Welcome Page - What It Calls**

**Architecture Doc Says:**
- Should call: `GET /api/client`
- Should get: `contactId`, `contactCompanyId`
- Should store in localStorage: `clientPortalContactId`, `clientPortalContactCompanyId`, `clientPortalContactEmail`, `firebaseId`

**What We Actually Have:**
- ✅ Calls: `GET /api/client`
- ✅ Stores: `clientPortalContactId`, `clientPortalContactCompanyId`, `clientPortalContactEmail`, `firebaseId`
- ❌ Also stores: `clientPortalWorkPackageId` (NOT IN ARCHITECTURE - we added this)

**Verdict:** We're storing workPackageId in welcome, but architecture says it should be derived server-side on dashboard.

---

## 📋 SUMMARY OF DEVIATIONS

| Component | Architecture Says | We Actually Have | Status |
|-----------|------------------|------------------|--------|
| **`/api/client`** | Returns contact + contactCompanyId only | Returns extra fields + workPackageId | ❌ Too much |
| **`/api/client/work`** | Uses `artifacts: WorkArtifact[]` | Uses `workCollateral` | ❌ Wrong model |
| **`/api/client/work`** | Derives from `company.workPackages[0]` | Has fallback to `contactId` | ⚠️ Extra logic |
| **`/api/client/work`** | No `minimal` param | Has `?minimal=true` | ⚠️ Extra param |
| **`/api/client/work/dashboard`** | Doesn't exist | We created it, then deleted | ✅ Fixed |
| **Welcome** | Stores contactId, contactCompanyId | Also stores workPackageId | ❌ Extra storage |
| **Dashboard** | Calls `/api/client/work` | Calls `/api/client/work?minimal=true` | ⚠️ Extra param |

---

## 🔍 KEY QUESTIONS TO RESOLVE

1. **WorkCollateral vs WorkArtifact:**
   - Architecture says Collateral is deprecated
   - Architecture says WorkArtifact doesn't exist yet
   - We're using workCollateral - is this correct for now?

2. **`minimal` query param:**
   - Not in architecture doc
   - Should we remove it or document it?

3. **workPackageId in `/api/client`:**
   - Architecture doesn't specify this
   - We added it - should we remove it?

4. **Authorization in `/api/client/work`:**
   - Currently checks `workPackage.contactId !== contact.id`
   - Should also check `workPackage.companyId === contact.contactCompanyId`
   - Architecture says: `Company.id → WorkPackage.companyId`

---

## 🎯 WHAT NEEDS TO FIX

### High Priority:
1. **Clarify WorkCollateral vs WorkArtifact** - Which one should we actually use?
2. **Remove workPackageId from `/api/client`** - Should be derived server-side only
3. **Fix authorization in `/api/client/work`** - Should check companyId relationship
4. **Remove `minimal` param OR document it** - Not in architecture

### Medium Priority:
5. **Strip down `/api/client` response** - Remove extra fields (role, ownerId, crmId, etc.)
6. **Remove workPackageId storage in welcome** - Should be derived server-side

### Low Priority:
7. **Document why we have fallback to contactId** - Architecture says use company.workPackages only

---

## 📝 ARCHITECTURE FLOW (What It Should Be)

```
Welcome Page:
  → GET /api/client
  → Returns: { contact: { id, firstName, lastName, email, contactCompanyId } }
  → Stores: contactId, contactCompanyId, email, firebaseId

Dashboard Page:
  → GET /api/client/work (NO PARAMS)
  → Server: firebaseUid → contact → contactCompanyId → company → workPackages[0]
  → Returns: { workPackage: { id, title, description, phases, items } }
  → Client computes: stats, needsReviewItems, currentPhase

WorkPackage Detail Page:
  → GET /api/client/work?workPackageId={id} (optional - if specific package)
  → Returns: Full WorkPackage with all data
```

---

## 🚨 CRITICAL: WorkCollateral vs WorkArtifact

**The architecture doc is contradictory:**
- Says "Collateral model - Deprecated, replaced by WorkArtifact"
- Says "WorkArtifact - FUTURE FEATURE: Not yet implemented"
- Says items should have `artifacts: WorkArtifact[]` relation

**But we're using:**
- `workCollateral` in the database
- `workCollateral` in queries

**We need to decide:**
1. Use `workCollateral` for now (until WorkArtifact is implemented)?
2. Or is WorkArtifact actually implemented and we should use that?

This is the biggest mismatch and needs immediate clarification.

