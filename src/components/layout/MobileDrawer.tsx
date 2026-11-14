import React from 'react';
import { Sidebar } from './Sidebar';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 dark:bg-black/60 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-64 max-w-[80vw] bg-surface dark:bg-surface-dark h-full flex flex-col shadow-float z-10">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3 p-1.5 rounded-lg text-charcoal-subtle dark:text-slate-400 hover:text-charcoal dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        <Sidebar onItemClick={onClose} />
      </div>
    </div>
  );
};
