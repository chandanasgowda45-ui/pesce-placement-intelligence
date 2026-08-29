import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_photo?: string;
  registration_number?: string;
  department?: string;
  year?: string;
  section?: string;
  college?: string;
  skills?: string[];
  bio?: string;
  resume_url?: string;
  created_at: string;
  updated_at?: string;
}

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const signingUpRef = useRef(false);
  const signingInRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        const mappedProfile: UserProfile = {
          id: data.id,
          auth_user_id: data.auth_user_id,
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          profile_photo: data.profile_photo || '',
          registration_number: data.registration_number || '',
          department: data.department || '',
          year: data.year || '',
          section: data.section || '',
          college: data.college || '',
          skills: data.skills || [],
          bio: data.bio || '',
          resume_url: data.resume_url || '',
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        if (mountedRef.current) {
          setProfile(mappedProfile);
        }
        return mappedProfile;
      }

      if (!data) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: retryData } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('auth_user_id', userId)
          .maybeSingle();

        if (retryData) {
          const mappedProfile: UserProfile = {
            id: retryData.id,
            auth_user_id: retryData.auth_user_id,
            full_name: retryData.full_name || '',
            email: retryData.email || '',
            phone: retryData.phone || '',
            profile_photo: retryData.profile_photo || '',
            registration_number: retryData.registration_number || '',
            department: retryData.department || '',
            year: retryData.year || '',
            section: retryData.section || '',
            college: retryData.college || '',
            skills: retryData.skills || [],
            bio: retryData.bio || '',
            resume_url: retryData.resume_url || '',
            created_at: retryData.created_at,
            updated_at: retryData.updated_at,
          };
          if (mountedRef.current) {
            setProfile(mappedProfile);
          }
          return mappedProfile;
        }
      }

      if (mountedRef.current) {
        setProfile(null);
      }
      return null;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      if (mountedRef.current) {
        setProfile(null);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || undefined });
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || undefined });

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION' || event === 'SIGNED_UP') {
          await fetchProfile(session.user.id);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (signingInRef.current) {
      console.warn('[Auth] signIn blocked: already in progress');
      return { error: new Error('Sign in already in progress') };
    }

    signingInRef.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Log safe error details (never log password/tokens)
        console.error('[Auth] signIn error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: (error as Record<string, unknown>).code,
        });
        signingInRef.current = false;

        const message = error.message || '';
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('invalid login credentials') || lowerMessage.includes('incorrect')) {
          return { error: new Error('Incorrect email or password.') };
        }

        if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('verify your email')) {
          return { error: new Error('Please verify your email before signing in.') };
        }

        if (lowerMessage.includes('too many requests') || error.status === 429) {
          return { error: new Error('Too many login attempts. Please wait before trying again.') };
        }

        if (lowerMessage.includes('configuration') || lowerMessage.includes('invalid api key')) {
          return { error: new Error('Authentication configuration error. Please contact support.') };
        }

        return { error: new Error(message || 'Sign in failed') };
      }

      signingInRef.current = false;
      return { error: null };
    } catch (err) {
      console.error('[Auth] signIn exception:', err instanceof Error ? err.message : err);
      signingInRef.current = false;
      return { error: err instanceof Error ? err : new Error('Sign in failed') };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (signingUpRef.current) {
      console.warn('[Auth] signUp blocked: already in progress');
      return { error: new Error('Sign up already in progress'), needsEmailConfirmation: false };
    }

    signingUpRef.current = true;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        // Log safe error details (never log password/tokens)
        console.error('[Auth] signUp error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: (error as Record<string, unknown>).code,
        });
        signingUpRef.current = false;

        const errorCode = (error as Record<string, unknown>).code;
        const isRateLimit =
          error.status === 429 ||
          errorCode === '429' ||
          error.message?.toLowerCase().includes('too many requests');
        const isEmailRateLimit =
          errorCode === 'over_email_send_rate_limit' ||
          (error.message?.toLowerCase().includes('email rate limit') && error.status === 429);

        if (isEmailRateLimit) {
          return {
            error: new Error(
              'Too many verification emails have been requested. Please wait before trying again.',
            ),
            needsEmailConfirmation: false,
          };
        }

        if (isRateLimit) {
          return {
            error: new Error(
              'Too many signup attempts. Please wait before trying again.',
            ),
            needsEmailConfirmation: false,
          };
        }

        return { error: new Error(error.message), needsEmailConfirmation: false };
      }

      if (data.user) {
        if (data.session) {
          // Try to create profile — non-fatal if it fails (table may not exist yet)
          try {
            const { error: profileError } = await supabase
              .from('student_profiles')
              .upsert(
                {
                  auth_user_id: data.user.id,
                  full_name: fullName,
                  email: email,
                },
                { onConflict: 'auth_user_id' }
              );

            if (profileError) {
              console.warn('[Auth] Profile creation failed (non-fatal):', profileError.message, profileError.code);
            }
          } catch (profileErr) {
            console.warn('[Auth] Profile creation exception (non-fatal):', profileErr);
          }

          setUser({ id: data.user.id, email: data.user.email || undefined });
          await fetchProfile(data.user.id);
          signingUpRef.current = false;
          return { error: null, needsEmailConfirmation: false };
        } else {
          setUser(null);
          setProfile(null);
          signingUpRef.current = false;
          return { error: null, needsEmailConfirmation: true };
        }
      }

      signingUpRef.current = false;
      return { error: new Error('Sign up failed'), needsEmailConfirmation: false };
    } catch (err) {
      console.error('[Auth] signUp exception:', err instanceof Error ? err.message : err);
      signingUpRef.current = false;
      return { error: err instanceof Error ? err : new Error('Sign up failed'), needsEmailConfirmation: false };
    }
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Password reset failed') };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Password update failed') };
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('student_profiles')
        .update(updates)
        .eq('auth_user_id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Profile update failed') };
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
