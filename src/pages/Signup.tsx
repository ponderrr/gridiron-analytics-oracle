import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses, SPACING_SCALE } from "@/lib/constants";
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
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);
  const navigate = useNavigate();
  const { error, setError, clearError, formatAndSetError } = useFormError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess("");

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

  const handleEmailChange = (value: string) => {
    const sanitized = DOMPurify.sanitize(value);
    setEmail(sanitized);
    const result = validateEmailDetailed(sanitized);
    setEmailFeedback(result.errors);
  };

  const handlePasswordChange = (value: string) => {
    const sanitized = DOMPurify.sanitize(value);
    setPassword(sanitized);
    setPasswordFeedback(getPasswordFeedback(sanitized));
    const score = passwordStrengthScore(sanitized);
    setPasswordScore(score);
    setPasswordLabel(passwordStrengthLabel(score));
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <Layout>
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ padding: `${SPACING_SCALE["2xl"]} ${SPACING_SCALE.md}` }}
      >
        <div className="max-w-md w-full flex flex-col gap-12">
          {/* Header */}
          <div className="text-center">
            <h2
              className={`text-3xl font-bold mb-2 ${themeClasses.TEXT_PRIMARY}`}
            >
              Join the Guru Club
            </h2>
            <p className={themeClasses.TEXT_TERTIARY}>
              Create your Fantasy Football Guru account
            </p>
          </div>

          {/* Form */}
          <div
            className="card-gradient rounded-xl"
            style={{ padding: SPACING_SCALE.xl }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm p-3">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm p-3">
                  {success}
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-2 ${themeClasses.TEXT_SECONDARY}`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.TEXT_TERTIARY}`}
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 ${themeClasses.BG_TERTIARY} border ${themeClasses.BORDER} rounded-lg ${themeClasses.TEXT_PRIMARY} placeholder-${themeClasses.TEXT_TERTIARY} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {email && emailFeedback.length > 0 && (
                  <ul className="text-xs text-red-400 mt-1 space-y-1">
                    {emailFeedback.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${themeClasses.TEXT_SECONDARY}`}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.TEXT_TERTIARY}`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 ${themeClasses.BG_TERTIARY} border ${themeClasses.BORDER} rounded-lg ${themeClasses.TEXT_PRIMARY} placeholder-${themeClasses.TEXT_TERTIARY} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.TEXT_TERTIARY} hover:${themeClasses.TEXT_SECONDARY} transition-colors`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                <ul className="mt-2 space-y-1 text-xs">
                  {[
                    {
                      label: "At least 8 characters",
                      valid: passwordStrength.minLength,
                    },
                    {
                      label: "One uppercase letter",
                      valid: passwordStrength.hasUpper,
                    },
                    {
                      label: "One lowercase letter",
                      valid: passwordStrength.hasLower,
                    },
                    { label: "One number", valid: passwordStrength.hasNumber },
                  ].map(({ label, valid }, i) => (
                    <li
                      key={i}
                      className={`flex items-center ${valid ? "text-emerald-400" : themeClasses.TEXT_TERTIARY}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${valid ? "bg-emerald-400" : themeClasses.BG_TERTIARY}`}
                      />
                      {label}
                    </li>
                  ))}
                </ul>

                {/* Password Strength Bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={themeClasses.TEXT_TERTIARY}>
                      Strength:
                    </span>
                    <span className="text-emerald-400">{passwordLabel}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        passwordScore <= 1
                          ? "bg-red-500"
                          : passwordScore <= 2
                            ? "bg-yellow-500"
                            : passwordScore <= 3
                              ? "bg-blue-500"
                              : "bg-emerald-500"
                      }`}
                      style={{ width: `${(passwordScore / 4) * 100}%` }}
                    />
                  </div>
                </div>

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
                <label
                  className={`block text-sm font-medium mb-2 ${themeClasses.TEXT_SECONDARY}`}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.TEXT_TERTIARY}`}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(DOMPurify.sanitize(e.target.value))
                    }
                    className={`w-full pl-10 pr-12 py-3 ${themeClasses.BG_TERTIARY} border ${themeClasses.BORDER} rounded-lg ${themeClasses.TEXT_PRIMARY} placeholder-${themeClasses.TEXT_TERTIARY} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.TEXT_TERTIARY} hover:${themeClasses.TEXT_SECONDARY} transition-colors`}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
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

            {/* Redirect to Login */}
            <div className="mt-6 text-center">
              <p className={themeClasses.TEXT_TERTIARY}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Sign in now
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
