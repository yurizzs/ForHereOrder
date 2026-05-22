// 3. Your core Menu registry
export interface Food {
    id: number;
    name: string;
    category: string;
    price: number;
    description?: string;
    image: string;   // Add this! Stores the Laravel storage or S3 bucket path
    track_stock: boolean;
    stock_qty: number;
    is_available: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}