import { useState } from 'react';
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
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Search, User, UserPlus } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { useAllUsers, useUpdateUserRole, useDeleteUser } from '../../hooks/useUsers';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Fetch users from Firebase
  const { data: users = [], isLoading, error } = useAllUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.displayName || user.firstName || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser.mutateAsync(userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const columns = [
    {
      field: 'displayName',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const name = params.value || 
          (params.row.firstName && params.row.lastName 
            ? `${params.row.firstName} ${params.row.lastName}` 
            : 'Unknown User');
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              src={params.row.photoURL} 
              sx={{ width: 32, height: 32 }}
            >
              <User size={18} />
            </Avatar>
            {name}
          </Box>
        );
      },
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params) => (
        <Select
          value={params.value || 'resident'}
          size="small"
          onChange={(e) => handleRoleChange(params.row.id, e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="resident">Resident</MenuItem>
          <MenuItem value="tanod">Tanod</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      ),
    },
    {
      field: 'emailVerified',
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
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return '-';
        const date = params.value?.toDate ? params.value.toDate() : new Date(params.value);
        return date.toLocaleDateString();
      },
    },
  ];

  // Prepare rows from users data
  const rows = filteredUsers.map((user) => ({
    id: user.id,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    photoURL: user.photoURL,
    role: user.role || 'resident',
    emailVerified: user.emailVerified || false,
    createdAt: user.createdAt,
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

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          User Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage barangay residents and staff ({rows.length} users)
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400, flex: 1 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Role Filter</InputLabel>
          <Select
            value={roleFilter}
            label="Role Filter"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="resident">Resident</MenuItem>
            <MenuItem value="tanod">Tanod</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </Box>
      )}
    </Stack>
  );
};

export default UserManagement;
