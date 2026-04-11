import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Card,
  alpha,
  Button,
} from '@mui/material';
import { Search, User, Trash2, ShieldAlert, UserCheck, UserX } from 'lucide-react';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { DataGrid } from '@mui/x-data-grid';
import { useAllUsers, useUpdateUserRole, useDeleteUser } from '../../hooks/useUsers';
import { useAppSelector } from '../../store/hooks';
import { ROLE_OPTIONS, ROLE_COLORS } from '../../config/roles';
import { getBarangayScope } from '../../services/barangayScope';

const UserManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user: currentUser } = useAppSelector((s) => s.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);

  useEffect(() => {
    document.title = 'User Management – BH360';
  }, []);

  const { data: users = [], isLoading, error } = useAllUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  // ── Optimized Filtering ──────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const currentBarangayCode = getBarangayScope();
    return users.filter((user) => {
      const name = (
        user.displayName ||
        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '') ||
        ''
      ).toLowerCase();
      const email = (user.email || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = name.includes(term) || email.includes(term);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesBarangay = !currentBarangayCode || user.barangayCode === currentBarangayCode;

      return matchesSearch && matchesRole && matchesBarangay;
    });
  }, [users, searchTerm, roleFilter]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleRoleChangeRequest = useCallback((userId, newRole, userName, oldRole) => {
    if (userId === (currentUser?.uid || currentUser?.id)) return;
    if (newRole === oldRole) return;
    setPendingRoleChange({ userId, newRole, userName, oldRole });
    setRoleDialogOpen(true);
  }, [currentUser]);

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    try {
      await updateRole.mutateAsync({ 
        userId: pendingRoleChange.userId, 
        role: pendingRoleChange.newRole 
      });
    } catch (err) {
      console.error('[UserManagement] role change error:', err);
    } finally {
      setRoleDialogOpen(false);
      setPendingRoleChange(null);
    }
  };

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

  // ── Column Definitions ────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      field: 'displayName',
      headerName: 'Resident Details',
      flex: 1.5,
      minWidth: 250,
      renderCell: (params) => {
        const isSelf = params.row.id === (currentUser?.uid || currentUser?.id);
        const name = params.row.displayName || 
                    `${params.row.firstName} ${params.row.lastName}`.trim() || 
                    'Unknown User';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
            <Avatar 
              src={params.row.photoURL} 
              className="hover-lift"
              sx={{ 
                width: 42, 
                height: 42, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                border: '2px solid #fff'
              }}
            >
              {name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                {name} {isSelf && <Typography component="span" variant="caption" color="primary" sx={{ fontWeight: 800 }}>(You)</Typography>}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {params.row.email}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'role',
      headerName: 'System Role',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const isSelf = params.row.id === (currentUser?.uid || currentUser?.id);
        const isUpdating = updateRole.isPending && pendingRoleChange?.userId === params.row.id;

        if (isSelf) {
          return (
            <Box className="status-badge submitted" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldAlert size={14} /> {params.value}
            </Box>
          );
        }

        return (
          <Box onClick={(e) => e.stopPropagation()} sx={{ width: '100%' }}>
            {isUpdating ? (
              <CircularProgress size={20} />
            ) : (
              <Select
                value={params.value || 'resident'}
                size="small"
                onChange={(e) => handleRoleChangeRequest(params.row.id, e.target.value, params.row.displayName, params.value)}
                sx={{ 
                  borderRadius: '10px', 
                  fontSize: '0.875rem', 
                  bgcolor: 'rgba(255,255,255,0.4)',
                  '& fieldset': { border: 'none' },
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                  width: '140px'
                }}
              >
                {ROLE_OPTIONS.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
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
      width: 130,
      renderCell: (params) => (
        <span className={`status-badge ${params.value ? 'resolved' : 'urgent'}`}>
          {params.value ? 'Verified' : 'Pending'}
        </span>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Joined Date',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return <Typography variant="caption" color="text.disabled">N/A</Typography>;
        const date = params.value?.toDate ? params.value.toDate() : new Date(params.value);
        return (
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 70,
      sortable: false,
      renderCell: (params) => {
        const isSelf = params.row.id === (currentUser?.uid || currentUser?.id);
        return (
          <Tooltip title={isSelf ? 'Restricted' : 'Delete User'}>
            <span>
              <IconButton
                size="small"
                className="hover-lift"
                color="error"
                disabled={isSelf || deleteUser.isPending}
                onClick={() => { setUserToDelete(params.row.id); setDeleteDialogOpen(true); }}
                sx={{ bgcolor: isSelf ? 'transparent' : alpha(theme.palette.error.main, 0.05) }}
              >
                <Trash2 size={18} />
              </IconButton>
            </span>
          </Tooltip>
        );
      },
    },
  ], [currentUser, theme, updateRole.isPending, pendingRoleChange, handleRoleChangeRequest, deleteUser.isPending]);

  if (error) {
    return (
      <Alert severity="error" variant="filled" className="animate-fade-in" sx={{ borderRadius: '12px' }}>
        Failed to sync user database. Please verify Firebase permissions.
      </Alert>
    );
  }

  return (
    <Stack spacing={4} className="animate-fade-in">
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} className="gradient-text" sx={{ letterSpacing: '-0.03em' }}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Manage barangay residents and staff access ({filteredUsers.length} total)
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/users/blacklist')}>
          Warning & Blacklist
        </Button>
      </Box>

      {/* Main Container */}
      <Card className="glass animate-scale-in" sx={{ p: 0, border: 'none', borderRadius: '20px', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.paper, 0.4), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
        >
          <TextField
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment>,
              sx: { borderRadius: '12px', bgcolor: 'background.paper' }
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={roleFilter}
              label="Filter by Role"
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ borderRadius: '12px', bgcolor: 'background.paper' }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              {ROLE_OPTIONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>

        {/* DataGrid */}
        {isLoading ? (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={400} gap={2}>
            <CircularProgress size={40} thickness={4} />
            <Typography variant="caption" color="text.secondary" className="animate-pulse">Loading Resident Data...</Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: 'auto' }}>
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              rowHeight={70}
              autoHeight
              disableRowSelectionOnClick
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[10, 25, 50]}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: alpha(theme.palette.grey[50], 0.5),
                  color: theme.palette.text.secondary,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  '&:focus': { outline: 'none' }
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.02)
                }
              }}
            />
          </Box>
        )}
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={roleDialogOpen}
        onClose={() => !updateRole.isPending && setRoleDialogOpen(false)}
        onConfirm={handleConfirmRoleChange}
        title="Update Permissions"
        message={`Are you sure you want to change ${pendingRoleChange?.userName || 'this user'}'s role to ${pendingRoleChange?.newRole}?`}
        confirmLabel="Update Role"
        loading={updateRole.isPending}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => !deleteUser.isPending && setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeleteUser}
        title="Delete Resident Account"
        message="This will permanently remove the user from the system. This action is irreversible."
        confirmLabel="Delete Permanently"
        confirmColor="error"
        loading={deleteUser.isPending}
      />
    </Stack>
  );
};

export default UserManagement;