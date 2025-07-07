import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import {
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validateEmailDetailed,
  getPasswordFeedback,
  passwordStrengthScore,
  passwordStrengthLabel,
} from "../lib/validation";
import { VALIDATION_MESSAGES } from "../lib/validation";
import { useFormError } from "@/hooks/useFormError";
import DOMPurify from "dompurify";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<string[]>([]);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
  const [passwordScore, setPasswordScore] = useState<number>(0);
  const [passwordLabel, setPasswordLabel] = useState<string>("Weak");

  const { signup } = useAuth();
  const navigate = useNavigate();
  const { error, setError, clearError, formatAndSetError } = useFormError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess("");

    // Sanitize inputs before validation and use
    const sanitizedEmail = DOMPurify.sanitize(email);
    const sanitizedPassword = DOMPurify.sanitize(password);
    const sanitizedConfirmPassword = DOMPurify.sanitize(confirmPassword);

    const emailError = validateEmail(sanitizedEmail);
    if (emailError) {
      setError(emailError);
      return;
    }

    const passwordErrors = validatePassword(sanitizedPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(" "));
      return;
    }

    if (!sanitizedConfirmPassword) {
      setError(VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED);
      return;
    }

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      setError(VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH);
      return;
    }

    setIsLoading(true);
    try {
      await signup(sanitizedEmail, sanitizedPassword);
      setSuccess(VALIDATION_MESSAGES.ACCOUNT_CREATED_SUCCESS);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      formatAndSetError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  // Real-time email validation
  const handleEmailChange = (value: string) => {
    const sanitized = DOMPurify.sanitize(value);
    setEmail(sanitized);
    const result = validateEmailDetailed(sanitized);
    setEmailFeedback(result.errors);
  };

  // Real-time password validation
  const handlePasswordChange = (value: string) => {
    const sanitized = DOMPurify.sanitize(value);
    setPassword(sanitized);
    setPasswordFeedback(getPasswordFeedback(sanitized));
    const score = passwordStrengthScore(sanitized);
    setPasswordScore(score);
    setPasswordLabel(passwordStrengthLabel(score));
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              Join the Guru Club
            </h2>
            <p className="text-slate-400">
              Create your Fantasy Football Guru account
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

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div
                      className={`text-xs flex items-center ${
                        passwordStrength.minLength
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          passwordStrength.minLength
                            ? "bg-emerald-400"
                            : "bg-slate-600"
                        }`}
                      />
                      At least 8 characters
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        passwordStrength.hasUpper
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          passwordStrength.hasUpper
                            ? "bg-emerald-400"
                            : "bg-slate-600"
                        }`}
                      />
                      One uppercase letter
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        passwordStrength.hasLower
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          passwordStrength.hasLower
                            ? "bg-emerald-400"
                            : "bg-slate-600"
                        }`}
                      />
                      One lowercase letter
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        passwordStrength.hasNumber
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          passwordStrength.hasNumber
                            ? "bg-emerald-400"
                            : "bg-slate-600"
                        }`}
                      />
                      One number
                    </div>
                  </div>
                )}

                {/* Password strength bar and label */}
                {password && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordScore >= 90
                            ? "bg-emerald-400 w-full"
                            : passwordScore >= 70
                              ? "bg-yellow-400 w-3/4"
                              : passwordScore >= 50
                                ? "bg-orange-400 w-1/2"
                                : "bg-red-400 w-1/4"
                        }`}
                        style={{ width: `${passwordScore}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        passwordScore >= 90
                          ? "text-emerald-400"
                          : passwordScore >= 70
                            ? "text-yellow-400"
                            : passwordScore >= 50
                              ? "text-orange-400"
                              : "text-red-400"
                      }`}
                    >
                      {passwordLabel}
                    </span>
                  </div>
                )}

                {/* Password feedback */}
                {password && passwordFeedback.length > 0 && (
                  <ul className="mt-1 text-xs text-red-400 space-y-0.5">
                    {passwordFeedback.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(DOMPurify.sanitize(e.target.value))
                    }
                    className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
