const {
  calculatePaymentSchedule,
  calculateMultiplePlans,
  validatePropertyPrice,
  formatCurrency,
  formatIndianNumber,
  comparePaymentPlans
} = require('../js/calculator.js');

const { paymentPlans } = require('../js/plans.js');

describe('Calculator Functions', () => {

  describe('calculatePaymentSchedule', () => {
    const testPlan = {
      name: 'Test Plan',
      stages: [
        { stage: 'Booking', percent: 20 },
        { stage: 'Possession', percent: 80 }
      ]
    };

    test('Should calculate correct installments for a plan', () => {
      const result = calculatePaymentSchedule(testPlan, 10000000);

      expect(result.planName).toBe('Test Plan');
      expect(result.propertyPrice).toBe(10000000);
      expect(result.installments).toHaveLength(2);
      expect(result.installments[0].amount).toBe(2000000);
      expect(result.installments[1].amount).toBe(8000000);
    });

    test('Should include all required fields in installment', () => {
      const result = calculatePaymentSchedule(testPlan, 5000000);

      result.installments.forEach((inst, index) => {
        expect(inst).toHaveProperty('installmentNumber');
        expect(inst).toHaveProperty('stage');
        expect(inst).toHaveProperty('percentage');
        expect(inst).toHaveProperty('amount');
        expect(inst.installmentNumber).toBe(index + 1);
      });
    });

    test('Should calculate total amount correctly', () => {
      const result = calculatePaymentSchedule(testPlan, 10000000);
      const sum = result.installments.reduce((total, inst) => total + inst.amount, 0);

      expect(result.totalAmount).toBe(sum);
      expect(Math.abs(result.totalAmount - 10000000)).toBeLessThan(10);
    });

    test('Should throw error for invalid plan', () => {
      expect(() => calculatePaymentSchedule(null, 1000000)).toThrow('Invalid plan');
      expect(() => calculatePaymentSchedule({}, 1000000)).toThrow('Invalid plan');
    });

    test('Should throw error for invalid price', () => {
      expect(() => calculatePaymentSchedule(testPlan, 0)).toThrow('positive number');
      expect(() => calculatePaymentSchedule(testPlan, -1000)).toThrow('positive number');
    });
  });

  describe('calculateMultiplePlans', () => {
    test('Should calculate schedules for multiple plans', () => {
      const plans = [paymentPlans['20:80'], paymentPlans['CLP']];
      const results = calculateMultiplePlans(plans, 10000000);

      expect(results).toHaveLength(2);
      expect(results[0].planName).toContain('20:80');
    });

    test('Should throw error for empty plans array', () => {
      expect(() => calculateMultiplePlans([], 1000000)).toThrow('non-empty array');
    });
  });

  describe('validatePropertyPrice', () => {
    test('Should validate correct price', () => {
      const result = validatePropertyPrice(5000000);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.value).toBe(5000000);
    });

    test('Should validate string price with commas', () => {
      const result = validatePropertyPrice('10,00,000');

      expect(result.valid).toBe(true);
      expect(result.value).toBe(1000000);
    });

    test('Should reject null or undefined', () => {
      expect(validatePropertyPrice(null).valid).toBe(false);
      expect(validatePropertyPrice(undefined).valid).toBe(false);
    });

    test('Should reject zero or negative numbers', () => {
      expect(validatePropertyPrice(0).valid).toBe(false);
      expect(validatePropertyPrice(-1000).valid).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    test('Should format number as Indian currency', () => {
      const result = formatCurrency(1000000);

      expect(result).toContain('₹');
    });

    test('Should handle invalid input gracefully', () => {
      expect(formatCurrency(NaN)).toBe('₹0');
    });
  });

  describe('comparePaymentPlans', () => {
    test('Should generate comparison insights', () => {
      const schedules = [
        calculatePaymentSchedule(paymentPlans['20:80'], 10000000),
        calculatePaymentSchedule(paymentPlans['CLP'], 10000000)
      ];

      const comparison = comparePaymentPlans(schedules);

      expect(comparison).toBeDefined();
      expect(comparison.totalPlans).toBe(2);
      expect(comparison).toHaveProperty('lowestBookingAmount');
    });

    test('Should return null for empty schedules', () => {
      expect(comparePaymentPlans([])).toBeNull();
    });
  });
});
