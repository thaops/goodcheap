import { Injectable } from '@nestjs/common';

// Local Evidence type used by aggregator and tests
export type Evidence = {
  id: string;
  type: 'productPage' | 'marketplace' | 'review' | string;
  source: string;
  content: string;
  timestamp?: string; // ISO datetime
};

@Injectable()
export class EvidenceAggregator {
  /**
   * Aggregates evidence from multiple sources and removes duplicates
   * @param evidenceArray Array of evidence items from different sources
   * @returns Aggregated evidence array with duplicates removed
   */
  aggregateEvidence(evidenceArray: Evidence[]): Evidence[] {
    const evidenceMap = new Map<string, Evidence>();
    
    evidenceArray.forEach(evidence => {
      // Use evidence ID as key to identify duplicates
      if (!evidenceMap.has(evidence.id)) {
        evidenceMap.set(evidence.id, evidence);
      }
    });
    
    return Array.from(evidenceMap.values());
  }
  
  /**
   * Cross-references evidence items to identify contradictions
   * @param evidenceArray Array of evidence items
   * @returns Array of contradictions found
   */
  crossReferenceEvidence(evidenceArray: Evidence[]): Array<{evidenceId1: string, evidenceId2: string, contradiction: string}> {
    const contradictions: Array<{evidenceId1: string, evidenceId2: string, contradiction: string}> = [];
    
    // Compare each evidence item with every other evidence item
    for (let i = 0; i < evidenceArray.length; i++) {
      for (let j = i + 1; j < evidenceArray.length; j++) {
        const evidence1 = evidenceArray[i];
        const evidence2 = evidenceArray[j];
        
        // Check for contradictions in pricing information
        if (evidence1.type === 'productPage' && evidence2.type === 'marketplace') {
          const content1 = evidence1.content.toLowerCase();
          const content2 = evidence2.content.toLowerCase();
          
          // Simple contradiction detection based on price mentions
          // In a real implementation, this would be more sophisticated
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
  
  /**
   * Checks if two evidence contents have contradictory pricing information
   * @param content1 First evidence content
   * @param content2 Second evidence content
   * @returns Boolean indicating if there's a price contradiction
   */
  private hasPriceContradiction(content1: string, content2: string): boolean {
    // This is a simplified implementation
    // In practice, this would involve more sophisticated natural language processing
    const priceRegex = /(\d+[.,]?\d*)\s*(vnd|đ|đồng)/gi;
    
    const prices1 = content1.match(priceRegex);
    const prices2 = content2.match(priceRegex);
    
    // If both contents mention prices, check if they're significantly different
    if (prices1 && prices2 && prices1.length > 0 && prices2.length > 0) {
      // For simplicity, we're just checking if the first price mentioned is different
      // A real implementation would be more comprehensive
      return prices1[0] !== prices2[0];
    }
    
    return false;
  }
  
  /**
   * Generates diagnostics information about the evidence quality
   * @param evidenceArray Array of evidence items
   * @returns Diagnostics information
   */
  generateDiagnostics(evidenceArray: Evidence[]): Array<{code: string, message: string, severity: 'low' | 'medium' | 'high'}> {
    const diagnostics: Array<{code: string, message: string, severity: 'low' | 'medium' | 'high'}> = [];
    
    // Check evidence diversity
    const evidenceTypes = new Set(evidenceArray.map(e => e.type));
    if (evidenceTypes.size < 3) {
      diagnostics.push({
        code: 'insufficient_evidence_diversity',
        message: `Only ${evidenceTypes.size} evidence types found. Need at least 3 distinct types.`,
        severity: 'medium'
      });
    }
    
    // Check for evidence completeness
    const essentialTypes = ['productPage', 'marketplace', 'review'];
    const missingTypes = essentialTypes.filter(type => !evidenceArray.some(e => e.type === type));
    if (missingTypes.length > 0) {
      diagnostics.push({
        code: 'missing_essential_evidence_types',
        message: `Missing essential evidence types: ${missingTypes.join(', ')}`,
        severity: 'high'
      });
    }
    
    // Check evidence recency (if timestamp is available)
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
}
