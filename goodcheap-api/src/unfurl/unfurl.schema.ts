import { z } from 'zod';

export const UnfurlRequestSchema = z.object({
  url: z.string().url(),
  debug: z
    .object({
      includeRawHtml: z.boolean().optional(),
    })
    .optional(),
});

export type UnfurlRequest = z.infer<typeof UnfurlRequestSchema>;
