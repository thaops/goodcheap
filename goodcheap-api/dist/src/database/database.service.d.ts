import { ProductDTO } from '../common/types';
import { DatabaseInterface } from '../common/interfaces/database.interface';
export declare class DatabaseService implements DatabaseInterface {
    saveProduct(product: ProductDTO): Promise<void>;
    getProduct(productId: string): Promise<ProductDTO | null>;
    updateProduct(productId: string, updates: Partial<ProductDTO>): Promise<void>;
    saveProductAnalysis(analysis: any): Promise<void>;
    getProductAnalysis(url: string): Promise<any | null>;
}
