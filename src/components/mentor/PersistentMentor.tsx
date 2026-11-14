import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  MessageSquareCode,
  X,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Languages,
  ChevronDown,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const PersistentMentor: React.FC = () => {
  const location = useLocation();
  const { user, profile } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [languageMode, setLanguageMode] = useState<'english' | 'tanglish'>('english');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message based on page context
    const currentPath = location.pathname;
    let initialGreeting = `Hello ${user?.name || 'Engineer'}! I'm your persistent SkillPath Mentor. How can I help you master your skills today?`;

    if (currentPath.includes('cloud-console')) {
      initialGreeting = languageMode === 'tanglish'
        ? `Vanakkam ${user?.name}! Neenga ippo Cloud Console simula irukeenga. IAM, EC2 or S3 bucket configuration pathi edhavadhu doubt irundha kelunga, explain panren!`
        : `Welcome to the Cloud Console Simulator! I'm monitoring your simulated AWS infrastructure. Need guidance on configuring IAM policies, EC2 security groups, or S3 bucket access?`;
    } else if (currentPath.includes('war-room')) {
      initialGreeting = languageMode === 'tanglish'
        ? `Alert alert! War Room-la P1 incident nadakudhu. Triage logs paathutu proper mitigation action choose pannunga. Need hints on root cause?`
        : `You are in the SRE Incident War Room. Need help triaging telemetry logs or evaluating mitigation runbooks?`;
    } else if (currentPath.includes('architecture')) {
      initialGreeting = languageMode === 'tanglish'
        ? `Architecture visualizer super-ah iruku! Multi-AZ topology and NAT gateway routing doubt irundha sollunga.`
        : `Inspecting the live cloud topology! I can explain subnet partitioning, ingress traffic flow, or high availability patterns.`;
    }

    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [location.pathname, languageMode]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const speakText = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const text = customPrompt || inputValue;
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputValue('');
    setIsSending(true);

    try {
      // Build contextual prompt with current route and language
      const contextPrefix = `[Current Page: ${location.pathname}, Mode: ${languageMode}]: `;
      const res = await api.sendMentorMessage(contextPrefix + text);

      let replyContent = res.assistantMessage?.content || (res as any).reply || 'How can I assist you further?';
      if (languageMode === 'tanglish') {
        replyContent = `Nalla question! ${replyContent} Idha implement panna easy-ah purinjukalam. Any other doubts?`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(replyContent);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    location.pathname.includes('war-room')
      ? 'How do I diagnose the P1 outage?'
      : 'Explain VPC subnetting simply',
    'Review my architecture resilience',
    'Give me a mock interview question',
    'Explain difference between microtasks and macrotasks'
  ];

  return (
    <>
      {/* Persistent Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-brand-600 hover:bg-brand-700 text-white rounded-full p-3.5 shadow-lg flex items-center gap-2.5 transition-all hover:scale-105 group border border-white/20"
          title="Open SkillPath Persistent Mentor"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-brand-600" />
          </div>
          <span className="text-xs font-bold tracking-tight pr-1">SkillPath Mentor</span>
        </button>
      )}

      {/* Floating Slide-Over Mentor Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[390px] h-[540px] bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#1A1C1E] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold tracking-tight text-white">SkillPath Mentor</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Online
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Context: {location.pathname.replace('/', '') || 'dashboard'}
                </span>
              </div>
            </div>

            {/* Controls (Speech, Tanglish, Close) */}
            <div className="flex items-center gap-1 text-slate-400">
              {/* Language Mode Toggle */}
              <button
                onClick={() => setLanguageMode(prev => prev === 'english' ? 'tanglish' : 'english')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                  languageMode === 'tanglish'
                    ? 'bg-brand-600 text-white'
                    : 'hover:text-white bg-slate-800 text-slate-300'
                }`}
                title="Toggle English / Tanglish mode"
              >
                {languageMode === 'tanglish' ? 'Tanglish' : 'ENG'}
              </button>

              {/* Voice Read-Aloud */}
              <button
                onClick={() => {
                  setSpeechEnabled(!speechEnabled);
                  if (speechEnabled && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className={`p-1.5 rounded hover:text-white transition-colors ${
                  speechEnabled ? 'text-brand-400' : 'text-slate-400'
                }`}
                title={speechEnabled ? 'Disable Speech Read-Aloud' : 'Enable Speech Read-Aloud'}
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded hover:text-white transition-colors ml-1"
                title="Minimize Mentor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-surface-subtle/50 dark:bg-slate-900/40 text-xs">
            {messages.map(msg => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      isAssistant
                        ? 'bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border text-charcoal dark:text-slate-100 shadow-xs'
                        : 'bg-brand-600 text-white rounded-br-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span
                      className={`text-[9px] mt-1 block font-mono text-right ${
                        isAssistant ? 'text-charcoal-subtle dark:text-slate-400' : 'text-brand-200'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center gap-2 text-charcoal-muted dark:text-slate-400 text-xs italic">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
                <span>Mentor analyzing context...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-surface-subtle dark:bg-slate-900 border-t border-surface-border dark:border-surface-dark-border flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map(p => (
              <button
                key={p}
                onClick={() => handleSendMessage(p)}
                className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-surface-border dark:border-surface-dark-border text-[10px] text-charcoal dark:text-slate-300 font-medium whitespace-nowrap hover:border-brand-500 transition-colors shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-surface-dark-card border-t border-surface-border dark:border-surface-dark-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  languageMode === 'tanglish'
                    ? 'Doubt edhavadhu kelunga...'
                    : 'Ask for guidance, code help, or architecture tips...'
                }
                className="flex-1 bg-surface-subtle dark:bg-slate-800 border border-surface-border dark:border-surface-dark-border rounded-lg px-3 py-2 text-xs text-charcoal dark:text-white focus:outline-hidden focus:ring-1 focus:ring-brand-600"
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isSending}
                className="px-3 h-8 text-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
