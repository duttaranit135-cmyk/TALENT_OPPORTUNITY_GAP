'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data?.user ?? null);
      } catch (err) {
        setUser(null);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Sign out error handling
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between px-6 max-w-6xl mx-auto h-full">
        {/* Left side */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="font-bold text-xl text-blue-600">
            SkillBridge
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              Upload Skills
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              Profile
            </Link>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="md:hidden text-gray-700 hover:text-blue-600 text-sm font-medium"
          >
            Dashboard
          </Link>
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline-block text-xs text-gray-500 font-medium truncate max-w-[150px]">
                {user?.user_metadata?.name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button size="sm" variant="outline">
                  Login
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm">
                  View Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
