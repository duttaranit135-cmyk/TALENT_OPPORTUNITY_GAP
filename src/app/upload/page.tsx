'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SKILL_CATEGORIES: Record<string, string[]> = {
  "Programming": ["Python", "JavaScript", "TypeScript", "Java", "C++", "React", "Node.js", "SQL", "HTML/CSS", "Git"],
  "Design": ["UI Design", "UX Research", "Figma", "Graphic Design", "Prototyping"],
  "Research": ["Data Analysis", "Literature Review", "Survey Design", "Statistical Modeling", "Academic Writing"],
  "Communication": ["Public Speaking", "Technical Writing", "Project Management", "Team Leadership", "Presentation"],
  "Data": ["Machine Learning", "Data Visualization", "Excel", "Pandas", "Tableau"],
  "Other": ["Event Planning", "Social Media", "Video Editing", "Photography", "Fundraising"]
};

export default function UploadPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login');
    });
  }, [router]);

  const [type, setType] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set<string>());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || selectedSkills.size === 0 || loading) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const skillCount = selectedSkills.size;
      await apiFetch('/api/artifacts', {
        method: 'POST',
        body: JSON.stringify({
          type,
          url: type === 'TEXT' ? '' : url,
          description,
          skillNames: Array.from(selectedSkills),
        }),
      });

      setSuccess(`Artifact uploaded with ${skillCount} skills tagged!`);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload artifact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Your Work</h1>

      {success && (
        <Card className="bg-green-50 border-green-200 p-4 mb-6">
          <p className="text-green-800 font-medium text-sm text-center">
            {success}
          </p>
        </Card>
      )}

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field 1 — Artifact Type */}
          <div className="space-y-2">
            <Label htmlFor="artifact-type">Type of Work</Label>
            <Select value={type} onValueChange={(val) => setType(val)}>
              <SelectTrigger id="artifact-type">
                <SelectValue placeholder="Select type of work" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GITHUB_URL">GitHub URL</SelectItem>
                <SelectItem value="PDF_LINK">PDF Link</SelectItem>
                <SelectItem value="TEXT">Text Description</SelectItem>
                <SelectItem value="VIDEO_URL">Video URL</SelectItem>
                <SelectItem value="FIGMA_URL">Figma URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Field 2 — URL (conditional) */}
          {type && type !== 'TEXT' && (
            <div className="space-y-2">
              <Label htmlFor="artifact-url">URL</Label>
              <Input
                id="artifact-url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
          )}

          {/* Field 3 — Description */}
          <div className="space-y-2">
            <Label htmlFor="artifact-description">Describe Your Work</Label>
            <Textarea
              id="artifact-description"
              rows={4}
              placeholder="What did you build? What problem did it solve?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Field 4 — Skill Tagging */}
          <div className="pt-2">
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              Tag Your Skills
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Check all skills you used in this project
            </p>

            {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
              <div key={category} className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const isChecked = selectedSkills.has(skill);
                    return (
                      <div
                        key={skill}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleSkill(skill)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleSkill(skill);
                          }
                        }}
                        className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-colors select-none ${
                          isChecked
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <p className="text-sm text-gray-500 mt-4">
              {selectedSkills.size} skills selected
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!type || selectedSkills.size === 0 || loading}
          >
            {loading ? 'Uploading & Tagging...' : 'Upload & Tag Skills'}
          </Button>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm mt-3 text-center">
              {error}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
