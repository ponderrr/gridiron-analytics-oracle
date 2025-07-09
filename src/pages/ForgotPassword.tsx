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

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
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
          <div className="card-gradient rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm">
                  {message}
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${themeClasses.TEXT_SECONDARY}`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.TEXT_TERTIARY}`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 ${themeClasses.BG_TERTIARY} border ${themeClasses.BORDER} rounded-lg ${themeClasses.TEXT_PRIMARY} placeholder-${themeClasses.TEXT_TERTIARY} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
              </button>
            </form>

            {/* back to Sign In */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
