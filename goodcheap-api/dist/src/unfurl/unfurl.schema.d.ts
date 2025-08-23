import { z } from 'zod';
export declare const UnfurlRequestSchema: z.ZodObject<{
    url: z.ZodString;
    debug: z.ZodOptional<z.ZodObject<{
        includeRawHtml: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        includeRawHtml?: boolean | undefined;
    }, {
        includeRawHtml?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    debug?: {
        includeRawHtml?: boolean | undefined;
    } | undefined;
}, {
    url: string;
    debug?: {
        includeRawHtml?: boolean | undefined;
    } | undefined;
}>;
export type UnfurlRequest = z.infer<typeof UnfurlRequestSchema>;
