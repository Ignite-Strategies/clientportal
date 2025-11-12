import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/jwt';

/**
 * POST /api/auth/setup
 * Set up password from invite token
 * Body: { token, contactId, password }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { token, contactId, password } = body ?? {};

    if (!token || !contactId || !password) {
      return NextResponse.json(
        { success: false, error: 'Token, contactId, and password are required' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    // Find contact
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 },
      );
    }

    // Check invite token
    let authData = null;
    if (contact.notes) {
      try {
        const notes = JSON.parse(contact.notes);
        authData = notes.clientPortalAuth;
      } catch (e) {
        // Notes not JSON
      }
    }

    if (!authData || authData.inviteToken !== token) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invite token' },
        { status: 401 },
      );
    }

    // Check if token expired
    if (authData.inviteTokenExpires && new Date(authData.inviteTokenExpires) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Invite token has expired' },
        { status: 401 },
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Update contact with password hash and remove invite token
    const updatedNotes = {
      ...(contact.notes ? JSON.parse(contact.notes) : {}),
      clientPortalAuth: {
        ...authData,
        passwordHash,
        passwordSetAt: new Date().toISOString(),
        inviteToken: undefined, // Remove invite token after use
        inviteTokenExpires: undefined,
      },
    };

    await prisma.contact.update({
      where: { id: contactId },
      data: {
        notes: JSON.stringify(updatedNotes),
      },
    });

    // Generate JWT token
    const jwtToken = generateToken(contact.id, contact.email);

    return NextResponse.json({
      success: true,
      token: jwtToken,
      message: 'Password set successfully',
    });
  } catch (error) {
    console.error('❌ Setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to set up password',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

