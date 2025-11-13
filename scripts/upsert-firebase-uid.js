/**
 * Script to upsert firebaseUid for a contact
 * 
 * Usage:
 *   node scripts/upsert-firebase-uid.js <firebaseUid> [email]
 * 
 * If email not provided, will get it from Firebase
 * 
 * Example:
 *   node scripts/upsert-firebase-uid.js Nwbu8tYrwTXZQpUq6YrkEFAg58O2
 *   node scripts/upsert-firebase-uid.js Nwbu8tYrwTXZQpUq6YrkEFAg58O2 john@example.com
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const admin = require('firebase-admin');

const prisma = new PrismaClient();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized');
    } else {
      console.warn('⚠️ Firebase Admin not initialized: FIREBASE_SERVICE_ACCOUNT_KEY missing');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
  }
}

async function upsertFirebaseUid(firebaseUid, email) {
  try {
    console.log(`🔍 Upserting firebaseUid: ${firebaseUid}`);

    // First, check if this firebaseUid is already assigned
    const existingContact = await prisma.contact.findUnique({
      where: { firebaseUid },
    });

    if (existingContact) {
      console.log(`✅ Firebase UID ${firebaseUid} is already assigned to contact ${existingContact.id}`);
      console.log(`   Email: ${existingContact.email}`);
      console.log(`   Name: ${existingContact.firstName} ${existingContact.lastName}`);
      return existingContact;
    }

    // If no email provided, try to get it from Firebase
    let contactEmail = email;
    if (!contactEmail) {
      try {
        if (admin.apps.length) {
          const firebaseUser = await admin.auth().getUser(firebaseUid);
          contactEmail = firebaseUser.email;
          console.log(`📧 Got email from Firebase: ${contactEmail}`);
        } else {
          throw new Error('Firebase Admin not initialized');
        }
      } catch (firebaseError) {
        console.error('❌ Error getting email from Firebase:', firebaseError.message);
        throw new Error('Could not get email from Firebase. Please provide email as second argument.');
      }
    }

    if (!contactEmail) {
      throw new Error('Email is required (either from Firebase or as argument)');
    }

    console.log(`🔍 Looking up contact by email: ${contactEmail}`);
    
    // Find contact by email
    const contact = await prisma.contact.findFirst({
      where: {
        email: contactEmail.toLowerCase().trim(),
      },
    });

    if (!contact) {
      console.error(`❌ Contact not found with email: ${contactEmail}`);
      process.exit(1);
    }

    console.log(`✅ Found contact: ${contact.id} (${contact.firstName} ${contact.lastName})`);
    console.log(`📝 Current firebaseUid: ${contact.firebaseUid || 'null'}`);

    // Upsert firebaseUid
    console.log(`🔄 Updating contact with firebaseUid: ${firebaseUid}`);
    const updated = await prisma.contact.update({
      where: { id: contact.id },
      data: {
        firebaseUid: firebaseUid,
        isActivated: true, // Mark as activated
      },
    });

    console.log(`✅ Successfully updated contact ${updated.id}`);
    console.log(`   firebaseUid: ${updated.firebaseUid}`);
    console.log(`   isActivated: ${updated.isActivated}`);
    console.log(`   email: ${updated.email}`);
    
    return updated;
  } catch (error) {
    console.error('❌ Error upserting firebaseUid:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const firebaseUid = process.argv[2];
const email = process.argv[3]; // Optional

if (!firebaseUid) {
  console.error('Usage: node scripts/upsert-firebase-uid.js <firebaseUid> [email]');
  console.error('Example: node scripts/upsert-firebase-uid.js Nwbu8tYrwTXZQpUq6YrkEFAg58O2');
  console.error('Example: node scripts/upsert-firebase-uid.js Nwbu8tYrwTXZQpUq6YrkEFAg58O2 john@example.com');
  process.exit(1);
}

upsertFirebaseUid(firebaseUid, email)
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });

