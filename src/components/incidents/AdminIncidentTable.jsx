import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
  useTheme,
  Menu,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Download,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  useAllIncidents, 
  useUpdateIncident, 
  useDeleteIncident,
  useResolveIncident,
} from '../../hooks/useIncidents';

const AdminIncidentTable = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Fetch incidents from Firebase
  const { data: incidents = [], isLoading, error } = useAllIncidents();
  const updateIncident = useUpdateIncident();
  const deleteIncident = useDeleteIncident();
  const resolveIncident = useResolveIncident();

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleResolveIncident = async () => {
    if (selectedRow) {
      try {
        await resolveIncident.mutateAsync({ 
          incidentId: selectedRow.id, 
          resolution: { note: 'Marked as resolved from table' } 
        });
        handleMenuClose();
      } catch (error) {
        console.error('Failed to resolve incident:', error);
      }
    }
  };

  const handleDeleteIncident = async () => {
    if (selectedRow && window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await deleteIncident.mutateAsync(selectedRow.id);
        handleMenuClose();
      } catch (error) {
        console.error('Failed to delete incident:', error);
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      crime: theme.palette.error.main,
      noise: theme.palette.warning.main,
      hazard: theme.palette.info.main,
      dispute: theme.palette.secondary.main,
      other: theme.palette.grey[500],
    };
    return colors[category?.toLowerCase()] || theme.palette.grey[500];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      emergency: theme.palette.error.main,
      urgent: theme.palette.warning.main,
      minor: theme.palette.info.main,
      low: theme.palette.success.main,
    };
    return colors[priority?.toLowerCase()] || theme.palette.grey[500];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 size={16} />;
      case 'in-progress':
        return <Clock size={16} />;
      case 'submitted':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          #{params.value.substring(0, 8)}
        </Typography>
      ),
    },
    {
      field: 'title',
      headerName: 'Incident Title',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || 'No title'}>
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 500,
            }}
          >
            {params.value || params.row.description?.substring(0, 50) || 'Untitled'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'other'}
          size="small"
          sx={{
            backgroundColor: alpha(getCategoryColor(params.value), 0.1),
            color: getCategoryColor(params.value),
            fontWeight: 600,
            textTransform: 'capitalize',
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value || 'medium'}
          size="small"
          sx={{
            backgroundColor: alpha(getPriorityColor(params.value), 0.1),
            color: getPriorityColor(params.value),
            fontWeight: 600,
            textTransform: 'capitalize',
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.value)}
          label={(params.value || 'submitted').replace('-', ' ')}
          size="small"
          sx={{
            backgroundColor:
              params.value === 'resolved'
                ? alpha(theme.palette.success.main, 0.1)
                : params.value === 'in-progress'
                ? alpha(theme.palette.warning.main, 0.1)
                : alpha(theme.palette.info.main, 0.1),
            color:
              params.value === 'resolved'
                ? theme.palette.success.main
                : params.value === 'in-progress'
                ? theme.palette.warning.main
                : theme.palette.info.main,
            fontWeight: 600,
            textTransform: 'capitalize',
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'reporterName',
      headerName: 'Reporter',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2">{params.value || 'Anonymous'}</Typography>
      ),
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color={params.value ? 'text.primary' : 'text.disabled'}>
          {params.value || 'Unassigned'}
        </Typography>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Tooltip title={params.value || 'No location specified'}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {params.value || '-'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Reported',
      width: 110,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/incidents/${params.row.id}`)}
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                },
              }}
            >
              <Eye size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="More Actions">
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, params.row)}
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.text.primary, 0.05),
                },
              }}
            >
              <MoreVertical size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const filteredRows = useMemo(() => {
    return incidents.filter((incident) => {
      const searchableText = [
        incident.title,
        incident.description,
        incident.reporterName,
        incident.location,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      const matchesSearch = searchableText.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || incident.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || incident.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [incidents, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  if (error) {
    return (
      <Alert severity="error">
        Failed to load incidents. Please check your Firebase connection.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            Incident Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor, manage and resolve all barangay incidents ({incidents.length} total)
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Download size={20} />}
            sx={{
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            Export Data
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => navigate('/incidents/create')}
          >
            New Incident
          </Button>
        </Stack>
      </Stack>

      {/* Statistics Cards */}
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {[
          { label: 'Total Reports', value: incidents.length, color: theme.palette.primary.main },
          {
            label: 'Pending',
            value: incidents.filter((i) => i.status === 'submitted').length,
            color: theme.palette.info.main,
          },
          {
            label: 'In Progress',
            value: incidents.filter((i) => i.status === 'in-progress').length,
            color: theme.palette.warning.main,
          },
          {
            label: 'Resolved',
            value: incidents.filter((i) => i.status === 'resolved').length,
            color: theme.palette.success.main,
          },
        ].map((stat, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              minWidth: 180,
              p: 2.5,
              borderRadius: 3,
              background: alpha(stat.color, 0.08),
              border: `1px solid ${alpha(stat.color, 0.2)}`,
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {stat.label}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={stat.color} mt={0.5}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <TextField
          placeholder="Search incidents, reporters, locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 250 }}
        />
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="submitted">Submitted</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="crime">Crime</MenuItem>
            <MenuItem value="noise">Noise</MenuItem>
            <MenuItem value="hazard">Hazard</MenuItem>
            <MenuItem value="dispute">Dispute</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={priorityFilter} label="Priority" onChange={(e) => setPriorityFilter(e.target.value)}>
            <MenuItem value="all">All Priorities</MenuItem>
            <MenuItem value="emergency">Emergency</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Data Grid */}
      <Box
        sx={{
          height: 600,
          width: '100%',
          '& .MuiDataGrid-root': {
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            backgroundColor: 'background.paper',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: `2px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
          },
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: false,
            },
          }}
        />
      </Box>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => {
          if (selectedRow) navigate(`/incidents/${selectedRow.id}`);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Eye size={18} />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleResolveIncident}>
          <ListItemIcon>
            <CheckCircle2 size={18} />
          </ListItemIcon>
          <ListItemText>Mark as Resolved</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteIncident} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Trash2 size={18} color={theme.palette.error.main} />
          </ListItemIcon>
          <ListItemText>Delete Incident</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default AdminIncidentTable;
