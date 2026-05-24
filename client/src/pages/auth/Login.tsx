import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ToastProvider, Icon } from "../../components/ui/index";
import { InputField, PasswordInputField } from "../../components/ui/forms/index";
import { useAuth } from "../../contexts/AuthContext";
import { notify } from "../../util/notify";
import { PATHS } from "../../routes/path";
import BrandLogo from "../../assets/react.svg";
import AuthService from "../../services/AuthService";
import type { User } from "../../interfaces/user";
import type { AxiosError } from "axios";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, setUserStateFromRegistration } = useAuth();
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Login state
    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [loginErrors, setLoginErrors] = useState<{ username?: string; password?: string }>({});

    // Register state
    const [registerData, setRegisterData] = useState({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });
    const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

    const validateLogin = (): boolean => {
        const newErrors: { username?: string; password?: string } = {};
        if (!loginData.username.trim()) {
            newErrors.username = "Username or email is required.";
        }
        if (!loginData.password.trim()) {
            newErrors.password = "Password is required.";
        }
        setLoginErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateLogin()) return;

        setIsLoading(true);
        try {
            const userData = await login({ username: loginData.username, password: loginData.password });
            notify.success("Login successful!");
            
            if (userData.role === 'admin') {
                navigate(PATHS.APP.ADMIN_DASHBOARD, { replace: true });
            } else if (userData.role === 'vendor') {
                navigate(PATHS.APP.VENDOR_DASHBOARD, { replace: true });
            } else {
                navigate(PATHS.APP.STUDENT_DASHBOARD, { replace: true });
            }
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            const status = axiosErr.response?.status;
            const data = axiosErr.response?.data;

            if (status === 422 && data?.errors) {
                setLoginErrors({
                    username: data.errors.username?.[0],
                    password: data.errors.password?.[0],
                });
            } else if (status === 401) {
                notify.error(data?.message || "Invalid credentials.");
            } else {
                notify.error("Connection failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegisterData((prev) => ({ ...prev, [name]: value }));
        if (registerErrors[name]) {
            setRegisterErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setRegisterErrors({});

        try {
            const response = await AuthService.registerStudent(
                registerData.name,
                registerData.username,
                registerData.email,
                registerData.password,
                registerData.password_confirmation,
                registerData.phone
            );
            
            const registeredUser: User = response.data.user;

            if (registeredUser) {
                setUserStateFromRegistration(registeredUser);
                notify.success("Registration successful! Welcome!");
                navigate(PATHS.APP.STUDENT_DASHBOARD);
            } else {
                notify.error("Registration failed. Please try again.");
            }
        } catch (error: any) {
            const validationErrors = error.response?.data?.errors;
            if (validationErrors) {
                const formattedErrors: Record<string, string> = {};
                for (const [key, value] of Object.entries(validationErrors)) {
                    formattedErrors[key] = (value as string[])[0];
                }
                setRegisterErrors(formattedErrors);
                notify.error("Please check the form for errors.");
            } else {
                notify.error(error.message || "Registration failed. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes flipIn {
                    from {
                        opacity: 0;
                        transform: rotateY(90deg);
                    }
                    to {
                        opacity: 1;
                        transform: rotateY(0deg);
                    }
                }
                
                @keyframes flipOut {
                    from {
                        opacity: 1;
                        transform: rotateY(0deg);
                    }
                    to {
                        opacity: 0;
                        transform: rotateY(-90deg);
                    }
                }

                .flip-container {
                    perspective: 1000px;
                }

                .flip-card {
                    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    transform-style: preserve-3d;
                }

                .flip-card.flipped {
                    animation: flipIn 0.6s ease-in-out forwards;
                }

                .flip-card:not(.flipped) {
                    animation: flipIn 0.6s ease-in-out forwards;
                }
            `}
            </style>

            <div className="flip-container min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
                <div className="w-full max-w-5xl h-[600px]">
                    <div className={`flip-card ${isFlipped ? 'flipped' : ''} w-full h-full relative`}>
                        {/* ==================== LOGIN SIDE ==================== */}
                        {!isFlipped && (
                            <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
                                {/* Left: Login Form */}
                                <div className="flex flex-col justify-center p-8 md:p-12 order-2 md:order-1">
                                    <div className="mb-8">
                                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Welcome Back</h2>
                                        <p className="text-gray-600">Sign in to your account to continue</p>
                                    </div>

                                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                                        <InputField
                                            label="Username or Email"
                                            name="username"
                                            type="text"
                                            placeholder="Enter your username"
                                            iconName="FaUser"
                                            value={loginData.username}
                                            onChange={(e) => {
                                                setLoginData((prev) => ({ ...prev, username: e.target.value }));
                                                if (loginErrors.username) setLoginErrors((prev) => ({ ...prev, username: undefined }));
                                            }}
                                            error={loginErrors.username}
                                            fullWidth
                                            required
                                        />

                                        <PasswordInputField
                                            label="Password"
                                            name="password"
                                            placeholder="Enter your password"
                                            value={loginData.password}
                                            onChange={(e) => {
                                                setLoginData((prev) => ({ ...prev, password: e.target.value }));
                                                if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: undefined }));
                                            }}
                                            error={loginErrors.password}
                                            fullWidth
                                            required
                                            autoComplete="current-password"
                                        />

                                        <div className="flex justify-end">
                                            <a href="#" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                                Forgot password?
                                            </a>
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            fullWidth
                                            isLoading={isLoading}
                                            loadingText="Signing in..."
                                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all"
                                        >
                                            Sign In
                                        </Button>
                                    </form>

                                    <div className="mt-6 text-center">
                                        <p className="text-gray-600 text-sm">
                                            Don't have an account?{" "}
                                            <button
                                                onClick={() => setIsFlipped(true)}
                                                className="text-orange-600 hover:text-orange-700 font-bold transition-colors"
                                            >
                                                Register here
                                            </button>
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Branding */}
                                <div className="hidden md:flex md:order-2 flex-col justify-center items-center bg-gradient-to-br from-orange-500 to-red-600 p-12 text-white">
                                    <img 
                                        src={BrandLogo} 
                                        alt="ForHereOrder Logo" 
                                        className="w-20 h-20 object-contain mb-6 drop-shadow-lg" 
                                    />
                                    <h1 className="text-4xl md:text-5xl font-black mb-4 text-center">
                                        ForHereOrder
                                    </h1>
                                    <p className="text-lg text-center text-orange-100 max-w-xs">
                                        Order delicious food from your favorite canteen vendors
                                    </p>
                                    <div className="mt-8 w-12 h-1 bg-yellow-300 rounded-full"></div>
                                </div>
                            </div>
                        )}

                        {/* ==================== REGISTER SIDE ==================== */}
                        {isFlipped && (
                            <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
                                {/* Left: Branding */}
                                <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-orange-500 to-red-600 p-12 text-white">
                                    <img 
                                        src={BrandLogo} 
                                        alt="ForHereOrder Logo" 
                                        className="w-20 h-20 object-contain mb-6 drop-shadow-lg" 
                                    />
                                    <h1 className="text-4xl md:text-5xl font-black mb-4 text-center">
                                        ForHereOrder
                                    </h1>
                                    <p className="text-lg text-center text-orange-100 max-w-xs">
                                        Join our community and start ordering now
                                    </p>
                                    <div className="mt-8 w-12 h-1 bg-yellow-300 rounded-full"></div>
                                </div>

                                {/* Right: Registration Form */}
                                <div className="flex flex-col justify-center p-8 md:p-12 overflow-y-auto max-h-[600px]">
                                    <div className="mb-6">
                                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Create Account</h2>
                                        <p className="text-gray-600 text-sm">Sign up to order from your favorite stalls</p>
                                    </div>

                                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                        <InputField
                                            label="Full Name"
                                            name="name"
                                            type="text"
                                            placeholder="Juan Dela Cruz"
                                            iconName="FaUser"
                                            value={registerData.name}
                                            onChange={handleRegisterChange}
                                            error={registerErrors.name}
                                            fullWidth
                                        />

                                        <InputField
                                            label="Username"
                                            name="username"
                                            type="text"
                                            placeholder="juandelacruz"
                                            iconName="FaAt"
                                            value={registerData.username}
                                            onChange={handleRegisterChange}
                                            error={registerErrors.username}
                                            fullWidth
                                        />

                                        <InputField
                                            label="Email"
                                            name="email"
                                            type="email"
                                            placeholder="juan@example.com"
                                            iconName="FaEnvelope"
                                            value={registerData.email}
                                            onChange={handleRegisterChange}
                                            error={registerErrors.email}
                                            fullWidth
                                        />

                                        <InputField
                                            label="Phone (Optional)"
                                            name="phone"
                                            type="tel"
                                            placeholder="+63 9xx xxx xxxx"
                                            iconName="FaPhone"
                                            value={registerData.phone}
                                            onChange={handleRegisterChange}
                                            error={registerErrors.phone}
                                            fullWidth
                                        />

                                        <PasswordInputField
                                            label="Password"
                                            name="password"
                                            placeholder="Min 8 characters"
                                            value={registerData.password}
                                            onChange={handleRegisterChange}
                                            error={registerErrors.password}
                                            fullWidth
                                        />

                                        <PasswordInputField
                                            label="Confirm Password"
                                            name="password_confirmation"
                                            placeholder="Repeat your password"
                                            value={registerData.password_confirmation}
                                            onChange={handleRegisterChange}
                                            error={registerErrors.password_confirmation}
                                            fullWidth
                                        />

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            fullWidth
                                            isLoading={isLoading}
                                            loadingText="Creating account..."
                                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all"
                                        >
                                            Create Account
                                        </Button>
                                    </form>

                                    <div className="mt-4 text-center">
                                        <p className="text-gray-600 text-sm">
                                            Already have an account?{" "}
                                            <button
                                                onClick={() => setIsFlipped(false)}
                                                className="text-orange-600 hover:text-orange-700 font-bold transition-colors"
                                            >
                                                Sign in
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500">
                    © {new Date().getFullYear()} ForHereOrder. All rights reserved.
                </div>
            </div>

            <ToastProvider />
        </>
    );
};

export default Login;