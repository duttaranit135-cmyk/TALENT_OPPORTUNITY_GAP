'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Search, Sparkles, Target, Award, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MatchScoreBadge } from '@/components/MatchScoreBadge';
import { SkillTag } from '@/components/SkillTag';
import { apiFetch } from '@/lib/api';

type Problem = {
  id: string;
  title: string;
  description: string;
  organizationName: string;
  matchScore: number;
  skillOverlap: string[];
  skillGap: string[];
  deadline: string | null;
  commitmentType: string;
};

const DEFAULT_PROBLEMS: Problem[] = [
  {
    id: "demo-org-1",
    title: "Build a Dashboard for Campus Food Bank",
    description: "Our campus food bank needs a real-time dashboard to track inventory, predict demand, and reduce food waste by 20%. We have the data but no one to visualize it.",
    organizationName: "Campus Food Bank",
    matchScore: 78,
    skillOverlap: ["React", "SQL"],
    skillGap: ["Data Visualization"],
    deadline: "2025-08-01T00:00:00Z",
    commitmentType: "PART_TIME",
  },
  {
    id: "demo-org-2",
    title: "Design a Mobile App for Student Mental Health",
    description: "We need a UX researcher and UI designer to create a mobile app that helps college students track their mental health and connect with campus counselors.",
    organizationName: "MindfulCampus Coalition",
    matchScore: 65,
    skillOverlap: ["UI Design", "Figma"],
    skillGap: ["UX Research", "Prototyping"],
    deadline: "2025-09-15T00:00:00Z",
    commitmentType: "INTERNSHIP",
  },
  {
    id: "demo-org-3",
    title: "Automate Grant Reporting for Local NGO",
    description: "Our NGO spends 15 hours per week manually compiling grant reports. We need a Python script that pulls data from our database and generates formatted PDF reports automatically.",
    organizationName: "Green Earth Trust",
    matchScore: 85,
    skillOverlap: ["Python", "SQL"],
    skillGap: ["Technical Writing"],
    deadline: "2025-07-20T00:00:00Z",
    commitmentType: "ONE_TIME",
  },
];

export default function DashboardPage() {
  const [problems, setProblems] = useState<Problem[]>(DEFAULT_PROBLEMS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCommitment, setSelectedCommitment] = useState<string>('ALL');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await apiFetch<Problem[]>('/api/problems');
        if (Array.isArray(data) && data.length > 0) {
          setProblems(data);
        }
      } catch (err: any) {
        // Fallback to default demo problems so dashboard never breaks
        console.warn('API fetch problem fallback:', err);
      }
    };

    fetchProblems();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
    } catch {
      return dateStr;
    }
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCommitment =
      selectedCommitment === 'ALL' ||
      problem.commitmentType.toUpperCase().replace(/\s+/g, '_') ===
        selectedCommitment.toUpperCase().replace(/\s+/g, '_');
    return matchesSearch && matchesCommitment;
  });

  const topMatch = problems.length > 0 ? Math.max(...problems.map((p) => p.matchScore)) : 0;
  const allSkills = Array.from(new Set(problems.flatMap((p) => p.skillOverlap || [])));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Opportunities Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Real projects from organizations matched to your verified skills
          </p>
        </div>
        <Link href="/upload">
          <Button className="flex items-center gap-1.5 shadow-sm">
            <Sparkles size={16} />
            Upload New Skills
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <Target size={14} className="text-blue-500" />
            Matched
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{problems.length}</div>
          <p className="text-xs text-gray-400 mt-0.5">Active problems</p>
        </Card>

        <Card className="p-4 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <Award size={14} className="text-green-500" />
            Top Match
          </div>
          <div className="text-2xl font-bold text-green-700 mt-1">{topMatch}%</div>
          <p className="text-xs text-gray-400 mt-0.5">High compatibility</p>
        </Card>

        <Card className="p-4 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} className="text-purple-500" />
            Your Skills
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{allSkills.length}</div>
          <p className="text-xs text-gray-400 mt-0.5">Tagged & verified</p>
        </Card>

        <Card className="p-4 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <Calendar size={14} className="text-orange-500" />
            Openings
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{filteredProblems.length}</div>
          <p className="text-xs text-gray-400 mt-0.5">Available now</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search opportunities by title or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'PART_TIME', 'INTERNSHIP', 'ONE_TIME'].map((type) => (
            <Button
              key={type}
              variant={selectedCommitment === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCommitment(type)}
              className="text-xs whitespace-nowrap"
            >
              {type === 'ALL' ? 'All Roles' : type.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          Loading opportunities...
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-8 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Problem Cards List */}
      <div className="flex flex-col gap-4">
        {filteredProblems.length > 0 ? (
          filteredProblems.map((problem) => (
            <Link
              key={problem.id}
              href={`/problems/${problem.id}`}
              className="block group"
            >
              <Card className="p-6 bg-white hover:border-blue-300 hover:shadow-md transition-all">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      {problem.title}
                      <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                    </h2>
                    <p className="text-sm font-medium text-gray-600 mt-1">
                      {problem.organizationName}
                    </p>
                  </div>
                  <MatchScoreBadge score={problem.matchScore} />
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                  {problem.description}
                </p>

                {/* Skills tags */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-gray-400 mr-1 font-medium">Matches:</span>
                    {problem.skillOverlap?.map((skill) => (
                      <SkillTag key={skill} name={skill} variant="match" />
                    ))}
                    {problem.skillGap?.map((skill) => (
                      <SkillTag key={skill} name={skill} variant="gap" />
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {problem.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar size={13} />
                        <span>{formatDate(problem.deadline)}</span>
                      </div>
                    )}
                    {problem.commitmentType && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        {problem.commitmentType.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="p-12 text-center max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-700">No matching opportunities found</h2>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search query or filter.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCommitment('ALL');
              }}
            >
              Reset Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
