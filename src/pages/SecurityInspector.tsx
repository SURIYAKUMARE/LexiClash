import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Wrench,
  ChevronRight,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SecurityFinding {
  id: string;
  benchmark: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'FAIL' | 'PASS';
  description: string;
  remediationSuggestion: string;
  canAutoRemediate: boolean;
}

export const SecurityInspector: React.FC = () => {
  const [auditScore, setAuditScore] = useState(60);
  const [auditStatus, setAuditStatus] = useState<'COMPLIANT' | 'WARNING' | 'CRITICAL'>('WARNING');
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchAudit = async () => {
    try {
      const res = await api.getSecurityAudit();
      setAuditScore(res.score);
      setAuditStatus(res.status);
      setFindings(res.findings);
    } catch (err) {
      console.error('Failed to run security audit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const handleRemediate = async (findingId: string) => {
    setRemediatingId(findingId);
    try {
      const res = await api.remediateSecurityIssue(findingId);
      if (res.success) {
        setToastMessage(res.message);
        setTimeout(() => setToastMessage(null), 4000);
        await fetchAudit();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRemediatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted font-mono">Running CIS Benchmark Cloud Security Audit...</p>
        </div>
      </div>
    );
  }

  const passCount = findings.filter(f => f.status === 'PASS').length;
  const failCount = findings.filter(f => f.status === 'FAIL').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              CIS Benchmark Auditor
            </span>
            <span className="text-xs text-charcoal-subtle dark:text-slate-400">Automated Policy Scanner</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
            Educational Security & Compliance Inspector
          </h1>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
            Audit simulated AWS infrastructure against Center for Internet Security (CIS) foundational benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={fetchAudit} className="gap-1.5 text-xs font-mono">
            <RotateCcw className="w-3.5 h-3.5" /> Re-scan
          </Button>
          <Link to="/cloud-console">
            <Button size="sm" variant="primary" className="text-xs">
              Cloud Console
            </Button>
          </Link>
        </div>
      </div>

      {/* Remediation Toast */}
      {toastMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-950 dark:text-emerald-200 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Audit Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">
              CIS Compliance Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-charcoal dark:text-white">
                {auditScore}%
              </span>
              <Badge
                variant={auditStatus === 'COMPLIANT' ? 'success' : auditStatus === 'WARNING' ? 'brand' : 'error'}
                size="sm"
              >
                {auditStatus}
              </Badge>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                auditScore >= 80 ? 'bg-emerald-500' : auditScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${auditScore}%` }}
            />
          </div>
        </Card>

        <Card>
          <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">
            Passed Checks
          </span>
          <div className="text-2xl font-bold text-status-success font-mono mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            {passCount} of {findings.length}
          </div>
          <span className="text-[11px] text-charcoal-muted mt-1 block">
            Infrastructure meets baseline compliance requirements
          </span>
        </Card>

        <Card>
          <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">
            Critical / High Findings
          </span>
          <div className="text-2xl font-bold text-rose-600 font-mono mt-1 flex items-center gap-1.5">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            {failCount} Security Gaps
          </div>
          <span className="text-[11px] text-charcoal-muted mt-1 block">
            One-click remediation available for high-risk misconfigurations
          </span>
        </Card>
      </div>

      {/* Findings List */}
      <Card>
        <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
          <h2 className="text-sm font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider">
            Automated Audit Findings & Remediations
          </h2>
          <span className="text-xs text-charcoal-subtle">6 Rules Evaluated</span>
        </div>

        <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
          {findings.map(finding => {
            const isPass = finding.status === 'PASS';
            const isRemediating = remediatingId === finding.id;

            return (
              <div key={finding.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-charcoal-subtle">
                      {finding.benchmark}
                    </span>
                    <Badge variant={isPass ? 'success' : finding.severity === 'CRITICAL' ? 'error' : 'brand'} size="sm">
                      {isPass ? 'PASS' : finding.severity}
                    </Badge>
                    <h3 className="text-xs font-bold text-charcoal dark:text-slate-100">
                      {finding.title}
                    </h3>
                  </div>

                  <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
                    {finding.description}
                  </p>

                  {!isPass && (
                    <div className="text-[11px] text-brand-700 dark:text-brand-300 font-medium pt-0.5">
                      <strong>Remediation:</strong> {finding.remediationSuggestion}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {!isPass && finding.canAutoRemediate && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleRemediate(finding.id)}
                      disabled={isRemediating}
                      className="text-xs gap-1.5 font-mono py-1 h-8"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      {isRemediating ? 'Applying...' : 'One-Click Remediate'}
                    </Button>
                  )}
                  {isPass && (
                    <span className="text-xs font-bold text-status-success flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Compliant
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
