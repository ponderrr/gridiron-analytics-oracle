import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/constants";
import { validateEmail, validateEmailDetailed } from "@/lib/validation";
import { useFormError } from "@/hooks/useFormError";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { error, setError, clearError, formatAndSetError } = useFormError();
  const [emailFeedback, setEmailFeedback] = useState<string[]>([]);

  const { resetPassword } = useAuth();
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

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
      <div className="min-h-screen flex items-center justify-center px-2 pt-8 sm:pt-16 pb-4 sm:px-4">
        <div
          className={`w-full max-w-md rounded-xl shadow-xl ${themeClasses.BG_CARD} p-6 sm:p-8`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2
              className={`text-3xl font-bold mb-2 ${themeClasses.TEXT_PRIMARY}`}
            >
              Reset Password
            </h2>
            <p className={themeClasses.TEXT_TERTIARY}>
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
              <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email-input"
                className={`block text-sm font-medium mb-2 ${themeClasses.TEXT_PRIMARY}`}
              >
                Email <span className="text-red-500 align-middle">*</span>
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${themeClasses.TEXT_TERTIARY}`}
                />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-transparent border border-black dark:border-slate-600 rounded-lg ${themeClasses.TEXT_PRIMARY} placeholder-black/40 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all`}
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
              className="w-full mt-2 py-3 rounded-lg text-lg font-semibold bg-indigo-500 hover:bg-indigo-400 transition-colors text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
              className={`inline-flex items-center text-sm transition-colors ${themeClasses.TEXT_PRIMARY} hover:${themeClasses.TEXT_PRIMARY}`}
            >
              <span
                className={`transition-transform duration-200 mr-1 ${themeClasses.TEXT_PRIMARY} group-hover:-translate-x-1`}
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
