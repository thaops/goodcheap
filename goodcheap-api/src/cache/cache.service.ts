import { Injectable } from '@nestjs/common';
import { sanitizeBuyUrl } from '../common/url/sanitizeBuyUrl';
import { CacheInterface } from '../common/interfaces/cache.interface';

@Injectable()
export class CacheService implements CacheInterface {
  private cache: Map<string, any> = new Map();

  /**
   * Normalize URL and cache it
   * This ensures URL integrity and provides caching for performance
   */
  async normalizeAndCacheUrl(rawUrl: string): Promise<string> {
    const normalizedUrl = sanitizeBuyUrl(rawUrl);
    const cacheKey = `normalized_url:${normalizedUrl}`;
    
    // Check if URL is already cached
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // For now, just return the normalized URL
    // In a real implementation, this would interact with Redis
    this.cache.set(cacheKey, normalizedUrl);
    return normalizedUrl;
  }

  /**
   * Get cached product data by URL
   */
  async getCachedProduct(url: string): Promise<any | null> {
    const cacheKey = `product:${url}`;
    return this.cache.has(cacheKey) ? this.cache.get(cacheKey) : null;
  }

  /**
   * Cache product data by URL
   */
  async cacheProduct(url: string, product: any): Promise<void> {
    const cacheKey = `product:${url}`;
    this.cache.set(cacheKey, product);
  }

  // Implementation of CacheInterface methods
  async get(key: string): Promise<any> {
    return this.cache.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, value);
    // Note: In a real Redis implementation, we would use the ttl parameter
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }
}
