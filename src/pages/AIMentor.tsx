import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MentorMessage } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Code2,
  HelpCircle,
  Briefcase,
  MapPin,
  Lightbulb,
  User,
  Loader2
} from 'lucide-react';

export const AIMentor: React.FC = () => {
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<'general' | 'code_explanation' | 'quiz' | 'interview_prep' | 'roadmap_help'>('general');
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([
    'Explain closure in JS simply',
    'How do I prepare for a React technical interview?',
    'Review my learning roadmap pace',
    'Give me a mock interview question for Full Stack Developer'
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
        setMessages(data.messages);
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
      alert(err?.message || 'Failed to send message to AI Mentor.');
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
    { key: 'general', label: 'General Guidance', icon: Bot },
    { key: 'code_explanation', label: 'Code Diagnostics', icon: Code2 },
    { key: 'interview_prep', label: 'Technical Interview', icon: Briefcase },
    { key: 'roadmap_help', label: 'Roadmap Advice', icon: MapPin },
    { key: 'quiz', label: 'Quick Quiz', icon: HelpCircle },
  ] as const;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-charcoal">AI Career & Technical Mentor</h1>
            <Badge variant="violet" size="sm">
              <Sparkles className="w-3 h-3 mr-1 text-violetAccent-600" />
              Context-Aware
            </Badge>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Grounded in your active profile ({profile?.targetCareerRoleId ? profile.targetCareerRoleId.replace('role-', '').toUpperCase() : 'Full Stack'}), skill inventory, and roadmap milestones.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClearHistory}
          disabled={messages.length === 0}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Clear History
        </Button>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.key;

          return (
            <button
              key={m.key}
              onClick={() => setSelectedMode(m.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-brand-600 text-white font-semibold shadow-xs'
                  : 'bg-surface border border-surface-border text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Container */}
      <Card className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 shadow-subtle flex flex-col">
        {isLoadingHistory ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3 py-12">
            <div className="w-12 h-12 rounded-2xl bg-violetAccent-50 text-violetAccent-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-charcoal">
              Welcome, {user?.name.split(' ')[0]}! How can I assist your engineering growth today?
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              I can explain difficult runtime mechanics, conduct simulated mock interviews, diagnose code bugs, or optimize your roadmap trajectory.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-violetAccent-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 leading-relaxed ${
                    isUser
                      ? 'bg-brand-600 text-white shadow-xs rounded-tr-none'
                      : 'bg-surface border border-surface-border text-charcoal shadow-xs rounded-tl-none prose prose-xs max-w-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  <span
                    className={`text-[10px] block mt-2 text-right ${
                      isUser ? 'text-brand-200' : 'text-charcoal-subtle'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex gap-3 text-xs items-center text-charcoal-subtle">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-violetAccent-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-surface border border-surface-border p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Analyzing learner profile and formulating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      {/* Suggested Follow-ups Chips */}
      {suggestedFollowUps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-charcoal-subtle flex items-center gap-1 self-center mr-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Suggested:
          </span>
          {suggestedFollowUps.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              disabled={isSending}
              className="text-[11px] px-2.5 py-1 bg-surface border border-surface-border hover:border-brand-300 hover:bg-brand-50/50 rounded-full text-charcoal-muted hover:text-brand-700 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="shrink-0 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask a technical question, paste code, or request interview prep..."
          className="flex-1 text-xs px-4 py-3 bg-surface border border-surface-border rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
        />
        <Button
          variant="primary"
          size="md"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isSending}
          rightIcon={<Send className="w-4 h-4" />}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
