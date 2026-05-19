import AxiosInstance from "../api/AxiosIntance";
import { handleRequest } from "../api/apiHandler";

const BASE_PREFIX = 'users';

const UserService = {

    // for GET user http://localhost:8000/api/users (index)
    getAll: (params?: { 
        search?: string; 
        page?: number; 
        limit?: number;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
        filter?: 'active' | 'deleted' | 'all';
        vendor_id?: string | number; // Added to support vendor scoping
    }) => 
        handleRequest(
            AxiosInstance.get(`${BASE_PREFIX}`, { params }), 
            "Failed to fetch users"
        ),

    getStats: () =>
        handleRequest(
            AxiosInstance.get(`${BASE_PREFIX}/stats`),
            "Failed to fetch user statistics"
        ),
    
    // for GET user http://localhost:8000/api/users/{slug} (show)
    getOne: (slug: string) => 
        handleRequest(
            AxiosInstance.get(`${BASE_PREFIX}/${slug}`), 
            "Failed to fetch user details"
        ),
    
    // for CREATE user http://localhost:8000/api/users (create)
    create: (data: any) => 
        handleRequest(
            AxiosInstance.post(`${BASE_PREFIX}`, data), 
            "Failed to create user"
        ),
    
    // for UPDATE user http://localhost:8000/api/users/{id} (update)
    update: ( id: string | number, data: FormData, ) => 
        handleRequest(
            AxiosInstance.post(`${BASE_PREFIX}/${id}`, data), 
            "Failed to update user"
        ),
    
    // for DELETE user http://localhost:8000/api/users/{id} (destroy)
    delete: (id: string | number) => 
        handleRequest(
            AxiosInstance.delete(`${BASE_PREFIX}/${id}`), 
            "Failed to delete user"
        ),

    // for RESTORE user http://localhost:8000/api/users/{id}/restore (restore)
    restore: (id: string | number) =>
        handleRequest(
            AxiosInstance.post(`${BASE_PREFIX}/${id}/restore`),
            "Failed to restore user"
        ),
};

export default UserService;