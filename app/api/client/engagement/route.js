import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';
import { hydrateWorkPackage } from '@/lib/services/WorkPackageHydrationService';

/**
 * GET /api/client/engagement?workPackageId={id}
 * 
 * MVP1: Returns work package hydrated by workPackageId (like main app)
 * If no workPackageId, finds by contactId
 * 
 * Returns:
 * - { success: true, workPackage: {...}, company: {...} } if work package exists
 * - { success: true, workPackage: null, company: {...} } if no work package
 */
export async function GET(request) {
  try {
    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(request);
    const firebaseUid = decodedToken.uid;

    // Get workPackageId from query params (optional - if provided, use it)
    const { searchParams } = request.nextUrl;
    const workPackageId = searchParams.get('workPackageId');

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

    // Get company info for display (from contact's company)
    const company = contact.contactCompany ? {
      id: contact.contactCompany.id,
      companyName: contact.contactCompany.companyName,
    } : null;

    let workPackage;

    if (workPackageId) {
      // Hydrate by workPackageId (like main app pattern)
      workPackage = await prisma.workPackage.findUnique({
        where: { id: workPackageId },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              contactCompany: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
            },
          },
          company: {
            select: {
              id: true,
              companyName: true,
            },
          },
          phases: {
            include: {
              items: {
                include: {
                  collateral: true,
                },
              },
            },
            orderBy: { position: 'asc' },
          },
          items: {
            include: {
              collateral: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      // Verify work package belongs to this contact
      if (workPackage && workPackage.contactId !== contact.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Work package does not belong to this contact' },
          { status: 403 },
        );
      }
    } else {
      // Find work package by contactId (get the first/most recent one)
      workPackage = await prisma.workPackage.findFirst({
        where: { contactId: contact.id },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              contactCompany: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
            },
          },
          company: {
            select: {
              id: true,
              companyName: true,
            },
          },
          phases: {
            include: {
              items: {
                include: {
                  collateral: true,
                },
              },
            },
            orderBy: { position: 'asc' },
          },
          items: {
            include: {
              collateral: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // If no work package, return null with company info
    if (!workPackage) {
      return NextResponse.json({
        success: true,
        workPackage: null,
        company,
        contact: {
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
        },
      });
    }

    // Hydrate work package using the same service as main app (client view - published only)
    const hydrated = await hydrateWorkPackage(workPackage, { clientView: true });

    // Transform to MVP1 format
    const transformed = {
      id: hydrated.id,
      title: hydrated.title,
      description: hydrated.description,
      items: hydrated.items.map((item) => ({
        id: item.id,
        deliverableName: item.deliverableLabel || item.itemLabel || 'Deliverable',
        artifacts: item.artifacts?.map((artifact) => ({
          id: artifact.id,
          type: artifact.collateralType?.toUpperCase() || 'UNKNOWN',
          status: artifact.published ? 'PUBLISHED' : 'DRAFT',
        })) || [],
      })),
      // Include company from workPackage (if exists) or from contact
      company: hydrated.company || company,
      contact: hydrated.contact ? {
        id: hydrated.contact.id,
        firstName: hydrated.contact.firstName,
        lastName: hydrated.contact.lastName,
        email: hydrated.contact.email,
      } : {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
      },
    };

    return NextResponse.json({
      success: true,
      workPackage: transformed,
      workPackageId: hydrated.id, // Include workPackageId for reference
      company: transformed.company,
      contact: transformed.contact,
    });
  } catch (error) {
    console.error('❌ GetClientEngagement error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get engagement',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
