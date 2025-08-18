import { GeminiService } from '../ai/gemini.service';
import type { UnfurlInterface } from '../common/interfaces/unfurl.interface';
export declare class VideoController {
    private readonly ai;
    private readonly unfurl;
    constructor(ai: GeminiService, unfurl: UnfurlInterface);
    search(body: any): Promise<{
        youtube: any[];
        tiktok: any[];
        all: any[];
    }>;
}
