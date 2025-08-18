"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickJsonLdProduct = pickJsonLdProduct;
exports.pickOpenGraph = pickOpenGraph;
const cheerio = __importStar(require("cheerio"));
function pickJsonLdProduct(html) {
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]');
    for (const el of scripts.toArray()) {
        try {
            const json = JSON.parse($(el).text());
            if (Array.isArray(json)) {
                for (const item of json) {
                    if (item?.['@type'] === 'Product')
                        return item;
                }
            }
            else if (json?.['@type'] === 'Product') {
                return json;
            }
        }
        catch { }
    }
    return null;
}
function pickOpenGraph(html) {
    const $ = cheerio.load(html);
    const og = {};
    $('meta[property^="og:"]').each((_, el) => {
        const key = $(el).attr('property') || '';
        const val = $(el).attr('content') || '';
        og[key] = val;
    });
    return og;
}
//# sourceMappingURL=html.js.map