import { Stack, Typography, TextField, InputAdornment, Chip, Avatar, Box } from '@mui/material';
import { Search, User } from 'lucide-react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';

const UserManagement = () => {
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            <User size={18} />
          </Avatar>
          {params.value}
        </Box>
      ),
    },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ textTransform: 'capitalize' }} />
      ),
    },
    {
      field: 'verified',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Verified' : 'Pending'}
          size="small"
          color={params.value ? 'success' : 'warning'}
        />
      ),
    },
  ];

  const rows = [
    { id: 1, name: 'Juan Dela Cruz', email: 'juan@example.com', role: 'resident', verified: true },
    { id: 2, name: 'Maria Santos', email: 'maria@example.com', role: 'resident', verified: true },
    { id: 3, name: 'Pedro Garcia', email: 'pedro@example.com', role: 'staff', verified: true },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          User Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage barangay residents and staff
        </Typography>
      </Stack>

      <TextField
        placeholder="Search users..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 500 }}
      />

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Box>
    </Stack>
  );
};

export default UserManagement;
