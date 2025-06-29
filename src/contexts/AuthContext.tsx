import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthLoading: boolean;
  authError: AuthError | null;
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

interface AuthError {
  message: string;
  status?: number;
  [key: string]: any;
}

// AuthProvider manages authentication state and provides auth actions to the app.
// It separates initial session loading from per-operation loading for better UX.
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

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
          setAuthError({
            message:
              (error as Error).message || "Failed to initialize session.",
          });
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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        setAuthError(null);
      } catch (error) {
        console.error("Auth state change error:", error);
        setAuthError({
          message: (error as Error).message || "Auth state change failed.",
        });
      }
    });

    // On mount, check if there's an existing session so the app can restore user state.
    fetchSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsAuthLoading(true);
    try {
      // Attempt login with a timeout to avoid indefinite loading.
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        15000,
        "login"
      );
      if (error) {
        // Provide specific error messages for common auth issues.
        if (error.message?.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password.");
        }
        if (error.message?.includes("Email not confirmed")) {
          throw new Error(
            "Please check your email and confirm your account before signing in."
          );
        }
        throw new Error(
          error.message || "Failed to sign in. Please try again."
        );
      }
      console.log("Login successful:", data.user?.email);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "message" in error) {
        console.error("Login error:", (error as AuthError).message);
      } else {
        console.error("Login error:", error);
      }
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<void> => {
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
          throw new Error(
            "An account with this email already exists. Please sign in instead."
          );
        }
        throw new Error(
          error.message || "Failed to create account. Please try again."
        );
      }
      console.log("Signup successful:", data.user?.email);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "message" in error) {
        console.error("Signup error:", (error as AuthError).message);
      } else {
        console.error("Signup error:", error);
      }
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsAuthLoading(true);
    try {
      const { error } = await withTimeout(
        supabase.auth.signOut(),
        10000,
        "logout"
      );
      if (error) {
        throw new Error(
          error.message || "Failed to log out. Please try again."
        );
      }
      console.log("Logout successful");
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "message" in error) {
        console.error("Logout error:", (error as AuthError).message);
      } else {
        console.error("Logout error:", error);
      }
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setIsAuthLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl }),
        10000,
        "password reset"
      );
      if (error) {
        throw new Error(
          error.message || "Failed to send reset email. Please try again."
        );
      }
      console.log("Password reset email sent to:", email);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "message" in error) {
        console.error("Password reset error:", (error as AuthError).message);
      } else {
        console.error("Password reset error:", error);
      }
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

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
