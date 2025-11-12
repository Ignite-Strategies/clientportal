import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/verify-contact
 * Verify ContactId-based login (username/password)
 * Universal personhood - same Contact, different context
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password, contactId } = body ?? {};

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 },
      );
    }

    // Find contact by contactId or username/email
    let contact;
    if (contactId) {
      contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: {
          contactCompany: true,
          companyHQ: true,
        },
      });
    } else {
      // Find by email (username might be email)
      contact = await prisma.contact.findFirst({
        where: {
          email: username,
        },
        include: {
          contactCompany: true,
          companyHQ: true,
        },
      });
    }

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Check stored credentials
    let authData = null;
    if (contact.notes) {
      try {
        const notes = JSON.parse(contact.notes);
        authData = notes.clientPortalAuth;
      } catch (e) {
        // Notes not JSON, skip
      }
    }

    if (!authData) {
      return NextResponse.json(
        { success: false, error: 'No portal access configured for this contact' },
        { status: 403 },
      );
    }

    // Verify password (simple check for now)
    const passwordHash = await hashPassword(password);
    if (passwordHash !== authData.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Return contact info for session
    return NextResponse.json({
      success: true,
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        contactCompanyId: contact.contactCompanyId,
        companyHQId: contact.crmId,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('❌ VerifyContact error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify credentials',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

