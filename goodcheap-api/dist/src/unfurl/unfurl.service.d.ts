import { ProductDTO } from '../common/types';
import { UnfurlInterface } from '../common/interfaces/unfurl.interface';
export declare class UnfurlService implements UnfurlInterface {
    private ensureValidUrl;
    expandUrl(url: string): Promise<string>;
    private detectSource;
    private parseTiktokOgInfo;
    fetchHtml(url: string): Promise<string>;
    fromUrl(url: string): Promise<ProductDTO>;
}
