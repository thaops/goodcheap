import { Injectable } from '@nestjs/common';
import { CommerceReviewResponse } from '../common/schemas/commerceReviewResponse.schema';
import { SimplifiedAnalyzeResponse } from '../common/interfaces/simplified-response.interface';

@Injectable()
export class SimplifiedResponseMapper {
  /**
   * Transform complex CommerceReviewResponse to simplified format
   * Gom nhóm thông tin theo 7 categories chính để frontend dễ xử lý
   */
  transform(
    originalResponse: CommerceReviewResponse,
  ): SimplifiedAnalyzeResponse {
    return {
      // 1. Thông tin cơ bản sản phẩm
      product: {
        id: originalResponse.meta.productId,
        title: originalResponse.product.title,
        brand:
          originalResponse.product.brand ||
          originalResponse.productNormalization?.brand ||
          undefined,
        images: originalResponse.product.images,
        canonicalUrl: originalResponse.product.canonicalUrl,
        size: originalResponse.productNormalization?.size || undefined,
        category: originalResponse.product.category,
      },

      // 2. Giá & tình trạng
      pricing: {
        currentPrice:
          originalResponse.marketplace?.price?.current ||
          originalResponse.marketplace?.price?.sale ||
          undefined,
        originalPrice:
          originalResponse.marketplace?.price?.original ||
          originalResponse.marketplace?.price?.list ||
          undefined,
        currency: originalResponse.meta.currency,
        discount: originalResponse.marketplace?.price?.discountPct,
        priceHistory:
          originalResponse.marketplace?.price?.history?.map((h) => ({
            date: h.date,
            price: h.price,
          })) || [],
        availability: originalResponse.availability?.stockStatus || 'unknown',
      },

      // 3. Đánh giá
      reviews: {
        totalCount:
          originalResponse.reviewsAggregate?.count ||
          originalResponse.socialProof?.ratingCount ||
          originalResponse.reviews?.length ||
          0,
        averageRating:
          originalResponse.reviewsAggregate?.average ||
          originalResponse.socialProof?.ratingAvg ||
          originalResponse.marketplace?.product?.ratingAvg ||
          undefined,
        breakdown:
          originalResponse.reviewsAggregate?.breakdown ||
          originalResponse.socialProof?.ratingBreakdown ||
          originalResponse.marketplace?.product?.ratingDist ||
          undefined,
        items:
          originalResponse.reviews?.map((review) => ({
            id: review.id,
            author: review.author,
            rating: review.rating,
            text: review.text,
            date: review.date,
            media: review.media || [],
            source: review.source,
            verifiedPurchase: review.verifiedPurchase,
          })) || [],
      },

      // 4. Tổng hợp review
      reviewSummary: {
        topPros: originalResponse.reviewSummary?.topPros || [],
        topCons: originalResponse.reviewSummary?.topCons || [],
        topics:
          originalResponse.reviewSummary?.topics?.map((topic) => ({
            name: topic.name,
            sentiment: topic.sentiment || 'neutral',
            mentions: topic.supportCount || 0,
          })) || [],
        reviewWithMediaPercent:
          originalResponse.reviewsAggregate?.reviewWithImagesPercent || 0,
      },

      // 5. Chính sách
      policies: {
        returnPolicy:
          originalResponse.policies?.returnPolicy ||
          originalResponse.marketplace?.product?.returnPolicy ||
          undefined,
        returnWindowDays: originalResponse.policies?.returnWindowDays,
        warranty:
          originalResponse.policies?.warranty ||
          originalResponse.marketplace?.product?.warranty ||
          undefined,
        cod:
          originalResponse.policies?.cod ||
          originalResponse.marketplace?.product?.shipping?.cod ||
          undefined,
        shipping: {
          minDays:
            originalResponse.policies?.shippingTimeDays ||
            originalResponse.marketplace?.product?.shipping?.minDays ||
            undefined,
          maxDays:
            originalResponse.marketplace?.product?.shipping?.maxDays ||
            undefined,
          freeThreshold:
            originalResponse.policies?.freeShipThreshold ||
            originalResponse.marketplace?.product?.shipping?.freeThreshold ||
            undefined,
        },
      },

      // 6. Phân tích AI
      aiAnalysis: {
        verdict:
          originalResponse.aiAnalysis?.verdict ||
          originalResponse.aiDecision?.verdict ||
          'unknown',
        confidence: Math.round(
          (originalResponse.aiAnalysis?.confidence || 0) * 100,
        ),
        reasons:
          originalResponse.aiAnalysis?.reasons ||
          originalResponse.aiDecision?.reasons?.map((r) => r.detail || r.id) ||
          [],
        overallScore: originalResponse.psychologyV2?.scorecard?.total || 0,
        trustScore: originalResponse.psychologyV2?.scorecard?.trust?.score || 0,
        evidenceScore:
          originalResponse.psychologyV2?.scorecard?.evidence?.score || 0,
      },

      // 7. Bằng chứng & nguồn
      evidence: {
        productPage: originalResponse.meta.sourceUrl,
        linkedVideos: this.extractLinkedVideos(originalResponse),
        reliability: this.calculateOverallReliability(originalResponse),
      },

      // Meta thông tin
      meta: {
        platform: originalResponse.meta.platform,
        locale: originalResponse.meta.locale,
        timestamp: originalResponse.meta.timestamp,
        processingTime: originalResponse.system?.latencyMs,
        warnings: originalResponse.system?.warnings,
      },
    };
  }

  /**
   * Extract linked videos from evidence and product videos
   */
  private extractLinkedVideos(response: CommerceReviewResponse) {
    const videos: Array<{
      id: string;
      title: string;
      author: string;
      url: string;
      views?: number;
      likes?: number;
      thumbnail?: string;
    }> = [];

    // From product videos
    if (response.product.videos) {
      videos.push(
        ...response.product.videos.map((video) => ({
          id: video.url.split('/').pop() || '',
          title: '', // không có title từ product videos
          author: '', // không có author từ product videos
          url: video.url,
          views: video.views,
          likes: video.likes,
          thumbnail: '',
        })),
      );
    }

    // From evidence (creator videos)
    const videoEvidence = response.evidence.filter(
      (e) => e.type === 'creatorVideo' || e.type === 'live',
    );

    videos.push(
      ...videoEvidence.map((evidence) => ({
        id: evidence.id,
        title: evidence.title || '',
        author: evidence.author?.name || '',
        url: evidence.url || '',
        views: evidence.engagement?.views,
        likes: evidence.engagement?.likes,
        thumbnail: '', // có thể add logic extract thumbnail từ URL
      })),
    );

    return videos;
  }

  /**
   * Calculate overall reliability from all evidence
   */
  private calculateOverallReliability(
    response: CommerceReviewResponse,
  ): number {
    if (!response.evidence || response.evidence.length === 0) {
      return 0;
    }

    const reliabilities = response.evidence
      .map((e) => e.reliability || 0)
      .filter((r) => r > 0);

    if (reliabilities.length === 0) {
      return 0;
    }

    // Weighted average, với productPage có trọng số cao hơn
    const productPageReliability =
      response.evidence.find((e) => e.type === 'productPage')?.reliability || 0;

    const otherReliabilities = response.evidence
      .filter((e) => e.type !== 'productPage')
      .map((e) => e.reliability || 0);

    const totalWeight = otherReliabilities.length + 2; // productPage có weight = 2
    const weightedSum =
      productPageReliability * 2 +
      otherReliabilities.reduce((sum, r) => sum + r, 0);

    return weightedSum / totalWeight;
  }
}
