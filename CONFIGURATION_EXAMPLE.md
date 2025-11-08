# Configuration Guide - Fully Flexible Calculator

## Overview

The calculator is 100% configurable. Users can customize:
- ✅ **Installments** - Add/remove/edit unlimited installments
- ✅ **Discounts** - Add custom discounts (percentage or fixed amount)
- ✅ **Rates** - GST%, Registry%, Interest%
- ✅ **Charges** - Possession charges per sq ft
- ✅ **All calculations** - Based on your configuration

## Configuration Structure

```javascript
{
  // Rates (all user-configurable)
  rates: {
    gst: 5,              // GST percentage (e.g., 5 for 5%)
    registry: 7,         // Registry percentage (e.g., 7 for 7%)
    interestPerAnnum: 10 // Annual interest rate (e.g., 10 for 10%)
  },

  // Possession charges
  possessionChargePerSqFt: 250,  // Amount in ₹ per sq ft

  // Custom installments (user creates all)
  installments: [
    {
      name: 'Booking',
      percentOfTCV: 10,          // % of Total Cost Value
      dueAt: 'On Booking',       // When it's due
      monthsFromBooking: 0,      // Timeline
      applyInterest: true,       // Apply interest?
      interestMonths: 19,        // Interest calculation period
      applyGST: true,            // Apply GST on this?
      notes: 'Initial payment'   // Optional notes
    },
    {
      name: 'Super Structure',
      percentOfTCV: 13,
      dueAt: 'Structure Complete',
      monthsFromBooking: 12,
      applyInterest: true,
      interestMonths: 17,
      applyGST: true,
      notes: ''
    },
    // ... add as many as needed
    {
      name: 'Possession',
      percentOfTCV: 10,
      dueAt: 'On Possession',
      monthsFromBooking: 30,
      applyInterest: false,
      interestMonths: 0,
      applyGST: false,
      notes: 'Final payment'
    }
  ],

  // Custom discounts (user creates all)
  discounts: [
    {
      name: 'Razorpay Discount',
      type: 'percentage',  // 'percentage' or 'fixed'
      value: 2.5,          // 2.5% or ₹2.5 lakh (depends on type)
      notes: 'Online payment discount'
    },
    {
      name: 'Channel Partner',
      type: 'fixed',
      value: 500000,       // ₹5 lakh fixed discount
      notes: 'Broker discount'
    }
    // ... add as many as needed
  ]
}
```

## Example Configurations

### Example 1: Standard Payment Plan (from CSV)

```javascript
const standardPlan = {
  rates: {
    gst: 5,
    registry: 7,
    interestPerAnnum: 10
  },
  possessionChargePerSqFt: 250,
  installments: [
    {
      name: 'First Installment - 1st year',
      percentOfTCV: 10,
      dueAt: 'On Booking',
      monthsFromBooking: 0,
      applyInterest: true,
      interestMonths: 19,
      applyGST: true
    },
    {
      name: 'Second Installment - Super Structure',
      percentOfTCV: 13,
      dueAt: 'Super Structure Complete',
      monthsFromBooking: 12,
      applyInterest: true,
      interestMonths: 17,
      applyGST: true
    },
    {
      name: 'Third Installment - OC',
      percentOfTCV: 67,
      dueAt: 'Occupation Certificate',
      monthsFromBooking: 24,
      applyInterest: true,
      interestMonths: 6,
      applyGST: false
    },
    {
      name: 'Fourth Installment - Possession',
      percentOfTCV: 10,
      dueAt: 'On Possession',
      monthsFromBooking: 30,
      applyInterest: false,
      interestMonths: 0,
      applyGST: false
    }
  ],
  discounts: [
    { name: 'Razorpay Discount', type: 'percentage', value: 0.27 },
    { name: 'Booking Discount', type: 'percentage', value: 1.35 },
    { name: 'Maintenance Discount', type: 'percentage', value: 0.93 },
    { name: 'Gift Discount', type: 'percentage', value: 0.67 },
    { name: 'Channel Partner', type: 'percentage', value: 0.62 }
  ]
};
```

### Example 2: Simple 20:80 Possession Linked

```javascript
const possessionLinked = {
  rates: {
    gst: 5,
    registry: 7,
    interestPerAnnum: 10
  },
  possessionChargePerSqFt: 250,
  installments: [
    {
      name: 'Booking (20%)',
      percentOfTCV: 20,
      dueAt: 'On Booking',
      monthsFromBooking: 0,
      applyInterest: true,
      interestMonths: 30,
      applyGST: true
    },
    {
      name: 'On Possession (80%)',
      percentOfTCV: 80,
      dueAt: 'On Possession',
      monthsFromBooking: 30,
      applyInterest: false,
      interestMonths: 0,
      applyGST: false
    }
  ],
  discounts: []
};
```

### Example 3: Monthly Payment Plan

