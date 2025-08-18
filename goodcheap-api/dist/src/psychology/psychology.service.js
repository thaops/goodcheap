"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsychologyService = void 0;
const common_1 = require("@nestjs/common");
let PsychologyService = class PsychologyService {
    calculatePsychologyScore(product) {
        const reviews = product.reviewsSample || [];
        if (reviews.length === 0) {
            return 50;
        }
        const avgRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length;
        const socialProofStrength = Math.min(reviews.length / 100, 1);
        const helpfulReviews = reviews.filter(review => review.helpfulCount && review.helpfulCount > 0);
        const evidenceStrength = helpfulReviews.length / reviews.length;
        const score = (avgRating * 20) + (socialProofStrength * 30) + (evidenceStrength * 50);
        return Math.min(Math.max(Math.round(score), 0), 100);
    }
    calculateBuyerDecisionFactors(product) {
        const reviews = product.reviewsSample || [];
        const socialProofStrength = Math.min(reviews.length / 100, 1);
        const positiveReviews = reviews.filter(review => review.rating && review.rating >= 4);
        const lossAversionMitigation = positiveReviews.length / Math.max(reviews.length, 1);
        const detailedReviews = reviews.filter(review => review.text && review.text.length > 50);
        const ambiguityMitigation = detailedReviews.length / Math.max(reviews.length, 1);
        const urgencyScarcity = 0.5;
        const imageReviews = reviews.filter(review => review.images && review.images.length > 0);
        const abilityFriction = imageReviews.length / Math.max(reviews.length, 1);
        return {
            socialProofStrength,
            lossAversionMitigation,
            ambiguityMitigation,
            urgencyScarcity,
            abilityFriction,
        };
    }
    calculateBuyerDecisionScorecard(product) {
        const psychologyScore = this.calculatePsychologyScore(product);
        const trust = Math.min(2, psychologyScore / 50);
        const evidence = Math.min(2, psychologyScore / 50);
        const riskReversal = Math.min(2, psychologyScore / 50);
        const easeToBuy = Math.min(2, psychologyScore / 50);
        const urgency = Math.min(2, psychologyScore / 50);
        return {
            trust,
            evidence,
            riskReversal,
            easeToBuy,
            urgency,
            total: psychologyScore,
        };
    }
};
exports.PsychologyService = PsychologyService;
exports.PsychologyService = PsychologyService = __decorate([
    (0, common_1.Injectable)()
], PsychologyService);
//# sourceMappingURL=psychology.service.js.map