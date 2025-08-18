export type Evidence = {
    id: string;
    type: string;
    source: string;
    content: string;
    timestamp?: string;
};
export declare const EVIDENCE_AGGREGATOR_TOKEN = "EvidenceAggregator";
export interface EvidenceAggregatorInterface {
    aggregateEvidence(evidenceArray: Evidence[]): Evidence[];
    crossReferenceEvidence(evidenceArray: Evidence[]): Array<{
        evidenceId1: string;
        evidenceId2: string;
        contradiction: string;
    }>;
    generateDiagnostics(evidenceArray: Evidence[]): Array<{
        code: string;
        message: string;
        severity: 'low' | 'medium' | 'high';
    }>;
}
