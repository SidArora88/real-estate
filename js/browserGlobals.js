/**
 * Browser Globals Shim
 * Makes all calculator functions available globally in the browser
 */

// This file should be loaded AFTER calculator.js and flexibleCalculator.js
// It exposes all functions globally for browser use

// From calculator.js - these are already global (no module.exports wrapper)
// formatCurrency, formatIndianNumber, etc. are already defined globally

// From flexibleCalculator.js - these are already global
// createBlankInstallment, createBlankDiscount, etc. are already defined globally

// Just to be safe, let's ensure they're on window object
if (typeof window !== 'undefined') {
  // Functions from calculator.js
  window.formatCurrency = formatCurrency;
  window.formatIndianNumber = formatIndianNumber;
  window.calculatePaymentSchedule = calculatePaymentSchedule;
  window.calculateMultiplePlans = calculateMultiplePlans;
  window.validatePropertyPrice = validatePropertyPrice;
  window.comparePaymentPlans = comparePaymentPlans;

  // Functions from flexibleCalculator.js
  window.createBlankInstallment = createBlankInstallment;
  window.createBlankDiscount = createBlankDiscount;
  window.validateConfiguration = validateConfiguration;
  window.calculateWithUserConfig = calculateWithUserConfig;
  window.exportConfiguration = exportConfiguration;
  window.importConfiguration = importConfiguration;

  console.log('✅ All calculator functions loaded globally');
}
