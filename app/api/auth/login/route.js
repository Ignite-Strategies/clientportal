import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/jwt';

/**
 * POST /api/auth/login
 * Client portal login - verify password and issue JWT
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 },
      );
    }

    // Find contact by email
    const contact = await prisma.contact.findFirst({
      where: {
        email: email.toLowerCase().trim(),
      },
      include: {
        contactCompany: true,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Check if portal access is configured
    let authData = null;
    if (contact.notes) {
      try {
        const notes = JSON.parse(contact.notes);
        authData = notes.clientPortalAuth;
      } catch (e) {
        // Notes not JSON, skip
      }
    }

    if (!authData || !authData.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Portal access not configured. Please use your invite link to set up access.' },
        { status: 403 },
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, authData.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = generateToken(contact.id, contact.email);

    // Return token and contact info
    return NextResponse.json({
      success: true,
      token,
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        contactCompanyId: contact.contactCompanyId,
        contactCompany: contact.contactCompany,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to login',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

