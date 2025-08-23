import { UnfurlService } from './unfurl.service';
import type { UnfurlRequest } from './unfurl.schema';
export declare class UnfurlController {
    private readonly unfurl;
    constructor(unfurl: UnfurlService);
    unfurlUrl(body: UnfurlRequest): Promise<any>;
}
