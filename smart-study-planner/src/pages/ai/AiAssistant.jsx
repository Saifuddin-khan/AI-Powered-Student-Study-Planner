import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MdSend, MdDelete, MdAutoAwesome, MdPerson } from 'react-icons/md';
import { toast } from 'react-toastify';

import aiService from '../../services/aiService';
import './AiAssistant.css';

/* ── Suggestion chips shown on empty state ────────────────── */
const SUGGESTIONS = [
  'Help me create a study plan for my upcoming exam',
  'What is the best way to memorize formulas?',
  'Explain the Pomodoro technique and how to use it',
  'Give me tips for staying focused while studying',
  'How can I improve my note-taking skills?',
];

/* ── Time formatter ───────────────────────────────────────── */
function fmtTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/* ── Typing indicator (3 bouncing dots) ───────────────────── */
function TypingDots() {
  return (
    <div className="ai-typing">
      <div className="ai-typing__bubble">
        <div className="ai-typing__icon"><MdAutoAwesome size={14} /></div>
        <div className="ai-typing__dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

/* ── Single message bubble ────────────────────────────────── */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`ai-msg${isUser ? ' ai-msg--user' : ' ai-msg--assistant'}`}>
      {!isUser && (
        <div className="ai-msg__avatar ai-msg__avatar--ai">
          <MdAutoAwesome size={16} />
        </div>
      )}

      <div className="ai-msg__body">
        <div className={`ai-msg__bubble${isUser ? ' ai-msg__bubble--user' : ' ai-msg__bubble--ai'}`}>
          <p className="ai-msg__text">{msg.content}</p>
        </div>
        <span className="ai-msg__time">{fmtTime(msg.createdAt)}</span>
      </div>

      {isUser && (
        <div className="ai-msg__avatar ai-msg__avatar--user">
          <MdPerson size={16} />
        </div>
      )}
    </div>
  );
}

/* ── Welcome / empty state ────────────────────────────────── */
function WelcomeScreen({ onSuggest }) {
  return (
    <div className="ai-welcome">
      <div className="ai-welcome__icon">
        <MdAutoAwesome size={40} />
      </div>
      <h2 className="ai-welcome__title">AI Study Assistant</h2>
      <p className="ai-welcome__sub">Powered by OpenAI GPT-4o-mini · Ask me anything about studying</p>

      <div className="ai-welcome__chips">
        {SUGGESTIONS.map((s, i) => (
          <button key={i} className="ai-chip" onClick={() => onSuggest(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function AiAssistant() {
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);
  const [clearing,    setClearing]    = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  /* Scroll to bottom whenever messages change */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, sending, scrollToBottom]);

  /* Load history on mount */
  useEffect(() => {
    (async () => {
      try {
        const res = await aiService.getChatHistory();
        setMessages(res.data?.data?.content ?? []);
      } catch { /* silent — empty state shown */ }
      finally  { setLoading(false); }
    })();
  }, []);

  /* Auto-resize textarea */
  function handleInputChange(e) {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  }

  /* Send message */
  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    /* Optimistic user message */
    const tempUser = { id: `u-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempUser]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setSending(true);

    try {
      const res       = await aiService.sendMessage(text);
      const aiMsg     = res.data?.data;
      if (aiMsg) {
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        toast.error('OpenAI API key is not configured. Please contact the administrator.');
      } else {
        toast.error('Failed to get a response. Please try again.');
      }
      /* Remove optimistic user message on failure */
      setMessages(prev => prev.filter(m => m.id !== tempUser.id));
    } finally {
      setSending(false);
    }
  }

  /* Enter = send, Shift+Enter = newline */
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  /* Suggestion chip clicked */
  function handleSuggest(text) {
    setInput(text);
    textareaRef.current?.focus();
  }

  /* Clear history */
  async function handleClear() {
    if (!window.confirm('Clear all chat history? This cannot be undone.')) return;
    setClearing(true);
    try {
      await aiService.clearHistory();
      setMessages([]);
      toast.success('Chat history cleared');
    } catch { toast.error('Failed to clear history'); }
    finally  { setClearing(false); }
  }

  return (
    <div className="ai-page">
      {/* ── Header ── */}
      <div className="ai-header">
        <div className="ai-header__left">
          <div className="ai-header__icon"><MdAutoAwesome size={20} /></div>
          <div>
            <h1 className="ai-header__title">AI Study Assistant</h1>
            <span className="ai-header__badge">OpenAI GPT-4o-mini</span>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            className="ai-header__clear"
            onClick={handleClear}
            disabled={clearing}
            title="Clear history"
          >
            <MdDelete size={16} />
            {clearing ? 'Clearing…' : 'Clear'}
          </button>
        )}
      </div>

      {/* ── Messages area ── */}
      <div className="ai-messages">
        {loading ? (
          <div className="ai-loading">
            <span className="ai-loading__dot" /><span className="ai-loading__dot" /><span className="ai-loading__dot" />
          </div>
        ) : messages.length === 0 ? (
          <WelcomeScreen onSuggest={handleSuggest} />
        ) : (
          <>
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {sending && <TypingDots />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="ai-input-bar">
        <div className="ai-input-wrap">
          <textarea
            ref={textareaRef}
            className="ai-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about studying… (Enter to send)"
            rows={1}
            disabled={sending || loading}
            maxLength={4000}
          />
          <button
            className="ai-send"
            onClick={handleSend}
            disabled={!input.trim() || sending || loading}
            title="Send message"
          >
            <MdSend size={20} />
          </button>
        </div>
        <p className="ai-input-hint">
          Enter to send &nbsp;·&nbsp; Shift+Enter for newline &nbsp;·&nbsp;
          {input.length > 0 && <span>{input.length} / 4000</span>}
        </p>
      </div>
    </div>
  );
}
