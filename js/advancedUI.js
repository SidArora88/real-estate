/**
 * Advanced UI Controller
 * Manages the fully configurable calculator interface
 */

// Global state
let currentConfig = {
  rates: {
    gst: 5,
    registry: 7,
    interestPerAnnum: 10,
    costOfMoney: 8 // Cost of money (opportunity cost) for NPV calculation
  },
  possessionChargePerSqFt: 250,
  installments: [],
  discounts: []
};

let currentResults = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  setupTabs();
  setupEventListeners();
  addDefaultInstallment();
  updateAllDisplays();
}

/**
 * Setup tab switching
 */
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Basic inputs
  document.getElementById('area').addEventListener('input', updateAllDisplays);
  document.getElementById('pricePerSqFt').addEventListener('input', updateAllDisplays);

  // Rates
  document.getElementById('gstRate').addEventListener('input', (e) => {
    currentConfig.rates.gst = parseFloat(e.target.value) || 0;
  });
  document.getElementById('registryRate').addEventListener('input', (e) => {
    currentConfig.rates.registry = parseFloat(e.target.value) || 0;
  });
  document.getElementById('interestRate').addEventListener('input', (e) => {
    currentConfig.rates.interestPerAnnum = parseFloat(e.target.value) || 0;
  });
  document.getElementById('possessionCharge').addEventListener('input', (e) => {
    currentConfig.possessionChargePerSqFt = parseFloat(e.target.value) || 0;
  });
  document.getElementById('costOfMoney').addEventListener('input', (e) => {
    currentConfig.rates.costOfMoney = parseFloat(e.target.value) || 0;
  });

  // Add buttons
  document.getElementById('addInstallmentBtn').addEventListener('click', addInstallment);
  document.getElementById('addDiscountBtn').addEventListener('click', addDiscount);

  // Calculate button
  document.getElementById('calculateBtn').addEventListener('click', calculate);

  // Modal
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  document.getElementById('shareModal').addEventListener('click', (e) => {
    if (e.target.id === 'shareModal') closeModal();
  });

  document.getElementById('shareBtn').addEventListener('click', shareResults);
  document.getElementById('copyLinkBtn').addEventListener('click', copyShareLink);
  document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);
}

/**
 * Add default installment
 */
function addDefaultInstallment() {
  const installment = createBlankInstallment();
  installment.name = 'Booking';
  installment.percentOfTCV = 10;
  installment.dueAt = 'On Booking';
  currentConfig.installments.push(installment);
  renderInstallments();
}

/**
 * Add new installment
 */
function addInstallment() {
  const installment = createBlankInstallment();
  currentConfig.installments.push(installment);
  renderInstallments();
}

/**
 * Remove installment
 */
function removeInstallment(id) {
  currentConfig.installments = currentConfig.installments.filter(inst => inst.id !== id);
  renderInstallments();
}

/**
 * Render installments list - Compact table style
 */
