import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/client/work/artifacts/[artifactId]
 * Get a single workCollateral for client view
 * Validates that the workCollateral belongs to the authenticated contact's WorkPackage
 */
export async function GET(request, { params }) {
  try {
    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(request);
    const firebaseUid = decodedToken.uid;

    // Get contact by Firebase UID
    const contact = await prisma.contact.findUnique({
      where: { firebaseUid },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 },
      );
    }

    // Get artifactId from params (route param name kept for backward compatibility)
    const { artifactId } = await params;

    if (!artifactId) {
      return NextResponse.json(
        { success: false, error: 'Collateral ID is required' },
        { status: 400 },
      );
    }

    // Find workCollateral with related WorkPackageItem and WorkPackage
    const collateral = await prisma.workCollateral.findUnique({
      where: { id: artifactId },
      include: {
        workPackageItem: {
          include: {
            workPackage: {
              include: {
                contact: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        workPackage: {
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!collateral) {
      return NextResponse.json(
        { success: false, error: 'Collateral not found' },
        { status: 404 },
      );
    }

    // Verify collateral belongs to this contact's WorkPackage
    const workPackage = collateral.workPackageItem?.workPackage || collateral.workPackage;
    if (!workPackage || workPackage.contactId !== contact.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Collateral does not belong to your work package' },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      collateral: {
        id: collateral.id,
        type: collateral.type,
        title: collateral.title,
        contentJson: collateral.contentJson,
        status: collateral.status,
        reviewRequestedAt: collateral.reviewRequestedAt,
        reviewCompletedAt: collateral.reviewCompletedAt,
        createdAt: collateral.createdAt,
        updatedAt: collateral.updatedAt,
      },
      workPackageItem: collateral.workPackageItem ? {
        id: collateral.workPackageItem.id,
        deliverableLabel: collateral.workPackageItem.deliverableLabel,
        deliverableDescription: collateral.workPackageItem.deliverableDescription,
        status: collateral.workPackageItem.status,
      } : null,
    });
  } catch (error) {
    console.error('❌ Get collateral error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get collateral',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

