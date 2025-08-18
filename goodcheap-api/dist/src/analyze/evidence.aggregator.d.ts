export type Evidence = {
    id: string;
    type: 'productPage' | 'marketplace' | 'review' | string;
    source: string;
    content: string;
    timestamp?: string;
};
export declare class EvidenceAggregator {
    aggregateEvidence(evidenceArray: Evidence[]): Evidence[];
    crossReferenceEvidence(evidenceArray: Evidence[]): Array<{
        evidenceId1: string;
        evidenceId2: string;
        contradiction: string;
    }>;
    private hasPriceContradiction;
    generateDiagnostics(evidenceArray: Evidence[]): Array<{
        code: string;
        message: string;
        severity: 'low' | 'medium' | 'high';
    }>;
}
