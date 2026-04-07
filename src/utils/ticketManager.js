/**
 * Ticket Manager
 * 
 * Stores and retrieves support tickets from localStorage.
 * Each ticket: { id, customer, subject, status, priority, tag, messages[], createdAt, updatedAt }
 */

const TICKETS_STORAGE_KEY = 'rumpel_tickets';

export function getTickets() {
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTickets(tickets) {
  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
}

export function createTicket(ticket) {
  const tickets = getTickets();
  const newTicket = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    customer: (ticket.customer || '').trim() || 'Anonymous',
    subject: (ticket.subject || '').trim() || 'No subject',
    status: ticket.status || 'open',
    priority: ticket.priority || 'medium',
    tag: ticket.tag || 'General',
    messages: ticket.messages || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tickets.unshift(newTicket);
  saveTickets(tickets);
  return newTicket;
}

export function updateTicket(id, updates) {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.id === id);
  if (idx === -1) return null;
  tickets[idx] = { ...tickets[idx], ...updates, updatedAt: new Date().toISOString() };
  saveTickets(tickets);
  return tickets[idx];
}

export function deleteTicket(id) {
  const tickets = getTickets().filter(t => t.id !== id);
  saveTickets(tickets);
}

export function addMessageToTicket(ticketId, message) {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx === -1) return null;
  const msg = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    role: message.role || 'customer', // 'customer' | 'agent' | 'ai'
    text: (message.text || '').trim(),
    timestamp: new Date().toISOString(),
  };
  tickets[idx].messages.push(msg);
  tickets[idx].updatedAt = msg.timestamp;
  saveTickets(tickets);
  return tickets[idx];
}

// Status helpers
export const TICKET_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

export const STATUS_COLORS = {
  'open':        '#FF9800',
  'in-progress': '#2196F3',
  'resolved':    '#4CAF50',
  'closed':      '#9E9E9E',
};
