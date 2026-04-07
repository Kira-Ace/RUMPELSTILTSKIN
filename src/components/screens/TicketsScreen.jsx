import { useState, useEffect, useRef } from 'react';
import { Plus, X, ChevronDown, Send, Circle, CheckCircle, Clock, Archive, Trash2, ArrowLeft } from 'lucide-react';
import TopBar from '../common/TopBar.jsx';
import { getTickets, createTicket, updateTicket, deleteTicket, addMessageToTicket, TICKET_STATUSES, STATUS_COLORS } from '../../utils/ticketManager.js';
import { TICKET_TAGS, TAG_COLORS, PRIORITY_COLORS, TICKET_PRIORITIES } from '../../utils/appConfig.js';
import '../../styles/tickets.css';

const STATUS_ICONS = {
  'open':        Circle,
  'in-progress': Clock,
  'resolved':    CheckCircle,
  'closed':      Archive,
};

export default function TicketsScreen() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | status values
  const [showCreate, setShowCreate] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [form, setForm] = useState({ customer: '', subject: '', tag: 'General', priority: 'medium' });
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setTickets(getTickets());
  }, []);

  const refreshTickets = () => setTickets(getTickets());

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  const handleCreate = () => {
    if (!form.subject.trim()) return;
    const ticket = createTicket(form);
    setTickets(prev => [ticket, ...prev]);
    setForm({ customer: '', subject: '', tag: 'General', priority: 'medium' });
    setShowCreate(false);
  };

  const handleStatusChange = (ticketId, newStatus) => {
    updateTicket(ticketId, { status: newStatus });
    refreshTickets();
    if (activeTicket?.id === ticketId) {
      setActiveTicket(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleDelete = (ticketId) => {
    deleteTicket(ticketId);
    refreshTickets();
    if (activeTicket?.id === ticketId) setActiveTicket(null);
  };

  const handleReply = () => {
    if (!replyText.trim() || !activeTicket) return;
    const updated = addMessageToTicket(activeTicket.id, { role: 'agent', text: replyText });
    setActiveTicket(updated);
    setReplyText('');
    refreshTickets();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages?.length]);

  // ─── Ticket Detail View ─────────────────────────────
  if (activeTicket) {
    const StatusIcon = STATUS_ICONS[activeTicket.status] || Circle;
    return (
      <>
        <TopBar />
        <div className="scroll-content">
          <div className="ticket-detail-wrap">
            <button className="ticket-back-btn" onClick={() => { setActiveTicket(null); refreshTickets(); }}>
              <ArrowLeft size={20} />
            </button>

            <div className="ticket-detail-header">
              <div className="ticket-detail-subject">{activeTicket.subject}</div>
              <div className="ticket-detail-meta">
                <span className="ticket-tag" style={{ backgroundColor: TAG_COLORS[activeTicket.tag] || '#607D8B' }}>
                  {activeTicket.tag}
                </span>
                <span className="ticket-priority" style={{ color: PRIORITY_COLORS[activeTicket.priority] }}>
                  {activeTicket.priority}
                </span>
                <span className="ticket-customer">{activeTicket.customer}</span>
              </div>
            </div>

            {/* Status changer */}
            <div className="ticket-status-bar">
              {TICKET_STATUSES.map(s => {
                const Icon = STATUS_ICONS[s];
                return (
                  <button
                    key={s}
                    className={`ticket-status-btn ${activeTicket.status === s ? 'active' : ''}`}
                    style={activeTicket.status === s ? { backgroundColor: STATUS_COLORS[s], color: '#fff' } : {}}
                    onClick={() => handleStatusChange(activeTicket.id, s)}
                  >
                    <Icon size={13} /> {s}
                  </button>
                );
              })}
            </div>

            {/* Messages */}
            <div className="ticket-messages">
              {activeTicket.messages.length === 0 && (
                <div className="ticket-no-messages">No messages yet. Start the conversation below.</div>
              )}
              {activeTicket.messages.map(msg => (
                <div key={msg.id} className={`ticket-msg ticket-msg-${msg.role}`}>
                  <div className="ticket-msg-role">{msg.role === 'customer' ? '👤 Customer' : msg.role === 'ai' ? '🤖 AI' : '💬 Agent'}</div>
                  <div className="ticket-msg-text">{msg.text}</div>
                  <div className="ticket-msg-time">{new Date(msg.timestamp).toLocaleString()}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <div className="ticket-reply-bar">
              <input
                className="ticket-reply-input"
                placeholder="Type a reply…"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReply()}
              />
              <button className="ticket-reply-send" onClick={handleReply} disabled={!replyText.trim()}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Ticket List View ───────────────────────────────
  return (
    <>
      <TopBar />
      <div className="scroll-content">
        <div className="tickets-wrap">
          <div className="tickets-header">
            <h1 className="tickets-title">Tickets</h1>
            <button className="tickets-add-btn" onClick={() => setShowCreate(true)}>
              <Plus size={18} />
            </button>
          </div>

          {/* Filters */}
          <div className="tickets-filters">
            {['all', ...TICKET_STATUSES].map(s => (
              <button
                key={s}
                className={`tickets-filter-btn ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {/* Create form */}
          {showCreate && (
            <div className="ticket-create-form">
              <div className="ticket-create-header">
                <span>New Ticket</span>
                <button onClick={() => setShowCreate(false)}><X size={16} /></button>
              </div>
              <input
                className="ticket-input"
                placeholder="Customer name"
                value={form.customer}
                onChange={e => setForm(f => ({ ...f, customer: e.target.value }))}
              />
              <input
                className="ticket-input"
                placeholder="Subject"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              />
              <div className="ticket-create-row">
                <select
                  className="ticket-select"
                  value={form.tag}
                  onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                >
                  {TICKET_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  className="ticket-select"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                >
                  {TICKET_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button
                className="ticket-create-submit"
                onClick={handleCreate}
                disabled={!form.subject.trim()}
              >
                Create Ticket
              </button>
            </div>
          )}

          {/* Ticket List */}
          <div className="tickets-list">
            {filtered.length === 0 && (
              <div className="tickets-empty">
                <Circle size={40} strokeWidth={1} />
                <p>No tickets {filter !== 'all' ? `with status "${filter}"` : 'yet'}.</p>
              </div>
            )}
            {filtered.map(ticket => {
              const StatusIcon = STATUS_ICONS[ticket.status] || Circle;
              return (
                <div key={ticket.id} className="ticket-card" onClick={() => setActiveTicket(ticket)}>
                  <div className="ticket-card-top">
                    <StatusIcon size={14} style={{ color: STATUS_COLORS[ticket.status] }} />
                    <span className="ticket-card-subject">{ticket.subject}</span>
                    <button
                      className="ticket-card-delete"
                      onClick={e => { e.stopPropagation(); handleDelete(ticket.id); }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="ticket-card-bottom">
                    <span className="ticket-tag-sm" style={{ backgroundColor: TAG_COLORS[ticket.tag] || '#607D8B' }}>{ticket.tag}</span>
                    <span className="ticket-card-customer">{ticket.customer}</span>
                    <span className="ticket-card-priority" style={{ color: PRIORITY_COLORS[ticket.priority] }}>
                      {ticket.priority}
                    </span>
                    <span className="ticket-card-date">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  {ticket.messages.length > 0 && (
                    <div className="ticket-card-preview">
                      {ticket.messages[ticket.messages.length - 1].text.slice(0, 80)}
                      {ticket.messages[ticket.messages.length - 1].text.length > 80 ? '…' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
