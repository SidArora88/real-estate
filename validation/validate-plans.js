/**
 * Validation script for payment plan configurations
 * Run with: node validation/validate-plans.js
 */

const { paymentPlans, validateAllPlans } = require('../js/plans.js');

console.log('🔍 Validating Payment Plan Configurations...\n');

const result = validateAllPlans();

if (result.valid) {
  console.log('✅ All payment plans are valid!\n');

  // Display summary
  console.log(`📊 Summary:`);
  console.log(`   Total Plans: ${Object.keys(paymentPlans).length}`);

  Object.entries(paymentPlans).forEach(([key, plan]) => {
    console.log(`   ✓ ${plan.name} (${plan.stages.length} stages)`);
  });

  console.log('\n✨ Validation passed!\n');
  process.exit(0);
} else {
  console.log('❌ Validation failed!\n');

  Object.entries(result.results).forEach(([key, validation]) => {
    if (!validation.valid) {
      console.log(`\n❌ ${key}:`);
      validation.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
  });

  console.log('\n💥 Please fix the errors above and try again.\n');
  process.exit(1);
}
