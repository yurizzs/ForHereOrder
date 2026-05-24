import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ToastProvider, Icon } from "../../components/ui";
import { InputField } from "../../components/ui/forms";
import { useAuth } from "../../contexts/AuthContext";
import { notify } from "../../util/notify";
import { PATHS } from "../../routes/path";
import AuthService from "../../services/AuthService";
import type { User } from "../../interfaces/user";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUserStateFromRegistration } = useAuth();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await AuthService.registerStudent(form.name, form.username, form.email, form.password, form.password_confirmation, form.phone);
      
      const registeredUser: User = response.data.user;
      const token: string | undefined = response.data.token;

      if (registeredUser) { // Token is handled by AuthService storing it
        if (token) {
          localStorage.setItem("auth_token", token);
        }
        setUserStateFromRegistration(registeredUser);
        notify.success("Registration successful! Welcome!");
        // Redirect to student dashboard
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
        setErrors(formattedErrors);
        notify.error("Please check the form for errors.");
      } else {
        notify.error(error.message || "Registration failed. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-primary-light to-primary-dark">
      <div className="bg-bg-dark text-text p-8 rounded-2xl shadow-2xl w-full max-w-md border border-border-muted">
        <div className="text-center mb-8">
          <Icon iconName="FaGraduationCap" className="text-5xl text-primary mb-4" />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
            Student Registration
          </h1>
          <p className="text-sm text-text-muted mt-2">
            Sign up to order food from your canteen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Full Name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            iconName="FaUser"
            placeholder="Juan Dela Cruz"
            error={errors.name}
            fullWidth
          />
          <InputField
            label="Username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            iconName="FaAt"
            placeholder="juandelacruz"
            error={errors.username}
            fullWidth
          />
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            iconName="FaEnvelope"
            placeholder="juan.delacruz@example.com"
            error={errors.email}
            fullWidth
          />
          <InputField
            label="Phone Number (Optional)"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            iconName="FaPhone"
            placeholder="+63 9xx xxx xxxx"
            error={errors.phone}
            fullWidth
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            iconName="FaLock"
            placeholder="Minimum 8 characters"
            error={errors.password}
            fullWidth
          />
          <InputField
            label="Confirm Password"
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            iconName="FaShieldHalved"
            placeholder="Repeat your password"
            error={errors.password_confirmation}
            fullWidth
          />

          <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
            Register Account
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link to={PATHS.LOGIN} className="text-primary hover:underline font-medium">
            Log In
          </Link>
        </p>
      </div>
      <ToastProvider />
    </div>
  );
};

export default Register;
