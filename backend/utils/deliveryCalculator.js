const DeliveryPricing = require("../models/DeliveryPricing");
const WebsiteConfig = require("../models/WebsiteConfig");

/**
 * Recalculates delivery charge server-side for security.
 * @param {string} pincode - Destination pincode
 * @param {number} weight - Total weight of items in kg
 * @param {number} itemsPrice - Total price of items after role-based verification
 * @returns {Object} { totalCharge, zone, vehicleType, vehicleCount, multiVehicle }
 */
const calculateServerSideDelivery = async (pincode, weight, itemsPrice) => {
    const pincodeNum = Number(pincode) || 0;
    const itemsTotalNum = Number(itemsPrice) || 0;
    const km = 50; // Default estimated KM for calculation (could be refined)

    // Find matching zone by pincode range
    const allRules = await DeliveryPricing.find({ isActive: true });
    if (!allRules || allRules.length === 0) {
        throw new Error("No active delivery pricing configured.");
    }

    let matchedRules = allRules.filter((r) =>
        r.pincodeRanges && Array.isArray(r.pincodeRanges) && 
        r.pincodeRanges.some((range) => pincodeNum >= (range.from || 0) && pincodeNum <= (range.to || 0))
    );

    // Fallback: use all rules if no specific pincode match
    if (matchedRules.length === 0) {
        matchedRules = allRules;
    }

    // Sort vehicle types by capacity AND then by price (most affordable first)
    const vehicleOrder = ["bike", "mini_truck", "truck", "heavy_trailer"];
    matchedRules.sort((a, b) => {
        const typeOrder = vehicleOrder.indexOf(a.vehicleType) - vehicleOrder.indexOf(b.vehicleType);
        if (typeOrder !== 0) return typeOrder;
        return (a.basePrice || 0) - (b.basePrice || 0);
    });


    // Find the single vehicle type that can carry weight
    let selectedRule = matchedRules.find((r) => (r.maxWeightKg || 0) >= weight);
    let vehicleCount = 1;
    let multiVehicle = false;

    // If no single vehicle can carry it, use the largest and multiply
    if (!selectedRule && matchedRules.length > 0) {
        selectedRule = matchedRules[matchedRules.length - 1]; // largest vehicle
        const maxCap = selectedRule.maxWeightKg || 1; 
        vehicleCount = Math.ceil(weight / maxCap);
        multiVehicle = true;
    }

    if (!selectedRule) {
        throw new Error("Delivery unserviceable for this area.");
    }

    // --- CALCULATION ---
    const baseCharge = Number(selectedRule.basePrice) || 0;
    const pricePerKg = Number(selectedRule.pricePerKg) || 0;
    const pricePerKm = Number(selectedRule.pricePerKm) || 0;
    const minimumCharge = Number(selectedRule.minimumCharge) || 0;
    const freeAbove = Number(selectedRule.freeAboveOrderValue) || 0;

    const perVehicleCost = baseCharge + (pricePerKg * weight) + (pricePerKm * km);

    // Check for free delivery
    const config = await WebsiteConfig.findOne();
    const isSiteWideFree = config?.settings?.isDeliveryFree === true;
    const isZoneFree = freeAbove > 0 && itemsTotalNum >= freeAbove;

    const totalCharge = (isSiteWideFree || isZoneFree) 
        ? 0 
        : Math.max(perVehicleCost * vehicleCount, minimumCharge);

    return {
        totalCharge: parseFloat(totalCharge.toFixed(2)),
        zone: selectedRule.zoneName,
        vehicleType: selectedRule.vehicleType,
        vehicleCount,
        multiVehicle
    };
};

module.exports = { calculateServerSideDelivery };
