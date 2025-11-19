import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/client
 * Client Portal Contact Hydration
 * 
 * Get contact and contactCompanyId for session setup
 * 
 * Architecture:
 * - User is authenticated via Firebase (token in header)
 * - Find contact by firebaseUid
 * - Return contact + contactCompanyId
 */
export async function GET(request) {
  try {
    console.log('🔍 GET /api/client - Starting contact hydration...');
    
    // Verify Firebase token (user must be authenticated)
    console.log('🔍 Verifying Firebase token...');
    let decodedToken;
    try {
      decodedToken = await verifyFirebaseToken(request);
      console.log('✅ Firebase token verified:', { uid: decodedToken.uid, email: decodedToken.email });
    } catch (tokenError) {
      console.error('❌ Firebase token verification failed:', tokenError.message);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired token', details: tokenError.message },
        { status: 401 },
      );
    }

    const firebaseUid = decodedToken.uid;
    console.log('🔍 Looking up contact by firebaseUid:', firebaseUid);

    // Step 1: Get contact by Firebase UID
    let contact;
    try {
      contact = await prisma.contact.findUnique({
        where: { firebaseUid },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          contactCompanyId: true,
        },
      });
      console.log('🔍 Contact lookup result:', contact ? `Found contact ${contact.id}` : 'Contact not found');
    } catch (prismaError) {
      console.error('❌ Prisma error:', prismaError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          details: process.env.NODE_ENV === 'development' ? prismaError.message : undefined,
        },
        { status: 500 },
      );
    }

    if (!contact) {
      console.log('⚠️ Contact not found for firebaseUid:', firebaseUid);
      return NextResponse.json(
        { success: false, error: 'Contact not found. Please ensure your account is activated.' },
        { status: 404 },
      );
    }

    // Step 2: Get company by contactCompanyId
    let company = null;
    let workPackageId = null;
    
    if (contact.contactCompanyId) {
      company = await prisma.company.findUnique({
        where: { id: contact.contactCompanyId },
        select: {
          id: true,
          companyName: true,
        },
      });

      // Step 3: Get latest WorkPackage for this company
      // Single source of truth: company → workPackages (latest)
      if (company) {
        const workPackage = await prisma.workPackage.findFirst({
          where: {
            companyId: company.id, // ONLY companyId - no OR, no fallback
          },
          select: {
            id: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (workPackage) {
          workPackageId = workPackage.id;
        }
      }
    }

    // Build hydration response - ONLY what architecture specifies
    const hydrationData = {
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        contactCompanyId: contact.contactCompanyId,
      },
      company: company
        ? {
            id: company.id,
            companyName: company.companyName,
          }
        : null,
      workPackageId: workPackageId, // ALWAYS return this (even if null)
    };

    console.log('✅ Contact hydration complete:', {
      contactId: contact.id,
      companyId: contact.contactCompanyId,
      workPackageId: workPackageId || 'null',
    });

    return NextResponse.json({
      success: true,
      contact: hydrationData.contact,
      company: hydrationData.company,
      workPackageId: hydrationData.workPackageId,
    });
  } catch (error) {
    console.error('❌ Client hydration error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    
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
        error: 'Failed to hydrate contact',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

