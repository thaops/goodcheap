import { UnfurlService } from './unfurl.service';
export declare class UnfurlController {
    private readonly unfurl;
    constructor(unfurl: UnfurlService);
    unfurlUrl(url: string): Promise<import("../common/types").ProductDTO>;
}
