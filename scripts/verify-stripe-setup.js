/**
 * Verify Stripe Environment Variables Setup
 * 
 * Run: node scripts/verify-stripe-setup.js
 */

// Load environment variables from .env file
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Also try .env

const requiredEnvVars = {
  'STRIPE_SECRET_KEY': {
    required: true,
    description: 'Stripe secret key for server-side API calls',
    pattern: /^sk_(test|live)_/,
    example: 'sk_test_... or sk_live_...',
  },
  'STRIPE_WEBHOOK_SECRET': {
    required: true,
    description: 'Stripe webhook signing secret',
    pattern: /^whsec_/,
    example: 'whsec_...',
  },
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': {
    required: true,
    description: 'Stripe publishable key for client-side checkout',
    pattern: /^pk_(test|live)_/,
    example: 'pk_test_... or pk_live_...',
  },
  'NEXT_PUBLIC_CLIENT_PORTAL_URL': {
    required: false,
    description: 'Client portal URL for Stripe return URL',
    pattern: /^https?:\/\//,
    example: 'https://portal.ignitegrowth.biz',
  },
};

console.log('🔍 Verifying Stripe Environment Variables...\n');

let allValid = true;
const results = [];

for (const [varName, config] of Object.entries(requiredEnvVars)) {
  const value = process.env[varName];
  const isSet = !!value;
  const isValid = isSet && (config.pattern ? config.pattern.test(value) : true);
  
  results.push({
    name: varName,
    set: isSet,
    valid: isValid,
    required: config.required,
    description: config.description,
    example: config.example,
  });
  
  if (config.required && !isSet) {
    allValid = false;
    console.log(`❌ ${varName}: MISSING (REQUIRED)`);
    console.log(`   ${config.description}`);
    console.log(`   Example: ${config.example}\n`);
  } else if (config.required && !isValid) {
    allValid = false;
    console.log(`⚠️  ${varName}: INVALID FORMAT`);
    console.log(`   ${config.description}`);
    console.log(`   Current value: ${value ? value.substring(0, 20) + '...' : 'undefined'}`);
    console.log(`   Expected format: ${config.example}\n`);
  } else if (!config.required && !isSet) {
    console.log(`⚠️  ${varName}: NOT SET (OPTIONAL)`);
    console.log(`   ${config.description}`);
    console.log(`   Example: ${config.example}\n`);
  } else {
    console.log(`✅ ${varName}: SET${isValid ? ' (VALID)' : ''}`);
    if (varName.includes('SECRET') || varName.includes('KEY')) {
      console.log(`   Value: ${value.substring(0, 12)}...${value.substring(value.length - 4)}`);
    } else {
      console.log(`   Value: ${value}`);
    }
    console.log();
  }
}

console.log('\n' + '='.repeat(60));
if (allValid) {
  console.log('✅ All required Stripe environment variables are set correctly!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Run database migration: npx prisma migrate dev --name add_invoice_model');
  console.log('   2. Set up Stripe webhook in Stripe Dashboard');
  console.log('   3. Create test invoices in the database');
  console.log('   4. Test payment flow in the client portal');
} else {
  console.log('❌ Some required environment variables are missing or invalid.');
  console.log('\n📋 Action Required:');
  console.log('   - Set missing environment variables in your .env file');
  console.log('   - Verify format matches expected patterns');
  console.log('   - Restart your development server after updating .env');
}
console.log('='.repeat(60) + '\n');

process.exit(allValid ? 0 : 1);

