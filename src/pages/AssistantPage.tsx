import React, { useEffect, useRef, useState } from 'react';
import { Send, Shield, Trash2 } from 'lucide-react';
import { AuthGateCard } from '../components/AuthGateCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../lib/api.ts';
import type { ChatMessageItem } from '../types/investigation.ts';

interface AssistantPageProps {
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

const STARTER_QUESTIONS = [
  'Someone on OLX sent me a QR code to "receive" payment. Is this safe?',
  'I received a video call claiming to be CBI about a courier parcel ("digital arrest"). What do I do?',
  'Explain what typosquatting and phishing mean in simple terms.',
  'I accidentally shared my bank OTP 5 minutes ago. What immediate steps should I take?',
];

export function AssistantPage({
  initialPrompt,
  onClearInitialPrompt,
}: AssistantPageProps) {
  const { firebaseUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt, onClearInitialPrompt]);

  useEffect(() => {
    if (!firebaseUser) {
      setMessages([]);
      return;
    }
    let mounted = true;
    setLoadingHistory(true);
    apiRequest<{ messages: ChatMessageItem[] }>('/api/chat')
      .then((res) => {
        if (mounted) setMessages(res.messages || []);
      })
      .catch(() => {
        if (mounted) setMessages([]);
      })
      .finally(() => {
        if (mounted) setLoadingHistory(false);
      });
    return () => {
      mounted = false;
    };
  }, [firebaseUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sending) return;

    setError(null);
    setSending(true);
    const optimisticUser: ChatMessageItem = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, optimisticUser]);
    setInput('');

    try {
      const res = await apiRequest<{ reply: string; messages: ChatMessageItem[] }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: trimmed }),
      });
      setMessages(res.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assistant failed to respond.');
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    setError(null);
    try {
      await apiRequest('/api/chat', { method: 'DELETE' });
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not clear chat history.');
    }
  };

  if (!firebaseUser) {
    return (
      <div className="space-y-6">
        <AuthGateCard
          title="Sign in to chat with the AI Investigation Assistant"
          description="Get step-by-step guidance on suspicious transactions, urgent scam calls, cybersecurity terminology, and India 1930 reporting."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] min-h-[520px] rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">AI Investigation Assistant</h2>
            <p className="text-xs text-slate-400">
              Ask about suspicious messages, payment safety, or immediate fraud response steps.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => void handleClearChat()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Chat Transcript */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loadingHistory ? (
          <div className="space-y-3">
            <div className="h-12 w-2/3 rounded-lg bg-slate-800/50 animate-pulse" />
            <div className="h-16 w-3/4 rounded-lg bg-slate-800/50 animate-pulse ml-auto" />
          </div>
        ) : messages.length === 0 ? (
          <div className="max-w-2xl mx-auto py-8 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-base font-semibold text-slate-100">
                Personal Digital Forensics Guidance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe what happened or pick a common situation below. Never share your real OTPs, passwords, or PINs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void sendMessage(q)}
                  className="text-left rounded-lg border border-slate-800 bg-[#060A13] p-3.5 text-xs text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200 transition-colors leading-relaxed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-medium'
                    : 'bg-[#060A13] border border-slate-800 text-slate-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-[#060A13] border border-slate-800 px-4 py-3 text-xs text-slate-400">
              Analyzing scenario and preparing protective guidance...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div role="alert" className="mx-6 mb-2 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(input);
        }}
        className="p-4 border-t border-slate-800/80 bg-[#080D1A] flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a suspicious transaction, message, or security term..."
          className="flex-1 rounded-lg border border-slate-700 bg-[#060A13] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
        >
          <Send className="h-4 w-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
