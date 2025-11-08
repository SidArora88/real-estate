/**
 * Advanced Real Estate Financial Calculator
 * Handles comprehensive calculations including discounts, interest, GST, registry, and possession charges
 */

/**
 * Main calculation configuration
 */
const calculationConfig = {
  gstRate: 0.05,           // 5% GST
  registryRate: 0.07,      // 7% Registry
  defaultPossessionChargePerSqFt: 250  // ₹250 per sq ft
};

/**
 * Discount types configuration
 */
const discountTypes = {
  razorpay: { name: 'Razorpay Discount', defaultPercent: 0, maxPercent: 5 },
  booking: { name: 'Booking Amount Discount', defaultPercent: 0, maxPercent: 10 },
  maintenance: { name: 'Maintenance Discount', defaultPercent: 0, maxPercent: 5 },
  gift: { name: 'Gift/Promotional Discount', defaultPercent: 0, maxPercent: 5 },
  channelPartner: { name: 'Channel Partner Discount', defaultPercent: 0, maxPercent: 10 }
};

/**
 * Payment installment structure templates
 */
const installmentTemplates = {
  'standard': {
    name: 'Standard Payment Plan',
    installments: [
      {
        name: 'First Installment (Booking & 1st Year)',
        percentOfTCV: 10,
        dueAt: 'On Booking',
        monthsFromBooking: 0,
        interestMonths: 19,
        includeGST: true
      },
      {
        name: 'Second Installment (Super Structure)',
        percentOfTCV: 13,
        dueAt: 'Super Structure Complete',
        monthsFromBooking: 12,
        interestMonths: 17,
        includeGST: true
      },
      {
        name: 'Third Installment (OC)',
        percentOfTCV: 67,
        dueAt: 'Occupation Certificate',
        monthsFromBooking: 24,
        interestMonths: 6,
        includeGST: false
      },
      {
        name: 'Fourth Installment (Possession)',
        percentOfTCV: 10,
        dueAt: 'On Possession',
        monthsFromBooking: 30,
        interestMonths: 0,
        includeGST: false
      }
    ]
  },
  'construction-linked': {
    name: 'Construction Linked Plan',
    installments: [
      { name: 'Booking', percentOfTCV: 10, dueAt: 'On Booking', monthsFromBooking: 0, interestMonths: 24, includeGST: true },
      { name: 'Foundation', percentOfTCV: 5, dueAt: 'Foundation Complete', monthsFromBooking: 3, interestMonths: 21, includeGST: true },
      { name: 'Plinth', percentOfTCV: 5, dueAt: 'Plinth Complete', monthsFromBooking: 6, interestMonths: 18, includeGST: true },
      { name: 'First Floor Slab', percentOfTCV: 10, dueAt: '1st Floor Complete', monthsFromBooking: 9, interestMonths: 15, includeGST: true },
      { name: 'Roof Slab', percentOfTCV: 15, dueAt: 'Roof Complete', monthsFromBooking: 15, interestMonths: 9, includeGST: true },
      { name: 'Plastering', percentOfTCV: 15, dueAt: 'Plastering Complete', monthsFromBooking: 20, interestMonths: 4, includeGST: false },
      { name: 'OC', percentOfTCV: 30, dueAt: 'Occupation Certificate', monthsFromBooking: 24, interestMonths: 0, includeGST: false },
      { name: 'Possession', percentOfTCV: 10, dueAt: 'On Possession', monthsFromBooking: 30, interestMonths: 0, includeGST: false }
    ]
  },
  'possession-linked': {
    name: 'Possession Linked Plan (20:80)',
    installments: [
      { name: 'Booking (20%)', percentOfTCV: 20, dueAt: 'On Booking', monthsFromBooking: 0, interestMonths: 30, includeGST: true },
      { name: 'On Possession (80%)', percentOfTCV: 80, dueAt: 'On Possession', monthsFromBooking: 30, interestMonths: 0, includeGST: false }
    ]
  }
};

/**
 * Calculates comprehensive financial breakdown
 * @param {Object} inputs - User inputs
 * @returns {Object} - Complete financial calculation
 */
