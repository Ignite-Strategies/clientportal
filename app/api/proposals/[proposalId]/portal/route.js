import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/proposals/:proposalId/portal
 * Get portal data for a proposal (client-facing)
 * Shares database with IgniteBD
 */
export async function GET(request, { params }) {
  try {
    const { proposalId } = params || {};
    if (!proposalId) {
      return NextResponse.json(
        { success: false, error: 'proposalId is required' },
        { status: 400 },
      );
    }

    // Get proposal from shared database
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        company: {
          include: {
            contacts: {
              take: 1, // Primary contact
            },
          },
        },
        deliverables: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 },
      );
    }

    // Get deliverables for the contact
    const contactId = proposal.company?.contacts?.[0]?.id;
    const deliverables = contactId
      ? await prisma.consultantDeliverable.findMany({
          where: { contactId, proposalId },
          orderBy: { dueDate: 'asc' },
        })
      : [];

    // Transform to portal format
    const portalData = {
      client: {
        name: proposal.clientName,
        company: proposal.clientCompany,
        contactEmail: proposal.company?.contacts?.[0]?.email,
        contactId,
      },
      contract: {
        contractId: proposal.company?.contractId,
        status: proposal.status === 'approved' ? 'active' : 'pending',
      },
      deliverables: deliverables.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        category: d.category,
        dueDate: d.dueDate,
        completedAt: d.completedAt,
      })),
      proposal: {
        id: proposal.id,
        purpose: proposal.purpose,
        phases: proposal.phases,
        milestones: proposal.milestones,
        status: proposal.status,
      },
      payments: proposal.compensation?.paymentSchedule || [],
      status: {
        overall: proposal.status,
        completedDeliverables: deliverables.filter((d) => d.status === 'completed').length,
        totalDeliverables: deliverables.length,
      },
    };

    return NextResponse.json({ success: true, portalData });
  } catch (error) {
    console.error('❌ GetPortalData error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get portal data',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

