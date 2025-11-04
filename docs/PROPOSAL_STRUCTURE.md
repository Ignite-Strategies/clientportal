# Ignite Client Portal - Proposal Structure

This document defines the canonical proposal structure used for the Ignite Client Portal. The BusinessPoint Law proposal serves as the reference implementation.

## Architecture Overview

The proposal experience is a **single-page scroll** interface with the following sections:

1. **Hero/Header Layer** - Animated welcome with gradient background
2. **Purpose Section** - Mission statement with accordion
3. **Scope of Work** - Interactive phase cards
4. **Compensation Section** - Payment visualization
5. **Interactive Timeline** - 8-node milestone tracker
6. **CLE Spotlight** - Special deliverable highlight
7. **Feedback & Collaboration Zone** - Client feedback input
8. **Approval Footer** - Fixed CTA bar

## Data Structure

All proposal data is located in `src/data/mockData.js` and follows this structure:

```javascript
{
  client: {
    name: "Client Name",
    company: "Company Name",
    contactEmail: "email@example.com"
  },
  proposal: {
    dateIssued: "Nov 3, 2025",
    duration: "8 Weeks",
    total: 1500,
    currency: "USD",
    paymentStructure: "3 × $500 payments",
    status: "Active"
  },
  purpose: {
    headline: "Main purpose statement",
    description: "Detailed description",
    whyThisMatters: ["Point 1", "Point 2", "Point 3"]
  },
  phases: [
    {
      id: 1,
      name: "Phase Name",
      weeks: "1-3",
      color: "red|yellow|purple",
      goal: "Phase goal",
      deliverables: ["Deliverable 1", "Deliverable 2"],
      outcome: "Expected outcome"
    }
  ],
  payments: [
    {
      id: 1,
      amount: 500,
      week: 1,
      trigger: "Kickoff",
      description: "Payment description",
      status: "pending|paid",
      dueDate: "Week 1"
    }
  ],
  timeline: [
    {
      week: 1,
      phase: "Phase Name",
      phaseColor: "red|yellow|purple",
      milestone: "Milestone Name",
      deliverable: "Deliverable description",
      phaseId: 1,
      paymentId: 2 // Optional, if payment occurs this week
    }
  ],
  cleInitiative: {
    title: "CLE Title",
    description: "Description",
    value: "Value proposition",
    deliverable: "Deliverable description"
  }
}
```

## Components

### HeroHeader
- Animated gradient background (crimson → amber → violet)
- Client welcome message
- Proposal metadata (date, duration, status)
- Scroll-to-content CTA

### PurposeSection
- Main purpose statement
- Expandable "Why this matters" accordion

### PhaseCard
- Expandable card for each phase
- Color-coded by phase (red/yellow/purple)
- Shows goal, deliverables, and outcome

### InteractiveTimeline
- Horizontal 8-node timeline
- Phase color coding
- Clickable nodes that open MilestoneModal
- Hover effects linked to PaymentBar

### PaymentBar
- Payment structure visualization
- Highlights on timeline hover
- Shows payment status (pending/paid)

### MilestoneModal
- Opens from timeline node clicks
- Shows week, phase, milestone, and deliverable
- Placeholder for "Mark Complete" and "View Docs" buttons

### CLESpotlight
- Special highlight section for CLE deliverables
- Optional preview link (future)

### FeedbackBox
- Text input for client feedback
- Toast notification on submit
- Ready for backend API integration

### ApprovalFooter
- Fixed bottom bar
- "Schedule Walkthrough" and "Approve Proposal" buttons
- Confetti effect on approval
- Locks page into read-only mode after approval

## Future Integration Points

### Backend API Structure
When ready to integrate with IgniteBDStack backend:

1. **Data Fetching**: Replace `mockData.js` imports with API calls
2. **Engagement ID**: Use URL parameter `/proposal/:engagementId` to fetch proposal data
3. **Client Token**: Authenticate client access via token
4. **Payment Status**: Update payment status from backend
5. **Feedback API**: POST feedback to backend endpoint
6. **Approval API**: POST approval action to backend

### Proposed API Endpoints
```
GET /api/proposals/:engagementId
POST /api/proposals/:engagementId/feedback
POST /api/proposals/:engagementId/approve
GET /api/proposals/:engagementId/payments
PUT /api/proposals/:engagementId/payments/:paymentId/status
```

## Creating New Proposals

To create a new proposal:

1. Copy the structure from `mockData.js`
2. Update all data fields with new proposal information
3. Adjust phases, timeline, and payments as needed
4. Ensure phase colors match (red/yellow/purple for 3 phases)
5. Timeline should have 8 nodes (one per week)
6. All components will automatically render with new data

## Design Patterns

- **Single-page scroll**: No navigation needed within proposal
- **Color coding**: Phases use consistent colors (red/yellow/purple)
- **Interactive elements**: Hover states, expandable cards, modals
- **Responsive design**: Mobile-first approach
- **Animation**: Subtle fade-ins and transitions
- **Fixed footer**: Approval CTA always visible

## Extensions

Future enhancements:
- PDF export mode
- Signature integration (DocuSign)
- AI proposal generation
- Proposal-to-project transition
- Real-time collaboration features

