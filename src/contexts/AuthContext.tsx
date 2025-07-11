import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  createAppError,
  AppError,
  AnyAppError,
  withErrorHandling,
} from "@/lib/errorHandling";

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message?: string }).message || String(error);
  }
  return String(error);
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthLoading: boolean;
  authError: AppError | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider manages authentication state and provides auth actions to the app.
// It separates initial session loading from per-operation loading for better UX.
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<AppError | null>(null);

  // Helper to add a timeout to any async auth operation, so users aren't left waiting forever.
  function withTimeout<T>(
    promise: Promise<T>,
    ms = 15000,
    op = "operation"
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`The ${op} timed out. Please try again.`)),
          ms
        )
      ),
    ]) as Promise<T>;
  }

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000;

    // Helper to fetch session with retry
    const fetchSession = async () => {
      setIsLoading(true);
      setAuthError(null);
      while (retryCount < maxRetries) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!isMounted) return;
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
          setAuthError(null);
          break;
        } catch (error) {
          retryCount++;
          console.error(
            `Auth session fetch error (attempt ${retryCount}):`,
            error
          );
          setAuthError(createAppError(extractErrorMessage(error)));
          if (retryCount < maxRetries) {
            await new Promise((res) => setTimeout(res, retryDelay));
          } else {
            setIsLoading(false);
          }
        }
      }
    };

    // Listen for auth state changes from Supabase and update local state accordingly.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        setAuthError(null);
      } catch (error) {
        console.error("Auth state change error:", error);
        setAuthError(createAppError(extractErrorMessage(error)));
      }
    });

    // On mount, check if there's an existing session so the app can restore user state.
    fetchSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = withErrorHandling(
    async (email: string, password: string): Promise<void> => {
      setIsAuthLoading(true);
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        15000,
        "login"
      );
      if (error) {
        if (error.message?.includes("Invalid login credentials")) {
          throw createAppError(
            "We couldn't sign you in. Please check your email and password, then try again.",
            "auth"
          );
        }
        if (error.message?.includes("Email not confirmed")) {
          throw createAppError(
            "Please confirm your email address by clicking the link we sent you. Then try signing in again.",
            "auth"
          );
        }
        throw createAppError(
          "We couldn't sign you in right now. Please try again in a few minutes. If the problem continues, contact support.",
          "auth"
        );
      }
      setAuthError(null);
      console.log("Login successful:", data.user?.email);
    },
    "login"
  );

  const signup = withErrorHandling(
    async (email: string, password: string): Promise<void> => {
      setIsAuthLoading(true);
      try {
        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: redirectUrl },
          }),
          15000,
          "signup"
        );
        if (error) {
          if (error.message?.includes("User already registered")) {
            throw createAppError(
              "An account with this email already exists. Please sign in instead, or reset your password if you've forgotten it.",
              "auth"
            );
          }
          throw createAppError(
            "We couldn't create your account right now. Please try again in a few minutes. If the problem continues, contact support.",
            "auth",
            undefined,
            "signup"
          );
        }
        setAuthError(null);
        console.log("Signup successful:", data.user?.email);
      } catch (error) {
        setAuthError(
          createAppError(
            extractErrorMessage(error),
            "auth",
            undefined,
            "signup"
          )
        );
        throw error;
      } finally {
        setIsAuthLoading(false);
      }
    },
    "signup"
  );

  const logout = withErrorHandling(async (): Promise<void> => {
    setIsAuthLoading(true);
    try {
      const { error } = await withTimeout(
        supabase.auth.signOut(),
        15000,
        "logout"
      );
      if (error) {
        throw createAppError(
          extractErrorMessage(error),
          "auth",
          undefined,
          "logout",
          error
        );
      }
      setAuthError(null);
      setUser(null);
      setSession(null);
    } catch (error) {
      setAuthError(
        createAppError(
          extractErrorMessage(error),
          "auth",
          undefined,
          "logout",
          error as AnyAppError
        )
      );
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  }, "logout");

  const resetPassword = withErrorHandling(
    async (email: string): Promise<void> => {
      setIsAuthLoading(true);
      try {
        const { error } = await withTimeout(
          supabase.auth.resetPasswordForEmail(email),
          15000,
          "resetPassword"
        );
        if (error) {
          throw createAppError(
            error.message || "Failed to send password reset email.",
            "auth"
          );
        }
        setAuthError(null);
      } catch (error) {
        setAuthError(
          createAppError(
            extractErrorMessage(error),
            "auth",
            undefined,
            "resetPassword",
            error as AnyAppError
          )
        );
        throw error;
      } finally {
        setIsAuthLoading(false);
      }
    },
    "resetPassword"
  );

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthLoading,
    authError,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
