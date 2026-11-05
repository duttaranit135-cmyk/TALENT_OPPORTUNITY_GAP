'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

const DEMO_PROBLEMS = [
  {
    organizationId: "demo-org-1",
    title: "Build a Dashboard for Campus Food Bank",
    description: "Our campus food bank needs a real-time dashboard to track inventory, predict demand, and reduce food waste by 20%. We have the data but no one to visualize it.",
    requiredSkills: ["React", "Data Visualization", "SQL"],
    deadline: "2025-08-01T00:00:00Z",
    commitmentType: "PART_TIME",
    domainTags: ["social-impact", "data"],
    status: "OPEN"
  },
  {
    organizationId: "demo-org-2",
    title: "Design a Mobile App for Student Mental Health",
    description: "We need a UX researcher and UI designer to create a mobile app that helps college students track their mental health and connect with campus counselors.",
    requiredSkills: ["UI Design", "UX Research", "Figma", "Prototyping"],
    deadline: "2025-09-15T00:00:00Z",
    commitmentType: "INTERNSHIP",
    domainTags: ["health", "design"],
    status: "OPEN"
  },
  {
    organizationId: "demo-org-3",
    title: "Automate Grant Reporting for Local NGO",
    description: "Our NGO spends 15 hours per week manually compiling grant reports. We need a Python script that pulls data from our database and generates formatted PDF reports automatically.",
    requiredSkills: ["Python", "SQL", "Technical Writing"],
    deadline: "2025-07-20T00:00:00Z",
    commitmentType: "ONE_TIME",
    domainTags: ["automation", "nonprofit"],
    status: "OPEN"
  }
];

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSeed = async () => {
    setLoading(true);
    setResult('');
    setError('');

    try {
      let count = 0;
      for (const problem of DEMO_PROBLEMS) {
        await apiFetch('/api/problems', {
          method: 'POST',
          body: JSON.stringify(problem),
        });
        count++;
      }
      setResult(`✅ Loaded ${count} problems`);
    } catch (err: any) {
      setError(err?.message || 'Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card className="p-6 text-center space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Demo Data Seeder</h1>
        <p className="text-sm text-yellow-600">
          This is for demo purposes only. Click once.
        </p>

        <Button
          onClick={handleSeed}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Loading...' : 'Load 3 Demo Problems'}
        </Button>

        {result && (
          <p className="text-sm font-medium text-green-600">
            {result}
          </p>
        )}

        {error && (
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}

