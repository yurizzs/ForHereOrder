export interface OrderItem {
    id: number;
    order_id: number;          // Connects this line item back to the main Order
    food_id: number;           // Connects this line item to your Food registry
    food_name: string;         // Snapshot copy (keeps the name safe if you edit the menu later)
    quantity: number;          // e.g., 2 (for 2x Sisig Rice Bowls)
    price_at_purchase: number; // Snapshot price (keeps revenue accurate even if menu prices change)
    subtotal?: number;
}
