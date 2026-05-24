import AxiosInstance from "../api/AxiosIntance";
import { handleRequest } from "../api/apiHandler";

const BASE_PREFIX = 'orders';

export type CreatePreorderPayload = {
    pickup_slot: string;
    payment_method: 'cash' | 'digital';
    notes?: string;
    items: Array<{
        food_id: number;
        quantity: number;
    }>;
};

const OrderService = {
    getAll: (params?: { 
        status?: string; 
        date?: string; 
        page?: number; 
        limit?: number;
    }) => 
        handleRequest(
            AxiosInstance.get(`${BASE_PREFIX}`, { params }), 
            "Failed to fetch orders"
        ),

    updateStatus: (id: string | number, status: string) => 
        handleRequest(
            AxiosInstance.put(`${BASE_PREFIX}/${id}`, { status }), 
            "Failed to update order status"
        ),

    cancelOrder: (id: string | number) =>
        handleRequest(
            AxiosInstance.put(`${BASE_PREFIX}/${id}`, { status: 'Cancelled' }),
            "Failed to cancel order"
        ),

    createPreorder: (payload: CreatePreorderPayload) =>
        handleRequest(
            AxiosInstance.post(`${BASE_PREFIX}`, payload),
            "Failed to place preorder"
        ),

    getSettlement: (date?: string) => 
        handleRequest(
            AxiosInstance.get(`${BASE_PREFIX}/settlement`, { params: { date } }), 
            "Failed to fetch settlement report"
        ),
};

export default OrderService;
