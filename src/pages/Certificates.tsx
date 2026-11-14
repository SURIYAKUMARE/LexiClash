import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Certificate } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Award,
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export const Certificates: React.FC = () => {
  const { user, profile } = useAuth();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadCertificates = async () => {
    try {
      const data = await api.getCertificates();
      setCertificates(data.certificates);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleClaimNewCertificate = async () => {
    setIsClaiming(true);
    try {
      const title = `${profile?.targetCareerRoleId ? profile.targetCareerRoleId.replace('role-', '').toUpperCase() : 'Full Stack'} Mastery & Foundations`;
      const res = await api.claimCertificate({
        title,
        skillsCovered: ['JavaScript', 'React', 'SQL', 'Git & Architecture'],
        gradePercentage: 95
      });

      // Confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      await loadCertificates();
      setSelectedCert(res.certificate);
      setIsViewerOpen(true);
    } catch (err: any) {
      alert(err?.message || 'Failed to claim certificate');
    } finally {
      setIsClaiming(false);
    }
  };

  const openCertViewer = (cert: Certificate) => {
    setSelectedCert(cert);
    setIsViewerOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Verifiable Certificates & Credentials</h1>
          <p className="text-xs text-charcoal-muted">
            Tamper-proof verifiable credentials issued upon passing topic assessments and completing roadmap phases.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleClaimNewCertificate}
          isLoading={isClaiming}
          leftIcon={<Award className="w-4 h-4" />}
        >
          Claim Milestone Credential
        </Button>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <Card key={cert.id} hoverable className="p-6 border-brand-100 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <Badge variant="success" size="sm" verified>
                  Verified Grade: {cert.gradePercentage}%
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-base text-charcoal">{cert.title}</h3>
                <span className="text-xs text-charcoal-muted block mt-0.5">
                  Awarded to <strong>{cert.userName}</strong>
                </span>
              </div>

              <div className="p-3 bg-surface-subtle border border-surface-border rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-subtle">Credential ID:</span>
                  <span className="font-mono font-semibold text-charcoal">{cert.credentialId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-subtle">Issued Date:</span>
                  <span className="text-charcoal">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-subtle">Verification Hash:</span>
                  <span className="font-mono text-[10px] text-charcoal-muted truncate max-w-[160px]">{cert.verificationHash}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block mb-1">
                  Skills Validated:
                </span>
                <div className="flex flex-wrap gap-1">
                  {cert.skillsCovered.map((s, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-brand-50 text-brand-800 rounded font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => openCertViewer(cert)}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Inspect Official Credential
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Official Certificate Viewer Modal */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        maxWidth="2xl"
      >
        {selectedCert && (
          <div className="space-y-6">
            {/* Certificate Canvas / Container */}
            <div className="border-8 border-brand-900/10 p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-white via-amber-50/20 to-white text-center space-y-4 shadow-sm relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-brand-700 text-white flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-700">
                  SkillPath AI • Verified Achievement
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
                  Certificate of Competency
                </h2>
              </div>

              <p className="text-xs text-charcoal-muted">This certifies that</p>
              <h3 className="text-xl sm:text-2xl font-bold text-brand-950 underline decoration-brand-300 decoration-2 underline-offset-4">
                {selectedCert.userName}
              </h3>
              <p className="text-xs text-charcoal-muted max-w-md mx-auto leading-relaxed">
                has successfully demonstrated verified proficiency, scoring {selectedCert.gradePercentage}% across industry-standard technical criteria in
              </p>

              <h4 className="text-base sm:text-lg font-bold text-charcoal">
                {selectedCert.title}
              </h4>

              <div className="pt-4 flex flex-wrap justify-center gap-2">
                {selectedCert.skillsCovered.map((s, idx) => (
                  <Badge key={idx} variant="brand" size="sm">
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="pt-6 border-t border-surface-border text-left grid grid-cols-2 text-[10px] text-charcoal-subtle">
                <div>
                  <span className="block font-semibold text-charcoal">Credential ID: {selectedCert.credentialId}</span>
                  <span>Issued: {new Date(selectedCert.issuedAt).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold text-charcoal">Verification Hash</span>
                  <span className="font-mono text-[9px]">{selectedCert.verificationHash}</span>
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => setIsViewerOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print / Save PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
