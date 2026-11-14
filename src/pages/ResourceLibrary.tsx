import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { LearningResource } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  BookOpen,
  Search,
  ExternalLink,
  Clock,
  Filter,
  RotateCcw,
  FileText,
  Layers,
  Code2,
  CheckCircle2
} from 'lucide-react';

export const ResourceLibrary: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [freeOnly, setFreeOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await api.getResources();
        setResources(data.resources || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  const skillOptions = [
    'All',
    'JavaScript',
    'React',
    'Node.js',
    'TypeScript',
    'PostgreSQL',
    'Docker',
    'Data Structures & Algorithms'
  ];

  const difficultyOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const typeOptions = ['All', 'documentation', 'course', 'tutorial', 'platform'];

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesSearch =
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.skill.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSkill = selectedSkill === 'All' || res.skill.toLowerCase().includes(selectedSkill.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'All' || res.difficulty === selectedDifficulty;
      const matchesType = selectedType === 'All' || res.type === selectedType;
      const matchesFree = !freeOnly || res.isFree;

      return matchesSearch && matchesSkill && matchesDifficulty && matchesType && matchesFree;
    });
  }, [resources, searchQuery, selectedSkill, selectedDifficulty, selectedType, freeOnly]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSkill('All');
    setSelectedDifficulty('All');
    setSelectedType('All');
    setFreeOnly(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'documentation':
        return <FileText className="w-3.5 h-3.5" />;
      case 'tutorial':
        return <Layers className="w-3.5 h-3.5" />;
      case 'platform':
        return <Code2 className="w-3.5 h-3.5" />;
      default:
        return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted dark:text-slate-400 font-medium">Loading verified resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
            Resource Library
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Verified documentation, courses, and engineering references for full-stack skill mastery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-charcoal-muted dark:text-slate-400">
            {filteredResources.length} resources available
          </span>
        </div>
      </div>

      {/* 2-Column Split: Filter Sidebar (Left) + List Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <Card className="lg:col-span-1 space-y-5 p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <span className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Filters
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-charcoal-subtle dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200">
              Keyword Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-charcoal-subtle dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search topics, providers..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal dark:text-slate-100 focus:outline-none focus:border-brand-600"
              />
            </div>
          </div>

          {/* Skill Domain Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200">
              Skill Domain
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSelectedSkill(skill)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                    selectedSkill === skill
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-900'
                      : 'text-charcoal-muted dark:text-slate-400 hover:bg-surface-subtle dark:hover:bg-slate-800'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200">
              Difficulty Level
            </label>
            <div className="flex flex-wrap gap-1">
              {difficultyOptions.map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedDifficulty === diff
                      ? 'bg-brand-600 text-white font-semibold'
                      : 'border border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Resource Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200">
              Content Type
            </label>
            <div className="space-y-1">
              {typeOptions.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs capitalize transition-colors ${
                    selectedType === t
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-900'
                      : 'text-charcoal-muted dark:text-slate-400 hover:bg-surface-subtle dark:hover:bg-slate-800'
                  }`}
                >
                  {t === 'All' ? 'All Formats' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Free Only Checkbox */}
          <div className="pt-2 border-t border-surface-border dark:border-surface-dark-border">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-charcoal dark:text-slate-200">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={e => setFreeOnly(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-0"
              />
              <span>Free Resources Only</span>
            </label>
          </div>
        </Card>

        {/* Right List Cards */}
        <div className="lg:col-span-3 space-y-3">
          {filteredResources.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-surface-subtle dark:bg-slate-800 mx-auto flex items-center justify-center text-charcoal-subtle dark:text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-charcoal dark:text-slate-100">
                No matching resources found
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 max-w-sm mx-auto">
                No verified tutorials or documentation matched your current filter criteria.
              </p>
              <div className="pt-2">
                <Button size="sm" variant="outline" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              </div>
            </Card>
          ) : (
            filteredResources.map(res => (
              <Card
                key={res.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Main Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider">
                      {res.provider}
                    </span>
                    <span className="text-charcoal-subtle dark:text-slate-600">·</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-900 capitalize">
                      {getTypeIcon(res.type)}
                      <span>{res.type}</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-subtle dark:bg-slate-800 text-charcoal-muted dark:text-slate-400 border border-surface-border dark:border-surface-dark-border">
                      {res.difficulty}
                    </span>
                    {res.isFree && (
                      <span className="text-[11px] px-1.5 py-0.2 rounded font-medium text-status-success bg-status-success-bg dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                        Free
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-charcoal dark:text-slate-100 leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-charcoal-muted dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-charcoal-subtle dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {res.duration}
                    </span>
                    <span>·</span>
                    <span>Skill: <strong>{res.skill}</strong></span>
                  </div>
                </div>

                {/* Right Action */}
                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-surface-border dark:border-surface-dark-border">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Open Resource
                    </Button>
                  </a>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceLibrary;
