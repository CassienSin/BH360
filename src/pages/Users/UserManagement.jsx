import { useState, useCallback, useEffect } from 'react';
import {
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Box,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Search, User, Trash2, ShieldAlert } from 'lucide-react';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { DataGrid } from '@mui/x-data-grid';
import { useAllUsers, useUpdateUserRole, useDeleteUser } from '../../hooks/useUsers';
import { useAppSelector } from '../../store/hooks';

const ROLES = [
  { value: 'resident', label: 'Resident' },
  { value: 'tanod',    label: 'Tanod' },
  { value: 'staff',    label: 'Staff' },
  { value: 'admin',    label: 'Admin' },
];

// Semantic role colors: admin = brand primary, tanod = info blue,
// staff = secondary pink, resident = neutral default.
// 'error' is intentionally reserved for destructive/broken states only.
const ROLE_COLORS = {
  admin:    'primary',
  staff:    'secondary',
  tanod:    'info',
  resident: 'default',
};

const UserManagement = () => {
  const theme = useTheme();
  const { user: currentUser } = useAppSelector((s) => s.auth);

  const [searchTerm,       setSearchTerm]       = useState('');
  const [roleFilter,       setRoleFilter]        = useState('all');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete,     setUserToDelete]      = useState(null);

  // Role-change confirmation state
  const [roleDialogOpen,   setRoleDialogOpen]   = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState(null); // { userId, newRole, userName, oldRole }

  useEffect(() => {
    document.title = 'User Management – BH360';
  }, []);

  const { data: users = [], isLoading, error } = useAllUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  // ── Filtering ────────────────────────────────────────────────────────────
  const filteredUsers = users.filter((user) => {
    const name = (
      user.displayName ||
      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '') ||
      ''
    ).toLowerCase();
    const email = (user.email || '').toLowerCase();
    const term  = searchTerm.toLowerCase();

    const matchesSearch = name.includes(term) || email.includes(term);
    const matchesRole   = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // ── Role change (opens confirmation dialog) ───────────────────────────────
  const handleRoleChangeRequest = useCallback((userId, newRole, userName, oldRole) => {
    if (userId === (currentUser?.uid || currentUser?.id)) return; // guard: no self-change
    if (newRole === oldRole) return;
    setPendingRoleChange({ userId, newRole, userName, oldRole });
    setRoleDialogOpen(true);
  }, [currentUser]);

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { userId, newRole } = pendingRoleChange;
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
    } catch (err) {
      console.error('[UserManagement] role change error:', err);
    } finally {
      setRoleDialogOpen(false);
      setPendingRoleChange(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteUser = useCallback((userId) => {
    if (userId === (currentUser?.uid || currentUser?.id)) return; // guard: no self-delete
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  }, [currentUser]);

  const handleConfirmDeleteUser = async () => {
    try {
      await deleteUser.mutateAsync(userToDelete);
    } catch (err) {
      console.error('[UserManagement] delete error:', err);
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // ── DataGrid columns ──────────────────────────────────────────────────────
  const columns = [
    {
      field: 'displayName',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const isSelf = params.row.id === (currentUser?.uid || currentUser?.id);
        const name   = params.row.displayName ||
          (params.row.firstName && params.row.lastName
            ? `${params.row.firstName} ${params.row.lastName}`
            : 'Unknown User');
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={params.row.photoURL} sx={{ width: 32, height: 32 }}>
              <User size={18} />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={isSelf ? 700 : 400} noWrap>
                {name}
              </Typography>
              {isSelf && (
                <Typography variant="caption" color="primary.main" sx={{ lineHeight: 1 }}>
                  You
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 160,
      renderCell: (params) => {
        const isSelf = params.row.id === (currentUser?.uid || currentUser?.id);
        const isUpdating = updateRole.isPending &&
          pendingRoleChange?.userId === params.row.id;

        if (isSelf) {
          // Current user's own role — read-only with a badge
          return (
          <Tooltip title="You cannot change your own role" placement="top">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip
                  label={ROLES.find((r) => r.value === params.value)?.label ?? params.value}
                  size="small"
                  variant="outlined"
                  color={ROLE_COLORS[params.value] ?? 'default'}
                />
                <ShieldAlert size={14} color={theme.palette.text.disabled} />
              </Box>
            </Tooltip>
          );
        }

        return (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            {isUpdating ? (
              <CircularProgress size={20} />
            ) : (
              <Select
                value={params.value || 'resident'}
                size="small"
                onChange={(e) =>
                  handleRoleChangeRequest(
                    params.row.id,
                    e.target.value,
                    params.row.displayName ||
                      `${params.row.firstName ?? ''} ${params.row.lastName ?? ''}`.trim() ||
                      'this user',
                    params.value,
                  )
                }
                sx={{ minWidth: 130 }}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Box>
        );
      },
    },
    {
      field: 'emailVerified',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Verified' : 'Pending'}
          size="small"
          color={params.value ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 130,
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2" color="text.disabled">—</Typography>;
        const date = params.value?.toDate
          ? params.value.toDate()
          : new Date(params.value);
        return (
          <Typography variant="body2">
            {date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const isSelf = params.row.id === (currentUser?.uid || currentUser?.id);
        return (
          <Tooltip title={isSelf ? 'You cannot delete your own account' : 'Delete user'} placement="top">
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={isSelf || deleteUser.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteUser(params.row.id);
                }}
                aria-label="Delete user"
              >
                <Trash2 size={16} />
              </IconButton>
            </span>
          </Tooltip>
        );
      },
    },
  ];

  // ── Rows ──────────────────────────────────────────────────────────────────
  const rows = filteredUsers.map((user) => ({
    id:            user.id,
    displayName:   user.displayName ?? null,
    firstName:     user.firstName   ?? '',
    lastName:      user.lastName    ?? '',
    email:         user.email       ?? '',
    photoURL:      user.photoURL    ?? null,
    role:          user.role        ?? 'resident',
    emailVerified: user.emailVerified ?? false,
    createdAt:     user.createdAt   ?? null,
  }));

  if (error) {
    return (
      <Stack spacing={3}>
        <Alert severity="error">
          Failed to load users. Please check your Firebase connection.
        </Alert>
      </Stack>
    );
  }

  const pendingUserName = pendingRoleChange?.userName || 'this user';
  const pendingOldRole  = ROLES.find((r) => r.value === pendingRoleChange?.oldRole)?.label ?? pendingRoleChange?.oldRole ?? '';
  const pendingNewRole  = ROLES.find((r) => r.value === pendingRoleChange?.newRole)?.label ?? pendingRoleChange?.newRole ?? '';

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
          User Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage barangay residents and staff ({rows.length} users)
        </Typography>
      </Stack>

      {/* ── Toolbar ── */}
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <TextField
          placeholder="Search by name or email…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 380, flex: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Role Filter</InputLabel>
          <Select
            value={roleFilter}
            label="Role Filter"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="all">All Roles</MenuItem>
            {ROLES.map((r) => (
              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* ── Table ── */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              borderRadius: 2,
              bgcolor: 'background.paper',
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                outline: 'none',
              },
            }}
          />
        </Box>
      )}

      {/* ── Role change confirmation ── */}
      <ConfirmDialog
        open={roleDialogOpen}
        onClose={() => {
          if (!updateRole.isPending) {
            setRoleDialogOpen(false);
            setPendingRoleChange(null);
          }
        }}
        onConfirm={handleConfirmRoleChange}
        title="Change User Role"
        message={`Change ${pendingUserName}'s role from ${pendingOldRole} to ${pendingNewRole}? This will immediately affect their access permissions.`}
        confirmLabel="Change Role"
        confirmColor="primary"
        loading={updateRole.isPending}
      />

      {/* ── Delete confirmation ── */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleteUser.isPending) {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteUser.isPending}
      />
    </Stack>
  );
};

export default UserManagement;
