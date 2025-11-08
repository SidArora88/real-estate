/**
 * Fully Flexible Real Estate Financial Calculator
 * 100% user-configurable - no hardcoded values except defaults
 */

/**
 * Creates a new blank installment
 * @returns {Object} - Blank installment object
 */
function createBlankInstallment() {
  return {
    id: Date.now() + Math.random(),
    name: '',
    percentOfTCV: 0,
    dueAt: '',
    monthsFromBooking: 0,
    interestRateForNextPeriod: null, // Interest rate (% p.a.) for period from this installment to next. Null = use global rate
    settleAccruedInterest: false, // If true, all accrued interest up to this point will be deducted from this installment
    settlementPeriodOverrides: [], // Optional: array of {fromInstallmentId, toInstallmentId} to settle specific periods
    applyGST: false,
    notes: ''
  };
}

/**
 * Creates a new blank discount
 * @returns {Object} - Blank discount object
 */
function createBlankDiscount() {
  return {
    id: Date.now() + Math.random(),
    name: '',
    type: 'percentage',  // 'percentage' or 'fixed'
    value: 0,
    notes: ''
  };
}

/**
 * Validates user configuration
 * @param {Object} config - User configuration
 * @returns {Object} - Validation result
 */
function validateConfiguration(config) {
  const errors = [];
  const warnings = [];

  // Validate installments
  if (!config.installments || config.installments.length === 0) {
    errors.push('At least one installment is required');
  } else {
    // Check if percentages sum to 100%
    const totalPercent = config.installments.reduce((sum, inst) =>
      sum + (parseFloat(inst.percentOfTCV) || 0), 0);

    if (Math.abs(totalPercent - 100) > 0.1) {
      errors.push(`Installment percentages sum to ${totalPercent.toFixed(2)}%. Must equal 100%`);
    }

    // Check for empty names
    const unnamedInstallments = config.installments.filter(inst => !inst.name || !inst.name.trim());
    if (unnamedInstallments.length > 0) {
      errors.push(`${unnamedInstallments.length} installment(s) missing name`);
    }

    // Check for negative or excessive percentages
    config.installments.forEach((inst, index) => {
      if (inst.percentOfTCV < 0) {
        errors.push(`Installment ${index + 1}: Percentage cannot be negative`);
      }
      if (inst.percentOfTCV > 100) {
        errors.push(`Installment ${index + 1}: Percentage cannot exceed 100%`);
      }
      if (inst.interestMonths < 0) {
        errors.push(`Installment ${index + 1}: Interest months cannot be negative`);
      }
    });
  }

  // Validate rates
  if (config.rates.gst < 0 || config.rates.gst > 50) {
    warnings.push('GST rate seems unusual (typically 0-18%)');
  }
  if (config.rates.registry < 0 || config.rates.registry > 20) {
    warnings.push('Registry rate seems unusual (typically 3-10%)');
  }
  if (config.rates.interestPerAnnum < 0 || config.rates.interestPerAnnum > 30) {
    warnings.push('Interest rate seems unusual (typically 8-15%)');
  }

  // Validate discounts
  if (config.discounts && config.discounts.length > 0) {
    const totalDiscountPercent = config.discounts
      .filter(d => d.type === 'percentage')
      .reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);

    if (totalDiscountPercent > 50) {
      warnings.push('Total percentage discounts exceed 50%');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculates comprehensive financials with user configuration
 * @param {Object} params - Calculation parameters
 * @returns {Object} - Complete financial breakdown
 */
function calculateWithUserConfig(params) {
  const {
    area,           // sq ft
    pricePerSqFt,   // ₹ per sq ft
    config          // User's complete configuration
  } = params;

  const results = {
    inputs: { area, pricePerSqFt },
    config: config,
    breakdown: {},
    errors: []
  };

  // Step 1: Basic Selling Price
  const basicSellingPrice = area * pricePerSqFt;
  results.breakdown.basicSellingPrice = Math.round(basicSellingPrice);

  // Step 2: Apply Discounts
  let totalDiscountAmount = 0;
  const discountDetails = [];

  if (config.discounts && config.discounts.length > 0) {
    config.discounts.forEach(discount => {
      let discountAmount = 0;

      if (discount.type === 'percentage') {
        discountAmount = (discount.value / 100) * basicSellingPrice;
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
      }

      discountDetails.push({
        name: discount.name,
        type: discount.type,
        value: discount.value,
        amount: Math.round(discountAmount),
        notes: discount.notes
      });

      totalDiscountAmount += discountAmount;
    });
  }

  results.breakdown.discounts = discountDetails;
  results.breakdown.totalDiscounts = Math.round(totalDiscountAmount);

  // Step 3: Total Cost Value (TCV)
  const totalCostValue = basicSellingPrice - totalDiscountAmount;
  results.breakdown.totalCostValue = Math.round(totalCostValue);
  results.breakdown.pricePerSqFtAfterDiscount = Math.round(totalCostValue / area);

  // Step 4: Calculate Installments with Interest Accrual Model
  // CORRECT MODEL:
  // - Interest during period Ik→I(k+1) accrues on cumulative paid UP TO AND INCLUDING Ik
  // - Builder pays interest to buyer for early payments
  // - Support per-period interest rates and settlement overrides

  const globalMonthlyRate = (config.rates.interestPerAnnum / 100) / 12;
  const installmentDetails = [];
  const interestAccrualPeriods = []; // Track all accrual periods
  let totalAccruedInterest = 0;

  if (config.installments && config.installments.length > 0) {
    // Sort installments by months from booking
    const sortedInstallments = [...config.installments].sort((a, b) =>
      a.monthsFromBooking - b.monthsFromBooking
    );

    let cumulativePaidAmount = 0; // Track cumulative paid INCLUDING current installment

    sortedInstallments.forEach((inst, index) => {
      // Base amount for this installment
      const baseAmount = (inst.percentOfTCV / 100) * totalCostValue;

      // GST calculation on base amount
      let gstAmount = 0;
      if (inst.applyGST) {
        gstAmount = baseAmount * (config.rates.gst / 100);
      }

      const grossAmount = baseAmount + gstAmount;

      // Update cumulative AFTER calculating GST but BEFORE interest
      // Interest accrues on the cumulative INCLUDING this installment
      cumulativePaidAmount += baseAmount;

      // Calculate interest accrued during period from THIS installment to NEXT
      let interestAccruedThisPeriod = 0;
      let interestMonths = 0;
      let periodInterestRate = config.rates.interestPerAnnum; // Default to global
      let monthlyRate = globalMonthlyRate;

      if (index < sortedInstallments.length - 1) {
        // Get interest rate for this period (installment-specific or global)
        if (inst.interestRateForNextPeriod !== null && inst.interestRateForNextPeriod !== undefined) {
          periodInterestRate = inst.interestRateForNextPeriod;
          monthlyRate = (periodInterestRate / 100) / 12;
        }

        // Calculate months to next installment
        interestMonths = sortedInstallments[index + 1].monthsFromBooking - inst.monthsFromBooking;

        // Interest accrues on cumulative paid UP TO AND INCLUDING this installment
        if (interestMonths > 0 && cumulativePaidAmount > 0) {
          interestAccruedThisPeriod = cumulativePaidAmount * monthlyRate * interestMonths;
          totalAccruedInterest += interestAccruedThisPeriod;

          // Track this accrual period for potential per-period settlement
          interestAccrualPeriods.push({
            fromInstallmentId: inst.id,
            toInstallmentId: sortedInstallments[index + 1].id,
            fromIndex: index,
            toIndex: index + 1,
            principal: cumulativePaidAmount,
            rate: periodInterestRate,
            months: interestMonths,
            interestAmount: interestAccruedThisPeriod
          });
        }
      }

      installmentDetails.push({
        installmentNumber: index + 1,
        id: inst.id,
        name: inst.name,
        dueAt: inst.dueAt,
        monthsFromBooking: inst.monthsFromBooking,
        percentOfTCV: inst.percentOfTCV,
        baseAmount: Math.round(baseAmount),

        // Interest accrual for THIS period (this → next)
        interestAccruedThisPeriod: Math.round(interestAccruedThisPeriod),
        interestMonths: interestMonths,
        interestRateThisPeriod: periodInterestRate,
        interestCalculationBase: Math.round(cumulativePaidAmount), // INCLUDING current installment

        // GST
        applyGST: inst.applyGST,
        gstRate: config.rates.gst,
        gstAmount: Math.round(gstAmount),

        // Gross (before settlement)
        grossAmount: Math.round(grossAmount),

        // Settlement tracking (will be filled in next pass)
        settleAccruedInterest: inst.settleAccruedInterest,
        interestSettled: 0,
        netPayment: Math.round(grossAmount), // Will be updated after settlement calculation

        notes: inst.notes
      });
    });

    // Second pass: Calculate settlements
    let alreadySettledInterest = 0; // Track cumulative settled interest

    installmentDetails.forEach((inst, index) => {
      if (sortedInstallments[index].settleAccruedInterest) {
        // Calculate total accrued UP TO this installment (before this settlement)
        let accruedUpToHere = 0;
        interestAccrualPeriods.forEach(period => {
          if (period.toIndex <= index) {
            accruedUpToHere += period.interestAmount;
          }
        });

        // Only settle what HASN'T been settled yet
        const toSettle = accruedUpToHere - alreadySettledInterest;
        inst.interestSettled = Math.round(toSettle);
        inst.netPayment = inst.grossAmount - inst.interestSettled;

        // Update cumulative settled amount
        alreadySettledInterest += toSettle;
      }
    });
  }

  results.breakdown.installments = installmentDetails;

  // Step 5: Calculate totals from installments
  const totalBaseAmount = installmentDetails.reduce((sum, inst) => sum + inst.baseAmount, 0);
  const totalInterestAccrued = installmentDetails.reduce((sum, inst) => sum + inst.interestAccruedThisPeriod, 0);
  const totalInterestSettled = installmentDetails.reduce((sum, inst) => sum + inst.interestSettled, 0);
  const totalGST = installmentDetails.reduce((sum, inst) => sum + inst.gstAmount, 0);
  const totalGrossAmount = installmentDetails.reduce((sum, inst) => sum + inst.grossAmount, 0);
  const totalNetPayment = installmentDetails.reduce((sum, inst) => sum + inst.netPayment, 0);

  // Step 6: Registry Charges
  const registryAmount = Math.round(totalCostValue * (config.rates.registry / 100));

  // Step 7: Possession Charges
  const possessionCharges = Math.round(area * config.possessionChargePerSqFt);

  // Step 8: Grand Total (Net Payment + Registry + Possession)
  const grandTotal = totalNetPayment + registryAmount + possessionCharges;

  // Compile summary
  results.breakdown.summary = {
    totalBaseAmount: Math.round(totalBaseAmount),
    totalInterestAccrued: Math.round(totalInterestAccrued),
    totalInterestSettled: Math.round(totalInterestSettled),
    totalGST: Math.round(totalGST),
    totalGrossAmount: Math.round(totalGrossAmount),
    totalNetPayment: Math.round(totalNetPayment),
    registryRate: config.rates.registry,
    registryAmount,
    possessionChargePerSqFt: config.possessionChargePerSqFt,
    possessionCharges,
    grandTotal: Math.round(grandTotal),
    effectiveCostPerSqFt: Math.round(grandTotal / area),
    savingsFromInterest: Math.round(totalInterestSettled) // Buyer's savings
  };

  return results;
}

/**
 * Exports configuration to JSON
 * @param {Object} config - Configuration object
 * @returns {string} - JSON string
 */
function exportConfiguration(config) {
  return JSON.stringify(config, null, 2);
}

/**
 * Imports configuration from JSON
 * @param {string} jsonString - JSON string
 * @returns {Object} - Configuration object
 */
function importConfiguration(jsonString) {
  try {
    const config = JSON.parse(jsonString);
    const validation = validateConfiguration(config);

    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    return config;
  } catch (error) {
    console.error('Failed to import configuration:', error);
    throw error;
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createBlankInstallment,
    createBlankDiscount,
    validateConfiguration,
    calculateWithUserConfig,
    exportConfiguration,
    importConfiguration
  };
}
