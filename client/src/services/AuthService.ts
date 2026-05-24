import AxiosInstance from "../api/AxiosIntance";
import { handleRequest } from "../api/apiHandler";

const AuthService = {

    /**
     * Fetch the CSRF cookie from Sanctum (required before login).
     */
    csrf: () =>
        AxiosInstance.get("/sanctum/csrf-cookie", {
            baseURL: import.meta.env.VITE_API_URL,
        }),

    /**
     * Login with username + password (session-based).
     */
    login: (credentials: { username: string; password: string }) =>
        handleRequest(
            AxiosInstance.post("auth/login", credentials),
            "Login failed.",
            { returnFullResponse: true }
        ),

    /**
     * Get the currently authenticated user.
     */
    me: () =>
        handleRequest(
            AxiosInstance.get("user/auth/me"),
            "Failed to fetch current user.",
            { silentStatuses: [401, 419] }
        ),

    /**
     * Logout the current user.
     */
    logout: () =>
        handleRequest(
            AxiosInstance.post("auth/logout"),
            "Logout failed."
        ),

    /**
     * Register a new student user.
     */
    registerStudent: (
        name: string,
        username: string,
        email: string,
        password: string,
        password_confirmation: string,
        phone?: string
    ) =>
        handleRequest(
            AxiosInstance.post("auth/register/student", {
                name,
                username,
                email,
                phone,
                password,
                password_confirmation,
            }),
            "Student registration failed"
        ),
};

export default AuthService;