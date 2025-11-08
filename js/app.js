/**
 * Main Application Logic
 * Handles UI interactions and orchestrates all components
 */

// Global state
let currentSchedules = [];
let currentPrice = 0;
let currentPlans = [];

// DOM elements
const elements = {
  propertyPriceInput: null,
  calculateBtn: null,
  resultsSection: null,
  scheduleContainer: null,
  comparisonSummary: null,
  shareBtn: null,
  downloadPdfBtn: null,
  shareModal: null,
  shareLink: null,
  copyLinkBtn: null,
  copySuccess: null,
  priceError: null,
  planError: null
};

/**
 * Initialize the application
 */
function initializeApp() {
  // Cache DOM elements
  elements.propertyPriceInput = document.getElementById('propertyPrice');
  elements.calculateBtn = document.getElementById('calculateBtn');
  elements.resultsSection = document.getElementById('resultsSection');
  elements.scheduleContainer = document.getElementById('scheduleContainer');
  elements.comparisonSummary = document.getElementById('comparisonSummary');
  elements.shareBtn = document.getElementById('shareBtn');
  elements.downloadPdfBtn = document.getElementById('downloadPdfBtn');
  elements.shareModal = document.getElementById('shareModal');
  elements.shareLink = document.getElementById('shareLink');
  elements.copyLinkBtn = document.getElementById('copyLinkBtn');
  elements.copySuccess = document.getElementById('copySuccess');
  elements.priceError = document.getElementById('priceError');
  elements.planError = document.getElementById('planError');

  // Set up event listeners
  setupEventListeners();

  // Check for URL parameters (shared link)
  checkForURLParameters();

  // Add input formatting
  setupPriceInputFormatting();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Calculate button
  elements.calculateBtn.addEventListener('click', handleCalculate);

  // Share button
  elements.shareBtn.addEventListener('click', handleShare);

  // Download PDF button
  elements.downloadPdfBtn.addEventListener('click', handleDownloadPDF);

  // Copy link button
  elements.copyLinkBtn.addEventListener('click', handleCopyLink);

  // Modal close
  const modalClose = document.querySelector('.modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', closeShareModal);
  }

  // Close modal on outside click
  elements.shareModal.addEventListener('click', (e) => {
    if (e.target === elements.shareModal) {
      closeShareModal();
    }
  });

  // Plan checkboxes - limit to 3 selections
  const planCheckboxes = document.querySelectorAll('input[name="plan"]');
  planCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handlePlanSelection);
  });

  // Enter key on price input
  elements.propertyPriceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  });
}

/**
 * Setup price input formatting
 */
function setupPriceInputFormatting() {
  elements.propertyPriceInput.addEventListener('input', (e) => {
    // Remove non-numeric characters except commas
    let value = e.target.value.replace(/[^0-9,]/g, '');

    // Remove existing commas
    value = value.replace(/,/g, '');

    // Add Indian number formatting
    if (value) {
      value = formatIndianNumberInput(value);
    }

    e.target.value = value;
  });
}

/**
 * Format number with Indian comma system for input
 * @param {string} num - Number string
 * @returns {string} - Formatted number
 */
