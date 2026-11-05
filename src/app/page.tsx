'use client';

import Link from 'next/link';
import { Upload, Search, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-full flex flex-col justify-between px-4 sm:px-6">
      {/* Section 1 — Hero */}
      <section className="py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
          <span>🚀 Talent-Opportunity Gap Platform</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Your Skills Deserve Real Opportunities
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4 leading-relaxed">
          Stop applying with resumes. Start matching with proof. Upload your work,
          discover real problems, and connect with organizations that need your
          exact skills.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="flex items-center gap-2 shadow-md">
              Open Dashboard
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In / Register
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 2 — Three Feature Cards */}
      <section className="max-w-5xl mx-auto mt-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center md:items-start md:text-left space-y-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Upload Your Work</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Add your GitHub repos, projects, and documents. Tag the skills you used.
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center md:items-start md:text-left space-y-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Discover Problems</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Find real problems from organizations that need your exact skill set.
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center md:items-start md:text-left space-y-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Connect & Apply</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Get your match score, close skill gaps, and send personalized outreach.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Section 3 — Footer */}
      <footer className="text-center text-gray-400 text-sm py-10 mt-16">
        Built for the Talent-Opportunity Gap Hackathon
      </footer>
    </div>
  );
}
