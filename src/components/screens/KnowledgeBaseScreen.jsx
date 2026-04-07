import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, FileText, HelpCircle, Link, Trash2, Edit3, Save, X, MessageSquare } from 'lucide-react';
import TopBar from '../common/TopBar.jsx';
import { getKnowledgeBase, addKBEntry, updateKBEntry, deleteKBEntry, getBusinessPrompt, saveBusinessPrompt } from '../../utils/knowledgeBase.js';
import '../../styles/knowledgebase.css';

const ENTRY_TYPES = [
  { id: 'text', label: 'Document', Icon: FileText },
  { id: 'faq',  label: 'FAQ',      Icon: HelpCircle },
  { id: 'url',  label: 'URL Ref',  Icon: Link },
];

export default function KnowledgeBaseScreen({ onBack }) {
  const [entries, setEntries] = useState([]);
  const [businessPrompt, setBusinessPrompt] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ type: 'text', title: '', content: '' });
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  useEffect(() => {
    setEntries(getKnowledgeBase());
    setBusinessPrompt(getBusinessPrompt());
  }, []);

  const handleAdd = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const entry = addKBEntry(form);
    setEntries(prev => [...prev, entry]);
    setForm({ type: 'text', title: '', content: '' });
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    updateKBEntry(editingId, { title: form.title, content: form.content, type: form.type });
    setEntries(getKnowledgeBase());
    setEditingId(null);
    setForm({ type: 'text', title: '', content: '' });
  };

  const handleDelete = (id) => {
    deleteKBEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const startEdit = (entry) => {
    setForm({ type: entry.type, title: entry.title, content: entry.content });
    setEditingId(entry.id);
    setShowAdd(true);
  };

  const handleSavePrompt = () => {
    saveBusinessPrompt(businessPrompt);
    setShowPromptEditor(false);
  };

  const typeIcon = (type) => {
    const t = ENTRY_TYPES.find(e => e.id === type);
    return t ? <t.Icon size={16} /> : <FileText size={16} />;
  };

  return (
    <>
      <TopBar />
      <div className="scroll-content">
        <div className="kb-wrap">
          <button className="kb-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>

          <div className="kb-header">
            <h1 className="kb-title">Knowledge Base</h1>
            <p className="kb-subtitle">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>
          </div>

          {/* Business Prompt Section */}
          <div className="kb-section">
            <div className="kb-section-header" onClick={() => setShowPromptEditor(v => !v)}>
              <MessageSquare size={18} />
              <span>Business Prompt</span>
            </div>
            {showPromptEditor && (
              <div className="kb-prompt-editor">
                <p className="kb-prompt-hint">
                  Customize how the AI responds. Describe your business, tone, policies, etc.
                </p>
                <textarea
                  className="kb-textarea"
                  rows={5}
                  placeholder="e.g., We are a SaaS company called Acme. Be professional but friendly. Our refund policy is 30 days..."
                  value={businessPrompt}
                  onChange={e => setBusinessPrompt(e.target.value)}
                />
                <button className="kb-btn kb-btn-primary" onClick={handleSavePrompt}>
                  <Save size={14} /> Save Prompt
                </button>
              </div>
            )}
          </div>

          {/* Add / Edit Form */}
          {(showAdd || editingId) && (
            <div className="kb-form">
              <div className="kb-form-header">
                <span>{editingId ? 'Edit Entry' : 'New Entry'}</span>
                <button className="kb-form-close" onClick={() => { setShowAdd(false); setEditingId(null); setForm({ type: 'text', title: '', content: '' }); }}>
                  <X size={16} />
                </button>
              </div>

              <div className="kb-type-picker">
                {ENTRY_TYPES.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    className={`kb-type-btn ${form.type === id ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, type: id }))}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              <input
                className="kb-input"
                placeholder={form.type === 'faq' ? 'Question' : form.type === 'url' ? 'Reference name' : 'Title'}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              <textarea
                className="kb-textarea"
                rows={4}
                placeholder={form.type === 'faq' ? 'Answer' : form.type === 'url' ? 'URL and notes' : 'Content'}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              />
              <button
                className="kb-btn kb-btn-primary"
                onClick={editingId ? handleUpdate : handleAdd}
                disabled={!form.title.trim() || !form.content.trim()}
              >
                {editingId ? 'Update' : 'Add Entry'}
              </button>
            </div>
          )}

          {/* Entries List */}
          <div className="kb-entries">
            {entries.length === 0 && !showAdd && (
              <div className="kb-empty">
                <FileText size={40} strokeWidth={1} />
                <p>No knowledge base entries yet.</p>
                <p className="kb-empty-sub">Add documents, FAQs, or references for the AI to use when responding to customers.</p>
              </div>
            )}
            {entries.map(entry => (
              <div key={entry.id} className="kb-entry-card">
                <div className="kb-entry-header">
                  <div className="kb-entry-type">{typeIcon(entry.type)}</div>
                  <div className="kb-entry-title">{entry.title}</div>
                  <button className="kb-entry-action" onClick={() => startEdit(entry)}><Edit3 size={14} /></button>
                  <button className="kb-entry-action kb-entry-delete" onClick={() => handleDelete(entry.id)}><Trash2 size={14} /></button>
                </div>
                <div className="kb-entry-content">{entry.content.length > 150 ? entry.content.slice(0, 150) + '…' : entry.content}</div>
                <div className="kb-entry-meta">
                  {ENTRY_TYPES.find(t => t.id === entry.type)?.label || 'Document'} · Updated {new Date(entry.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Add Button */}
          {!showAdd && !editingId && (
            <button className="kb-add-btn" onClick={() => { setShowAdd(true); setForm({ type: 'text', title: '', content: '' }); }}>
              <Plus size={20} /> Add Entry
            </button>
          )}
        </div>
      </div>
    </>
  );
}
