import { EvidenceValidator } from './evidence.validator';
import type { CommerceReviewResponse } from './evidence.validator';

describe('EvidenceValidator', () => {
  let evidenceValidator: EvidenceValidator;

  beforeEach(() => {
    evidenceValidator = new EvidenceValidator();
  });

  it('should be defined', () => {
    expect(evidenceValidator).toBeDefined();
  });

  describe('validateEvidenceReferences', () => {
    it('should return no errors for valid evidence references', () => {
      const response: CommerceReviewResponse = {
        meta: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          requestId: 'test-request-id',
        },
        product: {
          id: 'test-product-id',
          name: 'Test Product',
          canonicalUrl: 'https://example.com/product',
          finalUrl: 'https://example.com/product',
          imageUrl: 'https://example.com/image.jpg',
        },
        aiAnalysis: {
          summary: 'Test summary',
          pros: [
            { text: 'Pro 1', evidenceIds: ['evidence-1'] },
            { text: 'Pro 2', evidenceIds: ['evidence-2'] },
          ],
          cons: [
            { text: 'Con 1', evidenceIds: ['evidence-1'] },
          ],
          citations: [
            { evidenceId: 'evidence-1', reliability: 0.9, note: 'Test citation' },
          ],
        },
        analysis: {
          overallScore: 80,
          verdict: 'buy',
          reasons: ['Reason 1'],
          aspects: [
            {
              name: 'aspect1',
              score: 4,
              quotes: [
                { text: 'Quote 1', evidenceId: 'evidence-1' },
              ],
              fitFor: [
                { text: 'Fit for 1', evidenceId: 'evidence-2' },
              ],
            },
          ],
        },
        evidence: [
          { id: 'evidence-1', type: 'productPage', source: 'example.com', content: 'Content 1' },
          { id: 'evidence-2', type: 'marketplace', source: 'shopee.vn', content: 'Content 2' },
          { id: 'evidence-3', type: 'review', source: 'test-review', content: 'Content 3' },
        ],
        system: {
          warnings: [],
          diagnostics: [],
        },
      };

      const errors = evidenceValidator.validateEvidenceReferences(response);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid evidence references', () => {
      const response: CommerceReviewResponse = {
        meta: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          requestId: 'test-request-id',
        },
        product: {
          id: 'test-product-id',
          name: 'Test Product',
          canonicalUrl: 'https://example.com/product',
          finalUrl: 'https://example.com/product',
          imageUrl: 'https://example.com/image.jpg',
        },
        aiAnalysis: {
          summary: 'Test summary',
          pros: [
            { text: 'Pro 1', evidenceIds: ['invalid-evidence-id'] },
          ],
          cons: [],
          citations: [],
        },
        analysis: {
          overallScore: 80,
          verdict: 'buy',
          reasons: ['Reason 1'],
          aspects: [],
        },
        evidence: [
          { id: 'evidence-1', type: 'productPage', source: 'example.com', content: 'Content 1' },
        ],
        system: {
          warnings: [],
          diagnostics: [],
        },
      };

      const errors = evidenceValidator.validateEvidenceReferences(response);
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toBe('aiAnalysis.pros[0].evidenceIds[0]');
      expect(errors[0].error).toBe('Invalid evidenceId reference: invalid-evidence-id');
    });
  });

  describe('validateEvidenceArray', () => {
    it('should return no errors when evidence array has sufficient diversity', () => {
      const response: CommerceReviewResponse = {
        meta: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          requestId: 'test-request-id',
        },
        product: {
          id: 'test-product-id',
          name: 'Test Product',
          canonicalUrl: 'https://example.com/product',
          finalUrl: 'https://example.com/product',
          imageUrl: 'https://example.com/image.jpg',
        },
        aiAnalysis: {
          summary: 'Test summary',
          pros: [],
          cons: [],
          citations: [],
        },
        analysis: {
          overallScore: 80,
          verdict: 'buy',
          reasons: ['Reason 1'],
          aspects: [],
        },
        evidence: [
          { id: 'evidence-1', type: 'productPage', source: 'example.com', content: 'Content 1' },
          { id: 'evidence-2', type: 'marketplace', source: 'shopee.vn', content: 'Content 2' },
          { id: 'evidence-3', type: 'review', source: 'test-review', content: 'Content 3' },
          { id: 'evidence-4', type: 'socialProof', source: 'test-social', content: 'Content 4' },
        ],
        system: {
          warnings: [],
          diagnostics: [],
        },
      };

      const errors = evidenceValidator.validateEvidenceArray(response);
      expect(errors).toHaveLength(0);
    });

    it('should return errors when evidence array has insufficient diversity', () => {
      const response: CommerceReviewResponse = {
        meta: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          requestId: 'test-request-id',
        },
        product: {
          id: 'test-product-id',
          name: 'Test Product',
          canonicalUrl: 'https://example.com/product',
          finalUrl: 'https://example.com/product',
          imageUrl: 'https://example.com/image.jpg',
        },
        aiAnalysis: {
          summary: 'Test summary',
          pros: [],
          cons: [],
          citations: [],
        },
        analysis: {
          overallScore: 80,
          verdict: 'buy',
          reasons: ['Reason 1'],
          aspects: [],
        },
        evidence: [
          { id: 'evidence-1', type: 'productPage', source: 'example.com', content: 'Content 1' },
          { id: 'evidence-2', type: 'productPage', source: 'example2.com', content: 'Content 2' },
        ],
        system: {
          warnings: [],
          diagnostics: [],
        },
      };

      const errors = evidenceValidator.validateEvidenceArray(response);
      expect(errors).toHaveLength(2);
      expect(errors[0].error).toBe('Insufficient evidence diversity - need at least 3 distinct evidence types');
      expect(errors[1].error).toBe('Missing essential evidence types: marketplace, review');
    });
  });

  describe('validate', () => {
    it('should return valid status when all validations pass', () => {
      const response: CommerceReviewResponse = {
        meta: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          requestId: 'test-request-id',
        },
        product: {
          id: 'test-product-id',
          name: 'Test Product',
          canonicalUrl: 'https://example.com/product',
          finalUrl: 'https://example.com/product',
          imageUrl: 'https://example.com/image.jpg',
        },
        aiAnalysis: {
          summary: 'Test summary',
          pros: [
            { text: 'Pro 1', evidenceIds: ['evidence-1'] },
          ],
          cons: [],
          citations: [
            { evidenceId: 'evidence-1', reliability: 0.9, note: 'Test citation' },
          ],
        },
        analysis: {
          overallScore: 80,
          verdict: 'buy',
          reasons: ['Reason 1'],
          aspects: [
            {
              name: 'aspect1',
              score: 4,
              quotes: [
                { text: 'Quote 1', evidenceId: 'evidence-1' },
              ],
              fitFor: [],
            },
          ],
        },
        evidence: [
          { id: 'evidence-1', type: 'productPage', source: 'example.com', content: 'Content 1' },
          { id: 'evidence-2', type: 'marketplace', source: 'shopee.vn', content: 'Content 2' },
          { id: 'evidence-3', type: 'review', source: 'test-review', content: 'Content 3' },
        ],
        system: {
          warnings: [],
          diagnostics: [],
        },
      };

      const result = evidenceValidator.validate(response);
      expect(result.isValid).toBe(true);
      expect(result.status).toBe('valid');
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid status when validations fail', () => {
      const response: CommerceReviewResponse = {
        meta: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          requestId: 'test-request-id',
        },
        product: {
          id: 'test-product-id',
          name: 'Test Product',
          canonicalUrl: 'https://example.com/product',
          finalUrl: 'https://example.com/product',
          imageUrl: 'https://example.com/image.jpg',
        },
        aiAnalysis: {
          summary: 'Test summary',
          pros: [
            { text: 'Pro 1', evidenceIds: ['invalid-evidence-id'] },
          ],
          cons: [],
          citations: [],
        },
        analysis: {
          overallScore: 80,
          verdict: 'buy',
          reasons: ['Reason 1'],
          aspects: [],
        },
        evidence: [
          { id: 'evidence-1', type: 'productPage', source: 'example.com', content: 'Content 1' },
        ],
        system: {
          warnings: [],
          diagnostics: [],
        },
      };

      const result = evidenceValidator.validate(response);
      expect(result.isValid).toBe(false);
      expect(result.status).toBe('invalid');
      expect(result.errors).toHaveLength(2); // One for insufficient diversity, one for invalid reference
    });
  });
});
