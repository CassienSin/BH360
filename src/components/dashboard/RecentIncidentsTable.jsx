import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Link,
  Box,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import { Eye } from 'lucide-react';

// ─── Chip color maps ─────────────────────────────────────────────────────────

const STATUS_COLOR = {
  submitted: 'info',
  'in-progress': 'warning',
  resolved: 'success',
  rejected: 'error',
};

const PRIORITY_COLOR = {
  emergency: 'error',
  urgent:    'warning',
  // 'medium' must be visually distinct from 'minor' — use warning vs default
  medium:    'warning',
  minor:     'default',
  low:       'success',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTime = (timestamp) => {
  if (!timestamp) return '—';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <TableRow>
    {[180, 100, 70, 90, 60, 40].map((w, i) => (
      <TableCell key={i} sx={{ py: 1.5 }}>
        <Skeleton width={w} height={20} />
      </TableCell>
    ))}
  </TableRow>
);

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * RecentIncidentsTable
 *
 * Props:
 *   incidents  array   — list of incident objects
 *   isLoading  boolean — show skeleton rows
 *   limit      number  — max rows to display (default 5)
 */
const RecentIncidentsTable = ({ incidents = [], isLoading, limit = 5 }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const rows = incidents.slice(0, limit);

  return (
    <Card className="glass" sx={{ animation: 'fadeIn 0.8s ease-out' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={600}>
            Recent Incidents
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/incidents')}
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            View All →
          </Link>
        </Stack>

        <TableContainer>
          <Table
            size="small"
            aria-label="Recent incidents"
            sx={{ minWidth: { xs: 500, md: 'auto' } }}
          >
            <TableHead>
              <TableRow
                sx={{
                  '& .MuiTableCell-head': {
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    py: 1,
                    backgroundColor: alpha(theme.palette.grey[100], 0.6),
                  },
                }}
              >
                <TableCell>Title</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  Location
                </TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  Time
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent incidents
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((incident) => (
                  <TableRow
                    key={incident.id}
                    hover
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                    sx={{
                      cursor: 'pointer',
                      '&:last-child td': { border: 0 },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    {/* Title */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        noWrap
                        sx={{ maxWidth: { xs: 140, md: 220 } }}
                      >
                        {incident.title ||
                          incident.description?.substring(0, 50) ||
                          'Untitled Incident'}
                      </Typography>
                    </TableCell>

                    {/* Location (hidden on xs) */}
                    <TableCell
                      sx={{
                        py: 1.5,
                        display: { xs: 'none', sm: 'table-cell' },
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 120 }}
                      >
                        {incident.location || '—'}
                      </Typography>
                    </TableCell>

                    {/* Priority */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={incident.priority || 'minor'}
                        size="small"
                        color={PRIORITY_COLOR[incident.priority] ?? 'default'}
                        sx={{
                          textTransform: 'capitalize',
                          fontWeight: 600,
                          fontSize: '0.68rem',
                        }}
                      />
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={(incident.status || 'submitted').replace('-', ' ')}
                        size="small"
                        color={STATUS_COLOR[incident.status] ?? 'default'}
                        sx={{
                          textTransform: 'capitalize',
                          fontWeight: 600,
                          fontSize: '0.68rem',
                        }}
                      />
                    </TableCell>

                    {/* Time (hidden on xs/sm) */}
                    <TableCell
                      sx={{
                        py: 1.5,
                        display: { xs: 'none', md: 'table-cell' },
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(incident.createdAt)}
                      </Typography>
                    </TableCell>

                    {/* Actions — stop row click propagation */}
                    <TableCell
                      align="right"
                      sx={{ py: 1.5 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="View Details" arrow>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/incidents/${incident.id}`)}
                          aria-label={`View incident: ${incident.title || 'Untitled'}`}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RecentIncidentsTable;
