import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { OfflinePortfolioCredential } from '../db/indexedDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Award,
  CheckCircle2,
  Share2,
  Printer,
  Copy,
  ExternalLink,
  Shield,
  Layers,
  Terminal,
  Activity,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const VerifiedPortfolio: React.FC = () => {
  const [credentials, setCredentials] = useState<OfflinePortfolioCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreds = async () => {
      try {
        const res = await api.getPortfolioCredentials();
        setCredentials(res.credentials);
      } catch (err) {
        console.error('Failed to load portfolio credentials:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCreds();
  }, []);

  const handleCopyLink = (credId: string) => {
    navigator.clipboard.writeText(`https://skillpath.ai/verify/${credId}`);
    setCopiedId(credId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted font-mono">Loading Verified Proof of Work...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Verified Proof of Work v2.4
            </span>
            <span className="text-xs text-charcoal-subtle dark:text-slate-400">Cryptographically Auditable Credentials</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
            Verified Learner Portfolio & Credentials
          </h1>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
            Demonstrated mastery across hands-on cloud simulations, production incident response war rooms, and code assessments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={handlePrint} className="gap-1.5 text-xs font-mono">
            <Printer className="w-3.5 h-3.5" /> Print / Export PDF
          </Button>
          <Link to="/war-room">
            <Button size="sm" variant="primary" className="text-xs">
              Resolve Incidents
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">
            Verified Credentials
          </span>
          <div className="text-2xl font-bold text-charcoal dark:text-white font-mono mt-1 flex items-center gap-1.5">
            <Award className="w-5 h-5 text-brand-600" />
            {credentials.length} Issued
          </div>
          <span className="text-[11px] text-charcoal-muted mt-0.5 block">
            Evaluated by autonomous evaluator agents
          </span>
        </Card>

        <Card>
          <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">
            Average Score
          </span>
          <div className="text-2xl font-bold text-status-success font-mono mt-1">
            {Math.round(credentials.reduce((a, b) => a + b.scorePercentage, 0) / (credentials.length || 1))}%
          </div>
          <span className="text-[11px] text-charcoal-muted mt-0.5 block">
            Across practical scenarios & exams
          </span>
        </Card>

        <Card>
          <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">
            Audit Security
          </span>
          <div className="text-2xl font-bold text-indigo-600 font-mono mt-1 flex items-center gap-1.5">
            <Shield className="w-5 h-5" />
            SHA-256
          </div>
          <span className="text-[11px] text-charcoal-muted mt-0.5 block">
            Cryptographic proof with immutable verification hash
          </span>
        </Card>
      </div>

      {/* Credential Cards List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider">
          Verifiable Competency Records
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {credentials.map(cred => (
            <Card key={cred.id} className="flex flex-col justify-between border-brand-200 hover:border-brand-500 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-border dark:border-surface-dark-border">
                  <div>
                    <span className="font-mono text-[10px] text-brand-600 font-bold block mb-0.5">
                      {cred.credentialId}
                    </span>
                    <h3 className="text-sm font-bold text-charcoal dark:text-slate-100">
                      {cred.title}
                    </h3>
                    <span className="text-[11px] text-charcoal-subtle block mt-0.5">
                      Domain: {cred.skillCategory}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> {cred.status}
                  </span>
                </div>

                <div className="py-3 text-xs leading-relaxed space-y-2">
                  <p className="text-charcoal-muted dark:text-slate-300">
                    {cred.evidenceSummary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cred.skillsCovered.map(s => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-surface-subtle dark:bg-slate-800 text-[10px] font-medium text-charcoal dark:text-slate-200 border border-surface-border dark:border-surface-dark-border"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Credential Footer */}
              <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-charcoal-subtle">
                  <span>Audited by: {cred.verifiedByAgent}</span>
                  <span>Issued: {cred.issuedDate.substring(0, 10)}</span>
                </div>

                <div className="p-2 rounded bg-slate-900 text-slate-300 font-mono text-[9px] truncate">
                  HASH: {cred.verificationHash}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleCopyLink(cred.credentialId)}
                    className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1 font-mono"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedId === cred.credentialId ? 'Verification Link Copied!' : 'Copy Verification Link'}
                  </button>
                  <span className="text-xs font-mono font-bold text-status-success">
                    Score: {cred.scorePercentage}%
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