```javascript
const monthlyPlan = {
  rates: {
    gst: 0,        // No GST
    registry: 5,
    interestPerAnnum: 12
  },
  possessionChargePerSqFt: 200,
  installments: [
    { name: 'Month 1', percentOfTCV: 10, dueAt: 'Month 1', monthsFromBooking: 0, applyInterest: false, interestMonths: 0, applyGST: false },
    { name: 'Month 2', percentOfTCV: 10, dueAt: 'Month 2', monthsFromBooking: 1, applyInterest: false, interestMonths: 0, applyGST: false },
    { name: 'Month 3', percentOfTCV: 10, dueAt: 'Month 3', monthsFromBooking: 2, applyInterest: false, interestMonths: 0, applyGST: false },
    { name: 'Month 4', percentOfTCV: 10, dueAt: 'Month 4', monthsFromBooking: 3, applyInterest: false, interestMonths: 0, applyGST: false },
    { name: 'Month 5', percentOfTCV: 10, dueAt: 'Month 5', monthsFromBooking: 4, applyInterest: false, interestMonths: 0, applyGST: false },
    { name: 'Month 6', percentOfTCV: 10, dueAt: 'Month 6', monthsFromBooking: 5, applyInterest: false, interestMonths: 0, applyGST: false },
    { name: 'Month 7', percentOfTCV: 10, dueAt: 'Month 7', monthsFromBooking: 6, applyInterest: false, interestMonths: 0, applyGST: false },
    { name: 'Month 8', percentOfTCV: 10, dueAt: 'Month 8', monthsFromBooking: 7, applyInterest: false, interestMonths: 0, applyGST: false },
    { name: 'Month 9', percentOfTCV: 10, dueAt: 'Month 9', monthsFromBooking: 8, applyInterest: false, interestMonths: 0, applyGST: false },
    { name: 'Month 10', percentOfTCV: 10, dueAt: 'Month 10', monthsFromBooking: 9, applyInterest: false, interestMonths: 0, applyGST: false }
  ],
  discounts: [
    { name: 'Early bird discount', type: 'percentage', value: 5 }
  ]
};
```

## How to Use in UI

Users will be able to:

1. **Add Installment** - Click "+" button to add new installment
2. **Edit Installment** - Click on any field to edit
3. **Remove Installment** - Click "×" to remove
4. **Drag to Reorder** - Drag installments to reorder (optional)

5. **Add Discount** - Click "+" to add new discount type
6. **Edit Discount** - Edit name, type (% or fixed), value
7. **Remove Discount** - Click "×" to remove

8. **Adjust Rates** - Edit GST%, Registry%, Interest% directly
9. **Set Possession Charge** - Enter amount per sq ft

10. **Validate** - Real-time validation shows:
    - ✅ Installments sum to 100%
    - ⚠️ Warnings for unusual rates
    - ❌ Errors if required fields missing

## Calculation Flow

```
1. User inputs:
   - Area: 2400 sq ft
   - Price/sq ft: ₹15,000

2. BSP = 2400 × 15000 = ₹3,60,00,000

3. Apply discounts:
   - Razorpay 0.27% = ₹97,200
   - Booking 1.35% = ₹4,86,000
   - Total Discount = ₹5,83,200

4. TCV = ₹3,60,00,000 - ₹5,83,200 = ₹3,54,16,800

5. Calculate each installment:
   For "First Installment (10%)":
   - Base = 10% of TCV = ₹35,41,680
   - Interest = ₹35,41,680 × (10%/12) × 19 = ₹5,59,933
   - GST = (₹35,41,680 + ₹5,59,933) × 5% = ₹2,05,081
   - Total = ₹43,06,694

6. Sum all installments = ₹X

7. Add Registry = 7% of TCV = ₹24,79,176

8. Add Possession = 2400 × ₹250 = ₹6,00,000

9. Grand Total = Installments + Registry + Possession
```

## Validation Rules

### Mandatory:
- ✅ At least 1 installment
- ✅ Installment percentages must sum to 100%
- ✅ All installments must have names
- ✅ Area > 0
- ✅ Price per sq ft > 0

### Warnings (allowed but flagged):
- ⚠️ GST > 18% or < 0%
- ⚠️ Registry > 10% or < 3%
- ⚠️ Interest > 15% or < 5%
- ⚠️ Total discounts > 30%

## Export/Import

Users can:
- **Export** - Download configuration as JSON file
- **Import** - Upload JSON file to load configuration
- **Share URL** - Configuration encoded in URL parameters

---

## Key Benefits

✅ **No Limitations** - Add unlimited installments, discounts
✅ **Complete Control** - Every value is user-configurable
✅ **Flexible** - Supports any payment structure
✅ **Validated** - Real-time validation prevents errors
✅ **Portable** - Export/import configurations
✅ **Shareable** - URL-based sharing with full config

This makes the calculator suitable for ANY payment plan structure, not just predefined templates!
