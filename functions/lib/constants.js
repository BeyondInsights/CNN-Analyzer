"use strict";
// functions/src/constants.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_PRODUCT_CONFIG = exports.DEMOGRAPHIC_SEGMENTS = exports.MAX_PRODUCTS = exports.PRODUCT_PRICE_RANGES = exports.PRICING_RANGES = exports.AVAILABLE_FEATURES = exports.PRODUCT_TYPES = void 0;
exports.PRODUCT_TYPES = [
    "CNN Reader",
    "CNN Streaming",
    "CNN All-Access",
    "CNN Standalone Vertical",
];
exports.AVAILABLE_FEATURES = {
    reader: [
        "Unlimited articles",
        "Short-form video",
        "Subscriber-only articles, newsletters, and podcasts",
        "CNN Reality Check",
        "Podcast Club",
        "News from local providers",
        "CNN You",
        "CNN Technology Insider",
        "Bonus Subscription",
        "News from global providers",
        "CNN Live Events and Expert Q&A",
        "Ask CNN",
        "Al Anchor",
        "CNN Business & Markets Insider",
        "CNN Archive"
    ],
    streaming: [
        "24/7 Live News Channel",
        "Catch Up Channel",
        "CNN Library On-Demand",
        "Curated video playlist channels",
        "Multiview",
        "Personalized Daily Video Briefings",
        "Real-time Fact Checking",
        "CNN You",
        "Live Q&A with CNN Experts",
        "Live Global Feeds",
        "Customized Local News",
        "Original Short-Form CNN Series",
        "Live Text Commentary from CNN Experts",
        "Interactive video companions",
        "Real-Time News Ticker",
        "Exclusive, Subscriber-Only Events"
    ],
    vertical: [
        'CNN Longevity',
        'CNN Meditation & Mindfulness',
        'CNN Fitness',
        'CNN Entertainment Tracker',
        'CNN Expert Buying Guide',
        'CNN Personal Finance',
        'CNN Travel',
        'CNN Home',
        'CNN Beauty',
        'CNN Weather & Natural Phenomena'
    ],
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.PRICING_RANGES = {
    'CNN Standalone Vertical': {
        prices: [1.99, 3.99, 5.99, 7.99],
        min: 1.99,
        max: 7.99,
        default: 3.99,
    },
    'CNN Reader': {
        0: { prices: [3.99, 6.99, 9.99, 14.99], min: 3.99, max: 14.99, default: 6.99 },
        1: { prices: [5.49, 8.49, 11.49, 16.99], min: 5.49, max: 16.99, default: 8.49 },
        2: { prices: [6.99, 10.99, 14.99, 19.49], min: 6.99, max: 19.49, default: 10.99 },
        3: { prices: [8.49, 12.99, 16.99, 21.99], min: 8.49, max: 21.99, default: 12.99 },
    },
    'CNN Streaming': {
        0: { prices: [4.99, 8.49, 11.99, 16.99], min: 4.99, max: 16.99, default: 8.49 },
        1: { prices: [6.49, 9.99, 13.99, 17.99], min: 6.49, max: 17.99, default: 9.99 },
        2: { prices: [7.99, 11.99, 15.99, 21.49], min: 7.99, max: 21.49, default: 11.99 },
        3: { prices: [9.49, 13.99, 17.99, 24.99], min: 9.49, max: 24.99, default: 13.99 },
    },
    'CNN All-Access': {
        0: { prices: [5.99, 11.99, 17.99, 24.99], min: 5.99, max: 24.99, default: 11.99 },
        1: { prices: [7.99, 12.99, 18.99, 25.99], min: 7.99, max: 25.99, default: 12.99 },
        2: { prices: [9.99, 14.99, 21.49, 30.49], min: 9.99, max: 30.49, default: 14.99 },
        3: { prices: [11.99, 16.99, 23.99, 34.99], min: 11.99, max: 34.99, default: 16.99 },
    }
};
// Define price ranges and calculate midpoints for each product
exports.PRODUCT_PRICE_RANGES = {
    'CNN Standalone Vertical': {
        min: 1.99,
        max: 7.99,
        midpoint: 4.99,
        default: 3.99
    },
    'CNN Reader': {
        min: 3.99,
        max: 21.99,
        midpoint: 12.99,
        default: 6.99
    },
    'CNN Streaming': {
        min: 4.99,
        max: 24.99,
        midpoint: 14.99,
        default: 8.49
    },
    'CNN All-Access': {
        min: 5.99,
        max: 29.99,
        midpoint: 17.99,
        default: 14.99
    }
};
exports.MAX_PRODUCTS = 8;
exports.DEMOGRAPHIC_SEGMENTS = [
    // Individual demographics
    { group: 'Male' },
    { group: 'Female' },
    { group: '18-34' },
    { group: '35-54' },
    { group: '55-74' },
    // Linear TV
    { group: 'Have Linear TV' },
    { group: 'No Linear TV' },
    // Digital News Subscription
    { group: 'Digital News Subscriber' },
    { group: 'Not Digital News Subscriber' },
    // CNN TV Viewing
    { group: 'Watched Linear TV Network P30D' },
    { group: 'Accessed CNN.com P30D' },
    // CNN Access frequency
    { group: 'Regularly Access CNN' },
    { group: 'Occasionally Access CNN' },
    { group: 'Rarely Access CNN' },
    { group: 'Never Access CNN' },
];
const INITIAL_PRODUCT_CONFIG = (id, isInitiallyExcluded = false) => ({
    id,
    product: '',
    readerFeatures: [],
    streamingFeatures: [],
    verticals: [],
    monthlyRate: 10,
    pricingTier: 0,
    excluded: isInitiallyExcluded,
    pricingType: 'monthly',
    discount: 'none',
    isActive: true,
});
exports.INITIAL_PRODUCT_CONFIG = INITIAL_PRODUCT_CONFIG;
//# sourceMappingURL=constants.js.map