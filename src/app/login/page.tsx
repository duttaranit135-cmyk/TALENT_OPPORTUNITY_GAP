'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LoginPage() {
  const router = useRouter();

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign up states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setLoginError(error.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Failed to log in. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpSuccess(false);
    setSignUpLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            university: role === 'Student' ? university : undefined,
            major: role === 'Student' ? major : undefined,
          },
        },
      });

      if (error) {
        setSignUpError(error.message);
      } else {
        setSignUpSuccess(true);
      }
    } catch (err: any) {
      setSignUpError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
        Welcome to SkillBridge
      </h1>

      <Card className="p-8 shadow-lg">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* LOGIN TAB */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@university.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginLoading}
              >
                {loginLoading ? 'Logging in...' : 'Log In'}
              </Button>

              {loginError && (
                <p className="text-red-500 text-sm mt-3 text-center">
                  {loginError}
                </p>
              )}
            </form>
          </TabsContent>

          {/* SIGN UP TAB */}
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(val) => setRole(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Organization Admin">
                      Organization Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'Student' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="signup-university">University</Label>
                    <Input
                      id="signup-university"
                      type="text"
                      placeholder="e.g. UC Berkeley"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-major">Major</Label>
                    <Input
                      id="signup-major"
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={signUpLoading}
              >
                {signUpLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              {signUpSuccess && (
                <p className="text-green-600 text-sm mt-3 text-center">
                  Account created! Check your email to confirm.
                </p>
              )}

              {signUpError && (
                <p className="text-red-500 text-sm mt-3 text-center">
                  {signUpError}
                </p>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

