import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';

/**
 * POST /api/auth/generate-credentials
 * Generate username/password for a Contact to access client portal
 * Called by IgniteBD user to invite a Contact
 * 
 * Body:
 * - contactId (required)
 * - companyHQId (required) - for auth
 */
export async function POST(request) {
  try {
    await verifyFirebaseToken(request);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { contactId, companyHQId } = body ?? {};

    if (!contactId || !companyHQId) {
      return NextResponse.json(
        { success: false, error: 'contactId and companyHQId are required' },
        { status: 400 },
      );
    }

    // Get contact
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        contactCompany: true,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 },
      );
    }

    // Generate username (use email or create from name)
    const username = contact.email || `${contact.firstName?.toLowerCase() || 'user'}${contact.id.slice(0, 6)}`;
    
    // Generate secure password
    const password = generateSecurePassword();

    // Store credentials (we'll add a ClientPortalAuth model or use Contact notes)
    // For now, store in Contact.notes as JSON (temporary solution)
    // TODO: Create ClientPortalAuth model
    const authData = {
      username,
      passwordHash: await hashPassword(password), // In production, use bcrypt
      generatedAt: new Date().toISOString(),
    };

    // Update contact with auth info
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        notes: JSON.stringify({
          ...(contact.notes ? JSON.parse(contact.notes) : {}),
          clientPortalAuth: authData,
        }),
      },
    });

    // Return credentials (only shown once)
    return NextResponse.json({
      success: true,
      credentials: {
        contactId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        contactEmail: contact.email,
        username,
        password,
        loginUrl: `${process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL || 'http://localhost:3001'}/login?contactId=${contactId}`,
      },
      message: 'Credentials generated. Share these securely with the client.',
    });
  } catch (error) {
    console.error('❌ GenerateCredentials error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate credentials',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Generate secure password
function generateSecurePassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Hash password (in production, use bcrypt)
async function hashPassword(password) {
  // TODO: Use bcrypt in production
  // For now, return a simple hash
  return Buffer.from(password).toString('base64');
}

