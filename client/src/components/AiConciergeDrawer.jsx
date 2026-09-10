import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, MessageSquare } from 'lucide-react';
import api from '../services/api';

const QUICK_PROMPTS = [
  'Best villas in Goa with private pool',
  'Cozy wooden cottages in Manali under ₹5,000',
  'Heritage havelis in Jaipur near palaces',
  'Dev Deepawali stays in Varanasi ghats',
];

export default function AiConciergeDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Namaste! 🙏 I am your FairStay AI Concierge. Ask me anything about Indian vacation destinations, seasonal festivals, local price trends, or finding the perfect stay!',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history
      const history = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

      const res = await api.sendAiMessage(query, history);
      const botReply = res?.response || res?.message || 'I am ready to help you find your dream vacation stay in India!';
      setMessages((prev) => [...prev, { role: 'assistant', text: botReply }]);
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'FairStay AI is experiencing high demand. Feel free to explore our curated stays or ask again in a moment!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 24px',
          borderRadius: '9999px',
          background: 'linear-gradient(90deg, #ff6b4a 0%, #ff416c 100%)',
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '0.92rem',
          boxShadow: '0 8px 25px rgba(255, 65, 108, 0.45)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 65, 108, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 65, 108, 0.45)';
        }}
      >
        <Sparkles size={17} style={{ color: '#ffffff' }} />
        <span>FairStay AI Trip Assistant</span>
      </button>

      {/* Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
        />
      )}

      {/* Slide-over Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-card)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.4)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #ff5a5f 0%, #ff6b50 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>FairStay AI Concierge</div>
              <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '600' }}>● Powered by Gemini 1.5 Flash</div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)', padding: '6px', cursor: 'pointer', background: 'none', border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '8px',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              {m.role === 'assistant' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255, 90, 95, 0.15)', color: '#ff5a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={14} />
                </div>
              )}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  background: m.role === 'user' ? '#ff5a5f' : 'var(--bg-secondary)',
                  color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                  borderBottomRightRadius: m.role === 'user' ? '4px' : '14px',
                  borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '14px',
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255, 90, 95, 0.15)', color: '#ff5a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} />
              </div>
              <div style={{ padding: '10px 16px', borderRadius: '14px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-secondary)', display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {QUICK_PROMPTS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: '9999px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '8px', background: 'var(--bg-card)' }}>
          <input
            type="text"
            placeholder="Ask about stays, Goa villas, Manali cottages..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '9999px',
              border: '1px solid var(--border-hover)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: input.trim() ? '#ff5a5f' : 'var(--border-light)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              border: 'none',
              transition: 'background 0.2s',
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
