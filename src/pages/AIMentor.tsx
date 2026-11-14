import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OfflineMentorMessage } from '../db/indexedDb';
import { AgentOrchestrator } from '../agents/orchestrator';
import { AgentReasoningTrace } from '../agents/types';
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
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

export const AIMentor: React.FC = () => {
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState<OfflineMentorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('general');
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([
    '/mock-interview',
    '/explain-gap',
    '/pivot-career',
    '/reassess'
  ]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Embedded Agent Reasoning Trace State
  const [traces, setTraces] = useState<AgentReasoningTrace[]>([]);
  const [isTraceExpanded, setIsTraceExpanded] = useState(true);

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

    const unsubscribe = AgentOrchestrator.subscribe(newTraces => {
      setTraces(newTraces);
    });
    return unsubscribe;
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
    const optimisticUserMsg: OfflineMentorMessage = {
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
      alert(err?.message || 'Failed to send message.');
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

  const slashCommands = [
    { cmd: '/mock-interview', label: 'Mock Interview', desc: 'Socratic technical scenario drill' },
    { cmd: '/explain-gap', label: 'Explain Gaps', desc: 'Why specific skills are prioritized' },
    { cmd: '/pivot-career', label: 'Pivot Career', desc: 'Analyze adjacent career role overlaps' },
    { cmd: '/reassess', label: 'Reassess Profile', desc: 'Sync telemetry and recalculate gaps' }
  ];

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col space-y-3 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border dark:border-surface-dark-border shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-charcoal dark:text-slate-100 tracking-tight font-sans">
              Multi-Agent AI Mentor & Collaboration Console
            </h1>
            <span className="text-[11px] font-mono font-semibold text-stitch-blue bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
              4-Agent Orchestration
            </span>
          </div>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
            Socratic interview coaching, gap explanation, and real-time reasoning trace inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      {/* Slash Command Quick Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
        {slashCommands.map(sc => (
          <button
            key={sc.cmd}
            type="button"
            onClick={() => handleSendMessage(sc.cmd)}
            disabled={isSending}
            className="px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-xs font-mono text-charcoal hover:border-stitch-blue hover:text-stitch-blue transition-all flex items-center gap-1.5 shrink-0"
          >
            <span className="font-bold text-stitch-blue">{sc.cmd}</span>
            <span className="text-[11px] text-charcoal-subtle dark:text-slate-400">· {sc.label}</span>
          </button>
        ))}
      </div>

      {/* Main 2-Column Area: Chat Panel (Left) + Visible Agent Reasoning Trace Panel (Right) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chat Messages Panel (7 cols) */}
        <Card className="lg:col-span-7 flex flex-col justify-between overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {isLoadingHistory ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-stitch-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="py-12 text-center max-w-sm mx-auto space-y-3">
                <div className="w-9 h-9 rounded-lg bg-surface-subtle dark:bg-slate-800 mx-auto flex items-center justify-center text-stitch-blue border border-surface-border dark:border-surface-dark-border">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-charcoal dark:text-slate-100">
                  Welcome to AI Mentorship
                </h3>
                <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
                  Ask questions about event loops, state reconciliation, query indexing, or run a slash command like <code className="font-mono text-stitch-blue">/mock-interview</code>.
                </p>
              </div>
            ) : (
              messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.id} className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-stitch-blue flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-[11px]">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-xl rounded-lg p-3.5 leading-relaxed ${
                        isUser
                          ? 'bg-stitch-blue text-white'
                          : 'bg-surface-subtle dark:bg-slate-800/60 border border-surface-border dark:border-surface-dark-border text-charcoal dark:text-slate-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans text-xs">{msg.content}</div>
                      <span className={`block text-[10px] mt-1.5 font-mono ${isUser ? 'text-blue-100 text-right' : 'text-charcoal-subtle dark:text-slate-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Follow-up suggestions */}
          {suggestedFollowUps.length > 0 && (
            <div className="px-4 py-2 bg-surface-subtle dark:bg-surface-dark-subtle border-t border-surface-border dark:border-surface-dark-border flex gap-1.5 overflow-x-auto shrink-0">
              {suggestedFollowUps.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isSending}
                  className="text-left text-[11px] px-2 py-1 rounded border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal-muted hover:border-stitch-blue transition-colors shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-surface-border dark:border-surface-dark-border flex gap-2 bg-white dark:bg-surface-dark shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask a technical question or type /mock-interview, /explain-gap..."
              disabled={isSending}
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-surface-dark-subtle text-charcoal dark:text-slate-100 focus:outline-none focus:border-stitch-blue disabled:opacity-60"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!inputText.trim() || isSending}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              {isSending ? 'Synthesizing...' : 'Send'}
            </Button>
          </form>
        </Card>

        {/* Visible Agent Reasoning Trace Panel (5 cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between overflow-hidden p-0">
          <div className="p-3 border-b border-surface-border dark:border-surface-dark-border flex items-center justify-between bg-surface-subtle dark:bg-surface-dark-subtle">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-stitch-blue animate-pulse" />
              <span className="text-xs font-bold text-charcoal dark:text-slate-100 font-mono">
                Live Agent Reasoning Traces ({traces.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTraceExpanded(prev => !prev)}
              className="p-1 rounded text-charcoal-subtle hover:text-charcoal"
            >
              {isTraceExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isTraceExpanded ? (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 font-mono text-[11px]">
              {traces.length === 0 ? (
                <div className="py-12 text-center text-charcoal-subtle dark:text-slate-500 space-y-1">
                  <Terminal className="w-6 h-6 mx-auto opacity-30" />
                  <p className="font-sans text-xs">Awaiting agent interaction.</p>
                </div>
              ) : (
                traces.slice(0, 8).map((t, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded border border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-slate-800/40 space-y-1"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-stitch-blue">{t.agentName}</span>
                      <span className="text-charcoal-subtle dark:text-slate-500">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-charcoal-muted dark:text-slate-300 font-sans text-xs">
                      {t.thought}
                    </p>
                    <div className="pt-1 text-[10px] text-charcoal-subtle border-t border-surface-border dark:border-surface-dark-border">
                      <strong className="text-charcoal dark:text-slate-200">Action: </strong>
                      <span>{t.action}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-charcoal-subtle font-mono">
              Trace panel collapsed. Click expand to inspect agent thoughts.
            </div>
          )}

          <div className="p-2.5 border-t border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-surface-dark-subtle text-[10px] text-charcoal-subtle font-mono flex justify-between">
            <span>4 Specialized Agents Synced</span>
            <span className="text-status-success">Deterministic Offline Engine</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIMentor;
