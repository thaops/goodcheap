const STRIP_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'yclid', 'mc_eid', 'mc_cid', 'irgwc', 'irclickid',
  'aff', 'affid', 'aff_id', 'aff_source', 'aff_medium',
  'ref', 'refid', 'ref_id',
  '_svg', 'checksum',
  'pid', 'tag'
]);

const STRIP_REGEXES: RegExp[] = [
  /^utm_/i,        // utm_*
  /^aff/i,         // aff*
  /^ref/i,         // ref*
  /^(fb|g|yc)clid$/i, // fbclid, gclid, yclid
  /^ir(click)?id$/i,  // irgwc/irclickid variants
];

export function sanitizeBuyUrl(raw: string): string {
  try {
    const u = new URL(raw);
    // Remove known tracking params
    for (const key of Array.from(u.searchParams.keys())) {
      const lower = key.toLowerCase();
      const bySet = STRIP_PARAMS.has(lower);
      const byRegex = STRIP_REGEXES.some(rx => rx.test(key));
      if (bySet || byRegex) {
        u.searchParams.delete(key);
      }
    }
    // Apply normalized search string (drops leading ? when empty)
    const search = u.searchParams.toString();
    u.search = search ? `?${search}` : '';

    // Drop tracking-looking hash fragments
    if (u.hash && /^#(utm_|ref|aff|gclid|fbclid)/i.test(u.hash)) {
      u.hash = '';
    }

    return u.toString();
  } catch {
    // Invalid URL: return as-is; upstream integrity checker should flag
    return raw;
  }
}
