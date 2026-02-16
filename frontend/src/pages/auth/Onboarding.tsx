import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Target,
  Link2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  FaYoutube,
  FaInstagram,
  FaXTwitter,
  FaFacebook,
  FaTiktok,
  FaLinkedin,
  FaReddit,
} from "react-icons/fa6";
import { useApiClient } from "../../lib/api";
import type { OnboardingRequest, CreatorType, CreatorProfile, Platform, PlatformUrls } from "../../types/onboarding";

interface OnboardingData {
  user_name: string;
  creator_type: CreatorType | "";
  niche: string;
  target_audience_niche: string;
  existing_platforms: Platform[];
  platform_urls: PlatformUrls;
}

const CREATOR_TYPES: { value: CreatorType; label: string }[] = [
  { value: "content_creator", label: "Content Creator" },
  { value: "student", label: "Student" },
  { value: "marketing", label: "Marketing Professional" },
  { value: "business", label: "Business Owner" },
  { value: "freelancer", label: "Freelancer" },
];

const PLATFORMS: { name: Platform; icon: any; color: string; urlPlaceholder: string; urlPattern: RegExp }[] = [
  { 
    name: "YouTube", 
    icon: FaYoutube, 
    color: "#FF0000",
    urlPlaceholder: "https://youtube.com/@yourchannel or youtube.com/channel/...",
    urlPattern: /^https?:\/\/(www\.)?(youtube\.com\/(channel\/|@|c\/)|youtu\.be\/)/
  },
  { 
    name: "Twitter", 
    icon: FaXTwitter, 
    color: "#1DA1F2",
    urlPlaceholder: "https://twitter.com/yourhandle or x.com/yourhandle",
    urlPattern: /^https?:\/\/(www\.)?(twitter\.com\/|x\.com\/)/
  },
  { 
    name: "Instagram", 
    icon: FaInstagram, 
    color: "#E4405F",
    urlPlaceholder: "https://instagram.com/yourhandle",
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\//
  },
  { 
    name: "LinkedIn", 
    icon: FaLinkedin, 
    color: "#0A66C2",
    urlPlaceholder: "https://linkedin.com/in/yourprofile",
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/(in\/|company\/)/
  },
  { 
    name: "TikTok", 
    icon: FaTiktok, 
    color: "#000000",
    urlPlaceholder: "https://tiktok.com/@yourhandle",
    urlPattern: /^https?:\/\/(www\.)?tiktok\.com\/@/
  },
  { 
    name: "Facebook", 
    icon: FaFacebook, 
    color: "#1877F2",
    urlPlaceholder: "https://facebook.com/yourpage",
    urlPattern: /^https?:\/\/(www\.)?facebook\.com\//
  },
  { 
    name: "Reddit", 
    icon: FaReddit, 
    color: "#FF4500",
    urlPlaceholder: "https://reddit.com/user/yourname",
    urlPattern: /^https?:\/\/(www\.)?reddit\.com\/(user\/|u\/|r\/)/
  },
];