function renderInstallments() {
  const container = document.getElementById('installmentsList');
  container.innerHTML = '';

  currentConfig.installments.forEach((inst, index) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <div class="item-num">${index + 1}</div>
      <div class="item-fields">
        <div class="form-group">
          <label>Name</label>
          <input type="text" value="${inst.name}"
            onchange="updateInstallment(${inst.id}, 'name', this.value)"
            placeholder="e.g., Booking">
        </div>
        <div class="form-group">
          <label>% of TCV</label>
          <input type="number" value="${inst.percentOfTCV}" min="0" max="100" step="0.1"
            onchange="updateInstallment(${inst.id}, 'percentOfTCV', parseFloat(this.value) || 0)">
        </div>
        <div class="form-group">
          <label>Due At</label>
          <input type="text" value="${inst.dueAt}"
            onchange="updateInstallment(${inst.id}, 'dueAt', this.value)"
            placeholder="e.g., On Booking">
        </div>
        <div class="form-group">
          <label>Months from Booking</label>
          <input type="number" value="${inst.monthsFromBooking}" min="0" step="1"
            onchange="updateInstallment(${inst.id}, 'monthsFromBooking', parseInt(this.value) || 0)">
        </div>
        ${index < currentConfig.installments.length - 1 ? `
        <div class="form-group">
          <label>Interest (% p.a.)</label>
          <input type="number" value="${inst.interestRateForNextPeriod !== null ? inst.interestRateForNextPeriod : ''}"
            min="0" max="30" step="0.1"
            placeholder="Global"
            onchange="updateInstallment(${inst.id}, 'interestRateForNextPeriod', this.value ? parseFloat(this.value) : null)">
        </div>
        ` : ''}
      </div>
      ${currentConfig.installments.length > 1 ?
        `<button class="remove-btn" onclick="removeInstallment(${inst.id})">×</button>` :
        ''}
    `;

    // Add extras row for checkboxes
    const extrasHTML = `
      <div class="item-extras">
        <div class="checkbox-group">
          <input type="checkbox" id="settle-${inst.id}"
            ${inst.settleAccruedInterest ? 'checked' : ''}
            onchange="updateInstallment(${inst.id}, 'settleAccruedInterest', this.checked)">
          <label for="settle-${inst.id}">Settle Interest</label>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" id="gst-${inst.id}"
            ${inst.applyGST ? 'checked' : ''}
            onchange="updateInstallment(${inst.id}, 'applyGST', this.checked)">
          <label for="gst-${inst.id}">Apply GST</label>
        </div>
      </div>
    `;
    div.innerHTML += extrasHTML;

    container.appendChild(div);
  });

  updateValidation();
}

/**
 * Update installment property
 */
function updateInstallment(id, property, value) {
  const inst = currentConfig.installments.find(i => i.id === id);
  if (inst) {
    inst[property] = value;
    if (property === 'percentOfTCV') {
      updateValidation();
    }
    if (property === 'settleAccruedInterest') {
      renderInstallments(); // Re-render to show/hide settlement info
    }
  }
}

/**
 * Add new discount
 */
function addDiscount() {
  const discount = createBlankDiscount();
  currentConfig.discounts.push(discount);
  renderDiscounts();
}

/**
 * Remove discount
 */
function removeDiscount(id) {
  currentConfig.discounts = currentConfig.discounts.filter(d => d.id !== id);
  renderDiscounts();
  updateAllDisplays();
}

/**
 * Render discounts list - Compact style
 */
function renderDiscounts() {
  const container = document.getElementById('discountsList');
  container.innerHTML = '';

  const area = parseFloat(document.getElementById('area').value) || 0;
  const pricePerSqFt = parseFloat(document.getElementById('pricePerSqFt').value) || 0;
  const bsp = area * pricePerSqFt;

  currentConfig.discounts.forEach((disc, index) => {
    // Calculate this discount amount
    let discountAmount = 0;

    if (bsp > 0 && disc.value > 0) {
      if (disc.type === 'percentage') {
        discountAmount = (disc.value / 100) * bsp;
      } else {
        discountAmount = disc.value;
      }
    }

    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <div class="item-num">${index + 1}</div>
      <div class="item-fields">
        <div class="form-group">
          <label>Name</label>
          <input type="text" value="${disc.name}"
            onchange="updateDiscount(${disc.id}, 'name', this.value)"
            placeholder="e.g., Razorpay Discount">
        </div>
        <div class="form-group">
          <label>Type</label>
          <select onchange="updateDiscount(${disc.id}, 'type', this.value)">
            <option value="percentage" ${disc.type === 'percentage' ? 'selected' : ''}>% of BSP</option>
            <option value="fixed" ${disc.type === 'fixed' ? 'selected' : ''}>Fixed ₹</option>
          </select>
        </div>
        <div class="form-group">
          <label>Value</label>
          <input type="number" value="${disc.value}" min="0" step="0.1"
            onchange="updateDiscount(${disc.id}, 'value', parseFloat(this.value) || 0)"
            placeholder="${disc.type === 'percentage' ? '%' : '₹'}">
        </div>
        ${discountAmount > 0 ? `
        <div class="form-group">
          <label>Amount</label>
          <div style="padding: 10px 12px; background: #f0f9ff; border-radius: 6px; color: #16a34a; font-weight: 600;">
            ${formatCurrency(discountAmount)}
          </div>
        </div>
        ` : ''}
      </div>
      <button class="remove-btn" onclick="removeDiscount(${disc.id})">×</button>
    `;
    container.appendChild(div);
  });
}

/**
 * Update discount property
 */
function updateDiscount(id, property, value) {
  const disc = currentConfig.discounts.find(d => d.id === id);
  if (disc) {
    disc[property] = value;
    if (property === 'type' || property === 'value') {
      renderDiscounts();
      updateAllDisplays();
    }
  }
}