function calculateComprehensiveFinancials(inputs) {
  const {
    area,                    // Property area in sq ft
    pricePerSqFt,           // Base price per sq ft
    discounts,              // Object with discount percentages
    installmentTemplate,    // Template key
    interestRate,           // Annual interest rate (e.g., 10 for 10%)
    possessionChargePerSqFt // Possession charge per sq ft
  } = inputs;

  // Step 1: Calculate Basic Selling Price (BSP)
  const basicSellingPrice = area * pricePerSqFt;

  // Step 2: Calculate all discounts
  const discountCalculations = {};
  let totalDiscounts = 0;

  Object.keys(discounts || {}).forEach(key => {
    const discountPercent = discounts[key] || 0;
    const discountAmount = (discountPercent / 100) * basicSellingPrice;
    discountCalculations[key] = {
      name: discountTypes[key]?.name || key,
      percent: discountPercent,
      amount: Math.round(discountAmount)
    };
    totalDiscounts += discountAmount;
  });

  // Step 3: Calculate Total Cost Value (TCV)
  const totalCostValue = basicSellingPrice - totalDiscounts;

  // Step 4: Calculate installments with interest
  const template = installmentTemplates[installmentTemplate] || installmentTemplates['standard'];
  const monthlyInterestRate = (interestRate / 100) / 12;

  const installmentCalculations = template.installments.map((inst, index) => {
    // Base amount (percentage of TCV)
    const baseAmount = (inst.percentOfTCV / 100) * totalCostValue;

    // Calculate interest if applicable
    let interestAmount = 0;
    if (inst.interestMonths > 0 && interestRate > 0) {
      // Simple interest calculation: P * r * t
      interestAmount = baseAmount * monthlyInterestRate * inst.interestMonths;
    }

    // Calculate GST if applicable
    let gstAmount = 0;
    if (inst.includeGST) {
      gstAmount = (baseAmount + interestAmount) * calculationConfig.gstRate;
    }

    // Total for this installment
    const totalAmount = baseAmount + interestAmount + gstAmount;

    return {
      installmentNumber: index + 1,
      name: inst.name,
      dueAt: inst.dueAt,
      monthsFromBooking: inst.monthsFromBooking,
      percentOfTCV: inst.percentOfTCV,
      baseAmount: Math.round(baseAmount),
      interestMonths: inst.interestMonths,
      interestAmount: Math.round(interestAmount),
      gstAmount: Math.round(gstAmount),
      totalAmount: Math.round(totalAmount),
      includeGST: inst.includeGST
    };
  });

  // Step 5: Calculate totals
  const totalBaseAmount = installmentCalculations.reduce((sum, inst) => sum + inst.baseAmount, 0);
  const totalInterest = installmentCalculations.reduce((sum, inst) => sum + inst.interestAmount, 0);
  const totalGST = installmentCalculations.reduce((sum, inst) => sum + inst.gstAmount, 0);
  const totalInstallmentAmount = installmentCalculations.reduce((sum, inst) => sum + inst.totalAmount, 0);

  // Step 6: Calculate Registry (7% of TCV)
  const registryAmount = Math.round(totalCostValue * calculationConfig.registryRate);

  // Step 7: Calculate Possession Charges
  const possessionCharges = Math.round(area * (possessionChargePerSqFt || calculationConfig.defaultPossessionChargePerSqFt));

  // Step 8: Calculate Grand Total
  const grandTotal = totalInstallmentAmount + registryAmount + possessionCharges;

  // Return comprehensive breakdown
  return {
    // Input summary
    inputs: {
      area,
      pricePerSqFt,
      installmentTemplate: template.name,
      interestRate
    },

    // Price breakdown
    pricing: {
      basicSellingPrice: Math.round(basicSellingPrice),
      totalDiscounts: Math.round(totalDiscounts),
      totalCostValue: Math.round(totalCostValue),
      pricePerSqFtAfterDiscount: Math.round(totalCostValue / area)
    },

    // Discount details
    discounts: discountCalculations,

    // Installment details
    installments: installmentCalculations,

    // Summary totals
    summary: {
      totalBaseAmount: Math.round(totalBaseAmount),
      totalInterest: Math.round(totalInterest),
      totalGST: Math.round(totalGST),
      totalInstallmentAmount: Math.round(totalInstallmentAmount),
      registryAmount,
      possessionCharges,
      grandTotal: Math.round(grandTotal),
      costPerSqFt: Math.round(grandTotal / area)
    },

    // Additional charges breakdown
    additionalCharges: {
      registry: {
        name: 'Registry Charges',
        rate: calculationConfig.registryRate * 100 + '%',
        amount: registryAmount
      },
      possession: {
        name: 'Possession Charges',
        ratePerSqFt: possessionChargePerSqFt || calculationConfig.defaultPossessionChargePerSqFt,
        amount: possessionCharges
      }
    }
  };
}

