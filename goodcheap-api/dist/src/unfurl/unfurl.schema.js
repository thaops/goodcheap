"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnfurlRequestSchema = void 0;
const zod_1 = require("zod");
exports.UnfurlRequestSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    debug: zod_1.z
        .object({
        includeRawHtml: zod_1.z.boolean().optional(),
    })
        .optional(),
});
//# sourceMappingURL=unfurl.schema.js.map