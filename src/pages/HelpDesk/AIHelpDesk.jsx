import { useState } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Avatar,
  Paper,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  alpha,
  Tabs,
  Tab,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import { Send, Bot, User, Ticket, X, MessageCircle, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createTicket, addMessageToTicket } from '../../store/slices/ticketSlice';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const AIHelpDesk = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tickets } = useAppSelector((state) => state.ticket);
  const [currentTab, setCurrentTab] = useState(0);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [ticketData, setTicketData] = useState({
    title: '',
    category: 'general',
    priority: 'medium',
  });

  // Filter tickets created by current user
  const myTickets = tickets.filter((t) => t.createdBy.id === user?.id);

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    const userMessage = inputMessage;
    setInputMessage('');

    // Simulate bot response with ticket creation option
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: "I understand you need assistance. Would you like me to create a support ticket for you? This will allow our team to help you more effectively.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);

      // Pre-fill ticket data based on message
      setTicketData({
        title: userMessage.substring(0, 100),
        category: 'general',
        priority: 'medium',
      });
    }, 1000);
  };

  const handleCreateTicket = () => {
    if (!ticketData.title.trim()) {
      toast.error('Please provide a title for the ticket');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create a ticket');
      return;
    }

    // Create initial bot message for the ticket
    const initialMessage = {
      id: `msg-${Date.now()}`,
      text: `Ticket created: ${ticketData.title}`,
      sender: 'bot',
      senderName: 'AI Assistant',
      timestamp: new Date(),
    };

    // Add user's conversation messages to ticket
    const conversationMessages = messages
      .filter((msg) => msg.sender === 'user')
      .map((msg, index) => ({
        id: `msg-${Date.now()}-${index}`,
        text: msg.text,
        sender: 'user',
        senderName: `${user.firstName} ${user.lastName}`,
        timestamp: msg.timestamp,
      }));

    dispatch(
      createTicket({
        title: ticketData.title,
        category: ticketData.category,
        status: 'open',
        priority: ticketData.priority,
        createdBy: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        messages: [...conversationMessages, initialMessage],
      })
    );

    toast.success('Support ticket created successfully!');

    // Add confirmation message to chat
    const confirmMessage = {
      id: Date.now().toString(),
      text: 'Great! I\'ve created a support ticket for you. Our team will review it and get back to you soon. You can check your tickets in the "My Tickets" tab.',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, confirmMessage]);

    setShowTicketDialog(false);
    setTicketData({
      title: '',
      category: 'general',
      priority: 'medium',
    });
    setCurrentTab(1); // Switch to My Tickets tab
  };

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

  const handleSendTicketReply = () => {
    if (!selectedTicket || !replyMessage.trim() || !user) return;

    dispatch(
      addMessageToTicket({
        ticketId: selectedTicket.id,
        message: {
          text: replyMessage,
          sender: 'user',
          senderName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date(),
        },
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

  return (
    <Stack spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="start">
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700} className="gradient-text">
            AI Help Desk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Get instant answers and create support tickets
          </Typography>
        </Stack>
      </Stack>

      <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
        <Tab label="Chat with AI" />
        <Tab
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>My Tickets</span>
              {myTickets.length > 0 && (
                <Chip label={myTickets.length} size="small" color="primary" />
              )}
            </Stack>
          }
        />
      </Tabs>

      {/* Chat Tab */}
      {currentTab === 0 && (
        <Card
          className="glass"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Stack spacing={2}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    gap: 1,
                  }}
                >
                  {message.sender === 'bot' && (
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Bot size={20} />
                    </Avatar>
                  )}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      backgroundColor:
                        message.sender === 'user'
                          ? theme.palette.primary.main
                          : alpha(theme.palette.grey[500], 0.1),
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>
                  </Paper>
                  {message.sender === 'user' && (
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <User size={20} />
                    </Avatar>
                  )}
                </Box>
              ))}
            </Stack>
          </CardContent>

          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Ticket size={18} />}
                onClick={() => setShowTicketDialog(true)}
                size="small"
              >
                Create Ticket
              </Button>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button
                variant="contained"
                onClick={handleSend}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <Send size={20} />
              </Button>
            </Stack>
          </Box>
        </Card>
      )}

      {/* My Tickets Tab */}
      {currentTab === 1 && (
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {myTickets.length === 0 ? (
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
                    <Ticket size={48} color={theme.palette.text.secondary} />
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    No tickets yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Create your first ticket by chatting with the AI assistant
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<MessageCircle size={18} />}
                    onClick={() => setCurrentTab(0)}
                  >
                    Start Chat
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {myTickets.map((ticket, index) => (
                <Grid key={ticket.id} size={{ xs: 12, md: 6 }}>
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
                              <Ticket size={20} color={theme.palette.primary.main} />
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
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Create Ticket Dialog */}
      <Dialog
        open={showTicketDialog}
        onClose={() => setShowTicketDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <Ticket size={24} color={theme.palette.primary.main} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Create Support Ticket
              </Typography>
            </Stack>
            <IconButton onClick={() => setShowTicketDialog(false)} size="small">
              <X size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Ticket Title"
              value={ticketData.title}
              onChange={(e) => setTicketData({ ...ticketData, title: e.target.value })}
              required
              fullWidth
              placeholder="Brief description of your issue"
            />

            <TextField
              select
              label="Category"
              value={ticketData.category}
              onChange={(e) =>
                setTicketData({
                  ...ticketData,
                  category: e.target.value,
                })
              }
              required
              fullWidth
            >
              <MenuItem value="general">General Inquiry</MenuItem>
              <MenuItem value="incident">Incident Report</MenuItem>
              <MenuItem value="complaint">Complaint</MenuItem>
              <MenuItem value="request">Document Request</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
              select
              label="Priority"
              value={ticketData.priority}
              onChange={(e) =>
                setTicketData({
                  ...ticketData,
                  priority: e.target.value,
                })
              }
              required
              fullWidth
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Your conversation history will be included in the ticket to help our team understand your issue better.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowTicketDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleCreateTicket} variant="contained">
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>

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

            <DialogContent dividers sx={{ p: 3, maxHeight: '500px', overflow: 'auto' }}>
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
                          <Bot size={16} />
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
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} width="100%">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendTicketReply()}
                />
                <Button
                  variant="contained"
                  onClick={handleSendTicketReply}
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

export default AIHelpDesk;
