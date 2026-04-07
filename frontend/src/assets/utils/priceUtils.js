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
 * @returns {object} { mrp, sellingPrice, discountPct, hasDiscount }
 */
export const getProductPricing = (product, variant = null) => {
  const basePrice = (variant ? variant.price : product.price) || 0;
  const tiers = variant ? variant.pricingTiers : product.pricingTiers;
  const discountedPrice = tiers?.normal || 0;

  const hasDiscount = discountedPrice > 0 && discountedPrice < basePrice;
  const sellingPrice = hasDiscount ? discountedPrice : basePrice;
  const mrp = basePrice;
  const discountPct = calculateDiscount(mrp, sellingPrice);

  return { mrp, sellingPrice, discountPct, hasDiscount };
};
