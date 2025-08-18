"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceAggregator = void 0;
const common_1 = require("@nestjs/common");
let EvidenceAggregator = class EvidenceAggregator {
    aggregateEvidence(evidenceArray) {
        const evidenceMap = new Map();
        evidenceArray.forEach(evidence => {
            if (!evidenceMap.has(evidence.id)) {
                evidenceMap.set(evidence.id, evidence);
            }
        });
        return Array.from(evidenceMap.values());
    }
    crossReferenceEvidence(evidenceArray) {
        const contradictions = [];
        for (let i = 0; i < evidenceArray.length; i++) {
            for (let j = i + 1; j < evidenceArray.length; j++) {
                const evidence1 = evidenceArray[i];
                const evidence2 = evidenceArray[j];
                if (evidence1.type === 'productPage' && evidence2.type === 'marketplace') {
                    const content1 = evidence1.content.toLowerCase();
                    const content2 = evidence2.content.toLowerCase();
                    if (this.hasPriceContradiction(content1, content2)) {
                        contradictions.push({
                            evidenceId1: evidence1.id,
                            evidenceId2: evidence2.id,
                            contradiction: 'Price information contradicts between product page and marketplace'
                        });
                    }
                }
            }
        }
        return contradictions;
    }
    hasPriceContradiction(content1, content2) {
        const priceRegex = /(\d+[.,]?\d*)\s*(vnd|đ|đồng)/gi;
        const prices1 = content1.match(priceRegex);
        const prices2 = content2.match(priceRegex);
        if (prices1 && prices2 && prices1.length > 0 && prices2.length > 0) {
            return prices1[0] !== prices2[0];
        }
        return false;
    }
    generateDiagnostics(evidenceArray) {
        const diagnostics = [];
        const evidenceTypes = new Set(evidenceArray.map(e => e.type));
        if (evidenceTypes.size < 3) {
            diagnostics.push({
                code: 'insufficient_evidence_diversity',
                message: `Only ${evidenceTypes.size} evidence types found. Need at least 3 distinct types.`,
                severity: 'medium'
            });
        }
        const essentialTypes = ['productPage', 'marketplace', 'review'];
        const missingTypes = essentialTypes.filter(type => !evidenceArray.some(e => e.type === type));
        if (missingTypes.length > 0) {
            diagnostics.push({
                code: 'missing_essential_evidence_types',
                message: `Missing essential evidence types: ${missingTypes.join(', ')}`,
                severity: 'high'
            });
        }
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const oldEvidence = evidenceArray.filter(e => {
            if (e.timestamp) {
                return new Date(e.timestamp).getTime() < oneWeekAgo;
            }
            return false;
        });
        if (oldEvidence.length > evidenceArray.length / 2) {
            diagnostics.push({
                code: 'outdated_evidence',
                message: 'More than half of the evidence is older than one week',
                severity: 'low'
            });
        }
        return diagnostics;
    }
};
exports.EvidenceAggregator = EvidenceAggregator;
exports.EvidenceAggregator = EvidenceAggregator = __decorate([
    (0, common_1.Injectable)()
], EvidenceAggregator);
//# sourceMappingURL=evidence.aggregator.js.map