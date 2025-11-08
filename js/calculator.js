/**
 * Payment Calculator Engine
 * Performs calculations for payment plans
 */

/**
 * Calculates payment schedule for a given plan
 * @param {Object} plan - The payment plan configuration
 * @param {number} propertyPrice - Total property price
 * @returns {Object} - Calculated payment schedule
 */
function calculatePaymentSchedule(plan, propertyPrice) {
  if (!plan || !plan.stages) {
    throw new Error('Invalid plan configuration');
  }

  if (!propertyPrice || propertyPrice <= 0) {
    throw new Error('Property price must be a positive number');
  }

  const schedule = {
    planName: plan.name,
    propertyPrice: propertyPrice,
    installments: [],
    totalAmount: 0
  };

  plan.stages.forEach((stage, index) => {
    const amount = Math.round((stage.percent / 100) * propertyPrice);

    schedule.installments.push({
      installmentNumber: index + 1,
      stage: stage.stage,
      percentage: stage.percent,
      amount: amount
    });

    schedule.totalAmount += amount;
  });

  return schedule;
}

/**
 * Calculates payment schedules for multiple plans
 * @param {Array} plans - Array of payment plan configurations
 * @param {number} propertyPrice - Total property price
 * @returns {Array} - Array of calculated schedules
 */
function calculateMultiplePlans(plans, propertyPrice) {
  if (!Array.isArray(plans) || plans.length === 0) {
    throw new Error('Plans must be a non-empty array');
  }

  return plans.map(plan => calculatePaymentSchedule(plan, propertyPrice));
}

/**
 * Validates property price input
 * @param {*} price - Price to validate
 * @returns {Object} - {valid: boolean, errors: string[], value: number}
 */
function validatePropertyPrice(price) {
  const errors = [];

  // Check if price is provided
  if (price === null || price === undefined || price === '') {
    errors.push('Property price is required');
    return { valid: false, errors, value: null };
  }

  // Convert to number if string
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : price;

  // Check if it's a valid number
  if (isNaN(numPrice)) {
    errors.push('Property price must be a valid number');
    return { valid: false, errors, value: null };
  }

  // Check if it's positive
  if (numPrice <= 0) {
    errors.push('Property price must be greater than 0');
    return { valid: false, errors, value: null };
  }

  // Check if it's reasonable (not too small or too large)
  if (numPrice < 100000) {
    errors.push('Property price seems too low (minimum ₹1,00,000)');
  }

  if (numPrice > 10000000000) { // 10 billion
    errors.push('Property price seems too high (maximum ₹10,00,00,00,000)');
  }

  return {
    valid: errors.length === 0,
    errors,
    value: numPrice
  };
}

/**
 * Formats number as Indian currency (₹)
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }

  // Indian numbering system (lakhs and crores)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  return formatter.format(amount);
}

/**
 * Formats number with Indian comma system
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
function formatIndianNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }

  return num.toLocaleString('en-IN');
}

/**
 * Compares multiple payment plans and generates insights
 * @param {Array} schedules - Array of payment schedules
 * @returns {Object} - Comparison insights
 */
function comparePaymentPlans(schedules) {
  if (!schedules || schedules.length === 0) {
    return null;
  }

  const comparison = {
    totalPlans: schedules.length,
    insights: []
  };

  // Find plan with lowest booking amount
  const bookingAmounts = schedules.map(s => ({
    name: s.planName,
    amount: s.installments[0].amount
  }));

  const lowestBooking = bookingAmounts.reduce((min, curr) =>
    curr.amount < min.amount ? curr : min
  );

  comparison.lowestBookingAmount = lowestBooking;

  // Find plan with most deferred payment
  const possessionPayments = schedules.map(s => {
    const lastInstallment = s.installments[s.installments.length - 1];
    return {
      name: s.planName,
      amount: lastInstallment.amount,
      percentage: lastInstallment.percentage
    };
  });

  const highestPossessionPayment = possessionPayments.reduce((max, curr) =>
    curr.amount > max.amount ? curr : max
  );

  comparison.highestPossessionPayment = highestPossessionPayment;

  // Calculate early payment (first 2 installments)
  const earlyPayments = schedules.map(s => {
    const earlyAmount = s.installments
      .slice(0, Math.min(2, s.installments.length))
      .reduce((sum, inst) => sum + inst.amount, 0);

    return {
      name: s.planName,
      amount: earlyAmount
    };
  });

  const highestEarlyPayment = earlyPayments.reduce((max, curr) =>
    curr.amount > max.amount ? curr : max
  );

  const lowestEarlyPayment = earlyPayments.reduce((min, curr) =>
    curr.amount < min.amount ? curr : min
  );

  comparison.highestEarlyPayment = highestEarlyPayment;
  comparison.lowestEarlyPayment = lowestEarlyPayment;

  return comparison;
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculatePaymentSchedule,
    calculateMultiplePlans,
    validatePropertyPrice,
    formatCurrency,
    formatIndianNumber,
    comparePaymentPlans
  };
}
