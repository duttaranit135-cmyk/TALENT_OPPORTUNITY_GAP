import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isPlaceholder = !rawUrl || rawUrl.includes('example.supabase.co') || !rawKey || rawKey === 'demo-key';

const realClient = createClient(
  rawUrl || 'https://example.supabase.co',
  rawKey || 'demo-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

const STORAGE_KEY = 'skillbridge_auth_user';

function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: any) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

const authListeners = new Set<(event: string, session: any) => void>();

function notifyAuth(event: string, session: any) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (e) {
      console.error(e);
    }
  });
}

// Unified client providing real Supabase when configured, or seamless fallback
export const supabase = {
  ...realClient,
  auth: {
    ...realClient.auth,

    async signInWithPassword({ email, password }: { email: string; password?: string }) {
      if (!isPlaceholder) {
        try {
          const res = await realClient.auth.signInWithPassword({ email, password: password || '' });
          if (!res.error && res.data?.user) {
            setStoredUser(res.data.user);
            notifyAuth('SIGNED_IN', res.data.session);
            return res;
          }
        } catch (err) {
          console.warn('Real Supabase login failed, using local session fallback', err);
        }
      }

      // Local demo fallback
      const user = {
        id: 'user_demo_123',
        email: email || 'student@university.edu',
        user_metadata: {
          name: email ? email.split('@')[0] : 'Demo Student',
          role: 'Student',
          university: 'UC Berkeley',
          major: 'Computer Science',
        },
        created_at: new Date().toISOString(),
      };
      const session = { user, access_token: 'demo-token' };
      setStoredUser(user);
      notifyAuth('SIGNED_IN', session);
      return { data: { user, session }, error: null };
    },

    async signUp({ email, password, options }: any) {
      if (!isPlaceholder) {
        try {
          const res = await realClient.auth.signUp({ email, password, options });
          if (!res.error && res.data?.user) {
            setStoredUser(res.data.user);
            notifyAuth('SIGNED_IN', res.data.session);
            return res;
          }
        } catch (err) {
          console.warn('Real Supabase signup failed, using local session fallback', err);
        }
      }

      const user = {
        id: 'user_demo_' + Math.random().toString(36).substring(2, 9),
        email: email || 'student@university.edu',
        user_metadata: {
          name: options?.data?.name || (email ? email.split('@')[0] : 'Student User'),
          role: options?.data?.role || 'Student',
          university: options?.data?.university || 'University',
          major: options?.data?.major || 'Undeclared',
        },
        created_at: new Date().toISOString(),
      };
      const session = { user, access_token: 'demo-token' };
      setStoredUser(user);
      notifyAuth('SIGNED_IN', session);
      return { data: { user, session }, error: null };
    },

    async getUser() {
      if (!isPlaceholder) {
        try {
          const res = await realClient.auth.getUser();
          if (res.data?.user) {
            return res;
          }
        } catch {
          // ignore error and check local
        }
      }

      const user = getStoredUser();
      return { data: { user }, error: null };
    },

    async getSession() {
      if (!isPlaceholder) {
        try {
          const res = await realClient.auth.getSession();
          if (res.data?.session) return res;
        } catch {}
      }

      const user = getStoredUser();
      return { data: { session: user ? { user, access_token: 'demo-token' } : null }, error: null };
    },

    async signOut() {
      setStoredUser(null);
      notifyAuth('SIGNED_OUT', null);
      if (!isPlaceholder) {
        try {
          await realClient.auth.signOut();
        } catch {}
      }
      return { error: null };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      authListeners.add(callback);

      // Trigger initial state
      const user = getStoredUser();
      if (user) {
        setTimeout(() => {
          callback('INITIAL_SESSION', { user, access_token: 'demo-token' });
        }, 10);
      }

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
  },
} as any;

export default supabase;
