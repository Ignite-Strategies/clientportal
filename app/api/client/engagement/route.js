import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/client/engagement
 * Get client engagement data including work packages, deliverables, and artifacts
 * Returns stage-based summary with conditional artifact IDs
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
        contactCompany: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 },
      );
    }

    // Get work packages for this contact's COMPANY (not just the contact)
    // Work packages are scoped to the company (BusinessPoint Law), not the individual contact
    const workPackages = await prisma.workPackage.findMany({
      where: {
        OR: [
          { contactId: contact.id },
          { companyId: contact.contactCompanyId },
        ],
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        phases: {
          include: {
            items: {
              include: {
                artifacts: {
                  select: {
                    id: true,
                    type: true,
                    title: true,
                    status: true,
                    reviewRequestedAt: true,
                    reviewCompletedAt: true,
                  },
                  orderBy: { createdAt: 'desc' },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
        items: {
          include: {
            artifacts: {
              select: {
                id: true,
                type: true,
                title: true,
                status: true,
                reviewRequestedAt: true,
                reviewCompletedAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get deliverables (ConsultantDeliverable)
    const deliverables = await prisma.consultantDeliverable.findMany({
      where: { contactId: contact.id },
      orderBy: { createdAt: 'desc' },
    });

    // Determine current stage
    // Stage logic: If any artifact is IN_REVIEW, stage is "review"
    // If any work package exists, stage is "active"
    // Otherwise "onboarding"
    let stage = 'onboarding';
    let needsReview = false;

    for (const wp of workPackages) {
      for (const item of wp.items) {
        if (item.artifacts.length > 0) {
          stage = 'active';
          const hasInReview = item.artifacts.some(a => a.status === 'IN_REVIEW');
          if (hasInReview) {
            stage = 'review';
            needsReview = true;
            break;
          }
        }
      }
      if (needsReview) break;
    }

    // Build deliverables array with conditional artifactId
    const deliverablesWithArtifacts = deliverables.map((deliverable) => {
      // Find matching work package item by title/description
      let artifactId = null;
      let artifactStatus = null;

      for (const wp of workPackages) {
        for (const item of wp.items) {
          if (item.deliverableLabel === deliverable.title || 
              item.deliverableDescription === deliverable.description) {
            // Get first artifact if exists
            if (item.artifacts.length > 0) {
              artifactId = item.artifacts[0].id;
              artifactStatus = item.artifacts[0].status;
            }
            break;
          }
        }
        if (artifactId) break;
      }

      return {
        id: deliverable.id,
        title: deliverable.title,
        description: deliverable.description,
        status: deliverable.status,
        category: deliverable.category,
        artifactId, // Only included if artifact exists
        artifactStatus, // Status of the artifact if exists
      };
    });

    // Build work package response - emphasize company, not individual contact
    const workPackageResponse = workPackages.length > 0 ? {
      id: workPackages[0].id,
      title: workPackages[0].title,
      description: workPackages[0].description,
      // Company is the primary identifier (BusinessPoint Law), not the contact
      company: workPackages[0].company ? {
        id: workPackages[0].company.id,
        companyName: workPackages[0].company.companyName,
      } : null,
      // Contact is secondary (who the work package is associated with)
      contact: workPackages[0].contact ? {
        id: workPackages[0].contact.id,
        name: `${workPackages[0].contact.firstName || ''} ${workPackages[0].contact.lastName || ''}`.trim(),
        email: workPackages[0].contact.email,
      } : null,
      items: workPackages[0].items.map((item) => ({
        id: item.id,
        deliverableLabel: item.deliverableLabel,
        deliverableDescription: item.deliverableDescription,
        status: item.status,
        artifacts: item.artifacts.map((artifact) => ({
          id: artifact.id,
          type: artifact.type,
          title: artifact.title,
          status: artifact.status,
        })),
      })),
    } : null;

    return NextResponse.json({
      success: true,
      stage,
      needsReview,
      deliverables: deliverablesWithArtifacts,
      workPackage: workPackageResponse,
    });
  } catch (error) {
    console.error('❌ Get engagement error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get engagement data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

