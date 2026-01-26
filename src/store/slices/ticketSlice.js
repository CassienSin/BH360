import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tickets: [
    {
      id: '1',
      title: 'Request for Barangay Clearance',
      category: 'request',
      status: 'open',
      priority: 'medium',
      createdBy: {
        id: 'user1',
        name: 'Juan Dela Cruz',
        email: 'juan@example.com',
      },
      messages: [
        {
          id: '1',
          text: 'Hello! I need assistance with getting a barangay clearance.',
          sender: 'user',
          senderName: 'Juan Dela Cruz',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: '2',
          text: 'I understand you need help with a barangay clearance. Let me create a ticket for you.',
          sender: 'bot',
          senderName: 'AI Assistant',
          timestamp: new Date(Date.now() - 3500000),
        },
      ],
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3500000),
    },
    {
      id: '2',
      title: 'Noise Complaint on Purok 3',
      category: 'complaint',
      status: 'in-progress',
      priority: 'high',
      createdBy: {
        id: 'user2',
        name: 'Maria Santos',
        email: 'maria@example.com',
      },
      assignedTo: {
        id: 'admin1',
        name: 'Admin User',
      },
      messages: [
        {
          id: '1',
          text: 'There is excessive noise coming from a neighbor late at night.',
          sender: 'user',
          senderName: 'Maria Santos',
          timestamp: new Date(Date.now() - 86400000),
        },
        {
          id: '2',
          text: 'I can help you file a noise complaint. Creating a ticket for you now.',
          sender: 'bot',
          senderName: 'AI Assistant',
          timestamp: new Date(Date.now() - 86300000),
        },
        {
          id: '3',
          text: 'Thank you for your report. We will look into this matter immediately.',
          sender: 'admin',
          senderName: 'Admin User',
          timestamp: new Date(Date.now() - 82800000),
        },
      ],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 82800000),
    },
  ],
  loading: false,
};

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    createTicket: (state, action) => {
      const newTicket = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.tickets.unshift(newTicket);
    },
    addMessageToTicket: (state, action) => {
      const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
      if (ticket) {
        const newMessage = {
          ...action.payload.message,
          id: Date.now().toString(),
        };
        ticket.messages.push(newMessage);
        ticket.updatedAt = new Date();
      }
    },
    updateTicketStatus: (state, action) => {
      const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.status = action.payload.status;
        ticket.updatedAt = new Date();
      }
    },
    updateTicketPriority: (state, action) => {
      const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.priority = action.payload.priority;
        ticket.updatedAt = new Date();
      }
    },
    assignTicket: (state, action) => {
      const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.assignedTo = action.payload.assignedTo;
        ticket.updatedAt = new Date();
      }
    },
    deleteTicket: (state, action) => {
      state.tickets = state.tickets.filter((ticket) => ticket.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  createTicket,
  addMessageToTicket,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  deleteTicket,
  setLoading,
} = ticketSlice.actions;
export default ticketSlice.reducer;
