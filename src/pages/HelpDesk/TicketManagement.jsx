import { useState } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  TextField,
  Button,
  Grid,
  alpha,
  useTheme,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Paper,
  Divider,
} from '@mui/material';
import {
  Ticket as TicketIcon,
  MessageCircle,
  Clock,
  User,
  X,
  Send,
  Filter,
  CheckCircle2,
  AlertCircle,
  Circle,
  Star,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  addMessageToTicket,
  updateTicketStatus,
  updateTicketPriority,
} from '../../store/slices/ticketSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import FeedbackCard from '../../components/feedback/FeedbackCard';

const TicketManagement = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { tickets } = useAppSelector((state) => state.ticket);
  const { user } = useAppSelector((state) => state.auth);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [replyMessage, setReplyMessage] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in-progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Circle size={16} />;
      case 'in-progress':
        return <Clock size={16} />;
      case 'resolved':
        return <CheckCircle2 size={16} />;
      case 'closed':
        return <X size={16} />;
      default:
        return <Circle size={16} />;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || ticket.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    dispatch(
      addMessageToTicket({
        ticketId: selectedTicket.id,
        message: {
          text: replyMessage,
          sender: 'admin',
          senderName: `${user?.firstName} ${user?.lastName}`,
          timestamp: new Date(),
        },
      })
    );

    // Send notification to ticket creator
    dispatch(
      addNotification({
        id: `notif-${Date.now()}`,
        title: 'New Reply on Your Ticket',
        message: `Admin replied to your ticket: "${selectedTicket.title}"`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
        userId: selectedTicket.createdBy.id,
        category: 'ticket',
        link: '/helpdesk',
      })
    );

    setReplyMessage('');
    toast.success('Reply sent successfully');

    // Update selected ticket to reflect new message
    const updatedTicket = tickets.find((t) => t.id === selectedTicket.id);
    if (updatedTicket) {
      setSelectedTicket(updatedTicket);
    }
  };

  const handleStatusChange = (ticketId, status) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    dispatch(updateTicketStatus({ ticketId, status }));
    toast.success(`Ticket status updated to ${status}`);

    // Send notification to ticket creator
    dispatch(
      addNotification({
        id: `notif-${Date.now()}`,
        title: 'Ticket Status Updated',
        message: `Your ticket "${ticket.title}" status was changed to ${status}`,
        type: status === 'resolved' ? 'success' : 'info',
        read: false,
        createdAt: new Date().toISOString(),
        userId: ticket.createdBy.id,
        category: 'ticket',
        link: '/helpdesk',
      })
    );
    
    // Update selected ticket if it's the one being changed
    if (selectedTicket?.id === ticketId) {
      const updatedTicket = tickets.find((t) => t.id === ticketId);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
    }
  };

  const handlePriorityChange = (ticketId, priority) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    dispatch(updateTicketPriority({ ticketId, priority }));
    toast.success(`Ticket priority updated to ${priority}`);

    // Send notification to ticket creator
    dispatch(
      addNotification({
        id: `notif-${Date.now()}`,
        title: 'Ticket Priority Updated',
        message: `Your ticket "${ticket.title}" priority was changed to ${priority}`,
        type: priority === 'high' ? 'warning' : 'info',
        read: false,
        createdAt: new Date().toISOString(),
        userId: ticket.createdBy.id,
        category: 'ticket',
        link: '/helpdesk',
      })
    );
    
    // Update selected ticket if it's the one being changed
    if (selectedTicket?.id === ticketId) {
      const updatedTicket = tickets.find((t) => t.id === ticketId);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
    }
  };

  return (
    <Stack spacing={3} className="animate-fade-in">
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700} className="gradient-text">
          Ticket Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage support tickets from residents
        </Typography>
      </Stack>

      {/* Filters */}
      <Card className="glass">
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Filter size={20} color={theme.palette.text.secondary} />
            <TextField
              select
              size="small"
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto !important' }}>
              {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card className="glass">
          <CardContent>
            <Stack alignItems="center" spacing={2} py={4}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.grey[500], 0.1),
                }}
              >
                <TicketIcon size={48} color={theme.palette.text.secondary} />
              </Box>
              <Typography variant="h6" color="text.secondary">
                No tickets found
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Tickets will appear here when residents submit help requests
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredTickets.map((ticket, index) => (
            <Grid key={ticket.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                className="glass hover-lift"
                sx={{
                  cursor: 'pointer',
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                }}
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          }}
                        >
                          <TicketIcon size={20} color={theme.palette.primary.main} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          #{ticket.id}
                        </Typography>
                      </Stack>
                      <Chip
                        label={ticket.status}
                        size="small"
                        color={getStatusColor(ticket.status)}
                        icon={getStatusIcon(ticket.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Stack>

                    <Typography variant="h6" fontWeight={600} noWrap>
                      {ticket.title}
                    </Typography>

                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={ticket.priority}
                        size="small"
                        color={getPriorityColor(ticket.priority)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Chip
                        label={ticket.category}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <User size={14} color={theme.palette.text.secondary} />
                        <Typography variant="caption" color="text.secondary">
                          {ticket.createdBy.name}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MessageCircle size={14} color={theme.palette.text.secondary} />
                        <Typography variant="caption" color="text.secondary">
                          {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Clock size={14} color={theme.palette.text.secondary} />
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </Stack>
                      {ticket.feedback && ticket.feedback.length > 0 && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Star size={14} color={theme.palette.warning.main} />
                          <Typography variant="caption" color="text.secondary">
                            Rated {ticket.feedback[0].overallRating.toFixed(1)}/5.0
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            maxHeight: '90vh',
          },
        }}
      >
        {selectedTicket && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                      {selectedTicket.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      #{selectedTicket.id}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={selectedTicket.status}
                      size="small"
                      color={getStatusColor(selectedTicket.status)}
                      icon={getStatusIcon(selectedTicket.status)}
                    />
                    <Chip
                      label={selectedTicket.priority}
                      size="small"
                      color={getPriorityColor(selectedTicket.priority)}
                    />
                    <Chip
                      label={selectedTicket.category}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
                <IconButton onClick={() => setSelectedTicket(null)} size="small">
                  <X size={20} />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
              {/* Ticket Info */}
              <Box sx={{ p: 3, backgroundColor: alpha(theme.palette.grey[100], 0.5) }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Created By
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedTicket.createdBy.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedTicket.createdBy.email}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Created At
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {format(new Date(selectedTicket.createdAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Status"
                      value={selectedTicket.status}
                      onChange={(e) =>
                        handleStatusChange(selectedTicket.id, e.target.value)
                      }
                    >
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="in-progress">In Progress</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Priority"
                      value={selectedTicket.priority}
                      onChange={(e) =>
                        handlePriorityChange(selectedTicket.id, e.target.value)
                      }
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Box>

              {/* Messages */}
              <Box sx={{ p: 3, maxHeight: '400px', overflow: 'auto' }}>
                <Stack spacing={3}>
                  {/* Conversation Messages */}
                  <Stack spacing={2}>
                    {selectedTicket.messages.map((message) => (
                      <Stack
                        key={message.id}
                        direction="row"
                        spacing={1.5}
                        justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                      >
                        {message.sender !== 'user' && (
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor:
                                message.sender === 'bot'
                                  ? theme.palette.primary.main
                                  : theme.palette.secondary.main,
                            }}
                          >
                            {message.sender === 'bot' ? (
                              <AlertCircle size={16} />
                            ) : (
                              <User size={16} />
                            )}
                          </Avatar>
                        )}
                        <Stack spacing={0.5} sx={{ maxWidth: '70%' }}>
                          <Typography variant="caption" color="text.secondary">
                            {message.senderName} •{' '}
                            {format(new Date(message.timestamp), 'MMM dd, HH:mm')}
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              backgroundColor:
                                message.sender === 'user'
                                  ? alpha(theme.palette.primary.main, 0.1)
                                  : message.sender === 'admin'
                                  ? alpha(theme.palette.secondary.main, 0.1)
                                  : alpha(theme.palette.grey[500], 0.1),
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="body2">{message.text}</Typography>
                          </Paper>
                        </Stack>
                        {message.sender === 'user' && (
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: theme.palette.info.main,
                            }}
                          >
                            <User size={16} />
                          </Avatar>
                        )}
                      </Stack>
                    ))}
                  </Stack>

                  {/* Feedback Section */}
                  {selectedTicket.feedback && selectedTicket.feedback.length > 0 && (
                    <>
                      <Divider />
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Star size={20} color={theme.palette.warning.main} />
                          <Typography variant="subtitle2" fontWeight={600}>
                            Customer Feedback
                          </Typography>
                        </Stack>
                        {selectedTicket.feedback.map((feedback) => (
                          <FeedbackCard key={feedback.id} feedback={feedback} />
                        ))}
                      </Stack>
                    </>
                  )}
                </Stack>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} width="100%">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                />
                <Button
                  variant="contained"
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <Send size={20} />
                </Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
};

export default TicketManagement;
