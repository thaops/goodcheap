import { ReviewsService } from './reviews.service';

describe('ReviewsService.extractTikTokFromHtml', () => {
  const svc = new ReviewsService();

  it('parses JSON-LD Product offers (price/currency) and aggregateRating', async () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Tai nghe X",
          "image": ["https://cdn/img1.jpg", {"url":"https://cdn/img2.jpg"}],
          "offers": {
            "@type":"Offer",
            "price": "129.000",
            "priceCurrency": "VND"
          },
          "aggregateRating": {"ratingValue":"4.8","reviewCount":"235"}
        }
        </script>
      </head><body></body></html>`;
    const out = await svc.extractTikTokFromHtml(html);
    expect(out.title).toBe('Tai nghe X');
    expect(out.images).toEqual(['https://cdn/img1.jpg', 'https://cdn/img2.jpg']);
    expect(out.price).toBe(129000);
    expect(out.currency).toBe('VND');
    expect(out.ratingAvg).toBe(4.8);
    expect(out.reviewCount).toBe(235);
  });

  it('parses low/high price range and returns median (VND)', async () => {
    const html = `
      <script type="application/ld+json">
      {"@type":"Product","offers":{"lowPrice":"75,000","highPrice":"180,000","priceCurrency":"VND"}}
      </script>`;
    const out = await svc.extractTikTokFromHtml(html);
    expect(out.currency).toBe('VND');
    expect(out.price).toBe(127500);
  });

  it('clamps unreasonable VND price and drops it', async () => {
    const html = `
      <script type="application/ld+json">
      {"@type":"Product","offers":{"price":"0","priceCurrency":"VND"}}
      </script>`;
    const out = await svc.extractTikTokFromHtml(html);
    expect(out.currency).toBe('VND');
    expect(out.price).toBeUndefined();
  });

  it('fallback parses VND price from plain text when no JSON-LD present', async () => {
    const html = `<div class="price">Giá: 119.000 ₫</div>`;
    const out = await svc.extractTikTokFromHtml(html);
    expect(out.currency).toBe('VND');
    expect(out.price).toBe(119000);
  });

  it('reads og:title and multiple og:image tags', async () => {
    const html = `
      <meta property="og:title" content="Sản phẩm A" />
      <meta property="og:image" content="https://i/imgA.jpg" />
      <meta property="og:image" content="https://i/imgB.jpg" />`;
    const out = await svc.extractTikTokFromHtml(html);
    expect(out.title).toBe('Sản phẩm A');
    expect(out.images).toEqual(['https://i/imgA.jpg', 'https://i/imgB.jpg']);
  });

  it('infers VND from Vietnamese locale signals and clamps too-low price', async () => {
    const html = `
      <html lang="vi"><head>
        <script type="application/ld+json">
        {"@type":"Product","offers":{"price":"426"}}
        </script>
        <meta http-equiv="Content-Language" content="vi-VN" />
      </head><body></body></html>`;
    const out = await svc.extractTikTokFromHtml(html);
    expect(out.currency).toBe('VND');
    expect(out.price).toBeUndefined(); // 426 < 1000 should be clamped out for VND
  });

  it('parses TikTok inline JSON sku_info (price_val/price_str/original_price)', async () => {
    const html = `
      <html><head></head><body>
        <script>
          window.__INIT_PROPS__ = {"sku_info": {"price_val": 129000, "price_str": "129.000 ₫", "original_price": 199000}};
        </script>
      </body></html>`;
    const out = await svc.extractTikTokFromHtml(html);
    expect(out.price).toBe(129000);
    expect(out.discountPrice).toBe(199000);
    expect(out.currency).toBe('VND');
  });

  it('clamps too-low VND price from TikTok inline sku_info', async () => {
    const html = `
      <html lang="vi"><head></head><body>
        <script>
          var data = { sku_info: { price_val: 426, price_str: "426 ₫" } };
        </script>
      </body></html>`;
    const out = await svc.extractTikTokFromHtml(html);
    expect(out.currency).toBe('VND');
    expect(out.price).toBeUndefined();
  });
});
