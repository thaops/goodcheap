export type CacheEntry = {
    key: string;
    value: unknown;
    ttl?: number;
};
export interface CacheInterface {
    get(key: string): Promise<CacheEntry | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
