# Real Estate Payment Plan Calculator

A comprehensive web application for real estate financial planning and payment plan comparison. Built with pure HTML, CSS, and JavaScript with automated testing and validation.

## 🌟 Features

- **Multiple Payment Plans**: Compare up to 3 payment plans simultaneously
  - Construction-Linked Plan (CLP)
  - 20:80 Possession-Linked Plan
  - 10:90 Possession-Linked Plan
  - Down Payment Plan
  - Flexi 30:70 Plan
  - Flexi 50:50 Plan
  - Time-Linked Payment Plan

- **Smart Calculations**: Automatic calculation of payment schedules with percentage-based formulas
- **Shareable Results**: Generate shareable URLs with encoded parameters
- **PDF Export**: Download branded PDF reports with payment schedules
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: WCAG 2.1 AA compliant
- **No Server Required**: 100% client-side application
- **Automated Testing**: Comprehensive test suite with Jest
- **Pre-commit Validation**: Automatic validation before every commit

## 🚀 Quick Start

### Option 1: Open Directly (No Installation)

1. Open `index.html` in any modern web browser
2. Start comparing payment plans!

### Option 2: Local Development Server

```bash
# Install dependencies
npm install

# Start local server
npm run serve

# Open http://localhost:8000 in your browser
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run automated validations
npm run validate

# Run specific validations
npm run validate:plans
npm run validate:calculations
```

## 📁 Project Structure

```
real-estate/
├── index.html                 # Main HTML file
├── css/
│   └── styles.css            # Responsive CSS styles
├── js/
│   ├── plans.js              # Payment plan configurations
│   ├── calculator.js         # Calculation engine
│   ├── urlHandler.js         # URL sharing functionality
│   ├── pdfGenerator.js       # PDF generation
│   └── app.js                # Main application logic
├── tests/
│   ├── plans.test.js         # Plan configuration tests
│   └── calculator.test.js    # Calculator logic tests
├── validation/
│   ├── validate-all.js       # Master validation script
│   ├── validate-plans.js     # Plan validation
│   └── validate-calculations.js  # Calculation validation
├── .husky/
│   └── pre-commit            # Pre-commit hook
├── package.json              # Project dependencies
└── README.md                 # This file
```

## 🔧 Configuration

### Adding a New Payment Plan

1. Open `js/plans.js`
2. Add your plan to the `paymentPlans` object:

```javascript
'YourPlanKey': {
  name: 'Your Plan Name',
  description: 'Plan description',
  stages: [
    { stage: 'Booking', percent: 10 },
    { stage: 'Stage 2', percent: 30 },
    { stage: 'Possession', percent: 60 }
  ]
}
```

3. Ensure percentages sum to 100%
4. Run validation: `npm run validate:plans`

### Customizing Branding

Edit the following in `index.html`:
- Logo and company name in the header
- Meta tags for SEO and social sharing
- Footer information

Edit `css/styles.css` for colors and styling:
- CSS variables in `:root` section

## 🎯 How It Works

### 1. Payment Calculation

```javascript
// Plans are stored as percentage-based configurations
{
  stage: 'Booking',
  percent: 20  // 20% of total property price
}

// Calculator multiplies percentage by property price
amount = (percent / 100) * propertyPrice
```

### 2. URL Sharing

Results are shared via URL parameters:
```
https://yoursite.com/?price=10000000&plans=CLP,20:80
```

When someone opens this link:
1. App reads URL parameters
2. Auto-populates form fields
3. Automatically calculates and displays results

### 3. PDF Generation

- Uses jsPDF library (loaded from CDN)
- Generates PDF client-side in browser
- Includes branding, tables, and formatting
- No server required

## ✅ Automated Validation Features

### Pre-commit Hooks

Every commit automatically runs:
1. Payment plan validation (percentages sum to 100%)
2. Calculation accuracy tests
3. Full Jest test suite

### Validation Scripts

```bash
# Validate payment plans
npm run validate:plans

# Validate calculations
npm run validate:calculations

# Run all validations
npm run validate
```

### Test Coverage

- Unit tests for all calculation logic
- Plan configuration validation
- Input validation tests
- Currency formatting tests
- Integration tests

## 🌐 Deployment

### GitHub Pages

1. Push code to GitHub repository
2. Go to Settings > Pages
3. Select branch to deploy
4. Access at: `https://yourusername.github.io/real-estate/`

### Netlify / Vercel

1. Connect your GitHub repository
2. Build command: (none needed - static site)
3. Publish directory: `/`
4. Deploy!

### Any Static Hosting

Simply upload all files to your hosting provider. No build step required.

## 🧪 Testing Checklist

Before deploying, verify:

- [ ] All payment plans sum to 100%
- [ ] Calculations are accurate for various property prices
- [ ] URL sharing works correctly
- [ ] PDF download generates properly
- [ ] Responsive design works on mobile
- [ ] All links and buttons function
- [ ] Form validation works
- [ ] Error messages display correctly

Run automated tests:
```bash
npm run validate && npm test
```

## 🔒 Security

- No server-side code (no injection risks)
- No data storage (no data breaches)
- Input validation on all user inputs
- URL parameters validated before use
- XSS protection through proper DOM handling

## 🎨 Customization

### Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
  --primary-color: #2563eb;
  --primary-dark: #1e40af;
  /* Add more custom colors */
}
```

### Payment Plan Formulas

All formulas are in `js/plans.js` and can be easily modified without changing core logic.

## 📝 License

MIT License - Feel free to use and modify for your projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Commit (pre-commit hooks will run automatically)
6. Push and create a pull request

## 💡 Tips

- **Compare wisely**: Select plans with different structures for meaningful comparison
- **Share results**: Use the share button to send calculations to clients
- **Download PDFs**: Professional reports for client presentations
- **Bookmark links**: Save specific scenarios by bookmarking the URL

## 🐛 Troubleshooting

### PDF not generating
- Ensure jsPDF CDN is loading (check browser console)
- Try refreshing the page

### Tests failing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### Pre-commit hook not running
```bash
# Reinstall Husky
npm run prepare
```

## 📞 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with:
   - Browser version
   - Steps to reproduce
   - Expected vs actual behavior

## 🎉 Acknowledgments

- Built according to specifications from PaymentPlan.pdf
- Uses jsPDF for client-side PDF generation
- Follows Indian numbering system (lakhs and crores)
- Implements WCAG 2.1 AA accessibility standards

---

**Made with ❤️ for real estate professionals and home buyers**
