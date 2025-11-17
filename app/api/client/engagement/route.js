import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/client/engagement
 * 
 * MVP1: Returns the single work package for this contact
 * Fetches by contactId (from authenticated Firebase user)
 * But includes company information for display
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

    // Find work package by contactId (get the first/most recent one)
    const workPackage = await prisma.workPackage.findFirst({
      where: { contactId: contact.id },
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
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get company info for display (from contact's company)
    const company = contact.contactCompany ? {
      id: contact.contactCompany.id,
      companyName: contact.contactCompany.companyName,
    } : null;

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

    // Hydrate items with artifacts (MVP1 - use WorkArtifact model)
    const hydratedItems = await Promise.all(
      workPackage.items.map(async (item) => {
        // Load WorkArtifact records (primary source for MVP1)
        const workArtifacts = await prisma.workArtifact.findMany({
          where: { workPackageItemId: item.id },
          orderBy: { createdAt: 'asc' },
        });

        // Transform WorkArtifact to MVP1 format
        const artifacts = workArtifacts.map((artifact) => ({
          id: artifact.id,
          type: artifact.type,
          status: artifact.status, // DRAFT | IN_REVIEW | APPROVED | COMPLETED
        }));

        return {
          id: item.id,
          deliverableName: item.deliverableLabel || item.itemLabel || 'Deliverable',
          artifacts,
        };
      })
    );

    // Transform to MVP1 format - include company for display
    const transformed = {
      id: workPackage.id,
      title: workPackage.title,
      description: workPackage.description,
      items: hydratedItems,
      // Include company from workPackage (if exists) or from contact
      company: workPackage.company || company,
      contact: workPackage.contact ? {
        id: workPackage.contact.id,
        firstName: workPackage.contact.firstName,
        lastName: workPackage.contact.lastName,
        email: workPackage.contact.email,
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
      company: transformed.company, // Also include at top level for easy access
      contact: transformed.contact, // Also include at top level for easy access
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
