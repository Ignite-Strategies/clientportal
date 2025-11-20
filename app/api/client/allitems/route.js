import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';
import { mapItemStatus } from '@/lib/services/StatusMapperService';

/**
 * GET /api/client/allitems?workPackageId={id}
 * 
 * Dashboard hydration - summary data only
 * 
 * Client MUST pass workPackageId from localStorage
 * Server validates: firebaseUid → contact → company → workPackage belongs to company
 * 
 * Returns:
 * - stats: computed counts
 * - needsReviewItems: items needing review
 * - currentPhase: current phase with items
 * - workPackage: work package metadata
 * - contact: contact information
 */
export async function GET(request) {
  try {
    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(request);
    const firebaseUid = decodedToken.uid;

    // Get workPackageId from query params (MUST be provided from localStorage)
    const { searchParams } = request.nextUrl;
    const workPackageId = searchParams.get('workPackageId');

    if (!workPackageId) {
      return NextResponse.json(
        { success: false, error: 'workPackageId is required' },
        { status: 400 },
      );
    }

    // Step 1: Get contact by Firebase UID
    const contact = await prisma.contact.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        contactCompanyId: true,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 },
      );
    }

    if (!contact.contactCompanyId) {
      return NextResponse.json(
        { success: false, error: 'Contact has no company' },
        { status: 400 },
      );
    }

    // Step 2: Get workPackage and validate it belongs to contact's company
    const workPackage = await prisma.workPackage.findUnique({
      where: { id: workPackageId },
      select: {
        id: true,
        title: true,
        description: true,
        prioritySummary: true,
        companyId: true,
        contactId: true,
      },
    });

    if (!workPackage) {
      return NextResponse.json(
        { success: false, error: 'Work package not found' },
        { status: 404 },
      );
    }

    // Step 3: Validate workPackage belongs to contact's company
    // MUST match companyId (no fallback to contactId)
    if (workPackage.companyId !== contact.contactCompanyId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Work package does not belong to your company' },
        { status: 403 },
      );
    }

    // Step 4: Get all items for stats (minimal fields only)
    // Handle case where workCollateral table might not exist yet
    let allItems = [];
    try {
      allItems = await prisma.workPackageItem.findMany({
        where: { workPackageId: workPackage.id },
        select: {
          id: true,
          status: true,
          deliverableLabel: true,
          deliverableDescription: true,
          workPackagePhaseId: true,
          workCollateral: {
            select: {
              id: true,
              status: true,
              reviewRequestedAt: true,
              type: true,
              title: true,
            },
          },
        },
      });
    } catch (error) {
      // If workCollateral table doesn't exist, query without it
      if (error.code === 'P2021' && error.meta?.table === 'work_collateral') {
        console.warn('⚠️ work_collateral table does not exist, querying without workCollateral relation');
        allItems = await prisma.workPackageItem.findMany({
          where: { workPackageId: workPackage.id },
          select: {
            id: true,
            status: true,
            deliverableLabel: true,
            deliverableDescription: true,
            workPackagePhaseId: true,
          },
        });
        // Add empty workCollateral array to each item for compatibility
        allItems = allItems.map(item => ({ ...item, workCollateral: [] }));
      } else {
        throw error; // Re-throw if it's a different error
      }
    }

    // Step 5: Get all phases (with status) - used for current phase determination
    // This will be replaced by phasesWithStatus in Step 8, but kept for now for compatibility

    // Step 6: Compute stats
    const stats = {
      total: allItems.length,
      completed: 0,
      inProgress: 0,
      needsReview: 0,
      notStarted: 0,
    };

    allItems.forEach((item) => {
      const status = mapItemStatus(item, item.workCollateral || []);
      if (status === "APPROVED") stats.completed++;
      else if (status === "IN_PROGRESS") stats.inProgress++;
      else if (status === "IN_REVIEW") stats.needsReview++;
      else if (status === "CHANGES_NEEDED") stats.needsReview++; // Changes needed also needs review
      else stats.notStarted++;
    });

    // Step 7: Get needs review items
    const needsReviewItems = allItems.filter((item) => {
      const status = mapItemStatus(item, item.workCollateral || []);
      return status === "IN_REVIEW" || status === "CHANGES_NEEDED";
    });

    // Step 8: Get phase statuses from database
    const phasesWithStatus = await prisma.workPackagePhase.findMany({
      where: { workPackageId: workPackage.id },
      select: {
        id: true,
        name: true,
        description: true,
        position: true,
        status: true,
      },
      orderBy: { position: 'asc' },
    });

    // Step 9: Determine current phase (first non-completed phase)
    // Current phase = first phase that is not 'completed'
    const currentPhase = phasesWithStatus.find(
      (phase) => phase.status !== 'completed'
    ) || null;

    // Step 10: Get items for current phase only
    let currentPhaseItems = [];
    if (currentPhase) {
      currentPhaseItems = allItems.filter(item => item.workPackagePhaseId === currentPhase.id);
    }

    return NextResponse.json({
      success: true,
      workPackageId: workPackage.id,
      stats,
      needsReviewItems,
      currentPhase: currentPhase
        ? {
            ...currentPhase,
            items: currentPhaseItems,
          }
        : null,
      workPackage: {
        id: workPackage.id,
        title: workPackage.title,
        description: workPackage.description,
        prioritySummary: workPackage.prioritySummary || null,
      },
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
      },
    });
  } catch (error) {
    console.error('❌ Get allitems error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get dashboard data',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

