import AxiosInstance from "../api/AxiosIntance";
import { handleRequest } from "../api/apiHandler";

const BASE_PREFIX = 'orders';

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

    getSettlement: (date?: string) => 
        handleRequest(
            AxiosInstance.get(`${BASE_PREFIX}/settlement`, { params: { date } }), 
            "Failed to fetch settlement report"
        ),
};

export default OrderService;
