import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MentorMessage } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Send,
  Trash2,
  Code2,
  Briefcase,
  MapPin,
  HelpCircle,
  MessageSquare,
  Compass,
  ArrowRight
} from 'lucide-react';

export const AIMentor: React.FC = () => {
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<'general' | 'code_explanation' | 'quiz' | 'interview_prep' | 'roadmap_help'>('general');
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([
    'How does the Node.js event loop handle microtasks vs macrotasks?',
    'Simulate a technical interview question on React state reconciliation',
    'Why is B-tree indexing preferred for range queries in PostgreSQL?',
    'What tasks should I prioritize this week to close my Node.js gap?'
  ]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getMentorHistory();
        setMessages(data.messages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || inputText).trim();
    if (!msg || isSending) return;

    setInputText('');
    setIsSending(true);

    // Optimistic UI update
    const optimisticUserMsg: MentorMessage = {
      id: `temp-${Date.now()}`,
      userId: user?.id || 'me',
      role: 'user',
      content: msg,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticUserMsg]);

    try {
      const res = await api.sendMentorMessage(msg, selectedMode);
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== optimisticUserMsg.id);
        return [...withoutTemp, res.userMessage, res.assistantMessage];
      });
      if (res.suggestedFollowUps?.length > 0) {
        setSuggestedFollowUps(res.suggestedFollowUps);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to send message to Mentor.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear conversation history?')) return;
    try {
      await api.clearMentorHistory();
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const modes = [
    { key: 'general', label: 'General Mentorship', icon: MessageSquare },
    { key: 'code_explanation', label: 'Code Diagnostics', icon: Code2 },
    { key: 'interview_prep', label: 'Technical Interview', icon: Briefcase },
    { key: 'roadmap_help', label: 'Roadmap Guidance', icon: MapPin },
    { key: 'quiz', label: 'Concept Drill', icon: HelpCircle },
  ] as const;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border dark:border-surface-dark-border shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
              AI Technical Mentor
            </h1>
            <span className="text-[11px] font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-900">
              Target: Full Stack Developer
            </span>
          </div>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
            Contextual advisory tailored to your verified skills, current gaps (Node.js, PostgreSQL), and weekly roadmap.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClearHistory}
          disabled={messages.length === 0}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Clear Chat
        </Button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0">
        {modes.map(m => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.key;

          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setSelectedMode(m.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-300 hover:text-charcoal dark:hover:text-slate-100 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Panel */}
      <Card className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-10 h-10 rounded-lg bg-surface-subtle dark:bg-slate-800 mx-auto flex items-center justify-center text-brand-600 dark:text-brand-400 border border-surface-border dark:border-surface-dark-border">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
                Welcome to Engineering Mentorship
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
                Ask about specific engineering patterns, get code walkthroughs, practice mock technical interview questions, or ask how to close your current skill gaps.
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                      SP
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-lg p-3.5 leading-relaxed ${
                      isUser
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-subtle dark:bg-slate-800/60 border border-surface-border dark:border-surface-dark-border text-charcoal dark:text-slate-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-xs">{msg.content}</div>
                    <span
                      className={`block text-[10px] mt-1.5 ${
                        isUser ? 'text-brand-100 text-right' : 'text-charcoal-subtle dark:text-slate-500'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Suggested Prompts Ribbon */}
      <div className="shrink-0 space-y-1.5">
        <span className="text-[11px] font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider block">
          Suggested Prompts
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedFollowUps.slice(0, 4).map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              disabled={isSending}
              className="text-left text-xs px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal-muted dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-800 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="shrink-0 flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Ask a technical question, paste code snippet, or request roadmap advice..."
          disabled={isSending}
          className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal dark:text-slate-100 placeholder-charcoal-subtle dark:placeholder-slate-500 focus:outline-none focus:border-brand-600 disabled:opacity-60"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputText.trim() || isSending}
          rightIcon={<Send className="w-3.5 h-3.5" />}
        >
          {isSending ? 'Thinking...' : 'Send'}
        </Button>
      </form>
    </div>
  );
};

export default AIMentor;
