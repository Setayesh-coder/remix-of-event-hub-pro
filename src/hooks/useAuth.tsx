import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  requestOTP: (phone: string) => Promise<{ error: string | null; expiresIn?: number; devOtp?: string }>;
  verifyOTP: (phone: string, code: string) => Promise<{ error: string | null; isNewUser?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const requestOTP = async (phone: string): Promise<{ error: string | null; expiresIn?: number; devOtp?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('request-otp', {
        body: { phone }
      });

      if (error) {
        console.error('Request OTP error:', error);
        return { error: error.message };
      }

      if (data?.error) {
        return { error: data.error };
      }

      // Return devOtp if in development mode for testing
      if (data?.devOtp) {
        console.log('📱 [DEV MODE] OTP received:', data.devOtp);
      }

      return { error: null, expiresIn: data?.expiresIn || 300, devOtp: data?.devOtp };
    } catch (err) {
      console.error('Request OTP error:', err);
      return { error: 'خطا در ارسال کد تأیید' };
    }
  };

  const verifyOTP = async (phone: string, code: string): Promise<{ error: string | null; isNewUser?: boolean }> => {
    try {
      // Step 1: Verify OTP
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-otp', {
        body: { phone, code }
      });

      if (verifyError) {
        return { error: verifyError.message };
      }

      if (verifyData.error) {
        return { error: verifyData.error };
      }

      // Step 2: Exchange session token for actual session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('exchange-session', {
        body: { 
          sessionToken: verifyData.sessionToken, 
          userId: verifyData.userId 
        }
      });

      if (sessionError) {
        return { error: sessionError.message };
      }

      if (sessionData.error) {
        return { error: sessionData.error };
      }

      // Step 3: Set the session in Supabase client
      if (sessionData.session) {
        await supabase.auth.setSession({
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
        });
      }

      return { error: null, isNewUser: verifyData.isNewUser };
    } catch (err) {
      return { error: 'خطا در تأیید کد' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, requestOTP, verifyOTP, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
