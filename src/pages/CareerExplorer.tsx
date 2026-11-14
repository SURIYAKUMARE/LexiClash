import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CareerRole } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  DollarSign,
  TrendingUp,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CareerExplorer: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Intelligence Agent State
  const [roleIntel, setRoleIntel] = useState<any | null>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const data = await api.getCareers();
        setRoles(data.careers);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCareers();
  }, []);

  const handleOpenRoleDetail = async (role: CareerRole) => {
    setSelectedRole(role);
    setIsDetailModalOpen(true);
    setRoleIntel(null);
    setIsLoadingIntel(true);
    try {
      const data = await api.getCareerIntelligence(role.id);
      setRoleIntel(data.intelligence);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingIntel(false);
    }
  };

  const handleSetTargetRole = async (roleId: string) => {
    setIsSwitching(true);
    try {
      await api.selectTargetCareer(roleId);
      await refreshProfile();
      setIsDetailModalOpen(false);
      navigate('/roadmap');
    } catch (err: any) {
      alert(err?.message || 'Failed to update target role.');
    } finally {
      setIsSwitching(false);
    }
  };

  const categories = ['all', 'Software Engineering', 'Artificial Intelligence', 'Data & Analytics', 'Cloud & Infrastructure', 'Security', 'Design & Product'];

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || role.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const activeRoleId = profile?.targetCareerRoleId || 'role-fullstack';

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
          <h1 className="text-xl font-bold text-charcoal">Engineering Career Explorer</h1>
          <p className="text-xs text-charcoal-muted">
            Explore industry benchmarks, compensation insights, and align your personalized roadmap.
          </p>
        </div>
      </div>

      {/* Strict Career Disclaimer Alert */}
      <div className="p-3.5 bg-brand-50/70 border border-brand-200 rounded-xl text-xs text-brand-900 leading-relaxed flex items-start gap-2.5">
        <Compass className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Transparent Benchmark Notice:</span> All skill benchmarks and readiness scores reflect algorithmic alignment with typical engineering market criteria. Selecting or mastering a role provides structured educational guidance and does not imply or guarantee employment or hiring offers.
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, skills, descriptions..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-surface border border-surface-border rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'bg-surface border border-surface-border text-charcoal-muted hover:text-charcoal'
              }`}
            >
              {cat === 'all' ? 'All Domains' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoles.map((role) => {
          const isTarget = role.id === activeRoleId;

          return (
            <Card
              key={role.id}
              hoverable
              className={`flex flex-col justify-between transition-all ${
                isTarget ? 'border-brand-500 ring-2 ring-brand-500/10 bg-brand-50/10' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-subtle block">
                      {role.category}
                    </span>
                    <h3 className="text-base font-bold text-charcoal mt-0.5">{role.title}</h3>
                  </div>
                  {isTarget ? (
                    <Badge variant="brand" size="sm" className="shrink-0">
                      My Target Role
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm" className="shrink-0">
                      Demand: {role.marketDemand}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed">
                  {role.shortDescription}
                </p>

                <div className="text-xs font-semibold text-status-success flex items-center gap-1.5 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Salary Range: {role.salaryRange}</span>
                </div>

                {/* Required Skills Chips */}
                <div>
                  <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block mb-1.5">
                    Core Benchmark Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.requiredSkills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 bg-surface-subtle border border-surface-border rounded text-charcoal-muted"
                      >
                        {s.skillName} (L{s.benchmarkLevel})
                      </span>
                    ))}
                    {role.requiredSkills.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-charcoal-subtle">
                        +{role.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-4 mt-4 border-t border-surface-border flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleOpenRoleDetail(role)}
                >
                  View Details & Intel
                </Button>
                {isTarget ? (
                  <Link to="/roadmap" className="flex-1">
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      View Roadmap
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleSetTargetRole(role.id)}
                    isLoading={isSwitching}
                  >
                    Set as Target
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Role Details & Career Intelligence Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        maxWidth="xl"
        title={selectedRole?.title}
        description={`Domain: ${selectedRole?.category} • Benchmark Salary: ${selectedRole?.salaryRange}`}
      >
        {selectedRole && (
          <div className="space-y-5">
            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Role Description</h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">{selectedRole.description}</p>
            </div>

            {/* Daily Responsibilities */}
            <div>
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Typical Production Responsibilities</h4>
              <ul className="space-y-1.5 text-xs text-charcoal-muted">
                {selectedRole.dailyResponsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Skills Grid */}
            <div>
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Required Benchmark Competencies</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRole.requiredSkills.map((req, i) => (
                  <div key={i} className="p-2.5 bg-surface-subtle border border-surface-border rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-charcoal block">{req.skillName}</span>
                      <span className="text-[10px] text-charcoal-subtle capitalize">{req.category}</span>
                    </div>
                    <Badge variant={req.importance === 'critical' ? 'danger' : 'brand'} size="sm">
                      Level {req.benchmarkLevel}/5
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Intelligence Agent Output */}
            <div className="p-4 bg-brand-50/70 border border-brand-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                  Career Intelligence Agent Insights
                </h4>
              </div>

              {isLoadingIntel ? (
                <div className="py-4 flex items-center justify-center gap-2 text-xs text-brand-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing real-time market trends...</span>
                </div>
              ) : roleIntel ? (
                <div className="space-y-3 text-xs">
                  <p className="text-brand-900 leading-relaxed">{roleIntel.marketTrendAnalysis}</p>

                  <div>
                    <span className="font-semibold text-brand-900 block mb-1">Hiring Manager Portfolio Checklist:</span>
                    <ul className="space-y-1 text-brand-800 text-[11px]">
                      {roleIntel.hiringManagerChecklist?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {roleIntel.capstoneProjectThemes && (
                    <div>
                      <span className="font-semibold text-brand-900 block mb-1">Recommended Capstone Themes:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {roleIntel.capstoneProjectThemes.map((th: string, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-white border border-brand-200 rounded text-brand-800 font-medium">
                            {th}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Set as Target Career Action */}
            <div className="flex justify-between items-center pt-3 border-t border-surface-border">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              {selectedRole.id !== activeRoleId && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleSetTargetRole(selectedRole.id)}
                  isLoading={isSwitching}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Set as My Target Role & Update Roadmap
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