/**
 * Update validation status
 */
function updateValidation() {
  const validation = validateConfiguration(currentConfig);
  const statusDiv = document.getElementById('validationStatus');
  const totalPercentDiv = document.getElementById('totalPercentDisplay');

  const totalPercent = currentConfig.installments.reduce((sum, inst) =>
    sum + (parseFloat(inst.percentOfTCV) || 0), 0);

  totalPercentDiv.textContent = `Total: ${totalPercent.toFixed(1)}%`;

  if (Math.abs(totalPercent - 100) < 0.1) {
    totalPercentDiv.className = 'percentage-indicator valid';
  } else {
    totalPercentDiv.className = 'percentage-indicator invalid';
  }

  if (validation.errors.length > 0) {
    statusDiv.className = 'validation-status invalid';
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '<strong>❌ Errors:</strong><ul>' +
      validation.errors.map(e => `<li>${e}</li>`).join('') +
      '</ul>';
  } else if (validation.warnings.length > 0) {
    statusDiv.className = 'validation-status warning';
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '<strong>⚠️ Warnings:</strong><ul>' +
      validation.warnings.map(w => `<li>${w}</li>`).join('') +
      '</ul>';
  } else {
    statusDiv.className = 'validation-status valid';
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '<strong>✅ Configuration is valid</strong>';
  }

  return validation.valid;
}

/**
 * Update all displays
 */
function updateAllDisplays() {
  const area = parseFloat(document.getElementById('area').value) || 0;
  const pricePerSqFt = parseFloat(document.getElementById('pricePerSqFt').value) || 0;

  const bsp = area * pricePerSqFt;
  document.getElementById('bspDisplay').textContent = formatCurrency(bsp);

  // Show BSP calculation
  const bspCalcDiv = document.getElementById('bspCalculation');
  const bspFormulaDiv = document.getElementById('bspFormula');
  if (area > 0 && pricePerSqFt > 0) {
    bspCalcDiv.style.display = 'block';
    bspFormulaDiv.innerHTML = `${formatIndianNumber(area)} sq ft × ${formatCurrency(pricePerSqFt)}/sq ft = ${formatCurrency(bsp)}`;
  } else {
    bspCalcDiv.style.display = 'none';
  }

  // Calculate total discounts
  let totalDiscount = 0;
  let discountBreakdown = [];
  currentConfig.discounts.forEach(disc => {
    let discAmount = 0;
    if (disc.type === 'percentage') {
      discAmount = (disc.value / 100) * bsp;
      if (disc.name && disc.value > 0) {
        discountBreakdown.push(`${disc.name}: ${disc.value}% = ${formatCurrency(discAmount)}`);
      }
    } else {
      discAmount = disc.value;
      if (disc.name && disc.value > 0) {
        discountBreakdown.push(`${disc.name}: ${formatCurrency(discAmount)}`);
      }
    }
    totalDiscount += discAmount;
  });

  document.getElementById('totalDiscountDisplay').textContent = formatCurrency(totalDiscount);

  // Show TCV calculation
  const tcvCalcDiv = document.getElementById('tcvCalculation');
  const tcvFormulaDiv = document.getElementById('tcvFormula');
  const tcv = bsp - totalDiscount;

  if (bsp > 0) {
    tcvCalcDiv.style.display = 'block';
    let tcvFormula = `BSP: ${formatCurrency(bsp)}<br>`;
    if (discountBreakdown.length > 0) {
      tcvFormula += `Discounts:<br>`;
      discountBreakdown.forEach(db => {
        tcvFormula += `  - ${db}<br>`;
      });
      tcvFormula += `Total Discount: ${formatCurrency(totalDiscount)}<br>`;
    }
    tcvFormula += `<strong>TCV = ${formatCurrency(bsp)} - ${formatCurrency(totalDiscount)} = ${formatCurrency(tcv)}</strong>`;
    tcvFormulaDiv.innerHTML = tcvFormula;
  } else {
    tcvCalcDiv.style.display = 'none';
  }

  document.getElementById('tcvDisplay').textContent = formatCurrency(tcv);
}

/**
 * Calculate and show results
 */
