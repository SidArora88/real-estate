const { paymentPlans, validatePlan, validateAllPlans } = require('../js/plans.js');

describe('Payment Plans Configuration', () => {

  describe('Plan Structure Validation', () => {
    test('All plans should exist', () => {
      expect(paymentPlans).toBeDefined();
      expect(Object.keys(paymentPlans).length).toBeGreaterThan(0);
    });

    test('Each plan should have required properties', () => {
      Object.entries(paymentPlans).forEach(([key, plan]) => {
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('description');
        expect(plan).toHaveProperty('stages');
        expect(Array.isArray(plan.stages)).toBe(true);
      });
    });

    test('Each stage should have required properties', () => {
      Object.entries(paymentPlans).forEach(([key, plan]) => {
        plan.stages.forEach(stage => {
          expect(stage).toHaveProperty('stage');
          expect(stage).toHaveProperty('percent');
          expect(typeof stage.stage).toBe('string');
          expect(typeof stage.percent).toBe('number');
        });
      });
    });
  });

  describe('Percentage Validation', () => {
    test('All plans should sum to exactly 100%', () => {
      Object.entries(paymentPlans).forEach(([key, plan]) => {
        const total = plan.stages.reduce((sum, stage) => sum + stage.percent, 0);
        expect(total).toBeCloseTo(100, 2);
      });
    });

    test('No stage should have 0% or negative percentage', () => {
      Object.entries(paymentPlans).forEach(([key, plan]) => {
        plan.stages.forEach(stage => {
          expect(stage.percent).toBeGreaterThan(0);
        });
      });
    });

    test('No stage should exceed 100%', () => {
      Object.entries(paymentPlans).forEach(([key, plan]) => {
        plan.stages.forEach(stage => {
          expect(stage.percent).toBeLessThanOrEqual(100);
        });
      });
    });
  });

  describe('Specific Plan Validation', () => {
    test('CLP should have multiple construction milestones', () => {
      const clp = paymentPlans['CLP'];
      expect(clp.stages.length).toBeGreaterThan(5);
      expect(clp.name).toContain('Construction');
    });

    test('20:80 should have exactly 2 stages with correct percentages', () => {
      const plan = paymentPlans['20:80'];
      expect(plan.stages.length).toBe(2);
      expect(plan.stages[0].percent).toBe(20);
      expect(plan.stages[1].percent).toBe(80);
    });

    test('10:90 should have exactly 2 stages with correct percentages', () => {
      const plan = paymentPlans['10:90'];
      expect(plan.stages.length).toBe(2);
      expect(plan.stages[0].percent).toBe(10);
      expect(plan.stages[1].percent).toBe(90);
    });

    test('DownPayment should have large early payment', () => {
      const plan = paymentPlans['DownPayment'];
      const earlyPayment = plan.stages[0].percent + plan.stages[1].percent;
      expect(earlyPayment).toBeGreaterThanOrEqual(90);
    });

    test('TimeLinked should have equal installments', () => {
      const plan = paymentPlans['TimeLinked'];
      const percentages = plan.stages.map(s => s.percent);
      const allEqual = percentages.every(p => p === percentages[0]);
      expect(allEqual).toBe(true);
    });
  });

  describe('validatePlan Function', () => {
    test('Valid plan should pass validation', () => {
      const validPlan = {
        name: 'Test Plan',
        description: 'Test Description',
        stages: [
          { stage: 'Stage 1', percent: 50 },
          { stage: 'Stage 2', percent: 50 }
        ]
      };
      const result = validatePlan(validPlan);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('Plan without name should fail', () => {
      const plan = {
        description: 'Test',
        stages: [{ stage: 'S1', percent: 100 }]
      };
      const result = validatePlan(plan);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan must have a name');
    });

    test('Plan without description should fail', () => {
      const plan = {
        name: 'Test',
        stages: [{ stage: 'S1', percent: 100 }]
      };
      const result = validatePlan(plan);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan must have a description');
    });

    test('Plan without stages should fail', () => {
      const plan = {
        name: 'Test',
        description: 'Test'
      };
      const result = validatePlan(plan);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan must have stages array');
    });

    test('Plan with empty stages should fail', () => {
      const plan = {
        name: 'Test',
        description: 'Test',
        stages: []
      };
      const result = validatePlan(plan);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan must have at least one stage');
    });

    test('Plan with percentages not summing to 100 should fail', () => {
      const plan = {
        name: 'Test',
        description: 'Test',
        stages: [
          { stage: 'S1', percent: 30 },
          { stage: 'S2', percent: 60 }
        ]
      };
      const result = validatePlan(plan);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('must equal 100%'))).toBe(true);
    });

    test('Stage without name should fail', () => {
      const plan = {
        name: 'Test',
        description: 'Test',
        stages: [{ percent: 100 }]
      };
      const result = validatePlan(plan);
      expect(result.valid).toBe(false);
    });

    test('Stage with negative percent should fail', () => {
      const plan = {
        name: 'Test',
        description: 'Test',
        stages: [
          { stage: 'S1', percent: -10 },
          { stage: 'S2', percent: 110 }
        ]
      };
      const result = validatePlan(plan);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateAllPlans Function', () => {
    test('All configured plans should pass validation', () => {
      const result = validateAllPlans();
      expect(result.valid).toBe(true);

      Object.entries(result.results).forEach(([key, validation]) => {
        expect(validation.valid).toBe(true);
        if (!validation.valid) {
          console.error(`Plan ${key} failed validation:`, validation.errors);
        }
      });
    });
  });
});
