/**
 * URL Parameter Handler for Shareable Links
 * Encodes and decodes calculator state in URL parameters
 */

/**
 * Generates a shareable URL with current calculator state
 * @param {number} propertyPrice - The property price
 * @param {Array<string>} selectedPlans - Array of selected plan keys
 * @returns {string} - Complete shareable URL
 */
function generateShareableURL(propertyPrice, selectedPlans) {
  const baseURL = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();

  params.set('price', propertyPrice);
  params.set('plans', selectedPlans.join(','));

  return `${baseURL}?${params.toString()}`;
}

/**
 * Parses URL parameters and returns calculator state
 * @returns {Object|null} - {price: number, plans: Array<string>} or null if no params
 */
function parseURLParameters() {
  const params = new URLSearchParams(window.location.search);

  const priceParam = params.get('price');
  const plansParam = params.get('plans');

  if (!priceParam || !plansParam) {
    return null;
  }

  // Parse and validate price
  const price = parseFloat(priceParam);
  if (isNaN(price) || price <= 0) {
    console.warn('Invalid price in URL parameters');
    return null;
  }

  // Parse and validate plans
  const plans = plansParam.split(',').map(p => p.trim()).filter(p => p);
  if (plans.length === 0) {
    console.warn('No plans specified in URL parameters');
    return null;
  }

  return {
    price,
    plans
  };
}

/**
 * Updates URL without page reload (for better UX)
 * @param {number} propertyPrice - The property price
 * @param {Array<string>} selectedPlans - Array of selected plan keys
 */
function updateURLState(propertyPrice, selectedPlans) {
  const url = generateShareableURL(propertyPrice, selectedPlans);

  // Use history.pushState to update URL without reloading
  if (window.history && window.history.pushState) {
    window.history.pushState({ price: propertyPrice, plans: selectedPlans }, '', url);
  }
}

/**
 * Validates URL parameters against available plans
 * @param {Array<string>} planKeys - Plan keys from URL
 * @param {Object} availablePlans - Available payment plans object
 * @returns {Array<string>} - Valid plan keys only
 */
function validateURLPlans(planKeys, availablePlans) {
  return planKeys.filter(key => availablePlans.hasOwnProperty(key));
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateShareableURL,
    parseURLParameters,
    updateURLState,
    validateURLPlans,
    copyToClipboard
  };
}
