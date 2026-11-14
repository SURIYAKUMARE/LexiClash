import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';
import { AgentTraceDrawer } from '../agents/AgentTraceDrawer';
import { PersistentMentor } from '../mentor/PersistentMentor';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const Layout: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isExamActive, setIsExamActive] = useState(false);

  useEffect(() => {
    const handleExamEvent = (e: any) => {
      setIsExamActive(Boolean(e.detail?.active));
    };
    window.addEventListener('skillpath:exam-active', handleExamEvent);
    return () => window.removeEventListener('skillpath:exam-active', handleExamEvent);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-subtle dark:bg-surface-dark-subtle transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header onMobileMenuToggle={() => setMobileDrawerOpen(true)} />
        <main id="main-content" role="main" aria-label="Main Application Content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Persistent AI Mentor (Suppressed during secure proctored exams) */}
      {!isExamActive && <PersistentMentor />}

      {/* Collapsible Multi-Agent Reasoning Trace Drawer (Suppressed during secure proctored exams) */}
      {!isExamActive && <AgentTraceDrawer />}
    </div>
  );
};