function calculate() {
  const area = parseFloat(document.getElementById('area').value);
  const pricePerSqFt = parseFloat(document.getElementById('pricePerSqFt').value);

  if (!area || !pricePerSqFt) {
    alert('Please enter property area and price per sq ft');
    return;
  }

  if (!updateValidation()) {
    alert('Please fix configuration errors before calculating');
    return;
  }

  // Update config from UI
  currentConfig.rates.gst = parseFloat(document.getElementById('gstRate').value) || 0;
  currentConfig.rates.registry = parseFloat(document.getElementById('registryRate').value) || 0;
  currentConfig.rates.interestPerAnnum = parseFloat(document.getElementById('interestRate').value) || 0;
  currentConfig.rates.costOfMoney = parseFloat(document.getElementById('costOfMoney').value) || 0;
  currentConfig.possessionChargePerSqFt = parseFloat(document.getElementById('possessionCharge').value) || 0;

  // Calculate
  currentResults = calculateWithUserConfig({
    area,
    pricePerSqFt,
    config: currentConfig
  });

  displayResults();
}

/**
 * Display results
 */
function displayResults() {
  console.log('displayResults called', currentResults);
  if (!currentResults) return;

  const resultsSection = document.getElementById('resultsSection');
  resultsSection.classList.remove('hidden');

  const b = currentResults.breakdown;
  console.log('breakdown:', b);

  // Grand total
  document.getElementById('grandTotal').textContent = formatCurrency(b.summary.grandTotal);
  document.getElementById('effectiveCostPerSqFt').textContent = formatCurrency(b.summary.effectiveCostPerSqFt);

  // NPV display
  if (b.summary.costOfMoneyRate && b.summary.costOfMoneyRate > 0) {
    document.getElementById('npvDisplay').textContent = formatCurrency(b.summary.netPresentValue);
    document.getElementById('npvPerSqFt').textContent = formatCurrency(b.summary.npvPerSqFt);
    document.getElementById('savingsFromDeferral').textContent = formatCurrency(b.summary.savingsFromDeferral);
    const npvCard = document.getElementById('npvCard');
    if (npvCard) npvCard.classList.remove('hidden');
    const npvSection = document.getElementById('npvSection');
    if (npvSection) npvSection.style.display = 'block';
  } else {
    const npvCard = document.getElementById('npvCard');
    if (npvCard) npvCard.classList.add('hidden');
    const npvSection = document.getElementById('npvSection');
    if (npvSection) npvSection.style.display = 'none';
  }

  // Summary cards
  const summaryGrid = document.getElementById('summaryGrid');
  summaryGrid.innerHTML = `
    <div class="result-card">
      <h4>Price Breakdown</h4>
      <div class="result-row">
        <span class="result-label">Basic Selling Price</span>
        <span class="result-value">${formatCurrency(b.basicSellingPrice)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">Total Discounts</span>
        <span class="result-value" style="color: var(--success-color);">-${formatCurrency(b.totalDiscounts)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">Total Cost Value</span>
        <span class="result-value">${formatCurrency(b.totalCostValue)}</span>
      </div>
    </div>

    <div class="result-card">
      <h4>Payment Components</h4>
      <div class="result-row">
        <span class="result-label">Base Amount</span>
        <span class="result-value">${formatCurrency(b.summary.totalBaseAmount)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">GST (${currentConfig.rates.gst}%)</span>
        <span class="result-value">+${formatCurrency(b.summary.totalGST)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">Gross Payment</span>
        <span class="result-value">${formatCurrency(b.summary.totalGrossAmount)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">Interest Earned</span>
        <span class="result-value" style="color: var(--success-color);">-${formatCurrency(b.summary.savingsFromInterest)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">Net Payment</span>
        <span class="result-value">${formatCurrency(b.summary.totalNetPayment)}</span>
      </div>
    </div>

    <div class="result-card">
      <h4>Additional Charges & Total</h4>
      <div class="result-row">
        <span class="result-label">Registry (${currentConfig.rates.registry}%)</span>
        <span class="result-value">${formatCurrency(b.summary.registryAmount)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">Possession Charges</span>
        <span class="result-value">${formatCurrency(b.summary.possessionCharges)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">Grand Total</span>
        <span class="result-value">${formatCurrency(b.summary.grandTotal)}</span>
      </div>
      <div class="result-row" style="background: #f0fdf4; margin-top: 10px; padding: 8px; border-radius: 4px;">
        <span class="result-label" style="color: #16a34a;"><strong>💰 Your Savings</strong></span>
        <span class="result-value" style="color: #16a34a;"><strong>${formatCurrency(b.summary.savingsFromInterest)}</strong></span>
      </div>
    </div>
  `;

  // Detailed breakdown
  let detailedHTML = '<div class="result-card" style="grid-column: 1 / -1;">';
  detailedHTML += '<h4>Installment Schedule with Interest Accrual</h4>';
  detailedHTML += '<table class="installment-table" style="font-size: 0.9rem;">';

  // Add PV column if NPV is calculated
  const showNPV = b.summary.costOfMoneyRate && b.summary.costOfMoneyRate > 0;
  detailedHTML += '<thead><tr><th>#</th><th>Name</th><th>Month</th><th>Base + GST</th><th>Interest Accrued</th><th>Interest Settled</th><th>Net Payment</th>';
  if (showNPV) {
    detailedHTML += '<th>Present Value</th>';
  }
  detailedHTML += '</tr></thead>';
  detailedHTML += '<tbody>';

  b.installments.forEach(inst => {
    // Build interest accrued details
    let interestAccrued = '-';
    if (inst.interestAccruedThisPeriod > 0) {
      interestAccrued = `<span style="color: #16a34a;">+${formatCurrency(inst.interestAccruedThisPeriod)}</span><br>
        <small style="color: #64748b;">(${inst.interestRateThisPeriod}% p.a. for ${inst.interestMonths} months<br>
        on ${formatCurrency(inst.interestCalculationBase)} cumulative)</small>`;
    }

    // Interest settled
    let interestSettled = '-';
    if (inst.interestSettled > 0) {
      interestSettled = `<span style="color: #16a34a; font-weight: bold;">-${formatCurrency(inst.interestSettled)}</span><br>
        <small style="color: #16a34a;">✅ Deducted</small>`;
    }

    // Base + GST
    const baseGst = `${formatCurrency(inst.baseAmount)}<br>
      <small style="color: #64748b;">${inst.percentOfTCV}% of TCV${inst.gstAmount > 0 ? ' + GST ' + formatCurrency(inst.gstAmount) : ''}</small>`;

    detailedHTML += `<tr>
      <td>${inst.installmentNumber}</td>
      <td><strong>${inst.name}</strong><br><small style="color: #64748b;">${inst.dueAt}</small></td>
      <td>${inst.monthsFromBooking}</td>
      <td>${baseGst}</td>
      <td>${interestAccrued}</td>
      <td>${interestSettled}</td>
      <td><strong>${formatCurrency(inst.netPayment)}</strong></td>`;

    if (showNPV) {
      detailedHTML += `<td><strong style="color: #16a34a;">${formatCurrency(inst.presentValue)}</strong><br>
        <small style="color: #64748b;">@${b.summary.costOfMoneyRate}% p.a.</small></td>`;
    }

    detailedHTML += `</tr>`;
  });

  // Add additional charges as separate rows
  const additionalColspan = showNPV ? 5 : 4;
  detailedHTML += `<tr style="border-top: 3px solid #e2e8f0;">
    <td colspan="3"></td>
    <td colspan="${additionalColspan}" style="text-align: right; padding-top: 15px;"><strong>Additional Charges:</strong></td>
  </tr>`;

  detailedHTML += `<tr style="background: #f8fafc;">
    <td>-</td>
    <td><strong>Registry Charges</strong><br><small style="color: #64748b;">${currentConfig.rates.registry}% of TCV</small></td>
    <td>-</td>
    <td>${formatCurrency(b.summary.registryAmount)}</td>
    <td>-</td>
    <td>-</td>
    <td><strong>${formatCurrency(b.summary.registryAmount)}</strong></td>`;
  if (showNPV) {
    detailedHTML += `<td><strong style="color: #16a34a;">${formatCurrency(b.summary.registryPV)}</strong></td>`;
  }
  detailedHTML += `</tr>`;

  detailedHTML += `<tr style="background: #f8fafc;">
    <td>-</td>
    <td><strong>Possession Charges</strong><br><small style="color: #64748b;">₹${currentConfig.possessionChargePerSqFt}/sq ft</small></td>
    <td>-</td>
    <td>${formatCurrency(b.summary.possessionCharges)}</td>
    <td>-</td>
    <td>-</td>
    <td><strong>${formatCurrency(b.summary.possessionCharges)}</strong></td>`;
  if (showNPV) {
    detailedHTML += `<td><strong style="color: #16a34a;">${formatCurrency(b.summary.possessionPV)}</strong></td>`;
  }
  detailedHTML += `</tr>`;

  // Grand total row
  const totalColspan = showNPV ? 7 : 6;
  detailedHTML += `<tr style="border-top: 3px solid #2563eb; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); font-size: 1.1rem;">
    <td colspan="${totalColspan}" style="text-align: right; padding: 15px;"><strong>GRAND TOTAL (All Inclusive):</strong></td>
    <td style="padding: 15px;"><strong style="color: #2563eb; font-size: 1.2rem;">${formatCurrency(b.summary.grandTotal)}</strong></td>
  </tr>`;

  // NPV total row if applicable
  if (showNPV) {
    detailedHTML += `<tr style="border-top: 2px solid #16a34a; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); font-size: 1.1rem;">
      <td colspan="7" style="text-align: right; padding: 15px;"><strong>NET PRESENT VALUE (True Cost Today @ ${b.summary.costOfMoneyRate}%):</strong></td>
      <td style="padding: 15px;"><strong style="color: #16a34a; font-size: 1.2rem;">${formatCurrency(b.summary.netPresentValue)}</strong></td>
    </tr>`;
  }

  detailedHTML += '</tbody></table>';
  detailedHTML += '<div style="background: #fffbeb; padding: 15px; margin-top: 15px; border-radius: 4px; border-left: 3px solid #f59e0b;">';
  detailedHTML += '<strong>📖 How to read this table:</strong><br>';
  detailedHTML += '• <strong>Interest Accrued:</strong> Interest earned on cumulative amounts paid from this installment to the next<br>';
  detailedHTML += '• <strong>Interest Settled:</strong> Total accrued interest deducted from this payment<br>';
  detailedHTML += '• <strong>Net Payment:</strong> What you actually pay = Base + GST - Interest Settled<br>';
  if (showNPV) {
    detailedHTML += '• <strong>Present Value:</strong> True cost of payment in today\'s money, discounted at ' + b.summary.costOfMoneyRate + '% p.a. (opportunity cost)<br>';
  }
  detailedHTML += '• <strong>Additional Charges:</strong> Registry and Possession charges added at the end';
  detailedHTML += '</div>';
  detailedHTML += '</div>';

  document.getElementById('detailedBreakdown').innerHTML = detailedHTML;

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function shareResults() {
  // Simple implementation - can be enhanced
  document.getElementById('shareModal').classList.remove('hidden');
  document.getElementById('shareLink').value = window.location.href;
}

function copyShareLink() {
  const input = document.getElementById('shareLink');
  input.select();
  document.execCommand('copy');
  document.getElementById('copySuccess').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('copySuccess').classList.add('hidden');
  }, 2000);
}

