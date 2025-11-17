# Client Portal Documentation Index

Complete guide to all markdown documentation files in the Ignite Client Portal project.

## 📚 Documentation Files

### Root Level Documentation

1. **`README.md`** (59 lines)
   - Project overview and architecture
   - Product model (standalone vs add-on)
   - Setup basics
   - Database sharing explanation
   - Deployment notes

2. **`SETUP.md`** (67 lines)
   - Step-by-step setup instructions
   - Environment variables
   - Prisma configuration
   - Architecture overview
   - Routes documentation

3. **`VERCEL_ENV_VARS.md`** (79 lines)
   - Required environment variables for Vercel
   - Database configuration
   - Firebase client SDK setup
   - Quick copy-paste values
   - Deployment checklist

4. **`FAVICON.md`** (83 lines)
   - Favicon strategy (intentionally no static favicon)
   - Icon usage guidelines
   - Why lucide-react is used inline
   - Best practices for icon management

5. **`INVOICE_PAYMENT_QUICK_START.md`** (113 lines)
   - Quick reference for invoice payment system
   - Implementation summary
   - Next steps checklist
   - Testing guide
   - Troubleshooting tips

---

### `/docs` Directory - Detailed Guides

6. **`docs/ARCHITECTURE.md`** (405 lines)
   - Complete architecture overview
   - Self-contained architecture principle
   - Firebase UID bridge concept
   - API route structure
   - Database access patterns
   - Security model

7. **`docs/CLIENT_PORTAL_DEV_GUIDE.md`** (507 lines)
   - **Main developer guide** - Most comprehensive
   - Contact-first architecture
   - Data sources (Proposals, WorkPackages, Deliverables)
   - User flow documentation
   - API endpoints reference
   - Component structure
   - State management
   - Development workflow

8. **`docs/ACTIVATION_FLOW.md`** (216 lines)
   - Activation vs Login flow
   - Invite link process
   - Password setup
   - Firebase user creation
   - Step-by-step flow diagrams

9. **`docs/CLIENT_PORTAL_SESSION.md`** (374 lines)
   - Session management architecture
   - `useClientPortalSession` hook documentation
   - localStorage keys reference
   - Hydration flow (Step 1: Contact, Step 2: Company/Proposals)
   - State synchronization
   - Best practices

10. **`docs/CONTEXT_AWARE_HYDRATION.md`** (303 lines)
    - Dynamic content hydration
    - Context-based page updates
    - Proposal/Foundational Work/Timeline contexts
    - Layout structure
    - Implementation patterns

11. **`docs/PROPOSAL_STRUCTURE.md`** (182 lines)
    - Proposal data structure
    - Single-page scroll interface
    - Component breakdown
    - Future integration points
    - Design patterns

12. **`docs/WELCOME_ROUTER_ARCHITECTURE.md`** (221 lines)
    - Welcome page as smart router
    - Routing logic based on user state
    - Decision tree (no proposals → draft → approved → active work)
    - Implementation details

13. **`docs/UNIVERSAL_CONTACT_PERSONHOOD.md`** (525 lines)
    - Universal personhood concept
    - One Firebase UID = One Contact = Access everywhere
    - Database sharing explanation
    - `firebaseUid` bridge field
    - Cross-app identity management

14. **`docs/INVOICE_PAYMENT_SETUP.md`** (226 lines)
    - **Invoice payment system complete guide**
    - Database schema (Invoice model)
    - API endpoints documentation
    - Frontend components
    - Stripe configuration
    - Webhook setup
    - Testing guide
    - Troubleshooting

15. **`docs/buildprismaonvercel.md`** (219 lines)
    - Prisma client generation on Vercel
    - Build configuration
    - Troubleshooting Prisma errors
    - Vercel-specific setup
    - Common issues and solutions

---

## 📖 Documentation by Topic

### Getting Started
- **`README.md`** - Project overview
- **`SETUP.md`** - Initial setup
- **`VERCEL_ENV_VARS.md`** - Environment configuration

### Architecture & Design
- **`docs/ARCHITECTURE.md`** - Overall architecture
- **`docs/CLIENT_PORTAL_DEV_GUIDE.md`** - Comprehensive dev guide
- **`docs/UNIVERSAL_CONTACT_PERSONHOOD.md`** - Identity model

### User Flows
- **`docs/ACTIVATION_FLOW.md`** - First-time activation
- **`docs/WELCOME_ROUTER_ARCHITECTURE.md`** - Welcome page routing
- **`docs/CLIENT_PORTAL_SESSION.md`** - Session management

### Features
- **`docs/PROPOSAL_STRUCTURE.md`** - Proposal system
- **`docs/INVOICE_PAYMENT_SETUP.md`** - Invoice payment system
- **`INVOICE_PAYMENT_QUICK_START.md`** - Invoice payment quick ref
- **`docs/CONTEXT_AWARE_HYDRATION.md`** - Dynamic content

### Deployment & Operations
- **`docs/buildprismaonvercel.md`** - Vercel deployment
- **`VERCEL_ENV_VARS.md`** - Environment variables
- **`FAVICON.md`** - Asset management

---

## 🎯 Quick Reference

### For New Developers
1. Start with **`README.md`** and **`SETUP.md`**
2. Read **`docs/ARCHITECTURE.md`** for system design
3. Deep dive into **`docs/CLIENT_PORTAL_DEV_GUIDE.md`** for implementation details

### For Feature Development
- **Proposals**: `docs/PROPOSAL_STRUCTURE.md`
- **Invoices**: `docs/INVOICE_PAYMENT_SETUP.md` + `INVOICE_PAYMENT_QUICK_START.md`
- **Authentication**: `docs/ACTIVATION_FLOW.md` + `docs/UNIVERSAL_CONTACT_PERSONHOOD.md`
- **State Management**: `docs/CLIENT_PORTAL_SESSION.md`

### For Troubleshooting
- **Prisma Issues**: `docs/buildprismaonvercel.md`
- **Environment Setup**: `VERCEL_ENV_VARS.md`
- **Payment Issues**: `docs/INVOICE_PAYMENT_SETUP.md` (Troubleshooting section)

### For Deployment
- **Environment Variables**: `VERCEL_ENV_VARS.md`
- **Build Configuration**: `docs/buildprismaonvercel.md`
- **Asset Management**: `FAVICON.md`

---

## 📊 Documentation Statistics

- **Total Files**: 15 markdown files
- **Total Lines**: ~3,500+ lines of documentation
- **Most Comprehensive**: `docs/CLIENT_PORTAL_DEV_GUIDE.md` (507 lines)
- **Most Recent**: `docs/INVOICE_PAYMENT_SETUP.md` (added with invoice payment feature)

---

## 🔄 Documentation Maintenance

### When to Update Documentation

- **New Feature Added**: Create or update relevant docs
- **Architecture Change**: Update `ARCHITECTURE.md` and `CLIENT_PORTAL_DEV_GUIDE.md`
- **API Changes**: Update endpoint documentation in dev guide
- **Environment Changes**: Update `VERCEL_ENV_VARS.md`
- **Flow Changes**: Update activation/session/welcome docs

### Documentation Standards

- Use clear headings and structure
- Include code examples where helpful
- Add troubleshooting sections for complex features
- Keep quick start guides concise
- Maintain architecture diagrams when possible

---

**Last Updated**: January 2025  
**Maintained By**: Ignite Strategies Team

