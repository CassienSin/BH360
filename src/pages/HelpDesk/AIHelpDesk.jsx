import { useState, useRef, useEffect } from 'react';
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import {
  Send,
  Bot,
  User,
  Ticket,
  X,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
  Sparkles,
  FileText,
  Search,
  HelpCircle,
  Star,
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {
  generateAIResponse,
  barangayServices,
  faqDatabase,
  getFAQCategories,
} from '../../services/helpDeskAI';
import {
  useAllTicketsRealtime,
  useCreateTicket,
  useAddTicketMessage,
  useAddTicketFeedback,
} from '../../hooks/useTickets';
import ServiceCard from '../../components/helpdesk/ServiceCard';
import ServiceDetailsDialog from '../../components/helpdesk/ServiceDetailsDialog';
import FAQAccordion from '../../components/helpdesk/FAQAccordion';
import FeedbackDialog from '../../components/feedback/FeedbackDialog';
import FeedbackCard from '../../components/feedback/FeedbackCard';

// Helper to safely convert Firestore Timestamp or string to JS Date
const toDate = (ts) => {
  if (!ts) return new Date();
  if (typeof ts.toDate === 'function') return ts.toDate();
  return new Date(ts);
};

const AIHelpDesk = () => {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const chatEndRef = useRef(null);

  // --- Firestore real-time tickets ---
  const { data: allTickets, loading: ticketsLoading } = useAllTicketsRealtime();
  const myTickets = (allTickets || []).filter((t) => t.userId === user?.id || t.createdBy?.id === user?.id);

  // --- Mutations ---
  const createTicketMutation = useCreateTicket();
  const addMessageMutation = useAddTicketMessage();
  const addFeedbackMutation = useAddTicketFeedback();

  // Issue #23: Update document title
  useEffect(() => {
    document.title = 'AI Help Desk – BH360';
  }, []);

  const [currentTab, setCurrentTab] = useState(0);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I'm your AI Barangay Assistant 🤖\n\nI can help you with:\n• Information about barangay services and certificates\n• Requirements for clearances and permits\n• Answering frequently asked questions\n• Creating support tickets for complex concerns\n\nHow can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedTicketForFeedback, setSelectedTicketForFeedback] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [ticketData, setTicketData] = useState({
    title: '',
    category: 'general',
    priority: 'medium',
  });

  // Derive selectedTicket from live data (auto-updates after mutations)
  const selectedTicket = selectedTicketId
    ? myTickets.find((t) => t.id === selectedTicketId) || null
    : null;

  // Services state
  const [selectedService, setSelectedService] = useState(null);
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // FAQ state
  const [faqFilter, setFaqFilter] = useState('all');
  const [faqSearch, setFaqSearch] = useState('');

  // Filtered services
  const filteredServices = Object.values(barangayServices).filter((service) => {
    const matchesCategory = serviceFilter === 'all' || service.category === serviceFilter;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered FAQs
  const filteredFAQs = faqDatabase.filter((faq) => {
    const matchesCategory = faqFilter === 'all' || faq.category === faqFilter;
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Core send logic — accepts an explicit text so it can be called from
  // both the input field and suggestion chips without stale-closure issues.
  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMessage = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      const aiResponse = generateAIResponse(trimmed);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: aiResponse.suggestions || [],
        relatedService: aiResponse.relatedService,
        needsTicket: aiResponse.needsTicket,
      };
      setMessages((prev) => [...prev, botMessage]);

      if (aiResponse.needsTicket) {
        setTicketData({
          title: trimmed.substring(0, 100),
          category: 'general',
          priority: 'medium',
        });
      }
    }, 800);
  };

  const handleSend = () => {
    sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === 'Create support ticket') {
      setShowTicketDialog(true);
    } else if (suggestion === 'View all services') {
      setCurrentTab(1);
    } else if (suggestion === 'View FAQs' || suggestion === 'Common Questions') {
      setCurrentTab(2);
    } else if (suggestion.startsWith('View ') && suggestion.includes(' details')) {
      const serviceName = suggestion.replace('View ', '').replace(' details', '');
      const service = Object.values(barangayServices).find((s) =>
        s.name.toLowerCase().includes(serviceName.toLowerCase())
      );
      if (service) {
        setSelectedService(service);
        setCurrentTab(1);
      }
    } else {
      // Send directly — avoids stale-closure issue of setting state then calling handleSend
      sendMessage(suggestion);
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketData.title.trim()) {
      toast.error('Please provide a title for the ticket');
      return;
    }
    if (!user) {
      toast.error('You must be logged in to create a ticket');
      return;
    }

    const conversationMessages = messages
      .filter((msg) => msg.sender === 'user')
      .map((msg, index) => ({
        id: `msg-${Date.now()}-${index}`,
        text: msg.text,
        sender: 'user',
        senderName: `${user.firstName} ${user.lastName}`,
        timestamp: new Date(msg.timestamp).toISOString(),
      }));

    conversationMessages.push({
      id: `msg-bot-${Date.now()}`,
      text: `Ticket created: ${ticketData.title}`,
      sender: 'bot',
      senderName: 'AI Assistant',
      timestamp: new Date().toISOString(),
    });

    try {
      await createTicketMutation.mutateAsync({
        title: ticketData.title,
        category: ticketData.category,
        status: 'open',
        priority: ticketData.priority,
        userId: user.id,
        createdBy: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        messages: conversationMessages,
      });

      toast.success('Support ticket created successfully!');

      const confirmMessage = {
        id: Date.now().toString(),
        text: "Great! I've created a support ticket for you. Our team will review it and get back to you soon. You can check your tickets in the \"My Tickets\" tab.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, confirmMessage]);

      setShowTicketDialog(false);
      setTicketData({ title: '', category: 'general', priority: 'medium' });
      setCurrentTab(3);
    } catch {
      // error toast handled in mutation
    }
  };

  const handleSendTicketReply = async () => {
    if (!selectedTicketId || !replyMessage.trim() || !user) return;

    try {
      await addMessageMutation.mutateAsync({
        ticketId: selectedTicketId,
        message: {
          text: replyMessage,
          sender: 'user',
          senderName: `${user.firstName} ${user.lastName}`,
        },
      });
      setReplyMessage('');
      toast.success('Reply sent successfully');
    } catch {
      // error handled by mutation
    }
  };

  const handleRelatedServiceClick = (serviceId) => {
    const service = barangayServices[serviceId];
    if (service) {
      setSelectedService(service);
      setCurrentTab(1);
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    if (!selectedTicketForFeedback) return;
    try {
      await addFeedbackMutation.mutateAsync({
        ticketId: selectedTicketForFeedback.id,
        feedback: {
          ...feedbackData,
          userId: user?.id,
          userName: `${user?.firstName} ${user?.lastName}`,
        },
      });
      setFeedbackDialogOpen(false);
      setSelectedTicketForFeedback(null);
    } catch {
      // handled by mutation
    }
  };

  const handleRateTicket = (ticket) => {
    setSelectedTicketForFeedback(ticket);
    setFeedbackDialogOpen(true);
  };

  const getStatusColor = (status) => {
    const map = { open: 'default', 'in-progress': 'warning', resolved: 'success', closed: 'error' };
    return map[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const map = { low: 'success', medium: 'warning', high: 'error' };
    return map[priority] || 'warning';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Circle size={16} />;
      case 'in-progress': return <Clock size={16} />;
      case 'resolved': return <CheckCircle2 size={16} />;
      case 'closed': return <X size={16} />;
      default: return <Circle size={16} />;
    }
  };

  return (
    <Stack spacing={3} sx={{ height: { xs: 'auto', sm: 'calc(100vh - 200px)' }, minHeight: { xs: 0, sm: 'auto' } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="start">
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
              }}
            >
              <Sparkles size={24} />
            </Box>
            {/* Issue #6: component="h1" */}
            <Typography variant="h4" component="h1" fontWeight={700} className="gradient-text">
              AI Help Desk
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Get instant answers about barangay services and create support tickets
          </Typography>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Tabs
        value={currentTab}
        onChange={(_, newValue) => setCurrentTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ '& .MuiTab-root': { fontWeight: 600, minWidth: { xs: 'auto', sm: 160 }, px: { xs: 1.5, sm: 2 } } }}
      >
        <Tab icon={<MessageCircle size={18} />} iconPosition="start" label="Chat" />
        <Tab icon={<FileText size={18} />} iconPosition="start" label="Services" />
        <Tab icon={<HelpCircle size={18} />} iconPosition="start" label="FAQs" />
        <Tab
          icon={<Ticket size={18} />}
          iconPosition="start"
          label={
            <Stack direction="row" spacing={0.5} alignItems="center">
              <span>Tickets</span>
              {myTickets.length > 0 && (
                <Chip label={myTickets.length} size="small" color="primary" sx={{ height: 20 }} />
              )}
            </Stack>
          }
        />
      </Tabs>

      {/* Chat Tab */}
      {currentTab === 0 && (
        <Card
          elevation={0}
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <CardContent sx={{ flexGrow: 1, overflow: 'auto', maxHeight: { xs: '40vh', sm: 'calc(100vh - 400px)' } }}>
            <Stack spacing={2}>
              {messages.map((message) => (
                <Box key={message.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      gap: 1.5,
                    }}
                  >
                    {message.sender === 'bot' && (
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        }}
                      >
                        <Bot size={20} />
                      </Avatar>
                    )}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        maxWidth: '75%',
                        backgroundColor:
                          message.sender === 'user'
                            ? theme.palette.primary.main
                            : alpha(theme.palette.grey[500], 0.08),
                        color: message.sender === 'user' ? 'white' : 'text.primary',
                        borderRadius: 3,
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                        {message.text}
                      </Typography>

                      {message.suggestions && message.suggestions.length > 0 && (
                        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                          {message.suggestions.map((suggestion, index) => (
                            <Chip
                              key={index}
                              label={suggestion}
                              size="small"
                              onClick={() => handleSuggestionClick(suggestion)}
                              sx={{
                                cursor: 'pointer',
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                                mb: 0.5,
                              }}
                            />
                          ))}
                        </Stack>
                      )}

                      {message.relatedService && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.15) },
                          }}
                          onClick={() => {
                            setSelectedService(message.relatedService);
                            setCurrentTab(1);
                          }}
                        >
                          <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
                            📄 {message.relatedService.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Click to view full details →
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                    {message.sender === 'user' && (
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <User size={20} />
                      </Avatar>
                    )}
                  </Box>
                </Box>
              ))}
              <div ref={chatEndRef} />
            </Stack>
          </CardContent>

          <Box sx={{ p: { xs: 1.5, sm: 2 }, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={1}>
              {/* Issue #25: whiteSpace: 'nowrap' prevents text wrapping in narrow container */}
              <Button
                variant="outlined"
                startIcon={<Ticket size={18} />}
                onClick={() => setShowTicketDialog(true)}
                size="small"
                sx={{ whiteSpace: 'nowrap', flexShrink: 0, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Create Ticket
              </Button>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask me anything about barangay services..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!inputMessage.trim()}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <Send size={20} />
              </Button>
            </Stack>
          </Box>
        </Card>
      )}

      {/* Services Tab */}
      {currentTab === 1 && (
        <Stack spacing={3} sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <TextField
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{ flex: 1, minWidth: 250 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={serviceFilter}
                    label="Category"
                    onChange={(e) => setServiceFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="Certificates">Certificates</MenuItem>
                    <MenuItem value="Permits">Permits</MenuItem>
                    <MenuItem value="IDs">IDs</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {filteredServices.map((service) => (
              <Grid key={service.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <ServiceCard service={service} onViewDetails={(s) => setSelectedService(s)} />
              </Grid>
            ))}
          </Grid>

          {filteredServices.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">No services found</Typography>
              <Typography variant="body2" color="text.secondary">Try adjusting your search or filters</Typography>
            </Box>
          )}
        </Stack>
      )}

      {/* FAQs Tab */}
      {currentTab === 2 && (
        <Stack spacing={3} sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <TextField
                  placeholder="Search FAQs..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  size="small"
                  sx={{ flex: 1, minWidth: 250 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={faqFilter}
                    label="Category"
                    onChange={(e) => setFaqFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {getFAQCategories().map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>

          <Box>
            {filteredFAQs.map((faq) => (
              <FAQAccordion key={faq.id} faq={faq} onRelatedServiceClick={handleRelatedServiceClick} />
            ))}
          </Box>

          {filteredFAQs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">No FAQs found</Typography>
              <Typography variant="body2" color="text.secondary">Try adjusting your search or filters</Typography>
            </Box>
          )}
        </Stack>
      )}

      {/* My Tickets Tab */}
      {currentTab === 3 && (
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {ticketsLoading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : myTickets.length === 0 ? (
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Stack alignItems="center" spacing={2} py={4}>
                  <Box sx={{ p: 2, borderRadius: 3, backgroundColor: alpha(theme.palette.grey[500], 0.1) }}>
                    <Ticket size={48} color={theme.palette.text.secondary} />
                  </Box>
                  <Typography variant="h6" color="text.secondary">No tickets yet</Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Create your first ticket by chatting with the AI assistant
                  </Typography>
                  <Button variant="contained" startIcon={<MessageCircle size={18} />} onClick={() => setCurrentTab(0)}>
                    Start Chat
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {myTickets.map((ticket) => (
                <Grid key={ticket.id} size={{ xs: 12, md: 6 }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-2px)' },
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="start">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ p: 1, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                              <Ticket size={20} color={theme.palette.primary.main} />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              #{ticket.id.slice(-6).toUpperCase()}
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

                        <Box sx={{ cursor: 'pointer' }} onClick={() => setSelectedTicketId(ticket.id)}>
                          <Typography variant="h6" fontWeight={600} noWrap>{ticket.title}</Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <Chip label={ticket.priority} size="small" color={getPriorityColor(ticket.priority)} sx={{ textTransform: 'capitalize' }} />
                          <Chip label={ticket.category} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                        </Stack>

                        <Divider />

                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <MessageCircle size={14} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary">
                              {(ticket.messages || []).length} message{(ticket.messages || []).length !== 1 ? 's' : ''}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Clock size={14} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary">
                              {format(toDate(ticket.createdAt), 'MMM dd, yyyy HH:mm')}
                            </Typography>
                          </Stack>
                        </Stack>

                        {(ticket.status === 'resolved' || ticket.status === 'closed') &&
                          !ticket.feedback?.some((f) => f.userId === user?.id) && (
                            <>
                              <Divider />
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Star size={16} />}
                                onClick={(e) => { e.stopPropagation(); handleRateTicket(ticket); }}
                                fullWidth
                              >
                                Rate Experience
                              </Button>
                            </>
                          )}

                        {ticket.feedback && ticket.feedback.length > 0 && (
                          <>
                            <Divider />
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Star size={14} color={theme.palette.warning.main} />
                              <Typography variant="caption" color="text.secondary">
                                Rated {ticket.feedback[0].overallRating?.toFixed(1)}/5.0
                              </Typography>
                            </Stack>
                          </>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Service Details Dialog */}
      <ServiceDetailsDialog open={!!selectedService} onClose={() => setSelectedService(null)} service={selectedService} />

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={() => { setFeedbackDialogOpen(false); setSelectedTicketForFeedback(null); }}
        onSubmit={handleFeedbackSubmit}
        type="ticket"
        itemTitle={selectedTicketForFeedback?.title}
      />

      {/* Create Ticket Dialog */}
      <Dialog open={showTicketDialog} onClose={() => setShowTicketDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ p: 1, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                <Ticket size={24} color={theme.palette.primary.main} />
              </Box>
              <Typography variant="h6" fontWeight={700}>Create Support Ticket</Typography>
            </Stack>
            <IconButton onClick={() => setShowTicketDialog(false)} size="small"><X size={20} /></IconButton>
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
              onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
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
              onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
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
          <Button onClick={() => setShowTicketDialog(false)} variant="outlined">Cancel</Button>
          <Button
            onClick={handleCreateTicket}
            variant="contained"
            disabled={createTicketMutation.isPending}
          >
            {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicketId} onClose={() => setSelectedTicketId(null)} maxWidth="md" fullWidth>
        {selectedTicket && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="h6" fontWeight={700}>{selectedTicket.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      #{selectedTicket.id.slice(-6).toUpperCase()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Chip label={selectedTicket.status} size="small" color={getStatusColor(selectedTicket.status)} icon={getStatusIcon(selectedTicket.status)} />
                    <Chip label={selectedTicket.priority} size="small" color={getPriorityColor(selectedTicket.priority)} />
                    <Chip label={selectedTicket.category} size="small" variant="outlined" />
                  </Stack>
                </Stack>
                <IconButton onClick={() => setSelectedTicketId(null)} size="small"><X size={20} /></IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, maxHeight: '500px', overflow: 'auto' }}>
              <Stack spacing={3}>
                <Stack spacing={2}>
                  {(selectedTicket.messages || []).map((message, idx) => {
                    const isOwn = message.sender === 'user';
                    return (
                      <Stack
                        key={message.id || idx}
                        direction="row"
                        spacing={1.5}
                        justifyContent={isOwn ? 'flex-end' : 'flex-start'}
                      >
                        {!isOwn && (
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: message.sender === 'bot' ? theme.palette.primary.main : theme.palette.secondary.main,
                            }}
                          >
                            {message.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                          </Avatar>
                        )}
                        <Stack spacing={0.5} sx={{ maxWidth: '70%', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                          <Typography variant="caption" color="text.secondary">
                            {message.senderName} • {format(toDate(message.timestamp), 'MMM dd, HH:mm')}
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              backgroundColor: isOwn
                                ? alpha(theme.palette.primary.main, 0.15)
                                : (message.sender === 'staff' || message.sender === 'admin')
                                ? alpha(theme.palette.secondary.main, 0.1)
                                : alpha(theme.palette.grey[500], 0.1),
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="body2">{message.text}</Typography>
                          </Paper>
                        </Stack>
                        {isOwn && (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                            <User size={16} />
                          </Avatar>
                        )}
                      </Stack>
                    );
                  })}
                </Stack>

                {selectedTicket.feedback && selectedTicket.feedback.length > 0 && (
                  <>
                    <Divider />
                    <Stack spacing={2}>
                      <Typography variant="subtitle2" fontWeight={600}>Feedback</Typography>
                      {selectedTicket.feedback.map((feedback) => (
                        <FeedbackCard key={feedback.id} feedback={feedback} />
                      ))}
                    </Stack>
                  </>
                )}
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
                  disabled={!replyMessage.trim() || addMessageMutation.isPending}
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
