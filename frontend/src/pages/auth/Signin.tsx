import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { useSignIn } from "@clerk/clerk-react";

const Signin = () => {
  const { signIn, isLoaded } = useSignIn();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "code" | "success">(
    "email",
  );
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleGoogleSignin = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.errors?.[0]?.message || "Failed to sign in with Google");
    }
  };

  const handleSSOSignin = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: "saml",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      console.error("SSO sign in error:", err);
      setError(err.errors?.[0]?.message || "Failed to sign in with SSO");
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await signIn.setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.errors?.[0]?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setResetLoading(true);
    setResetError("");

    try {
      if (resetStep === "email") {
        await signIn.create({
          strategy: "reset_password_email_code",
          identifier: resetEmail,
        });
        setResetStep("code");
      } else if (resetStep === "code") {
        const result = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: resetCode,
          password: newPassword,
        });

        if (result.status === "complete") {
          setResetStep("success");
          setTimeout(() => {
            setShowForgotPassword(false);
            setResetStep("email");
            setResetEmail("");
            setResetCode("");
            setNewPassword("");
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      setResetError(err.errors?.[0]?.message || "Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  const socialButtons = [
    {
      icon: () => (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
      text: "Continue with Google",
      onClick: handleGoogleSignin,
    },
    {
      icon: Building2,
      text: "Continue with SSO",
      onClick: handleSSOSignin,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-text-secondary">Sign in to your account</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#111113] border border-gray-800 rounded-2xl p-8 shadow-xl"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-3 mb-6">
            {socialButtons.map((button, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={button.onClick}
                disabled={!isLoaded}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1a1a1c] border border-gray-700 rounded-lg text-white font-medium hover:bg-[#222224] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <button.icon size={20} />
                {button.text}
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="relative flex items-center justify-center my-6"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative bg-[#111113] px-4 text-sm text-text-secondary">
              or
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            onSubmit={handleSignin}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a1c] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-[#1a1a1c] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#10B981] hover:text-[#0f9a72] transition"
              >
                Forgot password?
              </button>
            </div>

            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full py-3 bg-[#10B981] text-white rounded-lg font-semibold hover:bg-[#0f9a72] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </motion.button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="mt-6 text-center text-sm text-text-secondary"
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#10B981] hover:text-[#0f9a72] font-medium transition"
            >
              Sign up
            </Link>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="mt-6 text-center text-xs text-text-secondary"
          >
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-[#10B981] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-[#10B981] hover:underline">
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowForgotPassword(false);
              setResetStep("email");
              setResetError("");
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111113] border border-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {resetStep === "email" && "Reset Password"}
                  {resetStep === "code" && "Enter Reset Code"}
                  {resetStep === "success" && "Password Reset!"}
                </h2>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetStep("email");
                    setResetError("");
                  }}
                  className="text-gray-500 hover:text-gray-300 transition"
                >
                  <X size={24} />
                </button>
              </div>

              {resetError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {resetError}
                </div>
              )}

              {resetStep === "email" && (
                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-4"
                >
                  <p className="text-text-secondary text-sm mb-4">
                    Enter your email address and we'll send you a code to reset
                    your password.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={18}
                      />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 bg-[#1a1a1c] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 bg-[#10B981] text-white rounded-lg font-semibold hover:bg-[#0f9a72] transition disabled:opacity-50"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Code"}
                  </button>
                </form>
              )}

              {resetStep === "code" && (
                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-4"
                >
                  <p className="text-text-secondary text-sm mb-4">
                    We've sent a code to {resetEmail}. Enter it below along with
                    your new password.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Reset Code
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-3 bg-[#1a1a1c] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={18}
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-4 py-3 bg-[#1a1a1c] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 bg-[#10B981] text-white rounded-lg font-semibold hover:bg-[#0f9a72] transition disabled:opacity-50"
                  >
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}

              {resetStep === "success" && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-[#10B981]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-white font-medium">
                    Password reset successful!
                  </p>
                  <p className="text-text-secondary text-sm mt-2">
                    You can now sign in with your new password.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Signin;
