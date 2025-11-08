/**
 * Payment Plan Configurations
 * Each plan consists of stages with percentages that must sum to 100%
 */

const paymentPlans = {
  'CLP': {
    name: 'Construction-Linked Plan',
    description: 'Payments tied to construction milestones',
    stages: [
      { stage: 'Booking', percent: 10 },
      { stage: 'Within 30 days', percent: 10 },
      { stage: 'Foundation complete', percent: 5 },
      { stage: '1st Floor Slab', percent: 5 },
      { stage: '2nd Floor Slab', percent: 5 },
      { stage: '3rd Floor Slab', percent: 5 },
      { stage: '4th Floor Slab', percent: 5 },
      { stage: '5th Floor Slab', percent: 5 },
      { stage: 'Roof Slab', percent: 5 },
      { stage: 'Brickwork Complete', percent: 5 },
      { stage: 'Plastering Complete', percent: 5 },
      { stage: 'Flooring Complete', percent: 5 },
      { stage: 'Finishing Work', percent: 10 },
      { stage: 'Possession', percent: 20 }
    ]
  },
  '20:80': {
    name: '20:80 Possession-Linked Plan',
    description: '20% upfront, 80% on possession',
    stages: [
      { stage: 'Booking', percent: 20 },
      { stage: 'On Possession', percent: 80 }
    ]
  },
  '10:90': {
    name: '10:90 Possession-Linked Plan',
    description: '10% upfront, 90% on possession',
    stages: [
      { stage: 'Booking', percent: 10 },
      { stage: 'On Possession', percent: 90 }
    ]
  },
  'DownPayment': {
    name: 'Down Payment Plan',
    description: 'Large upfront payment with early payment discount',
    stages: [
      { stage: 'Booking', percent: 10 },
      { stage: 'Within 30 days', percent: 80 },
      { stage: 'On Possession', percent: 10 }
    ]
  },
  'Flexi-30:70': {
    name: 'Flexi 30:70 Plan',
    description: 'Hybrid plan: 30% early, 70% on possession',
    stages: [
      { stage: 'Booking', percent: 10 },
      { stage: 'Within 60 days', percent: 20 },
      { stage: 'On Possession', percent: 70 }
    ]
  },
  'Flexi-50:50': {
    name: 'Flexi 50:50 Plan',
    description: 'Hybrid plan: 50% early, 50% on possession',
    stages: [
      { stage: 'Booking', percent: 10 },
      { stage: 'Within 3 months', percent: 40 },
      { stage: 'On Possession', percent: 50 }
    ]
  },
  'TimeLinked': {
    name: 'Time-Linked Payment Plan',
    description: 'Fixed payments at regular intervals',
    stages: [
      { stage: 'Month 0 (Booking)', percent: 20 },
      { stage: 'Month 6', percent: 20 },
      { stage: 'Month 12', percent: 20 },
      { stage: 'Month 18', percent: 20 },
      { stage: 'Month 24', percent: 20 }
    ]
  }
};

/**
 * Validates a payment plan configuration
 * @param {Object} plan - The plan to validate
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
function validatePlan(plan) {
  const errors = [];

  if (!plan.name) {
    errors.push('Plan must have a name');
  }

  if (!plan.description) {
    errors.push('Plan must have a description');
  }

  if (!plan.stages || !Array.isArray(plan.stages)) {
    errors.push('Plan must have stages array');
    return { valid: false, errors };
  }

  if (plan.stages.length === 0) {
    errors.push('Plan must have at least one stage');
  }

  let totalPercent = 0;
  plan.stages.forEach((stage, index) => {
    if (!stage.stage) {
      errors.push(`Stage ${index} must have a stage name`);
    }

    if (typeof stage.percent !== 'number') {
      errors.push(`Stage ${index} must have a numeric percent value`);
    } else if (stage.percent <= 0) {
      errors.push(`Stage ${index} percent must be greater than 0`);
    } else if (stage.percent > 100) {
      errors.push(`Stage ${index} percent must not exceed 100`);
    }

    totalPercent += stage.percent || 0;
  });

  // Allow for floating point rounding errors
  if (Math.abs(totalPercent - 100) > 0.01) {
    errors.push(`Total percentage is ${totalPercent}%, must equal 100%`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates all payment plans
 * @returns {Object} - {valid: boolean, results: Object}
 */
function validateAllPlans() {
  const results = {};
  let allValid = true;

  for (const [key, plan] of Object.entries(paymentPlans)) {
    const validation = validatePlan(plan);
    results[key] = validation;
    if (!validation.valid) {
      allValid = false;
    }
  }

  return { valid: allValid, results };
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { paymentPlans, validatePlan, validateAllPlans };
}
