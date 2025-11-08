# Setup & Installation Guide

## Quick Start (No Installation Required)

The easiest way to use this calculator:

1. Open `index.html` in your browser
2. Done! Start calculating payment plans

**No npm, no Node.js, no server needed for basic usage.**

---

## Developer Setup (With Testing & Validation)

If you want to run tests and use pre-commit validation:

### Prerequisites

- Node.js 14+ and npm installed
- Git installed

### Installation Steps

```bash
# 1. Navigate to project directory
cd /path/to/real-estate

# 2. Install dependencies
npm install

# 3. Verify installation
npm test
```

### Setup Pre-commit Hooks

```bash
# Initialize Husky
npm run prepare

# Make pre-commit hook executable (Mac/Linux)
chmod +x .husky/pre-commit
```

---

## Running the Application

### Method 1: Open File Directly

Double-click `index.html` or open it in your browser.

### Method 2: Local Server (Recommended for Development)

```bash
# Start Python server
npm run serve

# Or manually:
python3 -m http.server 8000

# Open http://localhost:8000
```

---

## Testing & Validation

### Run All Tests

```bash
npm test
```

### Run Specific Validations

```bash
# Validate payment plans
npm run validate:plans

# Validate calculations
npm run validate:calculations

# Run all validations
npm run validate
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

---

## Pre-commit Validation

Every time you commit, these checks run automatically:

1. ✅ Payment plan validation
2. ✅ Calculation validation
3. ✅ Full test suite

If any check fails, the commit is blocked until you fix the issues.

### Bypass Pre-commit (Not Recommended)

```bash
git commit --no-verify -m "Your message"
```

---

## Deployment

### Deploy to GitHub Pages

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Enable GitHub Pages in repository settings
# Settings > Pages > Source: main branch
```

### Deploy to Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Set build command: (leave empty)
4. Set publish directory: `/`
5. Deploy!

---

## Troubleshooting

### npm install fails

```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Tests not running

```bash
# Reinstall Jest
npm install --save-dev jest jest-environment-jsdom
```

### Pre-commit hook not executing

```bash
# Reinstall Husky
rm -rf .husky
npm install husky --save-dev
npm run prepare
chmod +x .husky/pre-commit
```

### PDF not generating in browser

- Check browser console for errors
- Ensure jsPDF CDN is accessible
- Try refreshing the page

---

## File Permissions (Mac/Linux)

```bash
# Make validation scripts executable
chmod +x validation/*.js

# Make pre-commit hook executable
chmod +x .husky/pre-commit
```

---

## Environment Check

Verify your setup:

```bash
# Check Node.js version
node --version  # Should be 14+

# Check npm version
npm --version

# Run health check
npm test && npm run validate
```

---

## Development Workflow

1. Make changes to code
2. Run tests: `npm test`
3. Run validations: `npm run validate`
4. Commit: `git commit -m "Your message"`
   - Pre-commit hooks run automatically
5. Push: `git push`

---

## Quick Commands Reference

```bash
# Testing
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report

# Validation
npm run validate           # All validations
npm run validate:plans     # Plan validation only
npm run validate:calculations  # Calculation validation only

# Development
npm run serve              # Start local server
npm run lint               # Run linter

# Husky
npm run prepare            # Setup pre-commit hooks
```

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Run tests: `npm test`
3. ✅ Setup Husky: `npm run prepare`
4. ✅ Start developing!

---

## Support

If you encounter issues:

1. Check this guide
2. Review README.md
3. Check the troubleshooting section
4. Create a GitHub issue

**Happy coding! 🚀**
