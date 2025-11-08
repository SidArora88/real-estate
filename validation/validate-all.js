/**
 * Master validation script - runs all validations
 * Run with: node validation/validate-all.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Running All Validations...\n');
console.log('='.repeat(60));

const validations = [
  { name: 'Payment Plans', script: 'validate-plans.js' },
  { name: 'Calculations', script: 'validate-calculations.js' }
];

let currentIndex = 0;
let allPassed = true;

function runNextValidation() {
  if (currentIndex >= validations.length) {
    // All validations complete
    console.log('\n' + '='.repeat(60));

    if (allPassed) {
      console.log('\n✅ ALL VALIDATIONS PASSED!\n');
      process.exit(0);
    } else {
      console.log('\n❌ SOME VALIDATIONS FAILED!\n');
      process.exit(1);
    }
    return;
  }

  const validation = validations[currentIndex];
  console.log(`\n📝 Running: ${validation.name}`);
  console.log('-'.repeat(60));

  const scriptPath = path.join(__dirname, validation.script);
  const child = spawn('node', [scriptPath], {
    stdio: 'inherit'
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      allPassed = false;
    }

    currentIndex++;
    runNextValidation();
  });

  child.on('error', (error) => {
    console.error(`Error running ${validation.name}:`, error);
    allPassed = false;
    currentIndex++;
    runNextValidation();
  });
}

// Start validations
runNextValidation();
