import { ProductDTO } from '../types';
export interface DatabaseInterface {
    saveProduct(product: ProductDTO): Promise<void>;
    getProduct(productId: string): Promise<ProductDTO | null>;
    updateProduct(productId: string, updates: Partial<ProductDTO>): Promise<void>;
}
