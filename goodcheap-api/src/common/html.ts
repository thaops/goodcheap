import * as cheerio from 'cheerio';

export function pickJsonLdProduct(html: string): any | null {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');

  for (const el of scripts.toArray()) {
    try {
      const json = JSON.parse($(el).text());
      if (Array.isArray(json)) {
        for (const item of json) {
          if (item?.['@type'] === 'Product') return item;
        }
      } else if (json?.['@type'] === 'Product') {
        return json;
      }
    } catch {}
  }
  return null;
}

export function pickOpenGraph(html: string): Record<string, string> {
  const $ = cheerio.load(html);
  const og: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const key = $(el).attr('property') || '';
    const val = $(el).attr('content') || '';
    og[key] = val;
  });
  return og;
}
