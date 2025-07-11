import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validateEmailDetailed,
  getPasswordFeedback,
  passwordStrengthScore,
  passwordStrengthLabel,
} from "@/lib/validation";
import { VALIDATION_MESSAGES } from "@/lib/validation";
import { useFormError } from "@/hooks/useFormError";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";

const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { effectiveTheme } = useTheme();
  const { error, setError, clearError, formatAndSetError } = useFormError();

  // Tab state: true = Sign In, false = Sign Up
  const [isLogin, setIsLogin] = useState(location.pathname !== "/signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<string[]>([]);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
  const [passwordScore, setPasswordScore] = useState<number>(0);
  const [passwordLabel, setPasswordLabel] = useState<string>("Weak");
  const [success, setSuccess] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  // Handle route changes and reset form when switching between login/signup
  useEffect(() => {
    const shouldBeLogin = location.pathname !== "/signup";
    setIsLogin(shouldBeLogin);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEmailFeedback([]);
    setPasswordFeedback([]);
    setPasswordScore(0);
    setPasswordLabel("Weak");
    clearError();
    setSuccess("");
  }, [location.pathname, clearError]);

  const handleEmailChange = (value: string) => {
    const sanitized = DOMPurify.sanitize(value);
    setEmail(sanitized);
    const result = validateEmailDetailed(sanitized);
    setEmailFeedback(result.errors);
  };

  const handlePasswordChange = (value: string) => {
    const sanitized = DOMPurify.sanitize(value);
    setPassword(sanitized);
    if (!isLogin) {
      setPasswordFeedback(getPasswordFeedback(sanitized));
      const score = passwordStrengthScore(sanitized);
      setPasswordScore(score);
      setPasswordLabel(passwordStrengthLabel(score));
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess("");
    const sanitizedEmail = DOMPurify.sanitize(email);
    const sanitizedPassword = DOMPurify.sanitize(password);
    const emailError = validateEmail(sanitizedEmail);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (isLogin) {
      if (!sanitizedPassword) {
        setError(VALIDATION_MESSAGES.PASSWORD_REQUIRED);
        return;
      }
      setIsLoading(true);
      try {
        await login(sanitizedEmail, sanitizedPassword);
        navigate(from, { replace: true });
      } catch (err) {
        formatAndSetError(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      const passwordErrors = validatePassword(sanitizedPassword);
      if (passwordErrors.length > 0) {
        setError(passwordErrors.join(" "));
        return;
      }
      const sanitizedConfirmPassword = DOMPurify.sanitize(confirmPassword);
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
          setIsLogin(true);
          navigate("/login");
        }, 2000);
      } catch (err) {
        formatAndSetError(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Tab click handler
  const handleTab = (loginTab: boolean) => {
    if (loginTab) {
      navigate("/login");
    } else {
      navigate("/signup");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-2 pt-8 sm:pt-16 pb-4 sm:px-4">
        <div className={`w-full max-w-md rounded-xl shadow-xl p-6 sm:p-8`}>
          {/* Tabs */}
          <div className="relative flex mb-8 border-b border-slate-200 dark:border-slate-200/10">
            <button
              className={`text-2xl font-semibold pb-2 px-2 transition-colors border-b-2 flex-1 ${isLogin ? `text-indigo-500 dark:text-indigo-400` : "text-black/50 dark:text-slate-400"} border-transparent focus:outline-none`}
              onClick={() => handleTab(true)}
              type="button"
              style={{ zIndex: 1 }}
            >
              Sign In
            </button>
            <button
              className={`text-2xl font-semibold pb-2 px-2 ml-6 transition-colors border-b-2 flex-1 ${!isLogin ? `text-indigo-500 dark:text-indigo-400` : "text-black/50 dark:text-slate-400"} border-transparent focus:outline-none`}
              onClick={() => handleTab(false)}
              type="button"
              style={{ zIndex: 1 }}
            >
              Sign Up
            </button>
            {/* Animated Indicator */}
            <span
              className="absolute bottom-0 h-1 rounded bg-indigo-400 transition-all duration-300"
              style={{
                left: isLogin ? 0 : "50%",
                width: "50%",
                transform: isLogin ? "translateX(0%)" : "translateX(0%)",
              }}
            />
          </div>

          {/* Form */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div layout>
              <motion.form
                key={isLogin ? "sign-in" : "sign-up"}
                initial={{ opacity: 0, x: isLogin ? -40 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 40 : -40 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="space-y-6"
                onSubmit={handleSubmit}
              >
                {/* Email */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 text-indigo-500 dark:text-indigo-400`}
                  >
                    Email <span className="text-red-500 align-middle">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`w-full bg-transparent border border-black dark:border-slate-600 rounded-lg px-4 py-3 text-indigo-500 dark:text-indigo-400 placeholder-black/40 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all`}
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
                  <label
                    className={`block text-sm font-medium mb-2 text-indigo-500 dark:text-indigo-400`}
                  >
                    Password{" "}
                    <span className="text-red-500 align-middle">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className={`w-full bg-transparent border border-black dark:border-slate-600 rounded-lg px-4 py-3 text-indigo-500 dark:text-indigo-400 placeholder-black/40 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-slate-400 hover:text-black dark:hover:text-white focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {/* Password requirements for Sign Up */}
                  {!isLogin && password && (
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
                        {
                          label: "One number",
                          valid: passwordStrength.hasNumber,
                        },
                      ].map(({ label, valid }, i) => (
                        <li
                          key={i}
                          className={`flex items-center ${valid ? "text-indigo-400" : "text-black/50 dark:text-slate-400"}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${valid ? "bg-indigo-400" : "bg-black/20 dark:bg-slate-700"}`}
                          />
                          {label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Confirm Password (Sign Up only) */}
                {!isLogin && (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 text-indigo-500 dark:text-indigo-400`}
                    >
                      Confirm Password{" "}
                      <span className="text-red-500 align-middle">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(DOMPurify.sanitize(e.target.value))
                        }
                        className={`w-full bg-transparent border border-black dark:border-slate-600 rounded-lg px-4 py-3 text-indigo-500 dark:text-indigo-400 placeholder-black/40 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all`}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-slate-400 hover:text-black dark:hover:text-white focus:outline-none"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error/Success Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-lg text-lg font-semibold bg-indigo-500 hover:bg-indigo-400 transition-colors text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </motion.form>
            </motion.div>
          </AnimatePresence>

          {/* Links */}
          <div className="mt-6 text-center">
            {isLogin && (
              <Link
                to="/forgot-password"
                className={`text-sm transition-colors text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300`}
              >
                Forgot password?
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;