import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  FaYoutube,
  FaInstagram,
  FaXTwitter,
  FaFacebook,
  FaTiktok,
  FaLinkedin,
} from "react-icons/fa6";

interface OnboardingData {
  name: string;
  niche: string;
  contentStyle: string;
  goals: string[];
  platforms: string[];
}

export default function Onboarding() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    niche: "",
    contentStyle: "",
    goals: [],
    platforms: [],
  });

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "goals" | "platforms", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    // Log the onboarding data to console
    console.log("Onboarding Data:", formData);

    // Update user metadata to mark onboarding as complete
    await user?.update({
      unsafeMetadata: {
        onboardingCompleted: true,
        onboardingData: formData,
      },
    });

    // Navigate to dashboard
    navigate("/dashboard");
  };

  const isStep1Valid =
    formData.name.trim() !== "" && formData.niche.trim() !== "";
  const isStep2Valid = formData.goals.length > 0;
  const isStep3Valid = formData.platforms.length > 0;

  const platformIcons = [
    { name: "YouTube", icon: FaYoutube, color: "#FF0000" },
    { name: "Twitter/X", icon: FaXTwitter, color: "#1DA1F2" },
    { name: "LinkedIn", icon: FaLinkedin, color: "#0A66C2" },
    { name: "Instagram", icon: FaInstagram, color: "#E4405F" },
    { name: "TikTok", icon: FaTiktok, color: "#000000" },
    { name: "Facebook", icon: FaFacebook, color: "#1877F2" },
  ];

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
          {[1, 2, 3].map((s) => (
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

        {/* Step 1: Tell us about yourself */}
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
                Tell us about yourself
              </h2>
              <p className="text-gray-400 text-lg">
                Help our AI agents understand your unique creator identity.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Your name or brand name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-5 py-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  What's your niche or topic area?
                </label>
                <input
                  type="text"
                  value={formData.niche}
                  onChange={(e) => handleInputChange("niche", e.target.value)}
                  className="w-full px-5 py-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Tech reviews, Fitness, Personal finance"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Describe your content style (optional)
                </label>
                <textarea
                  value={formData.contentStyle}
                  onChange={(e) =>
                    handleInputChange("contentStyle", e.target.value)
                  }
                  className="w-full px-5 py-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all resize-none"
                  rows={4}
                  placeholder="e.g., Educational with humor, Professional and data-driven"
                />
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

        {/* Step 2: What are your goals? */}
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
                What are your goals?
              </h2>
              <p className="text-gray-400 text-lg">
                Select all that apply. This helps us prioritize strategies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Grow my audience",
                "Monetize my content",
                "Build a personal brand",
                "Become a thought leader",
                "Launch a product/service",
                "Get more engagement",
              ].map((goal, idx) => (
                <motion.button
                  key={goal}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => toggleArrayItem("goals", goal)}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative p-5 rounded-xl text-left transition-all border-2 group ${
                    formData.goals.includes(goal)
                      ? "border-[#10B981] bg-[#10B981]/10"
                      : "border-gray-700 bg-[#1a1a1c] hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold ${formData.goals.includes(goal) ? "text-white" : "text-gray-300"}`}
                    >
                      {goal}
                    </span>
                    {formData.goals.includes(goal) && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                        }}
                      >
                        <CheckCircle size={22} className="text-[#10B981]" />
                      </motion.div>
                    )}
                  </div>
                  {formData.goals.includes(goal) && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-b-xl"
                    />
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

        {/* Step 3: Where do you create? */}
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
                <Zap className="text-[#10B981]" size={40} />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Where do you create?
              </h2>
              <p className="text-gray-400 text-lg">
                Select platforms you're active on or want to grow.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {platformIcons.map((platform, idx) => (
                <motion.button
                  key={platform.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => toggleArrayItem("platforms", platform.name)}
                  whileHover={{ scale: 1.05, y: -6 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-6 rounded-xl text-center transition-all border-2 group ${
                    formData.platforms.includes(platform.name)
                      ? "border-[#10B981] bg-[#10B981]/10"
                      : "border-gray-700 bg-[#1a1a1c] hover:border-gray-600"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                        formData.platforms.includes(platform.name)
                          ? "bg-white/10"
                          : "bg-gray-800/50"
                      }`}
                      style={{
                        backgroundColor: formData.platforms.includes(
                          platform.name,
                        )
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
                        formData.platforms.includes(platform.name)
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {platform.name}
                    </span>
                  </div>
                  {formData.platforms.includes(platform.name) && (
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
                  {formData.platforms.includes(platform.name) && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-b-xl"
                    />
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
                onClick={handleComplete}
                disabled={!isStep3Valid}
                whileHover={{ scale: isStep3Valid ? 1.02 : 1 }}
                whileTap={{ scale: isStep3Valid ? 0.98 : 1 }}
                className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#10B981]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                Complete
                <CheckCircle
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
