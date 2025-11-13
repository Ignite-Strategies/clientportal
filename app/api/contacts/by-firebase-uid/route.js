import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/contacts/by-firebase-uid
 * Step 1: Contact Lookup/Retrieval
 * 
 * Client portal architecture:
 * - User is ALREADY authenticated via Firebase (can't get here without it)
 * - Just FIND the contact by firebaseUid (no create logic)
 * - Returns contact info for hydration
 */
export async function GET(request) {
  try {
    // Verify Firebase token (user must be authenticated)
    const decodedToken = await verifyFirebaseToken(request);
    const firebaseUid = decodedToken.uid;

    // FIND contact by Firebase UID (no create - they're already authenticated)
    const contact = await prisma.contact.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        ownerId: true,
        crmId: true,
        isActivated: true,
        contactCompanyId: true,
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
        { success: false, error: 'Contact not found. Please ensure your account is activated.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error('❌ GetContactByFirebaseUid error:', error);
    
    // Handle unauthorized (invalid token)
    if (error.message?.includes('Unauthorized') || error.message?.includes('token')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired token' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get contact',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

