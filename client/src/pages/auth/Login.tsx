import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ToastProvider } from "../../components/ui/index";
import { InputField, PasswordInputField } from "../../components/ui/forms/index";
import { useAuth } from "../../contexts/AuthContext";
import { notify } from "../../util/notify";
import { PATHS } from "../../routes/path";
import BrandLogo from "../../assets/react.svg"; // Replace with your actual ForHereOrder logo
import type { AxiosError } from "axios";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = (): boolean => {
        const newErrors: { username?: string; password?: string } = {};

        if (!username.trim()) {
            newErrors.username = "Merchant username or Stall ID is required.";
        }
        if (!password.trim()) {
            newErrors.password = "Password is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const userData = await login({ username, password });
            notify.success("Vendor terminal connected successfully!");
            
            // Redirect based on role
            if (userData.role === 'admin') {
                navigate(PATHS.APP.ADMIN_DASHBOARD, { replace: true });
            } else {
                navigate(PATHS.APP.VENDOR_DASHBOARD, { replace: true });
            }
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            const status = axiosErr.response?.status;
            const data = axiosErr.response?.data;

            if (status === 422 && data?.errors) {
                setErrors({
                    username: data.errors.username?.[0],
                    password: data.errors.password?.[0],
                });
            } else if (status === 401) {
                notify.error(data?.message || "Invalid merchant credentials.");
            } else {
                notify.error("Connection failed. Please check your network.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Centered Minimalist Base Wrapper */}
            <div className="min-h-screen w-full flex flex-col justify-between items-center p-6 bg-[#040815] text-slate-200 font-sans">
                
                {/* Header Section */}
                <div className="w-full flex justify-center pt-4">
                    <div className="flex items-center gap-2.5">
                        <img 
                            src={BrandLogo} 
                            alt="ForHereOrder Logo" 
                            className="w-7 h-7 object-contain" 
                        />
                        <h1 className="text-xl font-black uppercase tracking-tight text-white">
                            ForHere<span className="text-blue-500">Order</span>
                        </h1>
                    </div>
                </div>

                {/* Primary Interactive Box */}
                <div className="w-full max-w-md my-auto">
                    <div className="bg-[#0b1224] border border-slate-900 rounded-2xl p-6 md:p-8 shadow-xl">
                        
                        {/* Descriptive Block */}
                        <div className="mb-6 text-center">
                            <h2 className="text-xl font-extrabold text-white tracking-tight">
                                Vendor Portal Access
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Enter your vendor credentials to sync with the canteen terminal.
                            </p>
                        </div>

                        {/* Interactive Form */}
                        <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
                            <InputField
                                label="Merchant Username or Stall ID"
                                name="username"
                                type="text"
                                placeholder="stall-id@canteen.com"
                                iconName="FaStore"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                                }}
                                error={errors.username}
                                fullWidth
                                required
                            />

                            <PasswordInputField
                                label="Password"
                                name="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                                }}
                                error={errors.password}
                                fullWidth
                                required
                                autoComplete="current-password"
                            />

                            {/* Additional Actions Row */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5" 
                                    />
                                    <span className="text-xs text-slate-400">Remember terminal</span>
                                </label>
                                <Link
                                    to="#"
                                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                                    id="forgot-password-link"
                                >
                                    Forgot Pin?
                                </Link>
                            </div>

                            {/* Standard Submissions Trigger */}
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                isLoading={isLoading}
                                loadingText="Connecting..."
                                iconName="FaRightToBracket"
                                size="lg"
                                id="login-submit-btn"
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all mt-2"
                            >
                                Open Terminal Dashboard
                            </Button>
                        </form>

                    </div>

                    {/* Support Notification Context */}
                    <div className="mt-5 text-center">
                        <span className="text-xs text-slate-500">Stall deployment issues? </span>
                        <Link 
                            to="#" 
                            className="text-xs font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/20" 
                            id="register-link"
                        >
                            Contact System Admin
                        </Link>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="w-full flex justify-center pb-4 text-[10px] text-slate-600 font-bold tracking-wider uppercase">
                    <p>© {new Date().getFullYear()} ForHereOrder Systems. Secure Connection.</p>
                </div>

            </div>

            <ToastProvider />
        </>
    );
};

export default Login;