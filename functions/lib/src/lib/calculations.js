"use strict";
// src/lib/calculations.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPriceSensitivity = exports.applyOverallMarketFactors = exports.validateProductData = exports.VALID_VERTICALS = exports.computeTakeRates = void 0;
const constants_1 = require("./constants"); // Import PRODUCT_PRICE_RANGES
/**
 * Computes utilities for a single product/respondent pair.
 */
function calculateUtility(product, resp, options // Ensure SimulationOptions is imported or defined
) {
    const p = resp.individualParams;
    let u = p.base[product.product] ?? 0;
    // Price effect with safety check
    const safePrice = Math.max(0.01, product.monthlyRate);
    const logP = Math.log(safePrice);
    // Apply tiered price sensitivity if enabled
    let priceLinear = p.price.linear;
    if (options.enablePriceTiers) {
        const threshold = options.priceThreshold ?? 12;
        if (product.monthlyRate < threshold) {
            priceLinear *= options.lowPriceMultiplier ?? 1.3;
        }
        else {
            priceLinear *= options.highPriceMultiplier ?? 0.8;
        }
    }
    u += priceLinear * logP;
    u += p.price.squared * logP * logP;
    // Vertical count effect
    const vc = Math.min(product.verticals?.length ?? 0, 3); // Added optional chaining and nullish coalescing
    u += p.verticalCount[vc.toString()] ?? 0; // Convert to string key
    // Individual vertical utilities
    if (product.verticals) { // Added check for product.verticals
        for (const v of product.verticals) {
            u += p.verticals[v] ?? 0;
        }
    }
    // Individual feature utilities
    const features = p.features || {}; // Simplified: removed p.all_features as it was causing an error
    // Handle reader features
    const readerFeatures = features.reader || features.readerFeatures || {};
    Object.entries(readerFeatures).forEach(([f, val]) => {
        if (product.readerFeatures?.includes(f))
            u += val; // Added type assertion
    });
    // Handle streaming features
    const streamingFeatures = features.streaming || features.streamingFeatures || {};
    Object.entries(streamingFeatures).forEach(([f, val]) => {
        if (product.streamingFeatures?.includes(f))
            u += val; // Added type assertion
    });
    // Feature count effects (MISSING CRITICAL COMPONENT)
    const readerFeatureCount = product.readerFeatures?.length || 0;
    if (readerFeatureCount > 0 && p.featureCounts?.reader) {
        u += p.featureCounts.reader[readerFeatureCount.toString()] || 0;
    }
    const streamingFeatureCount = product.streamingFeatures?.length || 0;
    if (streamingFeatureCount > 0 && p.featureCounts?.streaming) {
        u += p.featureCounts.streaming[streamingFeatureCount.toString()] || 0;
    }
    // Subscription terms utility (MISSING CRITICAL COMPONENT)
    if (product.pricingType === 'both' && product.discount === '50off' && p.subscription) {
        u += p.subscription['Both - 50% discount'] || 1.335;
    }
    else if (product.pricingType === 'both' && product.discount === '30off' && p.subscription) {
        u += p.subscription['Both - 30% discount'] || 1.156;
    }
    else if (product.pricingType === 'both' && product.discount === 'free_months' && p.subscription) {
        u += p.subscription['Both - 3 months free if Annual'] || 1.098;
    }
    else if (product.pricingType === 'annual' && p.subscription) {
        u += p.subscription['Annual only'] || 0.547;
    }
    else if (product.pricingType === 'monthly' && p.subscription) {
        u += p.subscription['Monthly only'] || 0;
    }
    return u;
}
/**
 * Calculate market adjustment factor
 */
function calculateMarketAdjustment(factors) {
    const adj = (factors.baseConversion || 0.5) * // Ensure baseConversion has a default if undefined
        (factors.awareness / 100) *
        (factors.distribution / 100) *
        (factors.competitive / 100) *
        (factors.marketing / 100) *
        ((factors.yearOneAdoption || 100) / 100);
    return adj;
}
/**
 * Get segment key for a respondent
 */
function getSegmentKey(resp) {
    const gender = resp.gender || 'Unknown';
    const age = resp.ageGroup || 'Unknown';
    return `${gender}|${age}`;
}
/**
 * Given respondents with params, product configs, and options,
 * returns independent take rates, subscriber counts & revenue.
 */