function formatIndianNumberInput(num) {
  const n = num.toString();
  const lastThree = n.substring(n.length - 3);
  const otherNumbers = n.substring(0, n.length - 3);

  if (otherNumbers !== '') {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return lastThree;
}

/**
 * Handle plan selection (max 3 plans)
 */
function handlePlanSelection(e) {
  const checkedBoxes = document.querySelectorAll('input[name="plan"]:checked');

  if (checkedBoxes.length > 3) {
    e.target.checked = false;
    showError(elements.planError, 'You can select maximum 3 plans for comparison');
  } else {
    clearError(elements.planError);
  }
}

/**
 * Handle calculate button click
 */
function handleCalculate() {
  // Clear previous errors
  clearError(elements.priceError);
  clearError(elements.planError);

  // Validate property price
  const priceValidation = validatePropertyPrice(elements.propertyPriceInput.value);

  if (!priceValidation.valid) {
    showError(elements.priceError, priceValidation.errors.join('. '));
    elements.propertyPriceInput.classList.add('error');
    return;
  }

  elements.propertyPriceInput.classList.remove('error');

  // Get selected plans
  const selectedPlanElements = document.querySelectorAll('input[name="plan"]:checked');
  const selectedPlanKeys = Array.from(selectedPlanElements).map(el => el.value);

  if (selectedPlanKeys.length === 0) {
    showError(elements.planError, 'Please select at least one payment plan');
    return;
  }

  // Get plan configurations
  const selectedPlans = selectedPlanKeys.map(key => paymentPlans[key]).filter(p => p);

  // Calculate schedules
  try {
    const schedules = calculateMultiplePlans(selectedPlans, priceValidation.value);

    // Store in global state
    currentSchedules = schedules;
    currentPrice = priceValidation.value;
    currentPlans = selectedPlanKeys;

    // Display results
    displayResults(schedules, priceValidation.value);

    // Update URL for sharing
    updateURLState(priceValidation.value, selectedPlanKeys);

    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (error) {
    console.error('Calculation error:', error);
    showError(elements.priceError, 'An error occurred during calculation. Please try again.');
  }
}

/**
 * Display calculation results
 * @param {Array} schedules - Payment schedules
 * @param {number} propertyPrice - Property price
 */
function displayResults(schedules, propertyPrice) {
  // Show results section
  elements.resultsSection.classList.remove('hidden');

  // Display comparison summary
  displayComparisonSummary(schedules);

  // Display individual schedules
  displaySchedules(schedules);
}

/**
 * Display comparison summary
 * @param {Array} schedules - Payment schedules
 */
function displayComparisonSummary(schedules) {
  const comparison = comparePaymentPlans(schedules);

  if (!comparison) {
    elements.comparisonSummary.innerHTML = '';
    return;
  }

  const html = `
    <h3>Quick Comparison Insights</h3>
    <div class="summary-grid">
      <div class="summary-item">
        <strong>📊 Plans Compared</strong>
        <div class="value">${comparison.totalPlans} Plans</div>
      </div>
      <div class="summary-item">
        <strong>💰 Lowest Booking Amount</strong>
        <div class="value">${formatCurrency(comparison.lowestBookingAmount.amount)}</div>
        <small>${comparison.lowestBookingAmount.name}</small>
      </div>
      <div class="summary-item">
        <strong>🏠 Highest Possession Payment</strong>
        <div class="value">${formatCurrency(comparison.highestPossessionPayment.amount)}</div>
        <small>${comparison.highestPossessionPayment.name}</small>
      </div>
      <div class="summary-item">
        <strong>⚡ Highest Early Payment</strong>
        <div class="value">${formatCurrency(comparison.highestEarlyPayment.amount)}</div>
        <small>${comparison.highestEarlyPayment.name}</small>
      </div>
    </div>
  `;

  elements.comparisonSummary.innerHTML = html;
}

/**
 * Display payment schedules
 * @param {Array} schedules - Payment schedules
 */
function displaySchedules(schedules) {
  const colors = ['#2563eb', '#7c3aed', '#059669', '#dc2626'];

  const html = schedules.map((schedule, index) => {
    const color = colors[index % colors.length];

    const rowsHTML = schedule.installments.map(inst => `
      <tr>
        <td><span class="stage-name">${inst.stage}</span><br><span class="percentage">${inst.percentage}%</span></td>
        <td class="amount">${formatCurrency(inst.amount)}</td>
      </tr>
    `).join('');

    return `
      <div class="schedule-card" style="border-top-color: ${color}">
        <div class="schedule-header" style="background: linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)">
          <h3>${schedule.planName}</h3>
          <div class="total">Total: ${formatCurrency(schedule.totalAmount)}</div>
        </div>
        <div class="schedule-body">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Payment Stage</th>
                <th style="text-align: right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');

  elements.scheduleContainer.innerHTML = html;
}

/**
 * Adjust color brightness
 * @param {string} color - Hex color
 * @param {number} amount - Amount to adjust
 * @returns {string} - Adjusted hex color
 */
function adjustColor(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/**
 * Handle share button click
 */
function handleShare() {
  if (currentSchedules.length === 0) return;

  const shareURL = generateShareableURL(currentPrice, currentPlans);
  elements.shareLink.value = shareURL;
  elements.shareModal.classList.remove('hidden');
  elements.shareLink.select();
}

/**
 * Handle copy link button
 */
async function handleCopyLink() {
  const success = await copyToClipboard(elements.shareLink.value);

  if (success) {
    elements.copySuccess.classList.remove('hidden');
    elements.copyLinkBtn.textContent = '✓ Copied!';

    setTimeout(() => {
      elements.copySuccess.classList.add('hidden');
      elements.copyLinkBtn.textContent = 'Copy';
    }, 2000);
  } else {
    alert('Failed to copy link. Please copy manually.');
  }
}

/**
 * Close share modal
 */
function closeShareModal() {
  elements.shareModal.classList.add('hidden');
}

/**
 * Handle download PDF button
 */
function handleDownloadPDF() {
  if (currentSchedules.length === 0) return;

  try {
    generatePDF(currentSchedules, currentPrice);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}

/**
 * Check for URL parameters and auto-calculate
 */
function checkForURLParameters() {
  const urlParams = parseURLParameters();

  if (!urlParams) return;

  // Validate plans exist
  const validPlans = validateURLPlans(urlParams.plans, paymentPlans);

  if (validPlans.length === 0) {
    console.warn('No valid plans found in URL');
    return;
  }

  // Set property price
  elements.propertyPriceInput.value = formatIndianNumberInput(urlParams.price.toString());

  // Check plan checkboxes
  const planCheckboxes = document.querySelectorAll('input[name="plan"]');
  planCheckboxes.forEach(checkbox => {
    if (validPlans.includes(checkbox.value)) {
      checkbox.checked = true;
    }
  });

  // Auto-calculate
  setTimeout(() => {
    handleCalculate();
  }, 500);
}

/**
 * Show error message
 * @param {HTMLElement} element - Error message element
 * @param {string} message - Error message
 */
function showError(element, message) {
  if (element) {
    element.textContent = message;
    element.classList.add('show');
  }
}

/**
 * Clear error message
 * @param {HTMLElement} element - Error message element
 */
function clearError(element) {
  if (element) {
    element.textContent = '';
    element.classList.remove('show');
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
