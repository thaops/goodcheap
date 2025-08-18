"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extract_price = exports.extract_specs = exports.youtube_transcript = exports.search_reviews = void 0;
exports.fetchUrl = fetchUrl;
exports.extractPrice = extractPrice;
exports.extractSpecs = extractSpecs;
exports.searchReviews = searchReviews;
exports.youtubeTranscript = youtubeTranscript;
async function fetchUrl(url) {
    return {
        url,
        status: 0,
        contentType: undefined,
        body: null,
        robotsAllowed: false,
        fetchedAt: new Date().toISOString(),
    };
}
async function extractPrice(url) {
    return { url, currentPrice: null, listPrice: null, fetchedAt: new Date().toISOString() };
}
async function extractSpecs(url) {
    return { url, specs: null, fetchedAt: new Date().toISOString() };
}
async function searchReviews(query) {
    return [];
}
async function youtubeTranscript(url) {
    return { url, text: '', segments: [], fetchedAt: new Date().toISOString() };
}
exports.search_reviews = searchReviews;
exports.youtube_transcript = youtubeTranscript;
exports.extract_specs = extractSpecs;
exports.extract_price = extractPrice;
//# sourceMappingURL=tools.js.map