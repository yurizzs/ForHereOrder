import type { OrderItem } from './orderItem';
export type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';

export interface Order {
    id: number;
    order_number: string;
    vendor_id: number;
    customer_id: number;
    customer_name: string;
    pickup_slot?: string;       // e.g., "10:30 AM (Recess)"
    total_amount: number;
    payment_method: 'cash' | 'digital';
    status: OrderStatus;
    notes?: string;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];       // TypeScript can find the name now!
}
