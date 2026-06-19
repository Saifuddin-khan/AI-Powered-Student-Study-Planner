import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ImpersonationBanner from './ImpersonationBanner';
import notificationService from '../../services/notificationService';
import api from '../../services/api';
import './Layout.css';

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const WELCOME = {
  role: 'assistant',
  content: "👋 Hi! I'm Stud AI, your personal study assistant. I can help you create study plans, explain topics, set goals, and much more. How can I help you today?",
  time: now(),
};

const CHIPS = [
  '📅 Create a study plan for me',
  '💡 Give me focus tips',
  '📝 Help me prepare for exams',
  '📊 How should I track my goals?',
];

function Layout() {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  /* ── Chat widget state ─────────────────────────────── */
  const [chatOpen,   setChatOpen]   = useState(false);
  const [messages,   setMessages]   = useState([WELCOME]);
  const [chatInput,  setChatInput]  = useState('');
  const [sending,    setSending]    = useState(false);
  const msgEndRef = useRef(null);
  const inputRef  = useRef(null);

  /* Auto-scroll on new message */
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  /* Focus input when chat opens */
  useEffect(() => {
    if (chatOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [chatOpen]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text ?? chatInput).trim();
    if (!msg || sending) return;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, time: now() }]);
    setSending(true);
    try {
      const res    = await api.post('/ai/chat', { message: msg });
      const reply  = res.data?.data?.message
                  || res.data?.data?.content
                  || res.data?.data?.reply
                  || res.data?.message
                  || 'I received your message! Let me help you with that.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: now() }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment.", time: now() },
      ]);
    } finally { setSending(false); }
  }, [chatInput, sending]);

  /* Notification polling */
  useEffect(() => {
    let mounted = true;
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        if (mounted) setUnreadCount(res.data.data.count ?? 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className={`layout__main${collapsed ? ' layout__main--collapsed' : ''}`}>
        <ImpersonationBanner />
        <Navbar
          collapsed={collapsed}
          onMobileOpen={() => setMobileOpen(true)}
          unreadCount={unreadCount}
        />
        <div className="layout__content">
          <Outlet />
        </div>
      </div>

      {/* ── Floating Chat Widget ─────────────────────────── */}
      {chatOpen && (
        <div className="chat-widget" role="dialog" aria-label="Stud AI chat">

          {/* Header */}
          <div className="chat-widget__header">
            <div className="chat-widget__avatar">🤖</div>
            <div className="chat-widget__info">
              <div className="chat-widget__name">Stud AI</div>
              <div className="chat-widget__sub">Your study assistant</div>
            </div>
            <span className="chat-widget__online">Online</span>
            <button
              className="chat-widget__close"
              onClick={() => setChatOpen(false)}
              aria-label="Close chat"
            >✕</button>
          </div>

          {/* Messages */}
          <div className="chat-widget__messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg--${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="chat-msg__avatar">🤖</div>
                )}
                <div className="chat-msg__body">
                  <div className="chat-bubble">{m.content}</div>
                  <div className="chat-time">{m.time}</div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {sending && (
              <div className="chat-msg chat-msg--assistant">
                <div className="chat-msg__avatar">🤖</div>
                <div className="chat-msg__body">
                  <div className="chat-bubble chat-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Quick chips — only before user sends first message */}
          {messages.length === 1 && (
            <div className="chat-widget__chips">
              {CHIPS.map(chip => (
                <button key={chip} className="chat-chip" onClick={() => sendMessage(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="chat-widget__input-row">
            <input
              ref={inputRef}
              className="chat-widget__input"
              placeholder="Type your message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={sending}
            />
            <button
              className="chat-widget__send"
              onClick={() => sendMessage()}
              disabled={sending || !chatInput.trim()}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

        </div>
      )}

      {/* ── FAB button ──────────────────────────────────── */}
      <button
        className={`layout__ai-fab${chatOpen ? ' fab--open' : ''}`}
        onClick={() => setChatOpen(v => !v)}
        title="Stud AI — Study Assistant"
        aria-label="Toggle Stud AI chat"
      >
        {chatOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

    </div>
  );
}

export default Layout;
