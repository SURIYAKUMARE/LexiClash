import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LearningResource } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  BookOpen,
  Search,
  ExternalLink,
  Star,
  Clock,
  CheckCircle,
  Filter
} from 'lucide-react';

export const ResourceLibrary: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await api.getResources();
        setResources(data.resources);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const types = ['All', 'course', 'documentation', 'tutorial', 'platform'];
  const skills = ['All', 'JavaScript', 'React', 'TypeScript', 'Python', 'SQL / PostgreSQL', 'Docker', 'Data Structures & Algorithms'];

  const filtered = resources.filter(res => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDiff = selectedDifficulty === 'All' || res.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'All' || res.type === selectedType;
    const matchesSkill = selectedSkill === 'All' || res.skill === selectedSkill;

    return matchesSearch && matchesDiff && matchesType && matchesSkill;
  });

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
      <div>
        <h1 className="text-xl font-bold text-charcoal">Verified Resource Library</h1>
        <p className="text-xs text-charcoal-muted">
          Curated official documentation, interactive courses, and tutorials with verified destination links.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, provider, or keywords..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-charcoal-subtle mb-1">Skill Domain</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
            >
              {skills.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-charcoal-subtle mb-1">Difficulty Level</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
            >
              {difficulties.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-charcoal-subtle mb-1">Resource Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
            >
              {types.map(t => (
                <option key={t} value={t}>{t === 'All' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((res) => (
          <Card key={res.id} hoverable className="flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-subtle block">
                  {res.provider}
                </span>
                <Badge variant={res.difficulty === 'Beginner' ? 'brand' : res.difficulty === 'Intermediate' ? 'violet' : 'warning'} size="sm">
                  {res.difficulty}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-charcoal line-clamp-2 leading-snug">
                {res.title}
              </h3>

              <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-3">
                {res.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-subtle pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {res.duration}
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {res.rating}
                </span>
                {res.isFree && (
                  <Badge variant="success" size="sm">Free</Badge>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-surface-border">
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Open Official Resource
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
