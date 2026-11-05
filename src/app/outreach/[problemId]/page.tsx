'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Copy, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { apiFetch } from '@/lib/api';

type Draft = {
  id: string;
  subjectLine: string;
  body: string;
};

export default function OutreachPage() {
  const params = useParams();
  const problemId = params.problemId as string;

  const [tone, setTone] = useState<string>('formal');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async () => {
    setLoading(true);
    setDraft(null);
    setError(null);

    try {
      const result = await apiFetch<Draft>('/api/outreach/generate', {
        method: 'POST',
        body: JSON.stringify({ problemId, tone }),
      });
      setDraft(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`${draft.subjectLine}\n\n${draft.body}`);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        href={`/problems/${problemId}`}
        className="text-sm text-blue-600 hover:underline inline-block mb-4"
      >
        ← Back to Problem
      </Link>

      {/* Heading & Subtext */}
      <h1 className="text-2xl font-bold text-gray-900">Draft Your Outreach</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Generate a personalized email to send to the organization
      </p>

      {/* Tone Selector */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose a Tone
        </label>
        <Select value={tone} onValueChange={(val) => setTone(val)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Generate Button */}
      <Button
        size="lg"
        className="w-full mt-4 flex items-center justify-center gap-2"
        disabled={loading}
        onClick={handleGenerate}
      >
        <Sparkles size={18} />
        {loading ? 'Generating...' : 'Generate Email'}
      </Button>

      {/* Error Message */}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {/* Draft Display */}
      {draft && (
        <Card className="p-6 mt-6 border-2 border-blue-100 bg-blue-50/30">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Draft</h2>

          <p className="font-medium text-gray-800">
            Subject: {draft.subjectLine}
          </p>

          <Separator className="my-3" />

          <div className="bg-white p-4 rounded-md border border-gray-200 font-mono text-sm text-gray-700 whitespace-pre-wrap">
            {draft.body}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 flex items-center gap-1.5"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy to Clipboard
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  );
}

