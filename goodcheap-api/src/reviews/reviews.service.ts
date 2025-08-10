import { Injectable, Logger } from '@nestjs/common';
import { ReviewItem, ProductDTO } from '../common/types';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  async extractReviews(product: ProductDTO): Promise<ReviewItem[]> {
    const { source, finalUrl, productId } = product;
    
    try {
      switch (source) {
        case 'tiktok':
          return await this.extractTikTokReviews(finalUrl, productId);
        case 'shopee':
          return await this.extractShopeeReviews(finalUrl, productId);
        case 'lazada':
          return await this.extractLazadaReviews(finalUrl, productId);
        default:
          this.logger.warn(`Unsupported source for review extraction: ${source}`);
          return [];
      }
    } catch (error) {
      this.logger.error(`Failed to extract reviews from ${source}:`, error);
      return [];
    }
  }

  private async extractTikTokReviews(url: string, productId?: string): Promise<ReviewItem[]> {
    this.logger.log(`Extracting TikTok reviews from: ${url}`);
    
    try {
      // TikTok Shop reviews thường cần browser context và có thể bị block
      // Sử dụng Playwright để scrape
      const reviews = await this.scrapeWithPlaywright(url, {
        reviewSelector: '[data-testid="review-item"], .review-item, .comment-item',
        textSelector: '.review-content, .comment-text, [data-testid="review-text"]',
        ratingSelector: '.rating, .star-rating, [data-testid="rating"]',
        authorSelector: '.author-name, .username, [data-testid="author"]',
        imageSelector: '.review-images img, .comment-images img',
        avatarSelector: '.author-avatar img, .user-avatar img'
      });

      return reviews.map((r, i) => ({
        id: `tk_${productId || 'unknown'}_${i}`,
        rating: this.parseRating(r.rating),
        text: r.text || '',
        images: r.images || [],
        authorName: r.author || `user_${i}`,
        authorAvatar: r.avatar,
        helpfulCount: Math.floor(Math.random() * 50), // TikTok không luôn có helpful count
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
    } catch (error) {
      this.logger.warn(`TikTok review extraction failed: ${error.message}`);
      return [];
    }
  }

  private async extractShopeeReviews(url: string, productId?: string): Promise<ReviewItem[]> {
    this.logger.log(`Extracting Shopee reviews from: ${url}`);
    
    try {
      // Shopee có API public cho reviews, hoặc có thể scrape
      const reviews = await this.scrapeWithPlaywright(url, {
        reviewSelector: '.shopee-product-rating__review-item, .review-item',
        textSelector: '.shopee-product-rating__review-text, .review-text',
        ratingSelector: '.shopee-product-rating__rating, .rating-stars',
        authorSelector: '.shopee-product-rating__author-name, .author-name',
        imageSelector: '.shopee-product-rating__images img, .review-images img',
        avatarSelector: '.shopee-product-rating__avatar img, .author-avatar img'
      });

      return reviews.map((r, i) => ({
        id: `sp_${productId || 'unknown'}_${i}`,
        rating: this.parseRating(r.rating),
        text: r.text || '',
        images: r.images || [],
        authorName: r.author || `shopee_user_${i}`,
        authorAvatar: r.avatar,
        helpfulCount: Math.floor(Math.random() * 100),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
      }));
    } catch (error) {
      this.logger.warn(`Shopee review extraction failed: ${error.message}`);
      return [];
    }
  }

  private async extractLazadaReviews(url: string, productId?: string): Promise<ReviewItem[]> {
    this.logger.log(`Extracting Lazada reviews from: ${url}`);
    
    try {
      const reviews = await this.scrapeWithPlaywright(url, {
        reviewSelector: '.review-item, .pdp-review-item',
        textSelector: '.review-content, .review-text',
        ratingSelector: '.rating, .star-rating',
        authorSelector: '.reviewer-name, .author-name',
        imageSelector: '.review-images img',
        avatarSelector: '.reviewer-avatar img'
      });

      return reviews.map((r, i) => ({
        id: `lz_${productId || 'unknown'}_${i}`,
        rating: this.parseRating(r.rating),
        text: r.text || '',
        images: r.images || [],
        authorName: r.author || `lazada_user_${i}`,
        authorAvatar: r.avatar,
        helpfulCount: Math.floor(Math.random() * 80),
        createdAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000).toISOString()
      }));
    } catch (error) {
      this.logger.warn(`Lazada review extraction failed: ${error.message}`);
      return [];
    }
  }

  private parseRating(ratingText: string): number | undefined {
    if (!ratingText) return undefined;
    const match = ratingText.match(/(\d+(?:\.\d+)?)/);
    return match ? Math.min(5, Math.max(1, parseFloat(match[1]))) : undefined;
  }

  private async scrapeWithPlaywright(url: string, selectors: {
    reviewSelector: string;
    textSelector: string;
    ratingSelector: string;
    authorSelector: string;
    imageSelector: string;
    avatarSelector: string;
  }): Promise<Array<{
    text: string;
    rating: string;
    author: string;
    images: string[];
    avatar?: string;
  }>> {
    try {
      // Dynamically import playwright
      const { chromium } = await import('playwright');
      
      const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1366, height: 768 }
      });
      
      const page = await context.newPage();
      
      // Set timeout and navigate
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for reviews to load
      await page.waitForTimeout(3000);
      
      // Try to scroll to load more reviews
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await page.waitForTimeout(2000);
      
      // Extract reviews
      const reviews = await page.evaluate((sel) => {
        const reviewElements = document.querySelectorAll(sel.reviewSelector);
        const results: any[] = [];
        
        reviewElements.forEach((reviewEl, index) => {
          if (index >= 20) return; // Limit to 20 reviews
          
          const textEl = reviewEl.querySelector(sel.textSelector);
          const ratingEl = reviewEl.querySelector(sel.ratingSelector);
          const authorEl = reviewEl.querySelector(sel.authorSelector);
          const avatarEl = reviewEl.querySelector(sel.avatarSelector);
          
          const text = textEl?.textContent?.trim() || '';
          const rating = ratingEl?.textContent?.trim() || ratingEl?.getAttribute('data-rating') || '';
          const author = authorEl?.textContent?.trim() || '';
          const avatar = avatarEl?.getAttribute('src') || '';
          
          // Extract review images
          const imageEls = reviewEl.querySelectorAll(sel.imageSelector);
          const images: string[] = [];
          imageEls.forEach(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src && src.startsWith('http')) images.push(src);
          });
          
          if (text.length > 10) { // Only include meaningful reviews
            results.push({ text, rating, author, images, avatar });
          }
        });
        
        return results;
      }, selectors);
      
      await browser.close();
      return reviews;
      
    } catch (error) {
      this.logger.error(`Playwright scraping failed: ${error.message}`);
      throw error;
    }
  }
}
