export type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';

// 1. The individual items inside a student's pre-order slip
export interface OrderItem {
    id: number;
    order_id: number;          // Connects this line item back to the main Order
    food_id: number;           // Connects this line item to your Food registry
    food_name: string;         // Snapshot copy (keeps the name safe if you edit the menu later)
    quantity: number;          // e.g., 2 (for 2x Sisig Rice Bowls)
    price_at_purchase: number; // Snapshot price (keeps revenue accurate even if menu prices change)
}

// 2. The main Order metadata slip
export interface Order {
    id: number;
    order_number: string;
    customer_id: number;
    customer_name: string;
    pickup_slot?: string;       // e.g., "10:30 AM (Recess)"
    total_amount: number;
    status: OrderStatus;
    notes?: string;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];       // TypeScript can find the name now!
}

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