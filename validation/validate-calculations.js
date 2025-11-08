/**
 * Validation script for calculation engine
 * Run with: node validation/validate-calculations.js
 */

const { paymentPlans } = require('../js/plans.js');
const { calculatePaymentSchedule, validatePropertyPrice } = require('../js/calculator.js');

console.log('🔍 Validating Calculation Engine...\n');

let errors = 0;
let passed = 0;

// Test data
const testPrices = [1000000, 5000000, 10000000, 50000000, 100000000];

console.log('Testing price validation...');

// Test valid prices
testPrices.forEach(price => {
  const result = validatePropertyPrice(price);
  if (result.valid) {
    passed++;
    console.log(`   ✓ Valid price: ₹${price.toLocaleString('en-IN')}`);
  } else {
    errors++;
    console.log(`   ❌ Failed for ₹${price.toLocaleString('en-IN')}: ${result.errors.join(', ')}`);
  }
});

// Test invalid prices
const invalidPrices = [0, -1000, 50000, 20000000000];
invalidPrices.forEach(price => {
  const result = validatePropertyPrice(price);
  if (!result.valid) {
    passed++;
    console.log(`   ✓ Correctly rejected: ${price}`);
  } else {
    errors++;
    console.log(`   ❌ Should have rejected: ${price}`);
  }
});

console.log('\nTesting payment calculations...');

// Test calculations for all plans
Object.entries(paymentPlans).forEach(([key, plan]) => {
  try {
    const schedule = calculatePaymentSchedule(plan, 10000000);

    // Verify total is close to property price
    const diff = Math.abs(schedule.totalAmount - 10000000);

    if (diff < 10) {
      passed++;
      console.log(`   ✓ ${plan.name}: Total=${schedule.totalAmount.toLocaleString('en-IN')}`);
    } else {
      errors++;
      console.log(`   ❌ ${plan.name}: Total mismatch (diff: ${diff})`);
    }

    // Verify number of installments matches stages
    if (schedule.installments.length === plan.stages.length) {
      passed++;
    } else {
      errors++;
      console.log(`   ❌ ${plan.name}: Installment count mismatch`);
    }

  } catch (error) {
    errors++;
    console.log(`   ❌ ${plan.name}: ${error.message}`);
  }
});

// Summary
console.log(`\n📊 Results:`);
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${errors}`);

if (errors === 0) {
  console.log('\n✨ All calculation tests passed!\n');
  process.exit(0);
} else {
  console.log('\n💥 Some tests failed. Please review the errors above.\n');
  process.exit(1);
}
