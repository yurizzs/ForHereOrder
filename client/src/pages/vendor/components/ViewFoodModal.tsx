import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../../components/layouts';
import { Button, LoadingSpinner, Icon, ToastProvider } from '../../../components/ui';
import FoodService from '../../../services/FoodService';
import type { Food } from '../../../interfaces/food';
import { notify } from '../../../util/notify';
import { useDateFormatter } from '../../../hooks/index';
import { PATHS } from '../../../routes/path';
import EditFoodModal from './EditFoodModal';
import DeleteFoodModal from './DeleteFoodModal';

/* =========================
   DETAIL ROW
========================= */
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col gap-1 py-3 border-b border-border-muted last:border-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {label}
        </span>
        <span className="text-sm text-text font-medium">
            {value || <span className="text-text-muted italic">—</span>}
        </span>
    </div>
);

/* =========================
   BADGE
========================= */
const StatusBadge = ({ isAvailable }: { isAvailable: boolean }) => {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isAvailable
                ? 'bg-success/15 text-success'
                : 'bg-danger/15 text-danger'
                }`}
        >
            <Icon iconName={isAvailable ? 'FaCircleCheck' : 'FaCircleXmark'} size={12} />
            {isAvailable ? 'Available' : 'Out of Stock'}
        </span>
    );
};

/* =========================
   FOOD DETAIL PAGE
========================= */
const FoodDetail = () => {
    const { slug } = useParams<{ slug: string }>(); 
    const navigate = useNavigate();

    const [food, setFood] = useState<Food | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const dateFormat = useDateFormatter();

    /* =========================
       FETCH FOOD ITEM
    ========================= */
    const fetchFood = async () => {
        if (!slug) return;
        setIsLoading(true);
        try {
            const response = await FoodService.getOne(slug);
            setFood(response.data?.food ?? response.food ?? null);
        } catch (error) {
            notify.error("Failed to load food details");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFood();
    }, [slug]);

    /* =========================
       CONTENT
    ========================= */
    const content = (
        <div className="space-y-6">

            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    iconName="FaArrowLeft"
                    onClick={() => navigate(PATHS.APP.FOOD_CATALOG)}
                    className="text-text-muted hover:text-text"
                >
                    Back to Menu
                </Button>

                {!isLoading && food && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="primary"
                            iconName="FaPencil"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            Edit Item
                        </Button>
                        <Button
                            variant="danger"
                            iconName="FaTrash"
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            Delete
                        </Button>
                    </div>
                )}
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-24">
                    <LoadingSpinner size="md" text="Loading item details..." />
                </div>
            )}

            {/* Food Not Found */}
            {!isLoading && !food && (
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-24">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-danger/10">
                        <Icon iconName="FaUtensils" className="text-3xl text-danger" />
                    </div>
                    <h2 className="text-lg font-semibold text-text">Food Item Not Found</h2>
                    <p className="text-sm text-text-muted">
                        The dish you're looking for doesn't exist or may have been removed from the catalog.
                    </p>
                    <Button variant="primary" iconName="FaArrowLeft" onClick={() => navigate(PATHS.APP.FOOD_CATALOG)}>
                        Back to Menu
                    </Button>
                </div>
            )}

            {/* Food Detail Card */}
            {!isLoading && food && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left — Thumbnail image + Status banner */}
                    <div className="lg:col-span-1">
                        <div className="bg-bg-light border border-border-muted rounded-2xl p-6 flex flex-col items-center text-center gap-4">

                            {/* Image cover photo */}
                            {food.image ? (
                                <img
                                    src={`${import.meta.env.VITE_STORAGE_URL}/${food.image}`}
                                    alt={food.name}
                                    className="w-full aspect-square rounded-xl object-cover ring-1 ring-border-muted"
                                />
                            ) : (
                                <div className="w-full aspect-square rounded-xl bg-primary/10 flex items-center justify-center text-5xl text-primary">
                                    <Icon iconName="FaUtensils" />
                                </div>
                            )}

                            {/* Title & Status */}
                            <div className="space-y-1.5 w-full">
                                <h2 className="text-lg font-bold text-text truncate">{food.name}</h2>
                                <span className="block text-xs font-medium text-text-muted capitalize bg-bg/50 py-1 px-2.5 rounded-md inline-block">
                                    {food.category}
                                </span>
                            </div>

                            <div className="w-full pt-2 border-t border-border-muted flex justify-between items-center text-sm">
                                <span className="text-text-muted">Status:</span>
                                <StatusBadge isAvailable={food.is_available ?? true} />
                            </div>

                            <div className="w-full flex justify-between items-center text-sm">
                                <span className="text-text-muted">Price:</span>
                                <span className="font-bold text-lg text-primary">₱{Number(food.price).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right — Technical and Metadata Rows */}
                    <div className="lg:col-span-2">
                        <div className="bg-bg-light border border-border-muted rounded-2xl p-6 space-y-0">

                            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-2 pb-3 border-b border-border-muted">
                                Menu Specifications
                            </h3>

                            <DetailRow label="Dish Name" value={food.name} />
                            <DetailRow label="Category / Section" value={<span className="capitalize">{food.category}</span>} />
                            <DetailRow label="Base Selling Price" value={`₱${Number(food.price).toFixed(2)}`} />
                            
                            <DetailRow 
                                label="Description" 
                                value={
                                    <p className="text-sm text-text leading-relaxed font-normal whitespace-pre-line">
                                        {food.description}
                                    </p>
                                } 
                            />

                            <DetailRow
                                label="Added to Inventory"
                                value={dateFormat.dateTime(food.created_at)}
                            />
                            <DetailRow
                                label="Last Modified"
                                value={dateFormat.dateTime(food.updated_at)}
                            />
                        </div>
                    </div>

                </div>
            )}

            <EditFoodModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    fetchFood();
                }}
                food={food}
                onSuccess={() => {
                    fetchFood();
                }}
            />

            <DeleteFoodModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                food={food}
                onSuccess={() => navigate(PATHS.APP.FOOD_CATALOG)}
            />

            <ToastProvider />
        </div>
    );

    return <MainLayout content={content} />;
};

export default FoodDetail;