import { useState } from "react";
import Modal from "../../../components/ui/Modal";
import { notify } from "../../../util/notify";
import FoodService from "../../../services/FoodService";

interface FoodItem {
  id: string | number;
  name: string;
  category: string;
  price: string | number;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  food: FoodItem | null;
  onSuccess?: () => void;
};

const RestoreFoodModal = ({ isOpen, onClose, food, onSuccess }: Props) => {
  const [isRestoring, setIsRestoring] = useState(false);

  const handleConfirmRestore = async () => {
    if (!food) return;

    setIsRestoring(true);
    try {
      await FoodService.restore(food.id);
      notify.success("Food item restored successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      notify.error("Failed to restore food item");
      console.error(error);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restore Food Item"
      size="sm"
      primaryAction={{
        label: 'Restore',
        onClick: handleConfirmRestore,
        variant: 'primary',
        isLoading: isRestoring,
        loadingText: 'Restoring...'
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        variant: 'secondary',
      }}
    >
      <div className="space-y-3">
        <p className="text-sm text-text">
          Are you sure you want to restore {food?.name}? This item will be moved back to the active menu display.
        </p>
        {food && (
          <div className="bg-bg-light rounded-lg p-3 space-y-2 text-sm">
            <div>
              <span className="font-semibold text-text-muted">Item Name:</span> {food.name}
            </div>
            <div>
              <span className="font-semibold text-text-muted">Category:</span> <span className="capitalize">{food.category}</span>
            </div>
            <div>
              <span className="font-semibold text-text-muted">Base Price:</span> ₱{Number(food.price).toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RestoreFoodModal;