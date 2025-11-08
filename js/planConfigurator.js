/**
 * Plan Configurator
 * Allows users to customize payment plan stages and percentages
 */

// Store custom configurations
const customPlanConfigurations = {};

/**
 * Configuration templates for each plan type
 */
const planConfigTemplates = {
  'CLP': {
    allowAddStages: true,
    allowRemoveStages: true,
    minStages: 3,
    maxStages: 20,
    defaultStages: [
      { stage: 'Booking', percent: 10, editable: true },
      { stage: 'Within 30 days', percent: 10, editable: true },
      { stage: 'Foundation complete', percent: 5, editable: true },
      { stage: 'Structure complete', percent: 25, editable: true },
      { stage: 'Finishing work', percent: 30, editable: true },
      { stage: 'Possession', percent: 20, editable: true }
    ]
  },
  '20:80': {
    allowAddStages: false,
    allowRemoveStages: false,
    minStages: 2,
    maxStages: 2,
    defaultStages: [
      { stage: 'Booking', percent: 20, editable: true },
      { stage: 'On Possession', percent: 80, editable: true }
    ]
  },
  '10:90': {
    allowAddStages: false,
    allowRemoveStages: false,
    minStages: 2,
    maxStages: 2,
    defaultStages: [
      { stage: 'Booking', percent: 10, editable: true },
      { stage: 'On Possession', percent: 90, editable: true }
    ]
  },
  'DownPayment': {
    allowAddStages: true,
    allowRemoveStages: true,
    minStages: 2,
    maxStages: 5,
    defaultStages: [
      { stage: 'Booking', percent: 10, editable: true },
      { stage: 'Within 30 days', percent: 80, editable: true },
      { stage: 'On Possession', percent: 10, editable: true }
    ]
  },
  'Flexi-30:70': {
    allowAddStages: true,
    allowRemoveStages: true,
    minStages: 2,
    maxStages: 10,
    defaultStages: [
      { stage: 'Booking', percent: 10, editable: true },
      { stage: 'Within 60 days', percent: 20, editable: true },
      { stage: 'On Possession', percent: 70, editable: true }
    ]
  },
  'Flexi-50:50': {
    allowAddStages: true,
    allowRemoveStages: true,
    minStages: 2,
    maxStages: 10,
    defaultStages: [
      { stage: 'Booking', percent: 10, editable: true },
      { stage: 'Within 3 months', percent: 40, editable: true },
      { stage: 'On Possession', percent: 50, editable: true }
    ]
  },
  'TimeLinked': {
    allowAddStages: true,
    allowRemoveStages: true,
    minStages: 2,
    maxStages: 12,
    defaultStages: [
      { stage: 'Month 0 (Booking)', percent: 20, editable: true },
      { stage: 'Month 6', percent: 20, editable: true },
      { stage: 'Month 12', percent: 20, editable: true },
      { stage: 'Month 18', percent: 20, editable: true },
      { stage: 'Month 24', percent: 20, editable: true }
    ]
  }
};

/**
 * Opens configuration modal for a plan
 * @param {string} planKey - The plan key to configure
 */
function openPlanConfigurator(planKey) {
  const template = planConfigTemplates[planKey];
  const plan = paymentPlans[planKey];

  if (!template || !plan) {
    console.error('Invalid plan key:', planKey);
    return;
  }

  // Get existing configuration or use default
  const currentConfig = customPlanConfigurations[planKey] || {
    planKey: planKey,
    planName: plan.name,
    stages: JSON.parse(JSON.stringify(template.defaultStages))
  };

  // Build and show modal
  showConfigurationModal(currentConfig, template);
}

/**
 * Shows the configuration modal
 * @param {Object} config - Current configuration
 * @param {Object} template - Plan template
 */
function showConfigurationModal(config, template) {
  const modal = document.getElementById('configModal');
  const modalTitle = document.getElementById('configModalTitle');
  const stagesContainer = document.getElementById('configStages');
  const totalDisplay = document.getElementById('configTotal');

  modalTitle.textContent = `Configure ${config.planName}`;

  // Render stages
  renderConfigStages(config, template, stagesContainer, totalDisplay);

  // Show modal
  modal.classList.remove('hidden');

  // Store current config in modal for later save
  modal.dataset.planKey = config.planKey;
}

/**
 * Renders configuration stages
 * @param {Object} config - Current configuration
 * @param {Object} template - Plan template
 * @param {HTMLElement} container - Container element
 * @param {HTMLElement} totalDisplay - Total percentage display
 */
function renderConfigStages(config, template, container, totalDisplay) {
  container.innerHTML = '';

  config.stages.forEach((stage, index) => {
    const stageRow = document.createElement('div');
    stageRow.className = 'config-stage-row';
    stageRow.dataset.index = index;

    stageRow.innerHTML = `
      <div class="config-stage-number">${index + 1}</div>
      <input
        type="text"
        class="config-stage-name"
        value="${stage.stage}"
        placeholder="Stage name"
        ${!stage.editable ? 'readonly' : ''}
      >
      <input
        type="number"
        class="config-stage-percent"
        value="${stage.percent}"
        min="0"
        max="100"
        step="0.1"
        placeholder="%"
        ${!stage.editable ? 'readonly' : ''}
      >
      <span class="config-percent-symbol">%</span>
      ${template.allowRemoveStages && config.stages.length > template.minStages ?
        '<button class="config-remove-btn" title="Remove stage">×</button>' :
        '<div class="config-remove-placeholder"></div>'}
    `;

    container.appendChild(stageRow);

    // Add event listeners
    const nameInput = stageRow.querySelector('.config-stage-name');
    const percentInput = stageRow.querySelector('.config-stage-percent');
    const removeBtn = stageRow.querySelector('.config-remove-btn');

    nameInput.addEventListener('input', () => {
      config.stages[index].stage = nameInput.value;
      updateConfigTotal(config, totalDisplay);
    });

    percentInput.addEventListener('input', () => {
      config.stages[index].percent = parseFloat(percentInput.value) || 0;
      updateConfigTotal(config, totalDisplay);
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        config.stages.splice(index, 1);
        renderConfigStages(config, template, container, totalDisplay);
      });
    }
  });

  // Add "Add Stage" button if allowed
  if (template.allowAddStages && config.stages.length < template.maxStages) {
    const addButton = document.createElement('button');
    addButton.className = 'config-add-stage-btn';
    addButton.innerHTML = '+ Add Stage';
    addButton.addEventListener('click', () => {
      config.stages.push({
        stage: `Stage ${config.stages.length + 1}`,
        percent: 0,
        editable: true
      });
      renderConfigStages(config, template, container, totalDisplay);
    });
    container.appendChild(addButton);
  }

  updateConfigTotal(config, totalDisplay);
}

/**
 * Updates total percentage display
 * @param {Object} config - Current configuration
 * @param {HTMLElement} totalDisplay - Total display element
 */
function updateConfigTotal(config, totalDisplay) {
  const total = config.stages.reduce((sum, stage) => sum + (parseFloat(stage.percent) || 0), 0);

  totalDisplay.textContent = `Total: ${total.toFixed(1)}%`;

  // Color code based on validity
  if (Math.abs(total - 100) < 0.1) {
    totalDisplay.className = 'config-total valid';
  } else {
    totalDisplay.className = 'config-total invalid';
  }

  // Enable/disable save button
  const saveBtn = document.getElementById('saveConfigBtn');
  if (saveBtn) {
    saveBtn.disabled = Math.abs(total - 100) >= 0.1;
  }

  return total;
}

/**
 * Saves the configuration
 */
function saveConfiguration() {
  const modal = document.getElementById('configModal');
  const planKey = modal.dataset.planKey;
  const config = customPlanConfigurations[planKey] || {};

  // Validate
  const total = config.stages.reduce((sum, stage) => sum + (parseFloat(stage.percent) || 0), 0);

  if (Math.abs(total - 100) >= 0.1) {
    alert('Total percentage must equal 100%');
    return;
  }

  // Validate stage names
  const emptyNames = config.stages.filter(s => !s.stage.trim());
  if (emptyNames.length > 0) {
    alert('All stages must have a name');
    return;
  }

  // Save configuration
  customPlanConfigurations[planKey] = config;

  // Update checkbox label to show "Configured"
  const checkbox = document.getElementById(`plan-${planKey.replace(':', '-')}`);
  if (checkbox) {
    const label = checkbox.nextElementSibling;
    const strong = label.querySelector('strong');
    if (strong && !strong.textContent.includes('✓')) {
      strong.textContent = strong.textContent + ' ✓';
      strong.style.color = '#10b981';
    }
  }

  closeConfigurationModal();
}

/**
 * Closes the configuration modal
 */
function closeConfigurationModal() {
  const modal = document.getElementById('configModal');
  modal.classList.add('hidden');
}

/**
 * Gets the configured plan or default plan
 * @param {string} planKey - Plan key
 * @returns {Object} - Plan configuration
 */
function getConfiguredPlan(planKey) {
  if (customPlanConfigurations[planKey]) {
    const custom = customPlanConfigurations[planKey];
    return {
      name: custom.planName + ' (Custom)',
      description: 'Custom configured plan',
      stages: custom.stages.map(s => ({
        stage: s.stage,
        percent: parseFloat(s.percent)
      }))
    };
  }

  return paymentPlans[planKey];
}

/**
 * Resets configuration for a plan
 * @param {string} planKey - Plan key
 */
function resetPlanConfiguration(planKey) {
  delete customPlanConfigurations[planKey];

  // Update checkbox label
  const checkbox = document.getElementById(`plan-${planKey.replace(':', '-')}`);
  if (checkbox) {
    const label = checkbox.nextElementSibling;
    const strong = label.querySelector('strong');
    if (strong) {
      strong.textContent = strong.textContent.replace(' ✓', '');
      strong.style.color = '';
    }
  }
}

/**
 * Encodes custom configurations for URL sharing
 * @returns {string} - Encoded configuration string
 */
function encodeCustomConfigurations() {
  if (Object.keys(customPlanConfigurations).length === 0) {
    return '';
  }

  try {
    const simplified = {};
    Object.keys(customPlanConfigurations).forEach(key => {
      const config = customPlanConfigurations[key];
      simplified[key] = config.stages.map(s => ({
        s: s.stage,
        p: s.percent
      }));
    });

    return btoa(JSON.stringify(simplified));
  } catch (error) {
    console.error('Failed to encode configurations:', error);
    return '';
  }
}

/**
 * Decodes custom configurations from URL
 * @param {string} encoded - Encoded configuration string
 */
function decodeCustomConfigurations(encoded) {
  if (!encoded) return;

  try {
    const simplified = JSON.parse(atob(encoded));

    Object.keys(simplified).forEach(key => {
      customPlanConfigurations[key] = {
        planKey: key,
        planName: paymentPlans[key]?.name || key,
        stages: simplified[key].map(s => ({
          stage: s.s,
          percent: s.p,
          editable: true
        }))
      };
    });
  } catch (error) {
    console.error('Failed to decode configurations:', error);
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    openPlanConfigurator,
    saveConfiguration,
    closeConfigurationModal,
    getConfiguredPlan,
    resetPlanConfiguration,
    encodeCustomConfigurations,
    decodeCustomConfigurations,
    customPlanConfigurations
  };
}