/**
 * Validates comprehensive input
 * @param {Object} inputs - User inputs
 * @returns {Object} - Validation result
 */
function validateComprehensiveInputs(inputs) {
  const errors = [];

  // Validate area
  if (!inputs.area || inputs.area <= 0) {
    errors.push('Property area must be greater than 0');
  }
  if (inputs.area > 100000) {
    errors.push('Property area seems too large (max 1,00,000 sq ft)');
  }

  // Validate price per sq ft
  if (!inputs.pricePerSqFt || inputs.pricePerSqFt <= 0) {
    errors.push('Price per sq ft must be greater than 0');
  }
  if (inputs.pricePerSqFt < 1000) {
    errors.push('Price per sq ft seems too low (minimum ₹1,000)');
  }
  if (inputs.pricePerSqFt > 100000) {
    errors.push('Price per sq ft seems too high (maximum ₹1,00,000)');
  }

  // Validate interest rate
  if (inputs.interestRate < 0 || inputs.interestRate > 30) {
    errors.push('Interest rate must be between 0% and 30%');
  }

  // Validate discounts
  if (inputs.discounts) {
    Object.keys(inputs.discounts).forEach(key => {
      const percent = inputs.discounts[key];
      if (percent < 0 || percent > 100) {
        errors.push(`${key} discount must be between 0% and 100%`);
      }
    });

    const totalDiscountPercent = Object.values(inputs.discounts).reduce((sum, val) => sum + val, 0);
    if (totalDiscountPercent > 50) {
      errors.push('Total discounts cannot exceed 50%');
    }
  }

  // Validate installment template
  if (!installmentTemplates[inputs.installmentTemplate]) {
    errors.push('Invalid installment template');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Formats a complete financial report as text
 * @param {Object} calculation - Calculation result
 * @returns {string} - Formatted report
 */
function formatFinancialReport(calculation) {
  let report = '=== FINANCIAL BREAKDOWN ===\n\n';

  report += `Property Area: ${calculation.inputs.area} sq ft\n`;
  report += `Base Price: ${formatCurrency(calculation.pricing.basicSellingPrice)}\n`;
  report += `Total Discounts: ${formatCurrency(calculation.pricing.totalDiscounts)}\n`;
  report += `Total Cost Value (TCV): ${formatCurrency(calculation.pricing.totalCostValue)}\n\n`;

  report += '=== PAYMENT INSTALLMENTS ===\n';
  calculation.installments.forEach(inst => {
    report += `\n${inst.installmentNumber}. ${inst.name}\n`;
    report += `   Due: ${inst.dueAt} (Month ${inst.monthsFromBooking})\n`;
    report += `   Base Amount: ${formatCurrency(inst.baseAmount)}\n`;
    if (inst.interestAmount > 0) {
      report += `   Interest (${inst.interestMonths} months): ${formatCurrency(inst.interestAmount)}\n`;
    }
    if (inst.gstAmount > 0) {
      report += `   GST (5%): ${formatCurrency(inst.gstAmount)}\n`;
    }
    report += `   Total: ${formatCurrency(inst.totalAmount)}\n`;
  });

  report += '\n=== ADDITIONAL CHARGES ===\n';
  report += `Registry (7%): ${formatCurrency(calculation.summary.registryAmount)}\n`;
  report += `Possession Charges: ${formatCurrency(calculation.summary.possessionCharges)}\n`;

  report += '\n=== GRAND TOTAL ===\n';
  report += `Total Amount: ${formatCurrency(calculation.summary.grandTotal)}\n`;
  report += `Effective Cost/Sq Ft: ${formatCurrency(calculation.summary.costPerSqFt)}\n`;

  return report;
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateComprehensiveFinancials,
    validateComprehensiveInputs,
    formatFinancialReport,
    installmentTemplates,
    discountTypes,
    calculationConfig
  };
}