export default function Onboarding() {
  const api = useApiClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingData>({
    user_name: "",
    creator_type: "",
    niche: "",
    target_audience_niche: "",
    existing_platforms: [],
    platform_urls: {},
  });

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user makes changes
  };

  const togglePlatform = (platform: Platform) => {
    setFormData((prev) => {
      const isSelected = prev.existing_platforms.includes(platform);
      if (isSelected) {
        // Remove platform and its URL
        const newPlatforms = prev.existing_platforms.filter(p => p !== platform);
        const newUrls = { ...prev.platform_urls };
        delete newUrls[platform];
        return {
          ...prev,
          existing_platforms: newPlatforms,
          platform_urls: newUrls,
        };
      } else {
        // Add platform
        return {
          ...prev,
          existing_platforms: [...prev.existing_platforms, platform],
        };
      }
    });
    setError(null);
  };

  const handlePlatformUrlChange = (platform: Platform, url: string) => {
    setFormData((prev) => ({
      ...prev,
      platform_urls: {
        ...prev.platform_urls,
        [platform]: url,
      },
    }));
    setError(null);
  };

  const validatePlatformUrls = (): boolean => {
    for (const platform of formData.existing_platforms) {
      const url = formData.platform_urls[platform];
      if (!url || !url.trim()) {
        setError(`Please enter your ${platform} profile URL`);
        return false;
      }
      
      // Validate URL format
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setError(`${platform} URL must start with http:// or https://`);
        return false;
      }
      
      // Validate platform-specific format
      const platformConfig = PLATFORMS.find(p => p.name === platform);
      if (platformConfig && !platformConfig.urlPattern.test(url)) {
        setError(`Invalid ${platform} URL format. Please check the example.`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate all fields are filled
      if (!formData.user_name.trim()) {
        throw new Error("Please enter your name");
      }
      if (!formData.creator_type) {
        throw new Error("Please select a creator type");
      }
      if (formData.existing_platforms.length === 0) {
        throw new Error("Please select at least one platform");
      }
      if (!validatePlatformUrls()) {
        return; // Error already set by validatePlatformUrls
      }
      if (!formData.niche.trim()) {
        throw new Error("Please enter your niche");
      }
      if (!formData.target_audience_niche.trim()) {
        throw new Error("Please describe your target audience");
      }

      // Prepare payload for backend
      const payload: OnboardingRequest = {
        user_name: formData.user_name.trim(),
        creator_type: formData.creator_type as CreatorType,
        niche: formData.niche.trim(),
        target_audience_niche: formData.target_audience_niche.trim(),
        existing_platforms: formData.existing_platforms,
        platform_urls: formData.platform_urls,
      };

      // Call backend API
      await api.post<CreatorProfile>("/onboarding", payload);

      // Navigate to dashboard on success
      navigate("/dashboard");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to complete onboarding. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid =
    formData.user_name.trim() !== "" && 
    formData.creator_type !== "";
  const isStep2Valid = formData.existing_platforms.length > 0;
  const isStep3Valid = formData.existing_platforms.every(
    platform => formData.platform_urls[platform]?.trim() !== ""
  );
  const isStep4Valid = 
    formData.niche.trim() !== "" && 
    formData.target_audience_niche.trim() !== "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F12] px-4 py-12 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10B981]/5 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-gradient-to-br from-[#111113] to-[#1a1a1c] border border-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 max-w-3xl w-full"
      >
        {/* Progress indicator */}
        <div className="flex justify-between mb-12 gap-2">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: s * 0.1 }}
              className="flex-1 h-2 rounded-full overflow-hidden bg-gray-800"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: s <= step ? "100%" : "0%" }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"
              />
            </motion.div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Step 1: Tell us about you */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-block mb-4 p-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30"
              >
                <Brain className="text-[#10B981]" size={40} />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Tell us about you
              </h2>
              <p className="text-gray-400 text-lg">
                Help our AI agents understand your unique creator identity.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Your name or brand name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.user_name}
                  onChange={(e) => handleInputChange("user_name", e.target.value)}
                  maxLength={255}
                  className="w-full px-5 py-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  I am a... <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.creator_type}
                  onChange={(e) => handleInputChange("creator_type", e.target.value)}
                  className="w-full px-5 py-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="" disabled>
                    Select creator type
                  </option>
                  {CREATOR_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <motion.button
              onClick={handleNext}
              disabled={!isStep1Valid}
              whileHover={{ scale: isStep1Valid ? 1.02 : 1 }}
              whileTap={{ scale: isStep1Valid ? 0.98 : 1 }}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#10B981]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              Next
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </motion.button>
          </motion.div>
        )}

        {/* Step 2: Where do you create? */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-block mb-4 p-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30"
              >
                <Target className="text-[#10B981]" size={40} />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Where do you create?
              </h2>
              <p className="text-gray-400 text-lg">
                Select the platforms where you're active or want to grow. Choose at least one.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PLATFORMS.map((platform, idx) => (
                <motion.button
                  key={platform.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => togglePlatform(platform.name)}
                  whileHover={{ scale: 1.05, y: -6 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-6 rounded-xl text-center transition-all border-2 group ${
                    formData.existing_platforms.includes(platform.name)
                      ? "border-[#10B981] bg-[#10B981]/10"
                      : "border-gray-700 bg-[#1a1a1c] hover:border-gray-600"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                        formData.existing_platforms.includes(platform.name)
                          ? "bg-white/10"
                          : "bg-gray-800/50"
                      }`}
                      style={{
                        backgroundColor: formData.existing_platforms.includes(platform.name)
                          ? `${platform.color}20`
                          : undefined,
                      }}
                    >
                      <platform.icon
                        size={32}
                        style={{ color: platform.color }}
                        className="group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <span
                      className={`font-semibold text-sm ${
                        formData.existing_platforms.includes(platform.name)
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {platform.name}
                    </span>
                  </div>
                  {formData.existing_platforms.includes(platform.name) && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                      }}
                      className="absolute -top-2 -right-2"
                    >
                      <div className="bg-[#10B981] rounded-full p-1">
                        <CheckCircle size={18} className="text-white" />
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <motion.button
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-[#1a1a1c] border border-gray-700 text-gray-300 py-4 rounded-xl font-semibold hover:bg-[#222224] transition-all flex items-center justify-center gap-2 group"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back
              </motion.button>
              <motion.button
                onClick={handleNext}
                disabled={!isStep2Valid}
                whileHover={{ scale: isStep2Valid ? 1.02 : 1 }}
                whileTap={{ scale: isStep2Valid ? 0.98 : 1 }}
                className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#10B981]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                Next
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Connect your accounts */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-block mb-4 p-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30"
              >
                <Link2 className="text-[#10B981]" size={40} />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Connect your accounts
              </h2>
              <p className="text-gray-400 text-lg">
                Share your profile URLs so we can analyze your content and provide personalized insights.
              </p>
            </div>

            <div className="space-y-6">
              {formData.existing_platforms.map((platformName) => {
                const platform = PLATFORMS.find(p => p.name === platformName);
                if (!platform) return null;
                
                return (
                  <motion.div
                    key={platformName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                      <platform.icon size={20} style={{ color: platform.color }} />
                      {platformName} Profile URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.platform_urls[platformName] || ""}
                      onChange={(e) => handlePlatformUrlChange(platformName, e.target.value)}
                      className="w-full px-5 py-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                      placeholder={platform.urlPlaceholder}
                    />
                  </motion.div>
                );
              })}
            </div>

            <div className="flex gap-4 pt-4">
              <motion.button
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-[#1a1a1c] border border-gray-700 text-gray-300 py-4 rounded-xl font-semibold hover:bg-[#222224] transition-all flex items-center justify-center gap-2 group"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back
              </motion.button>
              <motion.button
                onClick={handleNext}
                disabled={!isStep3Valid}
                whileHover={{ scale: isStep3Valid ? 1.02 : 1 }}
                whileTap={{ scale: isStep3Valid ? 0.98 : 1 }}
                className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#10B981]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                Next
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Define your niche */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-block mb-4 p-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30"
              >
                <Target className="text-[#10B981]" size={40} />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Define your niche
              </h2>
              <p className="text-gray-400 text-lg">
                Help us understand your content focus and target audience.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  What niche or topic do you focus on? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.niche}
                  onChange={(e) => handleInputChange("niche", e.target.value)}
                  className="w-full px-5 py-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all resize-none"
                  rows={3}
                  placeholder="e.g., Tech education, Fitness and nutrition, Personal finance"
                />
                <p className="mt-2 text-xs text-gray-500">Describe the category or topic area of your content</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Who is your target audience? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.target_audience_niche}
                  onChange={(e) => handleInputChange("target_audience_niche", e.target.value)}
                  className="w-full px-5 py-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all resize-none"
                  rows={3}
                  placeholder="e.g., Junior developers learning to code, Busy professionals wanting to get fit"
                />
                <p className="mt-2 text-xs text-gray-500">Describe what your audience is interested in or who they are</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <motion.button
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-[#1a1a1c] border border-gray-700 text-gray-300 py-4 rounded-xl font-semibold hover:bg-[#222224] transition-all flex items-center justify-center gap-2 group"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back
              </motion.button>
              <motion.button
                onClick={handleComplete}
                disabled={!isStep4Valid || isSubmitting}
                whileHover={{ scale: isStep4Valid && !isSubmitting ? 1.02 : 1 }}
                whileTap={{ scale: isStep4Valid && !isSubmitting ? 0.98 : 1 }}
                className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#10B981]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    Complete
                    <CheckCircle
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
