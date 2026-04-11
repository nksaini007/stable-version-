const DeliveryPricing = require("../models/DeliveryPricing");
const WebsiteConfig = require("../models/WebsiteConfig");

// ==================== NORTH INDIA ZONE DEFAULTS ====================
// Used when seeding or resetting zones
const NORTH_INDIA_ZONES = [
    {
        zoneName: "Delhi NCR",
        states: ["Delhi", "NCR"],
        pincodeRanges: [{ from: 110001, to: 110099 }, { from: 120000, to: 122099 }, { from: 201000, to: 203999 }],
        vehicles: [
            { vehicleType: "bike", vehicleLabel: "Bike/Scooter", maxWeightKg: 15, basePrice: 40, pricePerKm: 3, pricePerKg: 1, maxDistanceKm: 30 },
            { vehicleType: "mini_truck", vehicleLabel: "Mini Truck (1T)", maxWeightKg: 1000, basePrice: 300, pricePerKm: 10, pricePerKg: 0.5, maxDistanceKm: 100 },
            { vehicleType: "truck", vehicleLabel: "Truck (5T)", maxWeightKg: 5000, basePrice: 1200, pricePerKm: 18, pricePerKg: 0.2, maxDistanceKm: 300 },
            { vehicleType: "heavy_trailer", vehicleLabel: "Heavy Trailer (25T)", maxWeightKg: 25000, basePrice: 4000, pricePerKm: 28, pricePerKg: 0.1, maxDistanceKm: 800 },
        ],
    },
];

// ==================== ADMIN CONTROLLERS ====================

/**
 * GET /api/delivery-pricing/
 * Admin: View all pricing rules
 */
