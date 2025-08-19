"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceValidator = void 0;
const common_1 = require("@nestjs/common");
let EvidenceValidator = class EvidenceValidator {
    validateEvidenceReferences(response) {
        const errors = [];
        const evidenceIds = new Set(response.evidence.map(e => e.id));
        if (response.aiAnalysis && response.aiAnalysis.pros) {
            response.aiAnalysis.pros.forEach((pro, index) => {
                if (pro.evidenceIds) {
                    pro.evidenceIds.forEach((evidenceId, evidenceIndex) => {
                        if (!evidenceIds.has(evidenceId)) {
                            errors.push({
                                path: `aiAnalysis.pros[${index}].evidenceIds[${evidenceIndex}]`,
                                error: `Invalid evidenceId reference: ${evidenceId}`
                            });
                        }
                    });
                }
            });
        }
        if (response.aiAnalysis && response.aiAnalysis.cons) {
            response.aiAnalysis.cons.forEach((con, index) => {
                if (con.evidenceIds) {
                    con.evidenceIds.forEach((evidenceId, evidenceIndex) => {
                        if (!evidenceIds.has(evidenceId)) {
                            errors.push({
                                path: `aiAnalysis.cons[${index}].evidenceIds[${evidenceIndex}]`,
                                error: `Invalid evidenceId reference: ${evidenceId}`
                            });
                        }
                    });
                }
            });
        }
        if (response.analysis?.aspects) {
            response.analysis.aspects.forEach((aspect, aspectIndex) => {
                if (aspect.quotes) {
                    aspect.quotes.forEach((quote, quoteIndex) => {
                        if (quote.evidenceId && !evidenceIds.has(quote.evidenceId)) {
                            errors.push({
                                path: `analysis.aspects[${aspectIndex}].quotes[${quoteIndex}].evidenceId`,
                                error: `Invalid evidenceId reference: ${quote.evidenceId}`
                            });
                        }
                    });
                }
                if (aspect.fitFor) {
                    aspect.fitFor.forEach((fitForItem, fitForIndex) => {
                        if (fitForItem.evidenceId && !evidenceIds.has(fitForItem.evidenceId)) {
                            errors.push({
                                path: `analysis.aspects[${aspectIndex}].fitFor[${fitForIndex}].evidenceId`,
                                error: `Invalid evidenceId reference: ${fitForItem.evidenceId}`
                            });
                        }
                    });
                }
            });
        }
        if (response.reviews && response.reviews.topics) {
            response.reviews.topics.forEach((topic, topicIndex) => {
                if (topic.evidenceId && !evidenceIds.has(topic.evidenceId)) {
                    errors.push({
                        path: `reviews.topics[${topicIndex}].evidenceId`,
                        error: `Invalid evidenceId reference: ${topic.evidenceId}`
                    });
                }
                if (topic.reviews) {
                    topic.reviews.forEach((review, reviewIndex) => {
                        if (review.evidenceId && !evidenceIds.has(review.evidenceId)) {
                            errors.push({
                                path: `reviews.topics[${topicIndex}].reviews[${reviewIndex}].evidenceId`,
                                error: `Invalid evidenceId reference: ${review.evidenceId}`
                            });
                        }
                    });
                }
            });
        }
        if (response.reviewSummary && response.reviewSummary.topics) {
            response.reviewSummary.topics.forEach((topic, topicIndex) => {
                if (Array.isArray(topic.evidenceIds)) {
                    topic.evidenceIds.forEach((evidenceId, evidenceIndex) => {
                        if (!evidenceIds.has(evidenceId)) {
                            errors.push({
                                path: `reviewSummary.topics[${topicIndex}].evidenceIds[${evidenceIndex}]`,
                                error: `Invalid evidenceId reference: ${evidenceId}`
                            });
                        }
                    });
                }
            });
        }
        if (response.reviews && response.reviews.items) {
            response.reviews.items.forEach((item, itemIndex) => {
                if (item.evidenceId && !evidenceIds.has(item.evidenceId)) {
                    errors.push({
                        path: `reviews.items[${itemIndex}].evidenceId`,
                        error: `Invalid evidenceId reference: ${item.evidenceId}`
                    });
                }
            });
        }
        if (Array.isArray(response.reviews)) {
            response.reviews.forEach((item, itemIndex) => {
                if (item?.evidenceId && !evidenceIds.has(item.evidenceId)) {
                    errors.push({
                        path: `reviews[${itemIndex}].evidenceId`,
                        error: `Invalid evidenceId reference: ${item.evidenceId}`
                    });
                }
            });
        }
        return errors;
    }
    validateEvidenceArray(response) {
        const errors = [];
        const evidenceTypes = new Set(response.evidence.map(e => e.type));
        const diversityThreshold = 3;
        if (evidenceTypes.size < diversityThreshold) {
            errors.push({
                path: 'evidence',
                error: `Insufficient evidence diversity - need at least ${diversityThreshold} distinct evidence types`,
            });
        }
        const essentialEvidenceTypes = ['productPage', 'marketplace', 'review'];
        const missingTypes = essentialEvidenceTypes.filter(type => !response.evidence.some(e => e.type === type));
        if (missingTypes.length > 0) {
            errors.push({
                path: 'evidence',
                error: `Missing essential evidence types: ${missingTypes.join(', ')}`
            });
        }
        return errors;
    }
    validate(response) {
        const referenceErrors = this.validateEvidenceReferences(response);
        const arrayErrors = this.validateEvidenceArray(response);
        const combinedArrayErrors = arrayErrors.length > 0 ? [arrayErrors[0]] : [];
        const allErrors = [...referenceErrors, ...combinedArrayErrors];
        const isValid = allErrors.length === 0;
        const status = isValid ? 'valid' : 'invalid';
        return {
            isValid,
            errors: allErrors,
            status
        };
    }
};
exports.EvidenceValidator = EvidenceValidator;
exports.EvidenceValidator = EvidenceValidator = __decorate([
    (0, common_1.Injectable)()
], EvidenceValidator);
//# sourceMappingURL=evidence.validator.js.map