# Advanced Calculator - User Guide

## 🎯 Overview

The Advanced Calculator is a **fully configurable** financial calculator that allows you to:
- ✅ Add/remove/edit unlimited installments
- ✅ Add/remove/edit custom discounts
- ✅ Configure all rates (GST, Registry, Interest)
- ✅ Set possession charges
- ✅ Real-time validation
- ✅ Complete financial breakdown with interest calculations

## 🚀 How to Use

### Step 1: Basic Details

1. Open `advanced.html` in your browser
2. Enter **Property Area** (sq ft)
3. Enter **Base Price per sq ft** (₹)
4. See **Basic Selling Price (BSP)** calculated automatically

### Step 2: Configure Discounts

1. Click "2. Discounts" tab
2. Click "+ Add Discount" for each discount
3. For each discount, configure:
   - **Name**: e.g., "Razorpay Discount"
   - **Type**: Percentage (%) or Fixed Amount (₹)
   - **Value**: e.g., 2.5 for 2.5% or 500000 for ₹5 lakh
   - **Notes** (optional)
4. Remove unwanted discounts with × button
5. See **Total Discount** and **TCV** update automatically

### Step 3: Configure Installments

1. Click "3. Installments" tab
2. One default installment is already added
3. Click "+ Add Installment" to add more
4. For each installment, configure:
   - **Name**: e.g., "Booking", "Super Structure", "OC", "Possession"
   - **% of TCV**: e.g., 10 for 10%
   - **Due At**: e.g., "On Booking", "Structure Complete"
   - **Months from Booking**: Timeline (0 for immediate)
   - **Apply Interest**: Check if interest applies
   - **Interest Months**: How many months of interest (if checked)
   - **Apply GST**: Check if GST applies to this installment
   - **Notes** (optional)
5. Remove installments with × button
6. **IMPORTANT**: Total must equal 100%
7. See real-time validation:
   - ✅ Green = Valid (100%)
   - ❌ Red = Invalid (not 100%)

### Step 4: Configure Rates & Charges

1. Click "4. Rates & Charges" tab
2. Configure:
   - **GST Rate**: Default 5% (change as needed)
   - **Registry Rate**: Default 7% (varies by state)
   - **Interest Rate**: Default 10% per annum
   - **Possession Charges**: Default ₹250/sq ft

### Step 5: Calculate

1. Click "🧮 Calculate Complete Financial Breakdown"
2. View comprehensive results:
   - **Grand Total** (top card)
   - **Summary Cards** (BSP, Discounts, TCV, Components, Charges)
   - **Installment Schedule Table** (complete breakdown)

## 📊 Example Configuration

### Example from CSV Template:

**Property**: 2400 sq ft @ ₹15,516/sq ft

**Discounts:**
- Razorpay: 0.27% (percentage)
- Booking: 1.35% (percentage)
- Maintenance: 0.93% (percentage)
- Gift: 0.67% (percentage)
- Channel Partner: 0.62% (percentage)

**Installments:**
1. First Installment (10%)
   - Due: On Booking
   - Months: 0
   - Interest: Yes, 19 months
   - GST: Yes

2. Second Installment (13%)
   - Due: Super Structure
   - Months: 12
   - Interest: Yes, 17 months
   - GST: Yes

3. Third Installment (67%)
   - Due: Occupation Certificate
   - Months: 24
   - Interest: Yes, 6 months
   - GST: No

4. Fourth Installment (10%)
   - Due: On Possession
   - Months: 30
   - Interest: No
   - GST: No

**Rates:**
- GST: 5%
- Registry: 7%
- Interest: 10% p.a.
- Possession: ₹250/sq ft

**Result:**
- BSP: ₹3,72,38,400
- TCV: ₹3,58,12,400
- Grand Total: ₹34,08,8136 (approx)

## ✅ Validation Rules

### Must Be Valid:
- ✅ Installments must sum to exactly 100%
- ✅ All installments must have names
- ✅ Property area > 0
- ✅ Price per sq ft > 0

### Warnings (Allowed):
- ⚠️ Unusual rates (GST > 18%, Registry > 10%, etc.)
- ⚠️ High total discounts (> 30%)

## 🎨 Features

### Dynamic UI:
- **Tab Navigation**: 4-step wizard interface
- **Add/Remove**: Unlimited installments and discounts
- **Real-time Updates**: All calculations update live
- **Validation Feedback**: Color-coded status indicators
- **Responsive**: Works on desktop, tablet, mobile

### Calculations:
- **Interest**: Compounded based on months
- **GST**: Applied per-installment (if selected)
- **Registry**: Percentage of TCV
- **Possession**: Per sq ft charges
- **Grand Total**: Complete all-inclusive amount

### Results Display:
- **Summary Cards**: Quick overview
- **Detailed Table**: Complete installment breakdown
- **Grand Total Card**: Highlighted final amount
- **Effective Cost/sq ft**: True cost calculation

## 🔄 Common Use Cases

### Use Case 1: Standard Builder Plan
- Copy installment structure from builder's brochure
- Add all offered discounts
- Configure interest and GST as per builder
- Calculate to see total outflow

### Use Case 2: Comparison
- Set up Plan A configuration
- Calculate and note results
- Modify installment structure for Plan B
- Calculate and compare

### Use Case 3: Custom Negotiation
- Start with builder's plan
- Add your negotiated discounts
- Adjust payment schedule as agreed
- Calculate final numbers

### Use Case 4: What-If Analysis
- Change interest rates to see impact
- Adjust installment timing
- Add/remove discounts
- See how it affects grand total

## 💡 Tips

1. **Start Simple**: Begin with 2-3 installments, then add more
2. **Validate Often**: Check that total = 100% before calculating
3. **Use Notes**: Add context for each installment/discount
4. **Save Screenshots**: Download PDF or screenshot results
5. **Verify with Builder**: Cross-check calculated values

## ⚠️ Important Notes

- All calculations are **estimates**
- Interest calculation uses **simple interest**
- GST may vary by state and property type
- Registry charges vary by location
- Always verify final numbers with builder/legal advisor

## 🐛 Troubleshooting

**Problem**: Can't calculate
- **Solution**: Ensure installments sum to 100%

**Problem**: Numbers seem wrong
- **Solution**: Check interest months, GST settings per installment

**Problem**: Total doesn't match builder's quote
- **Solution**: Verify all rates, discounts, and installment structure match exactly

## 📱 Accessibility

- Keyboard navigation supported
- Tab through all fields
- Enter key to submit forms
- Screen reader compatible

## 🔮 Future Enhancements

- Save/load configurations
- Export configuration as JSON
- Import builder's plan from file
- Compare multiple configurations side-by-side
- Charts and visualizations
- Payment timeline graph

---

**File Location**: `advanced.html`

**Status**: ✅ Fully Functional

**Last Updated**: November 8, 2025
