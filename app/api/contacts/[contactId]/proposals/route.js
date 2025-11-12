import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/contacts/:contactId/proposals
 * Get all proposals for a contact (client portal access)
 * Universal personhood - same Contact, different context
 */
export async function GET(request, { params }) {
  try {
    const { contactId } = params || {};
    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'contactId is required' },
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

    // Find proposals linked to this contact's company
    const proposals = contact.contactCompanyId
      ? await prisma.proposal.findMany({
          where: {
            companyId: contact.contactCompanyId,
            status: {
              in: ['active', 'approved'],
            },
          },
          include: {
            company: true,
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    return NextResponse.json({
      success: true,
      proposals,
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        contactCompany: contact.contactCompany,
      },
    });
  } catch (error) {
    console.error('❌ GetContactProposals error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get proposals',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

