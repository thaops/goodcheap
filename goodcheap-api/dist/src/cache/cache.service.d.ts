import { CacheInterface } from '../common/interfaces/cache.interface';
export declare class CacheService implements CacheInterface {
    private cache;
    normalizeAndCacheUrl(rawUrl: string): Promise<string>;
    getCachedProduct(url: string): Promise<any | null>;
    cacheProduct(url: string, product: any): Promise<void>;
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
