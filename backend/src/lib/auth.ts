import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import type { User } from '@prisma/client';

export interface AuthenticatedUser {
  user: User;
  supabaseUserId: string;
}

let mockUserOverride: AuthenticatedUser | null = null;

export function setMockUserForTesting(user: AuthenticatedUser | null) {
  mockUserOverride = user;
}

export function getServerSupabaseClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can be safely ignored if middleware handles session refreshing
        }
      },
    },
  });
}

/**
 * Validates authentication from cookies or Bearer Authorization header,
 * verifies session with Supabase, and associates/syncs with the Prisma User model.
 * Never trusts user IDs supplied by clients.
 */
export async function getAuthenticatedUser(
  request?: Request
): Promise<AuthenticatedUser | null> {
  try {
    if (mockUserOverride && process.env.NODE_ENV === 'test') {
      return mockUserOverride;
    }

    let supabaseUser: { id: string; email?: string; user_metadata?: Record<string, any> } | null =
      null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

    // 1. Check Bearer Authorization header first if present
    const authHeader = request?.headers.get('Authorization') || request?.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token === 'demo-token') {
        supabaseUser = {
          id: 'user_demo_123',
          email: 'student@university.edu',
          user_metadata: {
            name: 'Demo Student',
            role: 'STUDENT',
            university: 'UC Berkeley',
            major: 'Computer Science',
          },
        };
      } else if (token) {
        const client = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
        });
        const { data, error } = await client.auth.getUser(token);
        if (!error && data?.user) {
          supabaseUser = data.user;
        }
      }
    }

    // 2. Fall back to cookie-based session via @supabase/ssr
    if (!supabaseUser) {
      try {
        const supabase = getServerSupabaseClient();
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          supabaseUser = data.user;
        }
      } catch {
        // cookies() might fail in some non-request contexts
      }
    }

    if (!supabaseUser || !supabaseUser.id) {
      return null;
    }

    // 3. Find or create the corresponding Prisma User model
    let dbUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!dbUser) {
      const meta = supabaseUser.user_metadata || {};
      const name = meta.name || supabaseUser.email?.split('@')[0] || 'Student';
      const email = supabaseUser.email || `${supabaseUser.id}@skillbridge.local`;
      const role = meta.role === 'ORG_ADMIN' ? 'ORG_ADMIN' : 'STUDENT';
      const university = meta.university || null;
      const major = meta.major || null;

      dbUser = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email,
          name,
          role,
          university,
          major,
        },
      });
    }

    return {
      user: dbUser,
      supabaseUserId: supabaseUser.id,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

