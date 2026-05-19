import { useState } from "react";
import Modal from "../../../components/ui/Modal";
import { notify } from "../../../util/notify";
import { InputField, FileUploadField, Radio } from "../../../components/ui/forms";
import FoodService from "../../../services/FoodService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendorId: string;
};

interface FoodFormData {
  image: File | null;
  name: string;
  category: string;
  price: string; // Kept as string for form input parsing safely
  track_stock: "true" | "false"; // String value representation for handling form selection states
  stock_qty: string;
  is_available: "true" | "false";
}

interface FormErrors {
  [key: string]: string;
}

const CreateFoodModal = ({ isOpen, onClose, onSuccess, vendorId }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const initialFormState: FoodFormData = {
    image: null,
    name: "",
    category: "",
    price: "",
    track_stock: "false",
    stock_qty: "0",
    is_available: "true",
  };

  const [form, setForm] = useState<FoodFormData>(initialFormState);

  const handleFileSelect = (files: File[]) => {
    setForm((prev) => ({
      ...prev,
      image: files[0] || null,
    }));
    
    if (errors.image) {
      setErrors((prev) => {
        const { image, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("vendor_id", vendorId);
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("price", form.price);
      
      // Convert UI string options to actual boolean flags for Laravel backend consumption
      const isTrackingStock = form.track_stock === "true";
      formData.append("track_stock", isTrackingStock ? "1" : "0");
      formData.append("stock_qty", isTrackingStock ? form.stock_qty : "0");
      formData.append("is_available", form.is_available === "true" ? "1" : "0");

      if (form.image) {
        formData.append("image", form.image);
      }

      await FoodService.create(formData);
      
      notify.success("Food item registered in menu database!");
      setForm({ ...initialFormState });
      setErrors({});
      onClose();
      onSuccess();
    } catch (error: any) {
      const validationErrors = error.response?.data?.errors;

      if (validationErrors && typeof validationErrors === 'object') {
        const formattedErrors: FormErrors = {};
        for (const [field, messages] of Object.entries(validationErrors)) {
          if (Array.isArray(messages) && messages.length > 0) {
            formattedErrors[field] = messages[0] as string;
          }
        }
        notify.error("Some fields are incomplete or contain invalid information. Please review them.");
        setErrors(formattedErrors);
      } else {
        notify.error(error?.message || "Failed to add food item");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Menu Item"
      size="md"
      primaryAction={{
        label: "Save Item",
        onClick: handleSubmit,
        variant: "primary",
        iconName: "FaFloppyDisk",
        isLoading,
        loadingText: "Saving Plate..."
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: onClose,
        variant: "secondary",
      }}
    >
      <form className="space-y-4">
        <FileUploadField
          label="Display Image"
          name="image"
          accept="image/jpg,image/jpeg,image/png"
          onFileSelect={handleFileSelect}
          error={errors.image}
          fullWidth
        />

        <InputField
          name="name"
          label="Dish Name"
          type="text"
          placeholder="e.g., Sizzling Pork Sisig"
          required
          fullWidth
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          iconName="FaBowlFood"
          error={errors.name}
        />

        <InputField
          name="category"
          label="Category Block"
          type="text"
          placeholder="e.g., Pork, Seafood, Noodles, Drinks"
          required
          fullWidth
          value={form.category}
          onChange={(e) => handleChange("category", e.target.value)}
          iconName="FaTags"
          error={errors.category}
        />

        <InputField
          name="price"
          label="Unit Cost (PHP)"
          type="number"
          placeholder="0.00"
          required
          fullWidth
          value={form.price}
          onChange={(e) => handleChange("price", e.target.value)}
          iconName="FaPesoSign"
          error={errors.price}
        />

        {/* INVENTORY TRACKING CONFIGURATOR */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-text-muted font-semibold uppercase tracking-wider ml-1">
            Track Stock Quantities?
          </label>
          <div className="inline-flex gap-4">
            <Radio 
              name="track_stock" 
              label="Infinite Supply" 
              value="false" 
              checked={form.track_stock === "false"} 
              onChange={() => handleChange("track_stock", "false")}
            />
            <Radio 
              name="track_stock" 
              label="Limited Quantities" 
              value="true" 
              checked={form.track_stock === "true"} 
              onChange={() => handleChange("track_stock", "true")}
            />
          </div>
        </div>

        {/* NUMERIC COUNTER CONTROLLER PANEL */}
        {form.track_stock === "true" && (
          <InputField
            name="stock_qty"
            label="Initial Stock Inventory Level"
            type="number"
            placeholder="How many portions are ready in the kitchen?"
            required
            fullWidth
            value={form.stock_qty}
            onChange={(e) => handleChange("stock_qty", e.target.value)}
            iconName="FaBoxesStacked"
            error={errors.stock_qty}
          />
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm text-text-muted font-semibold uppercase tracking-wider ml-1">
            Instant Availability Status
          </label>
          <div className="inline-flex gap-4">
            <Radio 
              name="is_available" 
              label="Active / Ordering Visible" 
              value="true" 
              checked={form.is_available === "true"} 
              onChange={() => handleChange("is_available", "true")}
            />
            <Radio 
              name="is_available" 
              label="Hidden / Suspended" 
              value="false" 
              checked={form.is_available === "false"} 
              onChange={() => handleChange("is_available", "false")}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateFoodModal;