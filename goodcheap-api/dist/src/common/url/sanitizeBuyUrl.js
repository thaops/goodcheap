"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeBuyUrl = sanitizeBuyUrl;
const STRIP_PARAMS = new Set([
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'fbclid', 'yclid', 'mc_eid', 'mc_cid', 'irgwc', 'irclickid',
    'aff', 'affid', 'aff_id', 'aff_source', 'aff_medium',
    'ref', 'refid', 'ref_id',
    '_svg', 'checksum',
    'pid', 'tag'
]);
const STRIP_REGEXES = [
    /^utm_/i,
    /^aff/i,
    /^ref/i,
    /^(fb|g|yc)clid$/i,
    /^ir(click)?id$/i,
];
function sanitizeBuyUrl(raw) {
    try {
        const u = new URL(raw);
        for (const key of Array.from(u.searchParams.keys())) {
            const lower = key.toLowerCase();
            const bySet = STRIP_PARAMS.has(lower);
            const byRegex = STRIP_REGEXES.some(rx => rx.test(key));
            if (bySet || byRegex) {
                u.searchParams.delete(key);
            }
        }
        const search = u.searchParams.toString();
        u.search = search ? `?${search}` : '';
        if (u.hash && /^#(utm_|ref|aff|gclid|fbclid)/i.test(u.hash)) {
            u.hash = '';
        }
        return u.toString();
    }
    catch {
        return raw;
    }
}
//# sourceMappingURL=sanitizeBuyUrl.js.map