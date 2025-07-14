import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail, validateEmailDetailed } from "@/lib/validation";
import { useFormError } from "@/hooks/useFormError";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { error, setError, clearError, formatAndSetError } = useFormError();
  const [emailFeedback, setEmailFeedback] = useState<string[]>([]);

  const { resetPassword } = useAuth();

  /* ---------- handlers ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage("");

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setMessage("Password reset instructions have been sent to your email.");
    } catch (err) {
      formatAndSetError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const result = validateEmailDetailed(value);
    setEmailFeedback(result.errors);
  };

  /* ---------- render ---------- */
  return (
    <Layout>
      <div className="min-h-screen flex items-start justify-center px-2 pt-4 sm:pt-8 pb-4 sm:px-4">
        <div className="mt-16 sm:mt-24 w-full max-w-md rounded-xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-[var(--color-text-primary)]">
              Reset Password
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              Enter your email to receive reset instructions
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alerts */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-[var(--color-text-primary)]/10 border border-[var(--color-text-primary)]/20 text-[var(--color-text-primary)] px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email-input"
                className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]"
              >
                Email <span className="text-red-500 align-middle">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-secondary)]" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border border-black dark:border-slate-600 rounded-full text-[var(--color-text-primary)] placeholder-black/40 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-text-primary)] focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
              {email && emailFeedback.length > 0 && (
                <ul className="mt-1 text-xs text-red-400 space-y-0.5">
                  {emailFeedback.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-full text-lg font-semibold bg-white hover:bg-white/90 transition-colors text-black dark:text-black shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </span>
              ) : (
                "Send Reset Instructions"
              )}
            </button>
          </form>

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="group inline-flex items-center text-sm transition-colors text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)]/80"
            >
              <span
                className="transition-transform duration-200 mr-1 group-hover:-translate-x-1"
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                <ArrowLeft className="h-4 w-4" />
              </span>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
