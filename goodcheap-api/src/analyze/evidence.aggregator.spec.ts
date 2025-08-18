import { EvidenceAggregator } from './evidence.aggregator';
import type { Evidence } from './evidence.aggregator';

describe('EvidenceAggregator', () => {
  let evidenceAggregator: EvidenceAggregator;

  beforeEach(() => {
    evidenceAggregator = new EvidenceAggregator();
  });

  it('should be defined', () => {
    expect(evidenceAggregator).toBeDefined();
  });

  describe('aggregateEvidence', () => {
    it('should remove duplicate evidence items', () => {
      const evidenceArray: Evidence[] = [
        { id: 'evidence-1', type: 'productPage', source: 'example.com', content: 'Content 1' },
        { id: 'evidence-2', type: 'marketplace', source: 'shopee.vn', content: 'Content 2' },
        { id: 'evidence-1', type: 'productPage', source: 'example.com', content: 'Content 1' }, // Duplicate
        { id: 'evidence-3', type: 'review', source: 'test-review', content: 'Content 3' },
      ];

      const result = evidenceAggregator.aggregateEvidence(evidenceArray);
      expect(result).toHaveLength(3);
      expect(result.map(e => e.id)).toEqual(['evidence-1', 'evidence-2', 'evidence-3']);
    });

    it('should handle empty evidence array', () => {
      const evidenceArray: Evidence[] = [];
      const result = evidenceAggregator.aggregateEvidence(evidenceArray);
      expect(result).toHaveLength(0);
    });
  });

  describe('crossReferenceEvidence', () => {
    it('should identify price contradictions between product page and marketplace', () => {
      const evidenceArray: Evidence[] = [
        { 
          id: 'evidence-1', 
          type: 'productPage', 
          source: 'example.com', 
          content: 'Product price: 1.000.000 VND' 
        },
        { 
          id: 'evidence-2', 
          type: 'marketplace', 
          source: 'shopee.vn', 
          content: 'Product price: 2.000.000 VND' 
        },
      ];

      const contradictions = evidenceAggregator.crossReferenceEvidence(evidenceArray);
      expect(contradictions).toHaveLength(1);
      expect(contradictions[0].evidenceId1).toBe('evidence-1');
      expect(contradictions[0].evidenceId2).toBe('evidence-2');
      expect(contradictions[0].contradiction).toBe('Price information contradicts between product page and marketplace');
    });

    it('should not identify contradictions when prices match', () => {
      const evidenceArray: Evidence[] = [
        { 
          id: 'evidence-1', 
          type: 'productPage', 
          source: 'example.com', 
          content: 'Product price: 1.000.000 VND' 
        },
        { 
          id: 'evidence-2', 
          type: 'marketplace', 
          source: 'shopee.vn', 
          content: 'Product price: 1.000.000 VND' 
        },
      ];

      const contradictions = evidenceAggregator.crossReferenceEvidence(evidenceArray);
      expect(contradictions).toHaveLength(0);
    });
  });

  describe('generateDiagnostics', () => {
    it('should generate diagnostics for insufficient evidence diversity', () => {
      const evidenceArray: Evidence[] = [
        { id: 'evidence-1', type: 'productPage', source: 'example.com', content: 'Content 1' },
        { id: 'evidence-2', type: 'productPage', source: 'example2.com', content: 'Content 2' },
      ];

      const diagnostics = evidenceAggregator.generateDiagnostics(evidenceArray);
      expect(diagnostics).toHaveLength(2);
      
      const diversityDiagnostic = diagnostics.find(d => d.code === 'insufficient_evidence_diversity');
      expect(diversityDiagnostic).toBeDefined();
      expect(diversityDiagnostic?.severity).toBe('medium');
      
      const missingDiagnostic = diagnostics.find(d => d.code === 'missing_essential_evidence_types');
      expect(missingDiagnostic).toBeDefined();
      expect(missingDiagnostic?.severity).toBe('high');
    });

    it('should generate diagnostics for missing essential evidence types', () => {
      const evidenceArray: Evidence[] = [
        { id: 'evidence-1', type: 'productPage', source: 'example.com', content: 'Content 1' },
        { id: 'evidence-2', type: 'socialProof', source: 'test-social', content: 'Content 2' },
      ];

      const diagnostics = evidenceAggregator.generateDiagnostics(evidenceArray);
      expect(diagnostics).toHaveLength(1);
      
      const missingDiagnostic = diagnostics[0];
      expect(missingDiagnostic.code).toBe('missing_essential_evidence_types');
      expect(missingDiagnostic.severity).toBe('high');
      expect(missingDiagnostic.message).toContain('marketplace');
      expect(missingDiagnostic.message).toContain('review');
    });

    it('should generate diagnostics for outdated evidence', () => {
      const oneMonthAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString();
      const evidenceArray: Evidence[] = [
        { 
          id: 'evidence-1', 
          type: 'productPage', 
          source: 'example.com', 
          content: 'Content 1',
          timestamp: oneMonthAgo
        },
        { 
          id: 'evidence-2', 
          type: 'marketplace', 
          source: 'shopee.vn', 
          content: 'Content 2',
          timestamp: oneMonthAgo
        },
        { 
          id: 'evidence-3', 
          type: 'review', 
          source: 'test-review', 
          content: 'Content 3',
          timestamp: oneMonthAgo
        },
      ];

      const diagnostics = evidenceAggregator.generateDiagnostics(evidenceArray);
      expect(diagnostics).toHaveLength(1);
      
      const outdatedDiagnostic = diagnostics[0];
      expect(outdatedDiagnostic.code).toBe('outdated_evidence');
      expect(outdatedDiagnostic.severity).toBe('low');
    });
  });
});
