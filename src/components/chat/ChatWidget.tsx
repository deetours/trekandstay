import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../ui/cn';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  streaming?: boolean;
}

const SUGGESTED: string[] = [
  'What are the best treks in Himalayas?',
  'Tell me about Maharashtra treks',
  'What should I pack for a trek?',
  'How difficult is Kedarkantha trek?',
  'What are your payment options?',
];

// Backend base (reuse Vite env like other API helper)
const API_BASE = (import.meta as ImportMeta).env?.VITE_API_URL || 'http://localhost:8000';


interface Source {
  id: string;
  type: string;
  score: number;
  title: string;
  snippet: string;
}

interface ToolResult {
  [key: string]: unknown;
}

// RAG backend completion using our new endpoints
async function backendComplete(messages: ChatMessage[]): Promise<{ answer: string; sources: Source[]; tool_result?: ToolResult }> {
  try {
    const token = localStorage.getItem('token');
    
    // Get the latest user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return { answer: 'No query provided.', sources: [] };
    }

    const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
    };
    
    // Add authorization if user is logged in
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const r = await fetch(`${API_BASE}/api/rag/chat/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        query: lastUserMessage.content 
      }),
    });

    if (!r.ok) {
      return { answer: 'Sorry, I encountered an error. Please try again.', sources: [] };
    }

    const data = await r.json();
    return { 
      answer: data.response || 'No response received.', 
      sources: data.sources || [],
  tool_result: undefined // RAG doesn't use tools for now
    };
  } catch {
    return { answer: 'Network error. Please check your connection and try again.', sources: [] };
  }
}


export const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'sys-welcome', 
    role: 'assistant', 
    content: 'Hi! I am your Trek & Stay assistant. Ask me about our trips, destinations, booking process, or travel advice. No account needed - just start chatting!'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [retrievalDocs, setRetrievalDocs] = useState<string[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (value?: string) => {
    const text = (value ?? input).trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    
    try {
      // Our RAG service handles retrieval internally
      const { answer, sources: usedSources } = await backendComplete([...messages, userMsg]);
      
      setSources(usedSources || []);
      setRetrievalDocs(usedSources?.map(s => `${s.type} :: ${s.title}`) || []);
      
      setMessages(m => [...m, { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: answer || 'No answer returned.' 
      }]);
    } catch {
      setMessages(m => [...m, { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: 'Error generating response. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-4 w-80 sm:w-96 h-[480px] rounded-2xl shadow-2xl border bg-white/90 backdrop-blur z-50 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
              <div className="flex items-center gap-2 font-medium"><Bot className="w-4 h-4" /> Trek Assistant</div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/20"><X className="w-4 h-4" /></button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
              {messages.map(m => (
                <div key={m.id} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {m.role !== 'user' && <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700"><Bot className="w-3 h-3" /></div>}
                  <div className={cn('max-w-[75%] rounded-lg px-3 py-2 shadow-sm',
                    m.role === 'user' ? 'bg-forest-green text-white' : 'bg-white border')}>
                    {m.content}
                  </div>
                  {m.role === 'user' && <div className="w-6 h-6 rounded-full bg-forest-green/10 flex items-center justify-center text-forest-green"><User className="w-3 h-3" /></div>}
                </div>
              ))}
              {loading && <div className="text-xs text-gray-500 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Thinking...</div>}
            </div>
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED.slice(0,3).map((s: string) => (
                    <button key={s} onClick={() => send(s)} className="text-[11px] px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200">{s}</button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={e => { e.preventDefault(); send(); }} className="border-t p-2 flex items-center gap-2">
              <input
                className="flex-1 text-sm rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Ask about trips, booking, safety..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <Button type="submit" size="sm" variant="adventure" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</Button>
            </form>
            {retrievalDocs.length > 0 && (
              <div className="border-t bg-white/70 p-2 max-h-28 overflow-y-auto text-[10px] text-gray-600">
                <div className="font-semibold mb-1 flex items-center gap-1">Sources Used</div>
                <div className="flex flex-wrap gap-1">
                  {sources.map((s, i: number) => (
                    <span key={i} className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-[10px]">
                      {s.title} ({s.type})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-lg flex items-center justify-center"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </>
  );
};

export default ChatWidget;
