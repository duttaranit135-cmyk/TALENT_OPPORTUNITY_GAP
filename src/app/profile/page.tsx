'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/api';
import { SkillTag } from '@/components/SkillTag';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError('');

      try {
        // 1. Get user from Supabase Auth
        const { data } = await supabase.auth.getUser();
        setUser(data?.user ?? null);

        // 2. Get user's skills by fetching problems and extracting unique skills
        try {
          const problems = await apiFetch<any[]>('/api/problems');
          if (Array.isArray(problems)) {
            setMatchCount(problems.length);
            const uniqueSkills = Array.from(
              new Set(
                problems.flatMap((p: any) => p?.skillOverlap || [])
              )
            ) as string[];
            setSkills(uniqueSkills);
          } else {
            setMatchCount(0);
            setSkills([]);
          }
        } catch {
          // If the API call fails or returns empty, just show "No skills yet"
          setMatchCount(0);
          setSkills([]);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  const name = user?.user_metadata?.name || 'Student';
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const rawRole = user?.user_metadata?.role || 'Student';
  const isOrg =
    rawRole.toUpperCase() === 'ORG_ADMIN' ||
    rawRole.toUpperCase().includes('ORGANIZATION');

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Section 1 — Profile Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
            <AvatarFallback className="bg-blue-600 text-white font-bold text-xl">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {name}
              </h1>
              <Badge
                className={
                  isOrg
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200'
                }
              >
                {isOrg ? 'Organization' : 'Student'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="truncate">{user?.email || 'No email'}</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="truncate">
              {user?.user_metadata?.university || 'Not specified'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="truncate">
              {user?.user_metadata?.major || 'Not specified'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <span>Member since {memberSince}</span>
          </div>
        </div>
      </Card>

      <Separator className="my-6" />

      {/* Section 2 — Your Skills */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Skills</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Skills demonstrated through your uploaded artifacts
        </p>

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SkillTag key={skill} name={skill} variant="match" />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No skills tagged yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Upload your first project to start building your skill profile.
            </p>
            <Link href="/upload">
              <Button variant="outline" className="mt-3">
                Upload Now
              </Button>
            </Link>
          </Card>
        )}
      </div>

      <Separator className="my-6" />

      {/* Section 3 — Quick Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activity</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">—</div>
            <div className="text-sm text-gray-600 mt-1">Artifacts</div>
            <div className="text-xs text-gray-400 mt-0.5">Coming soon</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{matchCount}</div>
            <div className="text-sm text-gray-600 mt-1">Matches</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{skills.length}</div>
            <div className="text-sm text-gray-600 mt-1">Skills</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

