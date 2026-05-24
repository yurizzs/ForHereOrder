// 3. Your core Menu registry
export interface Food {
    id: number;
    vendor_id: number;
    name: string;
    category: string;
    price: number;
    description?: string;
    image: string | null;
    track_stock: boolean;
    stock_qty: number;
    is_available: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
