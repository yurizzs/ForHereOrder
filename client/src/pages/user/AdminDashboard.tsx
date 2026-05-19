import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import CreateUserModal from "./components/CreateUserModal";
import EditUserModal from "./components/EditUserModal";
import DeleteUserModal from "./components/DeleteUserModal";
import RestoreUserModal from "./components/RestoreUserModal";
import UserService from "../../services/UserService";
import type { User } from "../../interfaces/user";
import { notify } from "../../util/notify";
import { useDebounce, useDateFormatter } from "../../hooks/index";
import { PATHS } from "../../routes/path";

/* =========================
    TYPES & CONFIG
========================= */
type SortState = {
  key: keyof User;
  direction: "asc" | "desc";
};

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const dateFormat = useDateFormatter();

  /* =========================
      STATE MANAGEMENT
  ========================= */
  const [users, setUsers] = useState<User[]>([]);
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

  const [filter, setFilter] = useState<"active" | "deleted" | "all">("active");
  const filters = {
    active: { icon: "FaCheck", label: "Active" },
    deleted: { icon: "FaTrash", label: "Deleted" },
    all: { icon: "FaList", label: "All Users" },
  } as const;

  const [searchTerm, setSearchTerm] = useState("");
  const isSearching = searchTerm?.trim() !== "";
  const debouncedSearchTerm = useDebounce(searchTerm);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Mock Overview Analytics Data (In a live app, fetch this from an AnalyticsService)
  const statsOverview = [
    {
      label: "Total Users",
      value: pagination.total || "0",
      icon: "FaUsers",
      color: "text-primary bg-primary/10",
    },
    {
      label: "System Health",
      value: "99.8%",
      icon: "FaServer",
      color: "text-info bg-info/10",
    },
    {
      label: "Active Sessions",
      value: "342",
      icon: "FaSignal",
      color: "text-success bg-success/10",
    },
    {
      label: "Pending Issues",
      value: "5",
      icon: "FaCircleExclamation",
      color: "text-danger bg-danger/10",
    },
  ];

  /* =========================
      DATA FETCHING
  ========================= */
  const fetchUsers = async (currentPage = page, pageLimit = pageSize) => {
    setIsLoading(true);
    try {
      const response = await UserService.getAll({
        page: currentPage,
        limit: pageLimit,
        search: debouncedSearchTerm,
        sort_by: sort.key,
        sort_order: sort.direction,
        filter: filter,
      });

      const userData = response.data || response;
      setUsers(userData.users || userData.data || []);

      if (userData.meta) {
        setPagination({
          current_page: userData.meta.current_page || currentPage,
          last_page: userData.meta.last_page || 1,
          per_page: userData.meta.per_page || pageLimit,
          total: userData.meta.total || 0,
        });
      }
    } catch (error) {
      notify.error("Failed to load dashboard metrics");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Single unified engine to react to controls and state updates seamlessly
  useEffect(() => {
    fetchUsers(page, pageSize);
  }, [page, pageSize, sort, debouncedSearchTerm, filter]);

  /* =========================
      INTERACTIVE HANDLERS
  ========================= */
  const handleFilterChange = (selectedFilter: "active" | "deleted" | "all") => {
    setFilter(selectedFilter);
    setPage(1);
  };

  const handleSort = (key: keyof User) => {
    setPage(1);
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  /* =========================
      MODALS COMPONENT STATES
  ========================= */
  const [isCreateUserModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [userToRestore, setUserToRestore] = useState<User | null>(null);

  const handleCreateUserClose = () => {
    setIsCreateModalOpen(false);
    setPage(1);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditUserClose = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserSuccess = async () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedUser(null);
    await fetchUsers(page, pageSize);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = async () => {
    setIsDeleteModalOpen(false);
    const nextPage = users.length === 1 && page > 1 ? page - 1 : page;
    setPage(nextPage);
    setUserToDelete(null);
    await fetchUsers(nextPage, pageSize);
  };

  const handleRestoreUser = (user: User) => {
    setUserToRestore(user);
    setIsRestoreModalOpen(true);
  };

  const handleRestoreSuccess = async () => {
    setIsRestoreModalOpen(false);
    const nextPage = users.length === 1 && page > 1 ? page - 1 : page;
    setPage(nextPage);
    setUserToRestore(null);
    await fetchUsers(nextPage, pageSize);
  };

  /* =========================
      LAYOUT VIEW
  ========================= */
  const content = (
    <div className="space-y-8">
      {/* Dashboard Top Heading */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Admin Dashboard
          </h1>
          <p className="text-sm text-text-muted">
            Monitor system data, run analytics audit metrics, and handle access
            management configuration.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 mt-4 md:mt-0">
          <Button
            variant="ghost"
            iconName="FaArrowRotateRight"
            onClick={() => fetchUsers(page, pageSize)}
          >
            Reload Data
          </Button>
          <Button
            variant="primary"
            iconName="FaPlus"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add System User
          </Button>
        </div>
      </div>

      {/* Analytics Info Metrics Deck */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsOverview.map((card, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-bg-light border border-bg-light/80 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                {card.label}
              </span>
              <h3 className="text-2xl font-bold text-text">{card.value}</h3>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${card.color}`}
            >
              {/* FIX: Dynamically render the actual icon configured for this card */}
              <Icon iconName="FaList" />
            </div>
          </div>
        ))}
      </div>

      <hr className="border-bg-light/40" />

      {/* Primary Data Module Block */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">
              User Base Directory
            </h2>
            <p className="text-xs text-text-muted">
              Perform complete CRUD actions and monitor security accounts.
            </p>
          </div>

          {/* Filtering Layout Navigation */}
          <div className="gap-1 bg-bg-light border border-bg-light/30 rounded-xl p-1 flex items-center w-fit self-start sm:self-auto">
            {(Object.keys(filters) as Array<keyof typeof filters>).map((f) => {
              const { icon, label } = filters[f];
              return (
                <Button
                  key={f}
                  variant="primary"
                  onClick={() => handleFilterChange(f)}
                  iconName={icon}
                  className={`relative px-3 py-1.5 rounded-lg font-semibold uppercase text-[10px] transition-all duration-200 flex items-center gap-1.5 ${
                    filter === f
                      ? "bg-primary text-bg-dark shadow-xs"
                      : "bg-transparent text-text hover:bg-bg-light/60"
                  }`}
                >
                  <span>{label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Search Input Filter Toolbar */}
        <div className="w-full max-w-md">
          <InputField
            name="search"
            placeholder="Search accounts using names or usernames..."
            fullWidth
            iconName="FaMagnifyingGlass"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Dynamic Context Table Data Interface */}
        <Table>
          <TableHeader>
            <tr>
              <TableCell isHeader>User</TableCell>
              <TableCell
                isHeader
                sortKey="name"
                currentSort={sort}
                onSort={handleSort}
              >
                Identity Name
              </TableCell>
              <TableCell isHeader>Username</TableCell>
              <TableCell isHeader>Phone Connection</TableCell>
              <TableCell
                isHeader
                sortKey="role"
                currentSort={sort}
                onSort={handleSort}
              >
                Authorization Permission
              </TableCell>
              <TableCell
                isHeader
                sortKey="created_at"
                currentSort={sort}
                onSort={handleSort}
              >
                Registration Date
              </TableCell>
              <TableCell isHeader>Management Control Actions</TableCell>
            </tr>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center gap-2 w-full">
                    <LoadingSpinner size="md" />
                    <span className="text-xs text-text-muted">
                      {isSearching
                        ? "Running match filter routines..."
                        : "Fetching cloud database profiles..."}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16">
                  <div className="flex flex-col items-center justify-center text-center space-y-3 max-w-sm mx-auto">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-bg-light text-text-muted text-xl">
                      <Icon iconName="FaUsersSlash" />
                    </div>
                    <h3 className="text-base font-semibold text-text">
                      No Accounts Cataloged
                    </h3>
                    <p className="text-xs text-text-muted">
                      No identities match your specified query configurations.
                      Try updating dashboard filters or create a profile.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      iconName="FaPlus"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      Register Profile
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.avatar ? (
                      <img
                        src={`${import.meta.env.VITE_STORAGE_URL}/${user.avatar}`}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-bg-light"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold uppercase">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-text">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-text-muted font-mono text-xs">
                    {user.username}
                  </TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        user.role === "admin"
                          ? "bg-danger/10 text-danger"
                          : "bg-info/10 text-info"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {dateFormat.dateTime(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 items-center justify-start">
                      <Button
                        size="sm"
                        variant="ghost"
                        iconName="FaEye"
                        tooltip="Explore Profile Records"
                        className="text-primary hover:bg-primary/10"
                        onClick={() =>
                          navigate(
                            PATHS.APP.USER_DETAIL.replace(":slug", user.slug),
                          )
                        }
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        iconName="FaPencil"
                        tooltip="Modify Attributes"
                        className="text-info hover:bg-info/10"
                        onClick={() => handleEditUser(user)}
                      />
                      {filter === "deleted" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          iconName="FaArrowRotateLeft"
                          tooltip="Recover Account State"
                          className="text-success hover:bg-success/10"
                          onClick={() => handleRestoreUser(user)}
                        />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        iconName="FaTrash"
                        tooltip={
                          filter === "deleted"
                            ? "Purge Account Data"
                            : "Archive Profile Record"
                        }
                        className="text-danger hover:bg-danger/10"
                        onClick={() => handleDeleteUser(user)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Table Flow Metadata Controller */}
        {!isLoading && users.length > 0 && (
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
      </div>

      {/* System Modals Control Hub Overlay */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={handleCreateUserClose}
        onSuccess={handleUserSuccess}
      />
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={handleEditUserClose}
        user={selectedUser}
        onSuccess={handleUserSuccess}
      />
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        user={userToDelete}
        isPermanentDelete={filter === "deleted"}
        onSuccess={handleDeleteSuccess}
      />
      <RestoreUserModal
        isOpen={isRestoreModalOpen}
        onClose={() => {
          setIsRestoreModalOpen(false);
          setUserToRestore(null);
        }}
        user={userToRestore}
        onSuccess={handleRestoreSuccess}
      />

      <ToastProvider />
    </div>
  );

  return <MainLayout content={content} />;
};

export default Dashboard;
