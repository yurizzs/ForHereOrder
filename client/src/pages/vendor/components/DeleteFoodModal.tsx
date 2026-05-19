import { useState } from "react";
import Modal from "../../../components/ui/Modal";
import { notify } from "../../../util/notify";
import FoodService from "../../../services/FoodService";

// Assuming you have an interface for food items that looks similar to this
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
  isPermanentDelete?: boolean;
  onSuccess?: () => void;
};

const DeleteFoodModal = ({ isOpen, onClose, food, isPermanentDelete = false, onSuccess }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!food) return;

    setIsDeleting(true);
    try {
      // Direct pass to your backend API service handler 
      await FoodService.delete(food.id);
      
      const deleteType = isPermanentDelete ? 'permanently' : 'moved to trash';
      notify.success(`Food item ${deleteType} successfully!`);
      
      onSuccess?.();
      onClose();
    } catch (error) {
      notify.error("Failed to delete food item");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isPermanentDelete ? 'Permanently Delete Food Item' : 'Delete Food Item'}
      size="sm"
      primaryAction={{
        label: 'Delete',
        onClick: handleConfirmDelete,
        variant: 'danger',
        isLoading: isDeleting,
        loadingText: 'Deleting...'
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        variant: 'secondary',
      }}
    >
      <div className="space-y-3">
        <p className="text-sm text-text">
          {isPermanentDelete
            ? `Are you sure you want to permanently delete ${food?.name}? This action cannot be undone and will affect mobile application sales records.`
            : `Are you sure you want to remove ${food?.name} from the active menu? It can be recovered from the deleted items archive later.`}
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

export default DeleteFoodModal;