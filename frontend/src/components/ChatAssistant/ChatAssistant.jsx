import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Bot, Send } from 'lucide-react';
import API from '../../services/api';
import './assistant.css';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your Academic Balance AI. Ask me for suggestions based on your logs!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const contextStr = localStorage.getItem("chat_context");
      const context = contextStr ? JSON.parse(contextStr) : {};

      const res = await API.post('/chat', { 
        message: userMsg,
        ...context
      });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-wrapper">
      {/* Floating Toggle Button */}
      <button 
        className={`ai-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant"
      >
        {isOpen ? <X size={20} /> : <Sparkles size={20} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="ai-chat-window glass-card"
            initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="ai-chat-header">
              <div className="ai-header-info">
                <span className="ai-header-icon"><Bot size={20} /></span>
                <div>
                  <h4>Balance AI</h4>
                  <p>Smart Suggestions Agent</p>
                </div>
              </div>
              <button className="ai-close-mini" onClick={() => setIsOpen(false)}><X size={16} /></button>
            </div>

            <div className="ai-messages-container" ref={chatRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`ai-message-bubble ${msg.role}`}>
                  {msg.role === 'assistant' && <span className="ai-bubble-icon"><Sparkles size={14} /></span>}
                  <div className="ai-message-text">{msg.text}</div>
                </div>
              ))}
              {loading && (
                <div className="ai-message-bubble assistant">
                  <div className="ai-loading-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              )}
            </div>

            <form className="ai-chat-input-area" onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Ask about workouts, study advice..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" disabled={!input.trim() || loading}>
                {loading ? '...' : <Send size={16} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatAssistant;
