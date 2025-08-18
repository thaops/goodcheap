"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const sanitizeBuyUrl_1 = require("../common/url/sanitizeBuyUrl");
let CacheService = class CacheService {
    cache = new Map();
    async normalizeAndCacheUrl(rawUrl) {
        const normalizedUrl = (0, sanitizeBuyUrl_1.sanitizeBuyUrl)(rawUrl);
        const cacheKey = `normalized_url:${normalizedUrl}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        this.cache.set(cacheKey, normalizedUrl);
        return normalizedUrl;
    }
    async getCachedProduct(url) {
        const cacheKey = `product:${url}`;
        return this.cache.has(cacheKey) ? this.cache.get(cacheKey) : null;
    }
    async cacheProduct(url, product) {
        const cacheKey = `product:${url}`;
        this.cache.set(cacheKey, product);
    }
    async get(key) {
        return this.cache.get(key);
    }
    async set(key, value, ttl) {
        this.cache.set(key, value);
    }
    async del(key) {
        this.cache.delete(key);
    }
    async exists(key) {
        return this.cache.has(key);
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)()
], CacheService);
//# sourceMappingURL=cache.service.js.map