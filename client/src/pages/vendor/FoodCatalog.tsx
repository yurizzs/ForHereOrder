import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "../../components/layouts";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TablePagination,
} from "../../components/ui/table/Table";
import {
  Button,
  ToastProvider,
  LoadingSpinner,
  Icon,
} from "../../components/ui";
import { InputField } from "../../components/ui/forms";
import CreateFoodModal from "./components/CreateFoodModal";
import EditFoodModal from "./components/EditFoodModal";
import DeleteFoodModal from "./components/DeleteFoodModal";
import FoodService from "../../services/FoodService";
import type { Food } from "../../interfaces/food";
import { notify } from "../../util/notify";
import { useDebounce } from "../../hooks/index";

/* ==========================================================================
   TYPES & INTERFACES
   ========================================================================== */
type SortState = {
  key: keyof Food;
  direction: "asc" | "desc";
};

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const FoodCatalog = () => {
  const { vendorId } = useParams<{ vendorId: string }>();

  /* ==========================================================================
     STATE MANAGEMENT
     ========================================================================== */
  const [Foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const [sort, setSort] = useState<SortState>({
    key: "name",
    direction: "asc",
  });

  const [availabilityFilter, setAvailabilityFilter] = useState<
    "all" | "available" | "low_stock" | "out_of_stock"
  >("all");
  const filters = {
    all: { icon: "FaList", label: "Complete Menu" },
    available: { icon: "FaCircleCheck", label: "In Stock" },
    low_stock: { icon: "FaTriangleExclamation", label: "Low Stock Alerts" },
    out_of_stock: { icon: "FaCircleXmark", label: "Sold Out" },
  } as const;

  const [searchTerm, setSearchTerm] = useState("");
  const isSearching = searchTerm?.trim() !== "";
  const debouncedSearchTerm = useDebounce(searchTerm);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ==========================================================================
     MODAL & DATA INTERACTION STATE
     ========================================================================== */
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(
    null,
  );

  /* ==========================================================================
     CORE DATA SYNC ENGINE
     ========================================================================== */
  const fetchMenuCatalog = async (currentPage = page, pageLimit = pageSize) => {
    if (!vendorId) return;
    setIsLoading(true);

    try {
      const response = await FoodService.getByVendor(vendorId, {
        page: currentPage,
        limit: pageLimit,
        search: debouncedSearchTerm,
        sort_by: sort.key,
        sort_order: sort.direction,
        filter_status: availabilityFilter,
      });

      const responsePayload = response.data || response;
      setFoods(
        responsePayload.data || responsePayload.items || responsePayload || [],
      );

      if (responsePayload.meta) {
        setPagination({
          current_page: responsePayload.meta.current_page || currentPage,
          last_page: responsePayload.meta.last_page || 1,
          per_page: responsePayload.meta.per_page || pageLimit,
          total: responsePayload.meta.total || 0,
        });
      }
    } catch (error) {
      notify.error("Could not load menu metrics from database parameters");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuCatalog(page, pageSize);
  }, [vendorId, page, pageSize, sort, debouncedSearchTerm, availabilityFilter]);

  /* ==========================================================================
     ACTION & ROUTING EVENT HANDLERS
     ========================================================================== */
  const handleFilterChange = (newFilter: typeof availabilityFilter) => {
    setAvailabilityFilter(newFilter);
    setPage(1);
  };

  const handleSort = (key: keyof Food) => {
    setPage(1);
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleEditItem = (item: Food) => {
    setSelectedFood(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteItem = (item: Food) => {
    setSelectedFood(item);
    setIsDeleteModalOpen(true);
  };

  const handleActionSuccess = async () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedFood(null);

    const currentLength = Foods.length;
    const targetPage = currentLength === 1 && page > 1 ? page - 1 : page;
    setPage(targetPage);

    await fetchMenuCatalog(targetPage, pageSize);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedFood(null);
  };

  /* ==========================================================================
     RENDER INTERFACE COMPONENT
     ========================================================================== */
  const content = (
    <div className="space-y-6">
      {/* Search & Global Action Bar */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <InputField
            label="Dish Registry & Live Inventories"
            name="search"
            placeholder="Search catalog by plate name, ingredient variations, or categorization codes..."
            fullWidth
            iconName="FaMagnifyingGlass"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button
          variant="primary"
          iconName="FaPlus"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Menu Item
        </Button>
      </div>

      {/* Segment Filter Tabs */}
      <div className="gap-2 bg-bg-light rounded-xl p-1 flex flex-wrap w-fit">
        {(Object.keys(filters) as Array<keyof typeof filters>).map((f) => {
          const { icon, label } = filters[f];
          return (
            <Button
              key={f}
              variant="primary"
              onClick={() => handleFilterChange(f)}
              iconName={icon}
              className={`relative px-4 py-2.5 rounded-lg font-semibold uppercase text-xs transition-all duration-300 flex items-center gap-2 group ${
                availabilityFilter === f
                  ? "bg-primary text-bg-dark shadow-lg shadow-primary/30"
                  : "bg-transparent text-text hover:bg-bg-light/50"
              }`}
            >
              <span>{label}</span>
              {availabilityFilter === f && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary/0 via-primary to-primary/0 rounded-full" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Main Table View */}
      <Table>
        <TableHeader>
          <tr>
            <TableCell isHeader>Display Image</TableCell>
            <TableCell
              isHeader
              sortKey="name"
              currentSort={sort}
              onSort={handleSort}
            >
              Dish Identity
            </TableCell>
            <TableCell
              isHeader
              sortKey="category"
              currentSort={sort}
              onSort={handleSort}
            >
              Category Block
            </TableCell>
            <TableCell
              isHeader
              sortKey="price"
              currentSort={sort}
              onSort={handleSort}
            >
              Unit Cost
            </TableCell>
            <TableCell
              isHeader
              sortKey="stock_qty"
              currentSort={sort}
              onSort={handleSort}
            >
              Stocks Available
            </TableCell>
            <TableCell isHeader>System Availability</TableCell>
            <TableCell isHeader>Administrative Control</TableCell>
          </tr>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex items-center justify-center w-full">
                  <LoadingSpinner
                    size="md"
                    text={
                      isSearching
                        ? "Polling filter records..."
                        : "Reading active vendor storage layers..."
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          ) : Foods.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4 w-full">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-bg-light/50">
                    <Icon
                      iconName="FaBowlFood"
                      className="text-3xl text-text-muted"
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-text">
                    No Plates Registered
                  </h2>
                  <p className="text-sm text-center text-text-muted max-w-sm">
                    No individual menu blueprints map to your filter conditions.
                    Adjust filters to search broader scopes.
                  </p>
                  <Button
                    variant="primary"
                    iconName="FaPlus"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Register New Dish
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            Foods.map((item) => {
              const isLowStock =
                item.track_stock && item.stock_qty <= 5 && item.stock_qty > 0;
              const isOutOfStock =
                !item.is_available ||
                (item.track_stock && item.stock_qty === 0);

              return (
                <TableRow
                  key={item.id}
                  className={isOutOfStock ? "opacity-60 bg-bg-light/10" : ""}
                >
                  <TableCell>
                    {item.image ? (
                      <img
                        src={`${import.meta.env.VITE_STORAGE_URL}/${item.image}`}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-bg-light"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon iconName="FaUtensils" className="text-sm" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-text">
                    {item.name}
                  </TableCell>
                  <TableCell className="capitalize text-xs text-text-muted">
                    {item.category}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-success font-semibold">
                    ₱{item.price.toFixed(2)}
                  </TableCell>

                  <TableCell>
                    {item.track_stock ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isOutOfStock
                              ? "text-danger"
                              : isLowStock
                                ? "text-warning animate-pulse"
                                : "text-text"
                          }`}
                        >
                          {item.stock_qty} available
                        </span>
                        {isLowStock && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-warning/10 text-warning border border-warning/20 rounded-md font-bold uppercase tracking-wider">
                            Low
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-muted text-xs flex items-center gap-1 font-medium">
                        <Icon
                          iconName="FaInfinity"
                          className="text-xs text-primary"
                        />{" "}
                        Infinite Tracking
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        isOutOfStock
                          ? "bg-danger/10 text-danger border border-danger/20"
                          : "bg-success/10 text-success border border-success/20"
                      }`}
                    >
                      {isOutOfStock ? "Sold Out" : "Active"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2 items-center justify-start">
                      <Button
                        size="sm"
                        variant="ghost"
                        iconName="FaPencil"
                        tooltip="Edit Configuration Details"
                        tooltipPosition="top"
                        className="text-info hover:text-info hover:bg-info/10"
                        onClick={() => handleEditItem(item)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        iconName="FaTrash"
                        tooltip="Remove Dish Frame"
                        tooltipPosition="top"
                        className="text-danger hover:text-danger hover:bg-danger/10"
                        onClick={() => handleDeleteItem(item)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Layer */}
      {!isLoading && Foods.length > 0 && (
        <TablePagination
          currentPage={pagination.current_page}
          totalPages={pagination.last_page}
          totalResults={pagination.total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}

      {/* Standardized Overlay Context Portals */}
      <CreateFoodModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        vendorId={vendorId!}
        onSuccess={handleActionSuccess}
      />
      <EditFoodModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        food={selectedFood}
        onSuccess={handleActionSuccess}
      />
      <DeleteFoodModal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        food={selectedFood}
        onSuccess={handleActionSuccess}
      />

      <ToastProvider />
    </div>
  );

  return <MainLayout content={content} />;
};

export default FoodCatalog;
