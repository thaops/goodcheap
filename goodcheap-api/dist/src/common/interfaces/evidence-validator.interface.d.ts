export type CommerceReviewResponse = {
    aiAnalysis?: any;
    analysis?: {
        aspects?: Array<{
            quotes?: Array<{
                text: string;
                evidenceId?: string;
            }>;
            fitFor?: Array<{
                text: string;
                evidenceId?: string;
            }>;
            [key: string]: unknown;
        }>;
        [key: string]: unknown;
    };
    reviews?: Array<{
        id: string;
        author?: string;
        rating: number;
        text: string;
        pros?: string[];
        cons?: string[];
        media?: string[];
        helpfulCount?: number;
        verifiedPurchase?: boolean;
        language?: string;
        date: string;
        source?: string;
        evidenceId?: string;
    }> | {
        topics?: Array<{
            evidenceId?: string;
            reviews?: Array<{
                evidenceId?: string;
            }>;
            [key: string]: unknown;
        }>;
        items?: Array<{
            evidenceId?: string;
        }>;
    };
    reviewSummary?: {
        topics?: Array<{
            name?: string;
            evidenceIds?: string[];
            [key: string]: unknown;
        }>;
        [key: string]: unknown;
    };
    evidence: Array<{
        id: string;
        type: string;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
};
export interface EvidenceValidatorInterface {
    validateEvidenceReferences(response: CommerceReviewResponse): Array<{
        path: string;
        error: string;
    }>;
    validateEvidenceArray(response: CommerceReviewResponse): Array<{
        path: string;
        error: string;
    }>;
    validate(response: CommerceReviewResponse): {
        isValid: boolean;
        errors: Array<{
            path: string;
            error: string;
        }>;
        status: 'valid' | 'invalid' | 'partial';
    };
}
