import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/client/state
 * Check user state to determine routing
 * Returns: proposals, deliverables, and routing decision
 */
export async function GET(request) {
  try {
    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(request);
    const firebaseUid = decodedToken.uid;

    // Get contact by Firebase UID
    const contact = await prisma.contact.findUnique({
      where: { firebaseUid },
      include: {
        contactCompany: true,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 },
      );
    }

    // Get proposals for this contact's company
    const proposals = contact.contactCompanyId
      ? await prisma.proposal.findMany({
          where: {
            companyId: contact.contactCompanyId,
          },
          include: {
            company: true,
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    // Get deliverables for this contact
    const deliverables = await prisma.consultantDeliverable.findMany({
      where: { contactId: contact.id },
      orderBy: { dueDate: 'asc' },
    });

    // Determine state
    const hasApprovedProposals = proposals.some((p) => p.status === 'approved');
    const hasDeliverables = deliverables.length > 0;
    const hasDraftProposals = proposals.some((p) => p.status === 'draft');
    const hasActiveProposals = proposals.some((p) => p.status === 'active');

    // Strategic Routing Logic:
    // Scenario 1: Owner sends contact when proposal is ready → Show proposal view
    // Scenario 2: Owner sends contact when work starts → Show dashboard with deliverables
    
    // Check if work has actually started:
    // - Deliverables with workContent (actual work artifacts) - if field exists
    // - OR deliverables with status "in-progress" or "completed"
    const deliverablesWithWork = deliverables.filter(
      (d) => {
        // Check if workContent exists (field may not exist in schema yet)
        const hasWorkContent = d.workContent !== null && d.workContent !== undefined;
        const hasActiveStatus = d.status === 'in-progress' || d.status === 'completed';
        return hasWorkContent || hasActiveStatus;
      }
    );
    const workHasStarted = deliverablesWithWork.length > 0;

    // Find proposals for routing
    const firstDraftProposal = proposals.find((p) => p.status === 'draft');
    const firstApprovedProposal = proposals.find((p) => p.status === 'approved');
    const firstActiveProposal = proposals.find((p) => p.status === 'active');
    
    // Priority: approved > active > draft
    const primaryProposal = firstApprovedProposal || firstActiveProposal || firstDraftProposal;

    // Strategic routing decision
    let route, routeReason;
    if (workHasStarted) {
      // Scenario 2: Work has started → Dashboard
      route = '/dashboard';
      routeReason = 'work_started';
    } else if (primaryProposal) {
      // Scenario 1: Proposal ready, no work yet → Proposal view
      route = `/proposals/${primaryProposal.id}`;
      routeReason = 'proposal_ready';
    } else {
      // Fallback: Dashboard (will show empty state)
      route = '/dashboard';
      routeReason = 'no_proposals';
    }

    return NextResponse.json({
      success: true,
      state: {
        contact: {
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          contactCompanyId: contact.contactCompanyId,
          companyName: contact.contactCompany?.companyName || null,
        },
        proposals: proposals.map((p) => ({
          id: p.id,
          clientCompany: p.clientCompany,
          status: p.status,
          purpose: p.purpose,
        })),
        deliverables: deliverables.map((d) => ({
          id: d.id,
          title: d.title,
          status: d.status,
          category: d.category,
          dueDate: d.dueDate,
          hasWorkContent: !!d.workContent,
        })),
        hasApprovedProposals,
        hasDeliverables,
        hasDraftProposals,
        hasActiveProposals,
        workHasStarted,
        routing: {
          route,
          routeReason,
          proposalId: primaryProposal?.id || null,
        },
      },
    });
  } catch (error) {
    console.error('❌ GetClientState error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get client state',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