function computeTakeRates(respondents, products, options, marketFactors, TAM = 50000000) {
    if (!respondents.length || !products.length) {
        return {
            takeRates: [],
            // segmentResults will be undefined here, which is fine as it's optional
            diagnostics: {
                totalRespondents: 0,
                totalWeight: 0,
                averageDRN: 0,
                marketAdjustmentFactor: 0
            }
        };
    }
    // Default market factors if not provided
    const mktFactors = marketFactors ?? {
        baseConversion: 0.5,
        awareness: 70,
        distribution: 85,
        competitive: 90,
        marketing: 80,
        yearOneAdoption: 65,
        enablePriceSensitivity: false,
        lowPriceMultiplier: 1.3,
        highPriceMultiplier: 0.8,
        priceThreshold: 12,
        priceThresholdAdjustment: 0 // Added missing property
    };
    // Calculate market adjustment multiplier
    const marketAdjustment = calculateMarketAdjustment(mktFactors);
    // Include "None" option at index 0
    const all = [
        {
            id: 'None',
            product: 'None',
            monthlyRate: 0,
            readerFeatures: [],
            streamingFeatures: [],
            verticals: [],
            isActive: true,
            pricingType: 'monthly',
            discount: 'none'
        },
        ...products
    ];
    // Accumulate weighted takers per product and segment
    const weightedTakers = {};
    const segmentTakers = {};
    let totalWeight = 0;
    let drnSum = 0;
    for (const resp of respondents) {
        const weight = resp.weight || 1;
        totalWeight += weight;
        // Clamp DRN to valid range
        const drnClamped = Math.max(0.1, Math.min(0.99, resp.drn));
        drnSum += drnClamped * weight;
        // 1) Compute utilities
        const utils = all.map(prod => prod.product === 'None' ? 0 : calculateUtility(prod, resp, options));
        // 2) Softmax with numerical stability
        const M = Math.max(...utils);
        const exps = utils.map(u => Math.exp(u - M));
        const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
        const probs = exps.map(e => e / sumExp);
        // 3) Apply DRN
        const drnProbs = probs.map(p => p * drnClamped);
        // 4) Get segment key
        const segKey = getSegmentKey(resp);
        if (!segmentTakers[segKey]) {
            segmentTakers[segKey] = {};
        }
        // 5) Threshold & allocation
        if (options.allocationMethod === 'proportional') {
            drnProbs.forEach((p, i) => {
                if (i > 0 && p >= (options.takeThreshold ?? 0)) { // Added nullish coalescing for takeThreshold
                    const prodName = all[i].product;
                    weightedTakers[prodName] = (weightedTakers[prodName] || 0) + weight;
                    segmentTakers[segKey][prodName] = (segmentTakers[segKey][prodName] || 0) + weight;
                }
            });
        }
        else {
            // Winner-takes-all
            const maxIdx = drnProbs.indexOf(Math.max(...drnProbs));
            if (maxIdx > 0 && drnProbs[maxIdx] >= (options.takeThreshold ?? 0)) { // Added nullish coalescing for takeThreshold
                const prodName = all[maxIdx].product;
                weightedTakers[prodName] = (weightedTakers[prodName] || 0) + weight;
                segmentTakers[segKey][prodName] = (segmentTakers[segKey][prodName] || 0) + weight;
            }
        }
    }
    // Calculate average DRN
    const avgDRN = totalWeight > 0 ? drnSum / totalWeight : 0;
    // Build take rates for each product
    const takeRates = products.map(prod => {
        const w = weightedTakers[prod.product] || 0;
        const rawTakeRate = (w / totalWeight) * 100;
        const adjustedTakeRate = rawTakeRate * marketAdjustment;
        const subs = (adjustedTakeRate / 100) * TAM;
        const rev = subs * prod.monthlyRate * 12;
        return {
            productName: prod.product,
            takeRate: rawTakeRate,
            adjustedTakeRate: adjustedTakeRate,
            subscribers: Math.round(subs),
            revenue: Math.round(rev)
        };
    });
    // Build segment results
    const segmentResults = {};
    for (const [segKey, segProds] of Object.entries(segmentTakers)) {
        const segmentTakeRates = products.map(prod => {
            const w = segProds[prod.product] || 0;
            const rawTakeRate = (w / totalWeight) * 100;
            const adjustedTakeRate = rawTakeRate * marketAdjustment;
            const subs = (adjustedTakeRate / 100) * TAM;
            const rev = subs * prod.monthlyRate * 12;
            return {
                productName: prod.product,
                takeRate: rawTakeRate,
                adjustedTakeRate: adjustedTakeRate,
                subscribers: Math.round(subs),
                revenue: Math.round(rev)
            };
        });
        const totalSubs = segmentTakeRates.reduce((sum, tr) => sum + tr.subscribers, 0);
        const totalRev = segmentTakeRates.reduce((sum, tr) => sum + tr.revenue, 0);
        segmentResults[segKey] = {
            takeRates: segmentTakeRates,
            totalSubscribers: totalSubs,
            totalRevenue: totalRev
        };
    }
    return {
        takeRates,
        segmentResults,
        diagnostics: {
            totalRespondents: respondents.length,
            totalWeight: totalWeight,
            averageDRN: avgDRN,
            marketAdjustmentFactor: marketAdjustment
        }
    };
}
exports.computeTakeRates = computeTakeRates;
exports.VALID_VERTICALS = [
    'D1_1', 'D1_2', 'D1_3', 'D1_4',
    'D2_1', 'D2_2', 'D2_3', 'D2_4',
    'B1', 'B2'
];
function validateProductData(products) {
    const errors = [];
    products.forEach((product, index) => {
        if (!product.product || product.product.trim().length === 0) {
            errors.push(`Product ${index + 1}: Missing product name`);
        }
        if (!product.monthlyRate || product.monthlyRate <= 0) {
            errors.push(`${product.product || 'Unknown product'}: Invalid monthly rate`);
        }
        const hasReaderFeatures = product.readerFeatures && product.readerFeatures.length > 0;
        const hasStreamingFeatures = product.streamingFeatures && product.streamingFeatures.length > 0;
        if (!hasReaderFeatures && !hasStreamingFeatures) {
            errors.push(`${product.product || 'Unknown product'}: No features selected`);
        }
        if (product.verticals) {
            product.verticals.forEach(v => {
                if (!exports.VALID_VERTICALS.includes(v)) {
                    errors.push(`${product.product || 'Unknown product'}: Invalid vertical "${v}"`);
                }
            });
        }
    });
    return errors;
}
exports.validateProductData = validateProductData;
// Renamed existing applyMarketFactors to avoid collision
function applyOverallMarketFactors(baseRate, factors) {
    const safeFactors = {
        awareness: Math.max(0, Math.min(100, factors.awareness || 70)),
        distribution: Math.max(0, Math.min(100, factors.distribution || 85)),
        competitive: Math.max(0, Math.min(100, factors.competitive || 90)),
        marketing: Math.max(0, Math.min(100, factors.marketing || 80)),
        yearOneAdoption: Math.max(0, Math.min(100, factors.yearOneAdoption || 100)),
        priceThresholdAdjustment: factors.priceThresholdAdjustment || 0 // ensure this is present
    };
    let adjustedRate = baseRate * (factors.baseConversion || 0.5);
    adjustedRate *= (safeFactors.awareness / 100);
    adjustedRate *= (safeFactors.distribution / 100);
    adjustedRate *= (safeFactors.competitive / 100);
    adjustedRate *= (safeFactors.marketing / 100);
    adjustedRate *= (safeFactors.yearOneAdoption / 100);
    return adjustedRate;
}
exports.applyOverallMarketFactors = applyOverallMarketFactors;
// Updated price sensitivity implementation with product-specific thresholds
function applyPriceSensitivity(respondentProductProbabilities, activeProducts, marketFactors, simulationOptions // Ensure SimulationOptions is imported or defined
) {
    if (!marketFactors.enablePriceSensitivity && !simulationOptions?.enablePriceTiers) {
        return; // No price sensitivity adjustments
    }
    const lowPriceMultiplier = marketFactors.lowPriceMultiplier || simulationOptions?.lowPriceMultiplier || 1.3;
    const highPriceMultiplier = marketFactors.highPriceMultiplier || simulationOptions?.highPriceMultiplier || 0.8;
    // Get threshold adjustment from UI (e.g., -20% for low sensitivity, +20% for high sensitivity)
    const thresholdAdjustment = marketFactors.priceThresholdAdjustment || 0; // percentage adjustment
    console.log('Applying price sensitivity with product-specific thresholds:', {
        lowMultiplier: lowPriceMultiplier,
        highMultiplier: highPriceMultiplier,
        thresholdAdjustment: `${thresholdAdjustment}%`
    });
    // Apply multipliers to each respondent's probabilities
    for (const [_respondentId, probs] of respondentProductProbabilities) { // Prefixed respondentId with _
        for (const product of activeProducts) {
            const currentProb = probs.get(product.product) || 0;
            let adjustedProb = currentProb;
            // Get product-specific threshold
            const productRange = constants_1.PRODUCT_PRICE_RANGES[product.product];
            if (!productRange) {
                console.warn(`Product range not found for ${product.product} in PRODUCT_PRICE_RANGES. Skipping price sensitivity for this product.`);
                continue; // Skip if product not found
            }
            // Calculate adjusted threshold
            let threshold = productRange.midpoint;
            if (thresholdAdjustment !== 0) {
                // Apply percentage adjustment to threshold
                threshold = threshold * (1 + thresholdAdjustment / 100);
            }
            // Apply price sensitivity multiplier
            if (product.monthlyRate < threshold) {
                // Product is below threshold - apply boost
                adjustedProb = currentProb * lowPriceMultiplier;
                // console.log(`${product.product} at $${product.monthlyRate} < $${threshold.toFixed(2)}: applying ${lowPriceMultiplier}x boost`);
            }
            else {
                // Product is above threshold - apply reduction
                adjustedProb = currentProb * highPriceMultiplier;
                // console.log(`${product.product} at $${product.monthlyRate} >= $${threshold.toFixed(2)}: applying ${highPriceMultiplier}x reduction`);
            }
            // Cap probability at 0.99 to avoid overflow
            adjustedProb = Math.min(adjustedProb, 0.99);
            // Update the probability
            probs.set(product.product, adjustedProb);
        }
    }
}
exports.applyPriceSensitivity = applyPriceSensitivity;
//# sourceMappingURL=calculations.js.map