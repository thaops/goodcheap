import { ProductDTO } from '../types';

export interface UnfurlInterface {
  fromUrl(url: string): Promise<ProductDTO>;
  expandUrl(url: string): Promise<string>;
  fetchHtml(url: string): Promise<string>;
}
