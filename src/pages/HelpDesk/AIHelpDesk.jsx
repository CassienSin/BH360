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
  BookOpen,
  FileText,
  Search,
  HelpCircle,
  Star,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createTicket, addMessageToTicket, addFeedbackToTicket } from '../../store/slices/ticketSlice';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { generateAIResponse, barangayServices, faqDatabase, getServicesByCategory, getFAQCategories } from '../../services/helpDeskAI';
import ServiceCard from '../../components/helpdesk/ServiceCard';
import ServiceDetailsDialog from '../../components/helpdesk/ServiceDetailsDialog';
import FAQAccordion from '../../components/helpdesk/FAQAccordion';
import FeedbackDialog from '../../components/feedback/FeedbackDialog';
import FeedbackCard from '../../components/feedback/FeedbackCard';

const AIHelpDesk = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tickets } = useAppSelector((state) => state.ticket);
  const chatEndRef = useRef(null);

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
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [ticketData, setTicketData] = useState({
    title: '',
    category: 'general',
    priority: 'medium',
  });

  // Services state
  const [selectedService, setSelectedService] = useState(null);
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // FAQ state
  const [faqFilter, setFaqFilter] = useState('all');
  const [faqSearch, setFaqSearch] = useState('');

  // Filter tickets created by current user
  const myTickets = tickets.filter((t) => t.createdBy.id === user?.id);

  // Filtered services
  const filteredServices = Object.values(barangayServices).filter((service) => {
    const matchesCategory = serviceFilter === 'all' || service.category === serviceFilter;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered FAQs
  const filteredFAQs = faqDatabase.filter((faq) => {
    const matchesCategory = faqFilter === 'all' || faq.category === faqFilter;
    const matchesSearch = faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const newMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    const userQuery = inputMessage;
    setInputMessage('');

    // Generate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userQuery);
      
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

      // Pre-fill ticket if AI suggests it
      if (aiResponse.needsTicket) {
        setTicketData({
          title: userQuery.substring(0, 100),
          category: 'general',
          priority: 'medium',
        });
      }
    }, 800);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === 'Create support ticket') {
      setShowTicketDialog(true);
    } else if (suggestion === 'View all services') {
      setCurrentTab(1);
    } else if (suggestion === 'View FAQs' || suggestion === 'Common Questions') {
      setCurrentTab(2);
    } else if (suggestion.startsWith('View ') && suggestion.includes(' details')) {
      // Extract service name and show details
      const serviceName = suggestion.replace('View ', '').replace(' details', '');
      const service = Object.values(barangayServices).find(
        s => s.name.toLowerCase().includes(serviceName.toLowerCase())
      );
      if (service) {
        setSelectedService(service);
        setCurrentTab(1);
      }
    } else {
      // Send as message
      setInputMessage(suggestion);
      setTimeout(() => handleSend(), 100);
    }
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

    const initialMessage = {
      id: `msg-${Date.now()}`,
      text: `Ticket created: ${ticketData.title}`,
      sender: 'bot',
      senderName: 'AI Assistant',
      timestamp: new Date(),
    };

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
    setCurrentTab(3); // Switch to My Tickets tab
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

    const updatedTicket = tickets.find((t) => t.id === selectedTicket.id);
    if (updatedTicket) {
      setSelectedTicket(updatedTicket);
    }
  };

  const handleRelatedServiceClick = (serviceId) => {
    const service = barangayServices[serviceId];
    if (service) {
      setSelectedService(service);
      setCurrentTab(1);
    }
  };

  const handleFeedbackSubmit = (feedbackData) => {
    if (selectedTicketForFeedback) {
      dispatch(
        addFeedbackToTicket({
          ticketId: selectedTicketForFeedback.id,
          feedback: {
            ...feedbackData,
            userId: user?.id,
            userName: `${user?.firstName} ${user?.lastName}`,
          },
        })
      );
      setFeedbackDialogOpen(false);
      setSelectedTicketForFeedback(null);
    }
  };

  const handleRateTicket = (ticket) => {
    setSelectedTicketForFeedback(ticket);
    setFeedbackDialogOpen(true);
  };

  return (
    <Stack spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
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
            <Typography variant="h4" fontWeight={700}>
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
        sx={{
          '& .MuiTab-root': {
            fontWeight: 600,
          },
        }}
      >
        <Tab
          icon={<MessageCircle size={18} />}
          iconPosition="start"
          label="Chat with AI"
        />
        <Tab
          icon={<FileText size={18} />}
          iconPosition="start"
          label="Services"
        />
        <Tab
          icon={<HelpCircle size={18} />}
          iconPosition="start"
          label="FAQs"
        />
        <Tab
          icon={<Ticket size={18} />}
          iconPosition="start"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>My Tickets</span>
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
          <CardContent sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 'calc(100vh - 400px)' }}>
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
                      
                      {/* Suggestions */}
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
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                },
                                mb: 0.5,
                              }}
                            />
                          ))}
                        </Stack>
                      )}

                      {/* Related Service */}
                      {message.relatedService && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.info.main, 0.15),
                            },
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
          {/* Filters */}
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

          {/* Services Grid */}
          <Grid container spacing={3}>
            {filteredServices.map((service) => (
              <Grid key={service.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <ServiceCard
                  service={service}
                  onViewDetails={(s) => setSelectedService(s)}
                />
              </Grid>
            ))}
          </Grid>

          {filteredServices.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No services found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          )}
        </Stack>
      )}

      {/* FAQs Tab */}
      {currentTab === 2 && (
        <Stack spacing={3} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {/* Filters */}
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
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>

          {/* FAQs List */}
          <Box>
            {filteredFAQs.map((faq) => (
              <FAQAccordion
                key={faq.id}
                faq={faq}
                onRelatedServiceClick={handleRelatedServiceClick}
              />
            ))}
          </Box>

          {filteredFAQs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No FAQs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          )}
        </Stack>
      )}

      {/* My Tickets Tab - Keep existing implementation */}
      {currentTab === 3 && (
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {myTickets.length === 0 ? (
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
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
              {myTickets.map((ticket) => (
                <Grid key={ticket.id} size={{ xs: 12, md: 6 }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)',
                      },
                    }}
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

                        <Box
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <Typography variant="h6" fontWeight={600} noWrap>
                            {ticket.title}
                          </Typography>
                        </Box>

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

                        {(ticket.status === 'resolved' || ticket.status === 'closed') && 
                         !ticket.feedback?.some(f => f.userId === user?.id) && (
                          <>
                            <Divider />
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Star size={16} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateTicket(ticket);
                              }}
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
                                Rated {ticket.feedback[0].overallRating.toFixed(1)}/5.0
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
      <ServiceDetailsDialog
        open={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService}
      />

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={() => {
          setFeedbackDialogOpen(false);
          setSelectedTicketForFeedback(null);
        }}
        onSubmit={handleFeedbackSubmit}
        type="ticket"
        itemTitle={selectedTicketForFeedback?.title}
      />

      {/* Create Ticket Dialog */}
      <Dialog
        open={showTicketDialog}
        onClose={() => setShowTicketDialog(false)}
        maxWidth="sm"
        fullWidth
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

      {/* Ticket Detail Dialog - Keep existing implementation */}
      <Dialog
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        maxWidth="md"
        fullWidth
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
              <Stack spacing={3}>
                {/* Messages */}
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

                {/* Feedback Section */}
                {selectedTicket.feedback && selectedTicket.feedback.length > 0 && (
                  <>
                    <Divider />
                    <Stack spacing={2}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Feedback
                      </Typography>
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