function closeModal() {
  document.getElementById('shareModal').classList.add('hidden');
}

function downloadPDF() {
  if (!currentResults) {
    alert('Please calculate first before downloading PDF');
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Helper to format currency for PDF (replace ₹ with Rs. for better compatibility)
    const formatCurrencyPDF = (amount) => {
      return formatCurrency(amount).replace('₹', 'Rs. ');
    };

    const b = currentResults.breakdown;
    const area = currentResults.inputs.area;
    const pricePerSqFt = currentResults.inputs.pricePerSqFt;

    // Premium Dark Header
    doc.setFillColor(15, 23, 42); // Dark slate
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('Premium Financial Analysis', 105, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(203, 213, 225); // Lighter gray
    doc.text('Real Estate Payment Breakdown & NPV Analysis', 105, 28, { align: 'center' });

    // Date stamp
    doc.setFontSize(8);
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    doc.text(`Generated: ${dateStr}`, 105, 36, { align: 'center' });

    let yPos = 55;

    // Property Details - Compact Card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, yPos, 180, 22, 2, 2, 'F');

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('PROPERTY DETAILS', 20, yPos + 6);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.text(`${formatIndianNumber(area)} sq ft`, 20, yPos + 12);
    doc.text(`@ ${formatCurrencyPDF(pricePerSqFt)}/sq ft`, 20, yPos + 17);

    doc.text(`BSP: ${formatCurrencyPDF(b.basicSellingPrice)}`, 80, yPos + 12);
    doc.text(`TCV: ${formatCurrencyPDF(b.totalCostValue)}`, 80, yPos + 17);

    yPos += 30;

    // Premium Combined Total Box - Dark Theme
    const showNPVinPDF = b.summary.costOfMoneyRate && b.summary.costOfMoneyRate > 0;
    const boxHeight = showNPVinPDF ? 45 : 30;

    doc.setFillColor(15, 23, 42); // Dark slate
    doc.roundedRect(15, yPos, 180, boxHeight, 3, 3, 'F');

    if (showNPVinPDF) {
      // Two-column layout: Grand Total | NPV
      doc.setTextColor(203, 213, 225);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text('GRAND TOTAL', 25, yPos + 10);
      doc.text('NET PRESENT VALUE', 110, yPos + 10);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(formatCurrencyPDF(b.summary.grandTotal), 25, yPos + 22);

      doc.setTextColor(134, 239, 172); // Green for NPV
      doc.text(formatCurrencyPDF(b.summary.netPresentValue), 110, yPos + 22);

      // Subtitles
      doc.setTextColor(203, 213, 225);
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.text(formatCurrencyPDF(b.summary.effectiveCostPerSqFt) + '/sq ft', 25, yPos + 28);
      doc.text('@ ' + b.summary.costOfMoneyRate + '% p.a.', 110, yPos + 28);

      // Savings badge
      doc.setFillColor(22, 101, 52, 0.2);
      doc.setTextColor(134, 239, 172);
      doc.setFontSize(7);
      doc.text('Savings: ' + formatCurrencyPDF(b.summary.savingsFromDeferral), 110, yPos + 35);

      // Divider
      doc.setDrawColor(71, 85, 105);
      doc.setLineWidth(0.5);
      doc.line(105, yPos + 8, 105, yPos + 30);
    } else {
      // Single Grand Total
      doc.setTextColor(203, 213, 225);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('GRAND TOTAL (All Inclusive)', 25, yPos + 10);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(formatCurrencyPDF(b.summary.grandTotal), 185, yPos + 20, { align: 'right' });

      doc.setTextColor(203, 213, 225);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text('Effective: ' + formatCurrencyPDF(b.summary.effectiveCostPerSqFt) + '/sq ft', 25, yPos + 25);
    }

    yPos += boxHeight + 10;

    // Summary Section - Clean Modern Style
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('FINANCIAL SUMMARY', 20, yPos);
    yPos += 6;

    const summaryData = [
      ['Base Amount', formatCurrencyPDF(b.summary.totalBaseAmount)],
      ['GST (' + currentConfig.rates.gst + '%)', formatCurrencyPDF(b.summary.totalGST)],
      ['Gross Payment', formatCurrencyPDF(b.summary.totalGrossAmount)],
      ['Interest Earned', '- ' + formatCurrencyPDF(b.summary.savingsFromInterest)],
      ['Net Payment', formatCurrencyPDF(b.summary.totalNetPayment)],
      ['Registry (' + currentConfig.rates.registry + '%)', formatCurrencyPDF(b.summary.registryAmount)],
      ['Possession', formatCurrencyPDF(b.summary.possessionCharges)]
    ];

    doc.autoTable({
      startY: yPos,
      head: [['Component', 'Amount']],
      body: summaryData,
      theme: 'plain',
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [71, 85, 105],
        fontSize: 8,
        fontStyle: 'bold',
        lineWidth: 0,
        lineColor: [226, 232, 240]
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 15, right: 15 },
      styles: {
        lineColor: [241, 245, 249],
        lineWidth: 0.1
      }
    });

    yPos = doc.lastAutoTable.finalY + 12;

    // Installment Schedule
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('INSTALLMENT SCHEDULE', 20, yPos);
    yPos += 6;

    // showNPVinPDF already declared above

    const installmentData = b.installments.map(inst => {
      // Build detailed base+GST string
      let baseGSTDetail = formatCurrencyPDF(inst.baseAmount);
      if (inst.gstAmount > 0) {
        baseGSTDetail += `\n+ GST ${formatCurrencyPDF(inst.gstAmount)}\n= ${formatCurrencyPDF(inst.grossAmount)}`;
      }

      // Build interest accrued detail
      let interestDetail = '-';
      if (inst.interestAccruedThisPeriod > 0) {
        interestDetail = formatCurrencyPDF(inst.interestAccruedThisPeriod);
        interestDetail += `\n(${inst.interestRateThisPeriod}% p.a. for ${inst.interestMonths}m\non ${formatCurrencyPDF(inst.interestCalculationBase)})`;
      }

      // Build interest settled detail
      let settledDetail = '-';
      if (inst.interestSettled > 0) {
        settledDetail = formatCurrencyPDF(inst.interestSettled) + '\n(Deducted)';
      }

      const row = [
        inst.installmentNumber,
        inst.name,
        'Month ' + inst.monthsFromBooking,
        baseGSTDetail,
        interestDetail,
        settledDetail,
        formatCurrencyPDF(inst.netPayment)
      ];

      if (showNPVinPDF) {
        row.push(formatCurrencyPDF(inst.presentValue));
      }

      return row;
    });

    // Add additional charges
    if (showNPVinPDF) {
      installmentData.push(
        ['', '', '', '', '', '', '', ''],
        ['-', 'Registry Charges', '', formatCurrencyPDF(b.summary.registryAmount), '', '', formatCurrencyPDF(b.summary.registryAmount), formatCurrencyPDF(b.summary.registryPV)],
        ['-', 'Possession Charges', '', formatCurrencyPDF(b.summary.possessionCharges), '', '', formatCurrencyPDF(b.summary.possessionCharges), formatCurrencyPDF(b.summary.possessionPV)],
        ['', '', '', '', '', 'TOTAL', formatCurrencyPDF(b.summary.grandTotal), formatCurrencyPDF(b.summary.netPresentValue)]
      );
    } else {
      installmentData.push(
        ['', '', '', '', '', '', ''],
        ['-', 'Registry Charges', '', formatCurrencyPDF(b.summary.registryAmount), '', '', formatCurrencyPDF(b.summary.registryAmount)],
        ['-', 'Possession Charges', '', formatCurrencyPDF(b.summary.possessionCharges), '', '', formatCurrencyPDF(b.summary.possessionCharges)],
        ['', '', '', '', '', 'TOTAL', formatCurrencyPDF(b.summary.grandTotal)]
      );
    }

    const tableHeaders = ['#', 'Name', 'Month', 'Base+GST', 'Interest Accrued', 'Interest Settled', 'Net Payment'];
    if (showNPVinPDF) {
      tableHeaders.push('Present Value');
    }

    const columnStylesConfig = {
      0: { halign: 'center', cellWidth: 10 },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' }
    };
    if (showNPVinPDF) {
      columnStylesConfig[7] = { halign: 'right', fontStyle: 'bold' };
    }

    doc.autoTable({
      startY: yPos,
      head: [tableHeaders],
      body: installmentData,
      theme: 'plain',
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [71, 85, 105],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59]
      },
      columnStyles: columnStylesConfig,
      alternateRowStyles: { fillColor: [251, 252, 253] },
      margin: { left: 10, right: 10 },
      styles: {
        lineColor: [241, 245, 249],
        lineWidth: 0.1
      },
      didParseCell: function(data) {
        // Highlight Grand Total row
        if (data.row.index === installmentData.length - 1) {
          data.cell.styles.fillColor = [240, 249, 255];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [37, 99, 235];
        }
        // Highlight NPV row if exists
        if (showNPVinPDF && data.row.index === installmentData.length - 2 && installmentData[data.row.index][5] === 'TOTAL') {
          data.cell.styles.fillColor = [240, 253, 244];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [22, 163, 74];
        }
      }
    });

    // Modern Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Footer line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, 285, 195, 285);

      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Generated: ${dateStr}`,
        15,
        290
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        195,
        290,
        { align: 'right' }
      );
      doc.setFontSize(6);
      doc.text('Premium Real Estate Calculator', 105, 293, { align: 'center' });
    }

    // Save PDF with better filename
    const properyDesc = `${area}sqft_${Math.round(b.summary.grandTotal/100000)}L`;
    const filename = `Property_Analysis_${properyDesc}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF. Please check browser console for details.');
  }
}

// Make functions global for onclick handlers
window.removeInstallment = removeInstallment;
window.updateInstallment = updateInstallment;
window.removeDiscount = removeDiscount;
window.updateDiscount = updateDiscount;
