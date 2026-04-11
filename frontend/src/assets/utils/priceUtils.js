/**
 * Calculate the discount percentage based on MRP and Discounted Price.
 * @param {number} mrp - The original price.
 * @param {number} discountedPrice - The selling price.
 * @returns {number} The discount percentage, rounded to the nearest integer.
 */
export const calculateDiscount = (mrp, discountedPrice) => {
  if (!mrp || !discountedPrice || discountedPrice >= mrp) return 0;
  return Math.round(((mrp - discountedPrice) / mrp) * 100);
};

/**
 * Format a number as currency in INR format.
 * @param {number} amount - The amount to format.
 * @returns {string} Formatted currency string.
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get the effective pricing for a product.
 * @param {object} product - The product object.
 * @param {object} variant - Optional selected variant.
 * @param {string} userRole - User's role (architect, architectPartner, user).
 * @returns {object} { mrp, sellingPrice, discountPct, hasDiscount }
 */
export const getProductPricing = (product, variant = null, userRole = "user") => {
  const basePrice = (variant ? variant.price : product.price) || 0;
  const tiers = (variant ? variant.pricingTiers : product.pricingTiers) || {};
  
  // SECURE SYNC: Must match backend role-based logic
  let unitPrice = basePrice;
  if (userRole === "architect" || userRole === "architectPartner") {
      unitPrice = tiers.architect || basePrice;
  } else if (tiers.normal) {
      unitPrice = tiers.normal;
  }

  const sellingPrice = unitPrice;
  const mrp = basePrice;
  const discountPct = calculateDiscount(mrp, sellingPrice);
  const hasDiscount = sellingPrice < mrp;

  return { mrp, sellingPrice, discountPct, hasDiscount };
};

