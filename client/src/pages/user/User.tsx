import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layouts';
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TablePagination,
} from '../../components/ui/table/Table';
import { Button, ToastProvider, LoadingSpinner, Icon } from '../../components/ui';
import { InputField } from '../../components/ui/forms';
import CreateUserModal from './components/CreateUserModal';
import EditUserModal from './components/EditUserModal';
import DeleteUserModal from './components/DeleteUserModal';
import RestoreUserModal from './components/RestoreUserModal';
import UserService from '../../services/UserService';
import type { User } from '../../interfaces/user';
import { notify } from '../../util/notify';
import { useDebounce, useDateFormatter } from '../../hooks/index';
import { PATHS } from '../../routes/path';

/* ==========================================================================
   TYPES & INTERFACES
   ========================================================================== */
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

const Users = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>(); // Captures context if scoped to a specific store

  /* ==========================================================================
     STATE MANAGEMENT
     ========================================================================== */
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

  const [filter, setFilter] = useState<'active' | 'deleted' | 'all'>('active');
  const filters = {
    active: { icon: 'FaCheck', label: 'Active Users' },
    deleted: { icon: 'FaTrash', label: 'Deleted Users' },
    all: { icon: 'FaList', label: 'All Users' },
  } as const;

  const [searchTerm, setSearchTerm] = useState("");
  const isSearching = searchTerm?.trim() !== "";
  const debouncedSearchTerm = useDebounce(searchTerm);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ==========================================================================
     MODAL LAYERS & RECORD SELECTION STATE
     ========================================================================== */
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const dateFormat = useDateFormatter();

  /* ==========================================================================
     CORE DATA SYNC ENGINE
     ========================================================================== */
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
        vendor_id: vendorId, // Automatically passes down scope query parameter if present
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
      notify.error("Failed to load platform profiles");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed React race condition: Combined tracking into a single rendering execution hook
  useEffect(() => {
    fetchUsers(page, pageSize);
  }, [page, pageSize, sort, debouncedSearchTerm, filter, vendorId]);

  /* ==========================================================================
     ACTION EVENT HANDLERS
     ========================================================================== */
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleSort = (key: keyof User) => {
    setPage(1);
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleRestoreUser = (user: User) => {
    setSelectedUser(user);
    setIsRestoreModalOpen(true);
  };

  const handleActionSuccess = async () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsRestoreModalOpen(false);
    setSelectedUser(null);

    const currentLength = users.length;
    const targetPage = currentLength === 1 && page > 1 ? page - 1 : page;
    setPage(targetPage);

    await fetchUsers(targetPage, pageSize);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsRestoreModalOpen(false);
    setSelectedUser(null);
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
            label="Search Records"
            name="search"
            placeholder="Searching user profile by name identifier, registry username..."
            fullWidth
            iconName="FaMagnifyingGlass"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button variant="primary" iconName="FaPlus" onClick={() => setIsCreateModalOpen(true)}>
          Create User
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
                filter === f
                  ? 'bg-primary text-bg-dark shadow-lg shadow-primary/30'
                  : 'bg-transparent text-text hover:bg-bg-light/50'
              }`}
            >
              <span>{label}</span>
              {filter === f && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary/0 via-primary to-primary/0 rounded-full" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Profile Metrics Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableCell isHeader>Avatar</TableCell>
            <TableCell isHeader sortKey="name" currentSort={sort} onSort={handleSort}>Name</TableCell>
            <TableCell isHeader>Username</TableCell>
            <TableCell isHeader>Phone</TableCell>
            <TableCell isHeader sortKey="role" currentSort={sort} onSort={handleSort}>Role</TableCell>
            <TableCell isHeader sortKey="created_at" currentSort={sort} onSort={handleSort}>Created At</TableCell>
            <TableCell isHeader>Action</TableCell>
          </tr>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex items-center justify-center w-full">
                  <LoadingSpinner size="md" text={isSearching ? "Searching for users..." : "Loading Users...."} />
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4 w-full">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-bg-light/50">
                    <Icon iconName="FaUsersSlash" className="text-3xl text-text-muted" />
                  </div>
                  <h2 className="text-lg font-semibold text-text">No Users Found</h2>
                  <p className="text-sm text-center text-text-muted max-w-sm">
                    We couldn’t find any users matching your criteria. Try adjusting your filters or add a new user.
                  </p>
                  <Button variant="primary" iconName="FaPlus" onClick={() => setIsCreateModalOpen(true)}>
                    Create User
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className={user.deleted_at ? "opacity-60 bg-bg-light/10" : ""}>
                <TableCell>
                  {user.avatar ? (
                    <img
                      src={`${import.meta.env.VITE_STORAGE_URL}/${user.avatar}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-bg-light"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-semibold text-text">{user.name}</TableCell>
                <TableCell className="text-sm font-mono text-text-muted">{user.username}</TableCell>
                <TableCell className="text-sm text-text-muted">{user.phone || "-"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'admin' 
                      ? 'bg-danger/10 text-danger border border-danger/20' 
                      : 'bg-info/10 text-info border border-info/20'
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-text-muted">{dateFormat.dateTime(user.created_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center justify-start">
                    <Button
                      size="sm"
                      variant="ghost"
                      iconName="FaEye"
                      tooltip="View user details"
                      tooltipPosition="top"
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => navigate(PATHS.APP.USER_DETAIL.replace(':slug', user.slug))}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      iconName="FaPencil"
                      tooltip="Edit user"
                      tooltipPosition="top"
                      className="text-info hover:text-info hover:bg-info/10"
                      onClick={() => handleEditUser(user)}
                    />
                    {filter === 'deleted' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        iconName="FaArrowRotateLeft"
                        tooltip="Restore user profile matrix"
                        tooltipPosition="top"
                        className="text-success hover:text-success hover:bg-success/10"
                        onClick={() => handleRestoreUser(user)}
                      />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      iconName="FaTrash"
                      tooltip={filter === 'deleted' ? 'Permanently Wipe Record' : 'Soft Delete User'}
                      tooltipPosition="top"
                      className="text-danger hover:text-danger hover:bg-danger/10"
                      onClick={() => handleDeleteUser(user)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Layer */}
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

      {/* Modal Layout Interfaces */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleActionSuccess}
      />
      
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        user={selectedUser}
        onSuccess={handleActionSuccess}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        user={selectedUser}
        isPermanentDelete={filter === 'deleted'}
        onSuccess={handleActionSuccess}
      />

      <RestoreUserModal
        isOpen={isRestoreModalOpen}
        onClose={handleModalClose}
        user={selectedUser}
        onSuccess={handleActionSuccess}
      />

      <ToastProvider />
    </div>
  );

  return <MainLayout content={content} />;
};

export default Users;