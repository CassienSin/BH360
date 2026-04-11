import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { Stack, Typography, TextField, InputAdornment, Button, Card, Box, CircularProgress, Alert, Avatar, Chip, useTheme } from '@mui/material';
import { Search, ArrowLeft } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAllUsers, useUpdateUserProfile } from '../../hooks/useUsers';
import { getBarangayScope } from '../../services/barangayScope';

const FalseReportManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { data: users = [], isLoading, error } = useAllUsers();
  const updateUser = useUpdateUserProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    document.title = 'Warning & Blacklist – BH360';
  }, []);

  const filteredUsers = useMemo(() => {
    const currentBarangayCode = getBarangayScope();
    const term = searchTerm.toLowerCase();

    return users.filter((user) => {
      const name = (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const matchesSearch = name.includes(term) || email.includes(term);
      const matchesBarangay = !currentBarangayCode || user.barangayCode === currentBarangayCode;
      return matchesSearch && matchesBarangay;
    });
  }, [users, searchTerm]);

  const warningUsers = useMemo(
    () => filteredUsers.filter((user) => user.falseReportWarnings > 0 && !user.blacklisted),
    [filteredUsers],
  );

  const blacklistedUsers = useMemo(
    () => filteredUsers.filter((user) => user.blacklisted),
    [filteredUsers],
  );

  const handleActionRequest = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    const updates = {};

    if (actionType === 'requestAppeal') {
      updates.appealRequested = true;
      updates.appealRequestedAt = new Date();
    }

    if (actionType === 'approveAppeal') {
      updates.blacklisted = false;
      updates.appealRequested = false;
      updates.blacklistedAt = null;
      updates.appealResolvedAt = new Date();
      updates.appealResolvedBy = currentUser?.uid || currentUser?.id || currentUser?.email || 'system';
    }

    try {
      await updateUser.mutateAsync({ userId: selectedUser.id, updates });
    } catch (err) {
      console.error('[FalseReportManagement] action failed:', err);
    } finally {
      setConfirmDialogOpen(false);
      setSelectedUser(null);
      setActionType('');
    }
  };

  const userColumns = [
    {
      field: 'displayName',
      headerName: 'Name',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => {
        const name = params.row.displayName || `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim() || 'Unknown Resident';
        return (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>
              {name.charAt(0)}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              <Typography variant="body2" fontWeight={700}>{name}</Typography>
              <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'falseReportWarnings',
      headerName: 'Warnings',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          size="small"
          color={params.value > 0 ? 'warning' : 'default'}
        />
      ),
    },
    {
      field: 'blacklisted',
      headerName: 'Blacklisted',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'error' : 'success'}
        />
      ),
    },
    {
      field: 'appealRequested',
      headerName: 'Appeal',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Pending' : 'None'}
          size="small"
          color={params.value ? 'info' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 190,
      sortable: false,
      renderCell: (params) => {
        const user = params.row;
        if (!user.blacklisted) {
          return <Chip label="Warning Only" size="small" />;
        }

        if (user.blacklisted && !user.appealRequested) {
          return (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={() => handleActionRequest(user, 'requestAppeal')}
            >
              Request Appeal
            </Button>
          );
        }

        return (
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() => handleActionRequest(user, 'approveAppeal')}
          >
            Approve Appeal
          </Button>
        );
      },
    },
  ];

  if (error) {
    return (
      <Alert severity="error">Unable to load users. Please refresh the page.</Alert>
    );
  }

  return (
    <Stack spacing={4}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack>
          <Typography variant="h4" fontWeight={800} className="gradient-text">Warning & Blacklist</Typography>
          <Typography variant="body2" color="text.secondary">
            View residents with false-report warnings and blocked accounts, and manage appeal requests.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/users')}
          >
            Back to User Management
          </Button>
        </Stack>
      </Box>

      <Card sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={320}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Stack spacing={4}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack spacing={0.5}>
                  <Typography variant="h6" fontWeight={700}>Warning List</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Residents with active false-report warnings.
                  </Typography>
                </Stack>
                <Chip label={`${warningUsers.length} users`} color="warning" />
              </Stack>
              {warningUsers.length === 0 ? (
                <Alert severity="info">No users currently on the warning list.</Alert>
              ) : (
                <div style={{ width: '100%' }}>
                  <DataGrid
                    autoHeight
                    rows={warningUsers}
                    columns={userColumns}
                    getRowId={(row) => row.id}
                    rowHeight={68}
                    pageSizeOptions={[10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick
                    sx={{ border: 'none' }}
                  />
                </div>
              )}
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack spacing={0.5}>
                  <Typography variant="h6" fontWeight={700}>Blacklist</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Users blocked from reporting due to repeated false incidents.
                  </Typography>
                </Stack>
                <Chip label={`${blacklistedUsers.length} users`} color="error" />
              </Stack>
              {blacklistedUsers.length === 0 ? (
                <Alert severity="info">No users are currently blacklisted.</Alert>
              ) : (
                <div style={{ width: '100%' }}>
                  <DataGrid
                    autoHeight
                    rows={blacklistedUsers}
                    columns={userColumns}
                    getRowId={(row) => row.id}
                    rowHeight={68}
                    pageSizeOptions={[10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick
                    sx={{ border: 'none' }}
                  />
                </div>
              )}
            </Box>
          </Stack>
        )}
      </Card>

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => !updateUser.isPending && setConfirmDialogOpen(false)}
        onConfirm={handleConfirmAction}
        title={actionType === 'approveAppeal' ? 'Approve Appeal' : 'Request Appeal'}
        message={
          actionType === 'approveAppeal'
            ? 'Approve this user’s appeal and remove the blacklist restriction? This will allow them to submit reports again.'
            : 'Mark this user as requesting an appeal for their blacklist status.'
        }
        confirmLabel={actionType === 'approveAppeal' ? 'Approve Appeal' : 'Request Appeal'}
        loading={updateUser.isPending}
      />
    </Stack>
  );
};

export default FalseReportManagement;
