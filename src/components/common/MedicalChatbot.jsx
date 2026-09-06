import { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquare, Send, X } from 'lucide-react';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

const suggestions = ['Fever symptoms?', 'Pharmacy timing?', 'Emergency contact?'];

const MedicalChatbot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const ask = async (value = message) => {
    const prompt = value.trim();
    if (!prompt || loading) return;
    setMessages((current) => [...current, { id: `${Date.now()}-user`, role: 'user', text: prompt }]);
    setMessage('');
    setLoading(true);
    try {
      const response = await api.post('/ai/chat', { message: prompt });
      const reply = response.data?.data?.reply || 'Please consult a campus doctor.';
      setMessages((current) => [...current, { id: `${Date.now()}-assistant`, role: 'assistant', text: reply }]);
    } catch {
      setMessages((current) => [...current, { id: `${Date.now()}-error`, role: 'assistant', text: 'The assistant is unavailable. Please consult a campus doctor directly.' }]);
    }
    finally { setLoading(false); }
  };
  if (!user) return null;
  return <>
    <button type="button" onClick={() => setOpen((current) => !current)} aria-label="Open medical assistant" title="Open medical assistant" className="fixed bottom-5 right-5 z-40 btn btn-primary btn-circle text-white shadow-xl">
      {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
    </button>
    {open && <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-5 z-40 w-auto sm:w-[min(24rem,calc(100vw-2.5rem))] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 bg-primary text-white px-4 py-3"><Bot className="w-5 h-5" /><div><h3 className="font-bold text-sm">Medical Assistant</h3><p className="text-[10px] opacity-90">AI guidance, not a diagnosis</p></div></div>
      <div className="h-72 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-lg p-3">Describe a symptom or choose a quick question. Consult a campus doctor for official diagnosis.</p>}
        {messages.map((item) => <div key={item.id} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${item.role === 'user' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100'}`}>{item.text}</div></div>)}
        {loading && <div className="text-xs text-slate-400 flex items-center gap-1"><span className="loading loading-dots loading-xs" /> Typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex flex-wrap gap-1 px-3 pb-2">{suggestions.map((item) => <button key={item} type="button" onClick={() => ask(item)} className="btn btn-xs btn-outline btn-primary">{item}</button>)}</div>
      <form onSubmit={(event) => { event.preventDefault(); ask(); }} className="flex gap-2 p-3 border-t border-slate-200 dark:border-slate-700"><input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={800} placeholder="Ask about symptoms..." className="input input-bordered input-sm flex-1" /><button type="submit" disabled={loading || !message.trim()} aria-label="Send message" className="btn btn-primary btn-sm text-white"><Send className="w-4 h-4" /></button></form>
    </div>}
  </>;
};
export default MedicalChatbot;