const getPricingRules = async (req, res) => {
    try {
        const rules = await DeliveryPricing.find().sort({ zoneName: 1, vehicleType: 1 });
        res.json(rules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/delivery-pricing/zones
 * Public: Get unique zone names and their states
 */
const getZones = async (req, res) => {
    try {
        const zones = await DeliveryPricing.aggregate([
            { $group: { _id: "$zoneName", states: { $first: "$states" } } },
            { $project: { zoneName: "$_id", states: 1, _id: 0 } },
        ]);
        res.json(zones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/delivery-pricing/
 * Admin: Create a new pricing rule
 */
const createPricingRule = async (req, res) => {
    try {
        const rule = new DeliveryPricing(req.body);
        await rule.save();
        res.status(201).json({ message: "Pricing rule created", rule });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * PUT /api/delivery-pricing/:id
 * Admin: Update a pricing rule
 */
const updatePricingRule = async (req, res) => {
    try {
        const rule = await DeliveryPricing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!rule) return res.status(404).json({ message: "Rule not found" });
        res.json({ message: "Pricing rule updated", rule });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * DELETE /api/delivery-pricing/:id
 * Admin: Delete a pricing rule
 */
const deletePricingRule = async (req, res) => {
    try {
        const rule = await DeliveryPricing.findByIdAndDelete(req.params.id);
        if (!rule) return res.status(404).json({ message: "Rule not found" });
        res.json({ message: "Pricing rule deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/delivery-pricing/seed-defaults
 * Admin: Seed default North India zones
 */
const seedDefaultZones = async (req, res) => {
    try {
        await DeliveryPricing.deleteMany({});
        const allRules = [];

        for (const zone of NORTH_INDIA_ZONES) {
            for (const v of zone.vehicles) {
                allRules.push({
                    zoneName: zone.zoneName,
                    states: zone.states,
                    pincodeRanges: zone.pincodeRanges,
                    vehicleType: v.vehicleType,
                    vehicleLabel: v.vehicleLabel,
                    maxWeightKg: v.maxWeightKg,
                    basePrice: v.basePrice,
                    pricePerKm: v.pricePerKm,
                    pricePerKg: v.pricePerKg,
                    minDistanceKm: 0,
                    maxDistanceKm: v.maxDistanceKm,
                    isActive: true,
                    minimumCharge: v.basePrice,
                });
            }
        }

        // Also add generic rules for other North India states
        const otherZones = [
            { name: "UP West & Uttarakhand", states: ["Uttar Pradesh", "Uttarakhand"], pin: [{ from: 244000, to: 249999 }] },
            { name: "UP East & Bihar", states: ["Uttar Pradesh East", "Bihar"], pin: [{ from: 221000, to: 243999 }, { from: 800000, to: 855999 }] },
            { name: "Punjab & Haryana", states: ["Punjab", "Haryana"], pin: [{ from: 130001, to: 160099 }] },
            { name: "Rajasthan", states: ["Rajasthan"], pin: [{ from: 302000, to: 344999 }] },
            { name: "Himachal Pradesh", states: ["Himachal Pradesh"], pin: [{ from: 171001, to: 177999 }] },
            { name: "Jammu & Kashmir", states: ["Jammu and Kashmir", "Ladakh"], pin: [{ from: 180001, to: 194999 }] },
        ];

        const vehicleTemplates = [
            { vehicleType: "bike", vehicleLabel: "Bike/Scooter", maxWeightKg: 15, basePrice: 60, pricePerKm: 4, pricePerKg: 1.5, maxDistanceKm: 50 },
            { vehicleType: "mini_truck", vehicleLabel: "Mini Truck (1T)", maxWeightKg: 1000, basePrice: 400, pricePerKm: 12, pricePerKg: 0.6, maxDistanceKm: 200 },
            { vehicleType: "truck", vehicleLabel: "Truck (5T)", maxWeightKg: 5000, basePrice: 1500, pricePerKm: 20, pricePerKg: 0.25, maxDistanceKm: 600 },
            { vehicleType: "heavy_trailer", vehicleLabel: "Heavy Trailer (25T)", maxWeightKg: 25000, basePrice: 5000, pricePerKm: 30, pricePerKg: 0.12, maxDistanceKm: 1200 },
        ];

        for (const z of otherZones) {
            for (const v of vehicleTemplates) {
                allRules.push({
                    zoneName: z.name,
                    states: z.states,
                    pincodeRanges: z.pin,
                    vehicleType: v.vehicleType,
                    vehicleLabel: v.vehicleLabel,
                    maxWeightKg: v.maxWeightKg,
                    basePrice: v.basePrice,
                    pricePerKm: v.pricePerKm,
                    pricePerKg: v.pricePerKg,
                    minDistanceKm: 0,
                    maxDistanceKm: v.maxDistanceKm,
                    isActive: true,
                    minimumCharge: v.basePrice,
                });
            }
        }

        await DeliveryPricing.insertMany(allRules);
        res.json({ message: `Seeded ${allRules.length} pricing rules for North India`, count: allRules.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================== DELIVERY CHARGE CALCULATOR ====================

/**
 * POST /api/delivery-pricing/calculate
 * Calculate delivery charge based on pincode, weight, volume
 * Handles multi-vehicle scenarios for large orders
 */
const calculateDeliveryCharge = async (req, res) => {
    try {
        const { pincode, weightKg = 0, volumeM3 = 0, estimatedKm = 50, itemsPrice = 0 } = req.body;
        console.log("Delivery Calc Request Content:", { pincode, weightKg, estimatedKm, itemsPrice });

        if (!pincode) return res.status(400).json({ message: "Pincode is required" });

        const pincodeNum = Number(pincode) || 0;
        const weight = Number(weightKg) || 0;
        const km = Number(estimatedKm) || 0;
        const itemsTotalNum = Number(itemsPrice) || 0;

        // Find matching zone by pincode range
        const allRules = await DeliveryPricing.find({ isActive: true });
        if (!allRules || allRules.length === 0) {
            console.warn("No active delivery rules found in database.");
            return res.status(404).json({ message: "No delivery pricing configured. Admin needs to seed defaults." });
        }

        console.log(`Searching through ${allRules.length} active delivery rules...`);

        let matchedRules = allRules.filter((r) =>
            r.pincodeRanges && Array.isArray(r.pincodeRanges) && 
            r.pincodeRanges.some((range) => pincodeNum >= (range.from || 0) && pincodeNum <= (range.to || 0))
        );

        // Fallback: use all rules if no specific pincode match (for general North India)
        if (matchedRules.length === 0) {
            console.log("No specific pincode match, falling back to all rules...");
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
            const maxCap = selectedRule.maxWeightKg || 1; // avoid divide by zero
            vehicleCount = Math.ceil(weight / maxCap);
            multiVehicle = true;
            console.log(`Multi-vehicle required: ${vehicleCount}x ${selectedRule.vehicleType}`);
        }

        if (!selectedRule) {
            console.warn("No rule found even after fallback for pincode:", pincodeNum);
            return res.status(404).json({
                message: "No delivery pricing configured for this area. Please contact support.",
            });
        }

        console.log("Selected Rule:", selectedRule.zoneName, selectedRule.vehicleType);

        // --- CALCULATION ---
        const baseCharge = Number(selectedRule.basePrice) || 0;
        const pricePerKg = Number(selectedRule.pricePerKg) || 0;
        const pricePerKm = Number(selectedRule.pricePerKm) || 0;
        const minimumCharge = Number(selectedRule.minimumCharge) || 0;
        const freeAbove = Number(selectedRule.freeAboveOrderValue) || 0;

        const perVehicleCost = baseCharge + (pricePerKg * weight) + (pricePerKm * km);

        // Check for free delivery (Site-wide or Zone-specific)
        const config = await WebsiteConfig.findOne();
        const isSiteWideFree = config?.settings?.isDeliveryFree === true;
        
        const isZoneFree = freeAbove > 0 && itemsTotalNum >= freeAbove;

        const totalCharge = (isSiteWideFree || isZoneFree) 
            ? 0 
            : Math.max(perVehicleCost * vehicleCount, minimumCharge);

        console.log("Calculation Result:", { perVehicleCost, vehicleCount, totalCharge, isZoneFree });

        res.json({
            zone: selectedRule.zoneName,
            vehicleType: selectedRule.vehicleType,
            vehicleLabel: selectedRule.vehicleLabel || selectedRule.vehicleType,
            vehicleCount,
            multiVehicle,
            breakdown: {
                baseCharge: parseFloat((baseCharge * vehicleCount).toFixed(2)),
                weightCharge: parseFloat((pricePerKg * weight * vehicleCount).toFixed(2)),
                distanceCharge: parseFloat((pricePerKm * km * vehicleCount).toFixed(2)),
                perVehicleCost: parseFloat(perVehicleCost.toFixed(2)),
                vehicleCount,
                totalEstimatedKm: km,
            },
            totalCharge: parseFloat(totalCharge.toFixed(2)),
            note: multiVehicle
                ? `Order weight (${weight}kg) requires ${vehicleCount} ${selectedRule.vehicleLabel || selectedRule.vehicleType}(s)`
                : isZoneFree 
                    ? `Free delivery applied (Order > ₹${freeAbove})`
                    : null,
        });
    } catch (err) {
        console.error("CRITICAL ERROR in calculateDeliveryCharge:", err);
        res.status(500).json({ 
            error: "Failed to calculate delivery. Internal Server Error.",
            details: err.message,
            stack: process.env.NODE_ENV === "production" ? undefined : err.stack
        });
    }
};

module.exports = {
    getPricingRules,
    getZones,
    createPricingRule,
    updatePricingRule,
    deletePricingRule,
    seedDefaultZones,
    calculateDeliveryCharge,
};
