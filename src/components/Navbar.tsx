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
        <Link href="/" className="font-bold text-xl text-blue-600">
          SkillBridge
        </Link>

        {/* Right side */}
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Upload
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Profile
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

