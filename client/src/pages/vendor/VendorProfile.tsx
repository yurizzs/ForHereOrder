import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import {
  Button,
  Icon,
  ToastProvider,
} from "../../components/ui";
import { InputField, FileUploadField } from "../../components/ui/forms";
import { useAuth } from "../../contexts/AuthContext";
import { notify } from "../../util/notify";
import UserService from "../../services/UserService";

interface ProfileFormData {
  name: string;
  username: string;
  phone: string;
  avatar: File | null;
  password?: string;
  password_confirmation?: string;
}

const VendorProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<ProfileFormData>({
    name: "",
    username: "",
    phone: "",
    avatar: null,
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        username: user.username || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileSelect = (files: File[]) => {
    setForm((prev) => ({ ...prev, avatar: files[0] || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("username", form.username);
      if (form.phone) formData.append("phone", form.phone);
      if (form.avatar) formData.append("avatar", form.avatar);
      if (form.password) {
        formData.append("password", form.password);
        formData.append("password_confirmation", form.password_confirmation || "");
      }

      await UserService.updateProfile(formData);
      await refreshUser();
      
      notify.success("Profile updated successfully!");
      setForm(prev => ({ ...prev, password: "", password_confirmation: "" }));
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
        notify.error(error.message || "Failed to update profile.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-text">
          Shop Profile Settings
        </h1>
        <p className="text-text-muted text-sm">
          Manage your vendor identity, contact information, and security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <div className="bg-bg-light border border-border-muted rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              {user?.avatar ? (
                <img
                  src={`${import.meta.env.VITE_STORAGE_URL}/${user.avatar}`}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <Icon iconName="FaStore" className="text-5xl text-primary" />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg text-text">{user?.name}</h2>
              <p className="text-xs text-text-muted uppercase tracking-widest font-black">
                {user?.role} Account
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
              <Icon iconName="FaCircleInfo" /> Tips
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Use a high-quality logo as your avatar to build trust with customers. 
              Ensure your contact number is active for order clarifications.
            </p>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-bg-light border border-border-muted rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FileUploadField
                  label="Update Shop Logo / Avatar"
                  name="avatar"
                  onFileSelect={handleFileSelect}
                  error={errors.avatar}
                />
              </div>

              <InputField
                label="Shop Name"
                name="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                iconName="FaStore"
                fullWidth
                required
                error={errors.name}
              />

              <InputField
                label="Public Username"
                name="username"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                iconName="FaAt"
                fullWidth
                required
                error={errors.username}
              />

              <InputField
                label="Contact Number"
                name="phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                iconName="FaPhone"
                fullWidth
                placeholder="+63 XXX XXX XXXX"
                error={errors.phone}
              />
            </div>

            <div className="pt-6 border-t border-border-muted">
              <h3 className="text-sm font-black uppercase tracking-widest text-text mb-6">
                Security & Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="New Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  iconName="FaLock"
                  fullWidth
                  placeholder="Leave blank to keep current"
                  error={errors.password}
                />
                <InputField
                  label="Confirm New Password"
                  name="password_confirmation"
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => handleChange("password_confirmation", e.target.value)}
                  iconName="FaShieldHalved"
                  fullWidth
                  placeholder="Repeat new password"
                  error={errors.password_confirmation}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                iconName="FaFloppyDisk"
                isLoading={isLoading}
                className="w-full md:w-auto px-12"
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
      <ToastProvider />
    </div>
  );

  return <MainLayout content={content} />;
};

export default VendorProfile;
