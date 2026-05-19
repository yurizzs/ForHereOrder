import AxiosInstance from "../api/AxiosIntance";
import { handleRequest } from "../api/apiHandler";

const BASE_PREFIX = 'foodservices';

const FoodService = {

    // for GET food services http://localhost:8000/api/foodservices (index)
    getAll: (params?: { 
        search?: string; 
        page?: number; 
        limit?: number;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
        filter?: 'active' | 'deleted' | 'all';
        category?: string;            // Filter by culinary category (e.g., Fast Food, Bakery)
        status?: 'open' | 'closed';   // Operational status filtering
        vendor_id?: string | number;  // Support vendor scoping
    }) => 
        handleRequest(
            AxiosInstance.get(`${BASE_PREFIX}`, { params }), 
            "Failed to fetch food services"
        ),

    // for GET performance/analytics stats http://localhost:8000/api/foodservices/stats
    getStats: () =>
        handleRequest(
            AxiosInstance.get(`${BASE_PREFIX}/stats`),
            "Failed to fetch food service statistics"
        ),
    
    // for GET single food service http://localhost:8000/api/foodservices/{slug} (show)
    getOne: (slug: string) => 
        handleRequest(
            AxiosInstance.get(`${BASE_PREFIX}/${slug}`), 
            "Failed to fetch food service details"
        ),
    
    // for CREATE food service http://localhost:8000/api/foodservices (create)
    create: (data: any) => 
        handleRequest(
            AxiosInstance.post(`${BASE_PREFIX}`, data), 
            "Failed to create food service"
        ),
    
    // for UPDATE food service http://localhost:8000/api/foodservices/{id} (update)
    // Uses FormData to cleanly support file uploads like restaurant logos or banner images
    update: (id: string | number, data: FormData) => 
        handleRequest(
            AxiosInstance.post(`${BASE_PREFIX}/${id}`, data), 
            "Failed to update food service"
        ),
    
    // for DELETE food service http://localhost:8000/api/foodservices/{id} (destroy)
    delete: (id: string | number) => 
        handleRequest(
            AxiosInstance.delete(`${BASE_PREFIX}/${id}`), 
            "Failed to delete food service"
        ),

    // for RESTORE soft-deleted food service http://localhost:8000/api/foodservices/{id}/restore (restore)
    restore: (id: string | number) =>
        handleRequest(
            AxiosInstance.post(`${BASE_PREFIX}/${id}/restore`),
            "Failed to restore food service"
        ),
};

export default FoodService;