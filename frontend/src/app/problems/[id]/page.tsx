'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Send } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { MatchScoreBadge } from '@/components/MatchScoreBadge';
import { SkillTag } from '@/components/SkillTag';
import { ActionPlanCard } from '@/components/ActionPlanCard';
import { SkillRadarChart } from '@/components/SkillRadarChart';
import { apiFetch } from '@/lib/api';

type ProblemDetail = {
  problem: {
    id: string;
    title: string;
    description: string;
    organizationName: string;
    organizationType: string;
    deadline: string | null;
    commitmentType: string;
    domainTags: string[];
    requiredSkills: string[];
  };
  match: {
    matchScore: number;
    skillOverlap: string[];
    skillGap: string[];
  };
};

type ActionPlan = {
  steps: {
    skill: string;
    url: string;
    description: string;
    minutes: number;
    predictedScoreBoost: number;
  }[];
};

export default function ProblemDetailPage() {
  const params = useParams();
  const problemId = params.id as string;

  const [problemData, setProblemData] = useState<ProblemDetail | null>(null);
  const [problemLoading, setProblemLoading] = useState<boolean>(true);
  const [problemError, setProblemError] = useState<string | null>(null);

  const [actionPlanData, setActionPlanData] = useState<ActionPlan | null>(null);
  const [actionPlanLoading, setActionPlanLoading] = useState<boolean>(true);
  const [actionPlanError, setActionPlanError] = useState<string | null>(null);

  useEffect(() => {
    if (!problemId) return;

    // Fetch problem detail
    setProblemLoading(true);
    setProblemError(null);
    apiFetch<ProblemDetail>('/api/problems/' + problemId)
      .then((data) => {
        setProblemData(data);
      })
      .catch((err) => {
        setProblemError(err instanceof Error ? err.message : 'Failed to load problem');
      })
      .finally(() => {
        setProblemLoading(false);
      });

    // Fetch action plan
    setActionPlanLoading(true);
    setActionPlanError(null);
    apiFetch<ActionPlan>('/api/matches/' + problemId + '/action-plan')
      .then((data) => {
        setActionPlanData(data);
      })
      .catch((err) => {
        setActionPlanError(err instanceof Error ? err.message : 'Failed to load action plan');
      })
      .finally(() => {
        setActionPlanLoading(false);
      });
  }, [problemId]);

  if (problemLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading problem details...
      </div>
    );
  }

  if (problemError || !problemData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 mb-4">{problemError || 'Problem not found'}</p>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const { problem, match } = problemData;

  // Build userScores from the match data
  const userScores: Record<string, number> = {};
  (problem.requiredSkills || []).forEach((skill) => {
    if (match.skillOverlap?.includes(skill)) {
      userScores[skill] = 80;
    } else if (match.skillGap?.includes(skill)) {
      userScores[skill] = 0;
    } else {
      userScores[skill] = 0;
    }
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Section 1 — Problem Header */}
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mt-4">{problem.title}</h1>

      <div className="flex items-center gap-2 mt-2">
        <span className="text-lg text-gray-600">{problem.organizationName}</span>
        <Badge variant="outline">{problem.organizationType}</Badge>
      </div>

      <p className="text-gray-600 mt-4 leading-relaxed whitespace-pre-wrap">
        {problem.description}
      </p>

      <div className="flex flex-wrap gap-3 mt-4 items-center">
        {problem.deadline && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Calendar size={16} />
            <span>{new Date(problem.deadline).toLocaleDateString()}</span>
          </div>
        )}
        <Badge variant="secondary">{problem.commitmentType}</Badge>
        {problem.domainTags?.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>

      <Separator className="my-6" />

      {/* Section 2 — Your Match */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Match</h2>
        <div className="mt-3">
          <MatchScoreBadge score={match.matchScore} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column: Skills You Have */}
          <div>
            <h3 className="text-sm font-semibold text-green-700 mb-2">
              Skills You Have
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {match.skillOverlap && match.skillOverlap.length > 0 ? (
                match.skillOverlap.map((skill) => (
                  <SkillTag key={skill} name={skill} variant="match" />
                ))
              ) : (
                <span className="text-sm text-gray-400">None yet</span>
              )}
            </div>
          </div>

          {/* Right Column: Skills You Need */}
          <div>
            <h3 className="text-sm font-semibold text-red-700 mb-2">
              Skills You Need
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {match.skillGap && match.skillGap.length > 0 ? (
                match.skillGap.map((skill) => (
                  <SkillTag key={skill} name={skill} variant="gap" />
                ))
              ) : (
                <span className="text-sm text-green-600">
                  You have all required skills! 🎉
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <SkillRadarChart
            requiredSkills={problem.requiredSkills || []}
            userScores={userScores}
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* Section 3 — Close the Gap */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Close the Gap</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Complete these steps to improve your match score
        </p>

        {actionPlanLoading && (
          <p className="text-sm text-gray-500 py-4">Loading action plan...</p>
        )}

        {actionPlanError && (
          <p className="text-sm text-red-600 py-4">
            Failed to load action plan: {actionPlanError}
          </p>
        )}

        {!actionPlanLoading && !actionPlanError && actionPlanData && (
          <>
            {actionPlanData.steps && actionPlanData.steps.length > 0 ? (
              <div className="flex flex-col gap-3">
                {actionPlanData.steps.map((step, idx) => (
                  <ActionPlanCard
                    key={`${step.skill}-${idx}`}
                    skill={step.skill}
                    url={step.url}
                    description={step.description}
                    minutes={step.minutes}
                    scoreBoost={step.predictedScoreBoost}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-4 bg-green-50 border-green-200 text-green-800 text-sm font-medium">
                No gaps to close! You're a perfect match.
              </Card>
            )}
          </>
        )}
      </div>

      <Separator className="my-6" />

      {/* Section 4 — CTA */}
      <div className="flex justify-center">
        <Button size="lg" asChild>
          <Link
            href={`/outreach/${problemId}`}
            className="inline-flex items-center gap-2"
          >
            <Send size={18} />
            Generate Outreach Email
          </Link>
        </Button>
      </div>
    </div>
  );
}
