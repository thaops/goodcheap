// Local Evidence type for contracts (kept minimal to avoid coupling to feature modules)
export type Evidence = {
  id: string;
  type: string;
  source: string;
  content: string;
  timestamp?: string;
};

export const EVIDENCE_AGGREGATOR_TOKEN = 'EvidenceAggregator';

export interface EvidenceAggregatorInterface {
  /**
   * Aggregates evidence from multiple sources and removes duplicates
   * @param evidenceArray Array of evidence items from different sources
   * @returns Aggregated evidence array with duplicates removed
   */
  aggregateEvidence(evidenceArray: Evidence[]): Evidence[];
  
  /**
   * Cross-references evidence items to identify contradictions
   * @param evidenceArray Array of evidence items
   * @returns Array of contradictions found
   */
  crossReferenceEvidence(evidenceArray: Evidence[]): Array<{evidenceId1: string, evidenceId2: string, contradiction: string}>;
  
  /**
   * Generates diagnostics information about the evidence quality
   * @param evidenceArray Array of evidence items
   * @returns Diagnostics information
   */
  generateDiagnostics(evidenceArray: Evidence[]): Array<{code: string, message: string, severity: 'low' | 'medium' | 'high'}>;
}
