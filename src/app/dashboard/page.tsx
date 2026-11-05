'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function DashboardPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiFetch<Problem[]>('/api/problems');
        setProblems(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load opportunities. Please try again.');
      } finally {
        setLoading(false);
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

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Page Heading & Subtext */}
      <h1 className="text-2xl font-bold text-gray-900">Opportunities For You</h1>
      <p className="text-gray-500 mb-6">Problems matched to your skills</p>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          Loading opportunities...
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-8 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && problems.length === 0 && (
        <Card className="p-8 text-center bg-gray-50 border-gray-200">
          <p className="text-gray-500 font-medium">
            No opportunities yet. Check back soon!
          </p>
        </Card>
      )}

      {/* Problem Cards List */}
      {!loading && !error && problems.length > 0 && (
        <div className="flex flex-col gap-4">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              href={`/problems/${problem.id}`}
              className="block group"
            >
              <Card className="p-5 hover:shadow-md transition-shadow">
                {/* Row 1 */}
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {problem.title}
                  </h2>
                  <MatchScoreBadge score={problem.matchScore} />
                </div>

                {/* Row 2 */}
                <p className="text-sm text-gray-500 mt-1">
                  {problem.organizationName}
                </p>

                {/* Row 3 */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {problem.skillOverlap?.map((skill) => (
                    <SkillTag key={skill} name={skill} variant="match" />
                  ))}
                  {problem.skillGap?.map((skill) => (
                    <SkillTag key={skill} name={skill} variant="gap" />
                  ))}
                </div>

                {/* Row 4 */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  {problem.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(problem.deadline)}</span>
                    </div>
                  )}
                  {problem.commitmentType && (
                    <Badge variant="secondary">{problem.commitmentType}</Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

