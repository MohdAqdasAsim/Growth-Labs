import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Target,
  CheckCircle2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  type CampaignStatus,
  type Platform,
  type CampaignType,
  type Metric,
  type PostingFrequency,
} from "../../data";

const platformOptions: {
  id: Platform;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "twitter", label: "Twitter", icon: Twitter },
  {
    id: "tiktok",
    label: "TikTok",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "youtube", label: "YouTube", icon: Youtube },
];

const campaignTypeOptions: {
  id: CampaignType;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: "awareness",
    label: "Awareness",
    description: "Build brand recognition",
    icon: TrendingUp,
  },
  {
    id: "engagement",
    label: "Engagement",
    description: "Increase interactions",
    icon: Target,
  },
  {
    id: "conversion",
    label: "Conversion",
    description: "Drive actions and sales",
    icon: CheckCircle2,
  },
  {
    id: "retention",
    label: "Retention",
    description: "Keep existing customers",
    icon: Clock,
  },
];

const statusOptions: {
  id: CampaignStatus;
  label: string;
  description: string;
}[] = [
  {
    id: "draft",
    label: "Draft",
    description: "Save to work on later",
  },
  {
    id: "active",
    label: "Active",
    description: "Campaign is live",
  },
  {
    id: "paused",
    label: "Paused",
    description: "Temporarily paused",
  },
];

const metricOptions: { id: Metric; label: string }[] = [
  { id: "impressions", label: "Impressions" },
  { id: "clicks", label: "Clicks" },
  { id: "conversions", label: "Conversions" },
  { id: "engagement_rate", label: "Engagement Rate" },
  { id: "reach", label: "Reach" },
  { id: "followers", label: "Followers" },
];

const postingFrequencyOptions: { id: PostingFrequency; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "twice_daily", label: "Twice Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "twice_weekly", label: "Twice Weekly" },
  { id: "custom", label: "Custom" },
];

const steps = [
  { id: 1, name: "Basics", description: "Name, type & platforms" },
  { id: 2, name: "Timeline", description: "Duration & frequency" },
  { id: 3, name: "Goals", description: "Objectives & metrics" },
];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    type: "awareness" as CampaignType,
    status: "draft" as CampaignStatus,
    startDate: "",
    endDate: "",
    platforms: [] as Platform[],
    metric: "impressions" as Metric,
    targetValue: "",
    postingFrequency: "daily" as PostingFrequency,
    goal: "",
    contentThemes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Campaign name is required";
      if (formData.platforms.length === 0)
        newErrors.platforms = "Select at least one platform";
    }

    if (step === 2) {
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";
      if (
        formData.startDate &&
        formData.endDate &&
        new Date(formData.endDate) < new Date(formData.startDate)
      ) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (step === 3) {
      if (!formData.targetValue)
        newErrors.targetValue = "Target value is required";
      if (!formData.goal.trim()) newErrors.goal = "Campaign goal is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = () => {
    console.log("Campaign created:", formData);
    navigate("/campaign");
  };

  const togglePlatform = (platformId: Platform) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId],
    }));
    if (errors.platforms) setErrors((prev) => ({ ...prev, platforms: "" }));
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "#0a0a0a" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/campaign")}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Campaigns</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-7 h-7 text-[#1B9C5B]" />
            <h1 className="text-3xl font-bold text-neutral-50">
              Create New Campaign
            </h1>
          </div>
          <p className="text-neutral-500 text-sm">
            Let's set up your campaign in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center"
                style={{ flex: index < steps.length - 1 ? "1" : "0 0 auto" }}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-[#1B9C5B] text-white shadow-lg shadow-[#1B9C5B]/30"
                        : "bg-neutral-900 text-neutral-600 border border-neutral-800"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-3 text-center" style={{ width: "120px" }}>
                    <div
                      className={`text-sm font-medium ${
                        currentStep >= step.id
                          ? "text-neutral-200"
                          : "text-neutral-600"
                      }`}
                    >
                      {step.name}
                    </div>
                    <div className="text-xs text-neutral-600 mt-0.5">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 transition-all duration-300 ${
                      currentStep > step.id ? "bg-[#1B9C5B]" : "bg-neutral-800"
                    }`}
                    style={{
                      flex: 1,
                      margin: "0 16px",
                      marginBottom: "52px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Campaign Name */}
              <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-neutral-200 mb-4">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="e.g., Summer Product Launch 2024"
                  className={`w-full px-4 py-3.5 bg-neutral-900/50 border ${
                    errors.name ? "border-red-500/50" : "border-neutral-800"
                  } rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-2 focus:ring-[#1B9C5B]/20 transition-all`}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-2">{errors.name}</p>
                )}
              </div>

              {/* Campaign Type */}
              <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-neutral-200 mb-4">
                  Campaign Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {campaignTypeOptions.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, type: type.id })
                        }
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          formData.type === type.id
                            ? "border-[#1B9C5B] bg-[#1B9C5B]/10 shadow-lg shadow-[#1B9C5B]/10"
                            : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mb-2 ${formData.type === type.id ? "text-[#1B9C5B]" : "text-neutral-500"}`}
                        />
                        <div className="font-semibold text-neutral-200 text-sm mb-1">
                          {type.label}
                        </div>
                        <p className="text-xs text-neutral-600">
                          {type.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-neutral-200 mb-4">
                  Campaign Status *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, status: status.id })
                      }
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        formData.status === status.id
                          ? "border-[#1B9C5B] bg-[#1B9C5B]/10 shadow-lg shadow-[#1B9C5B]/10"
                          : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-neutral-200 text-sm">
                          {status.label}
                        </span>
                        {formData.status === status.id && (
                          <CheckCircle2 className="w-5 h-5 text-[#1B9C5B]" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-600">
                        {status.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-neutral-200 mb-4">
                  Select Platforms *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {platformOptions.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = formData.platforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => togglePlatform(platform.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          isSelected
                            ? "border-[#1B9C5B] bg-[#1B9C5B]/10 shadow-lg shadow-[#1B9C5B]/10"
                            : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isSelected ? "text-[#1B9C5B]" : "text-neutral-500"}`}
                        />
                        <span
                          className={`text-sm font-medium ${isSelected ? "text-neutral-200" : "text-neutral-500"}`}
                        >
                          {platform.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.platforms && (
                  <p className="text-red-400 text-xs mt-3">
                    {errors.platforms}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Timeline */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Duration */}
              <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Campaign Duration *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => {
                        setFormData({ ...formData, startDate: e.target.value });
                        if (errors.startDate)
                          setErrors({ ...errors, startDate: "" });
                      }}
                      className={`w-full px-4 py-3.5 bg-neutral-900/50 border ${
                        errors.startDate
                          ? "border-red-500/50"
                          : "border-neutral-800"
                      } rounded-xl text-neutral-200 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-2 focus:ring-[#1B9C5B]/20 transition-all`}
                    />
                    {errors.startDate && (
                      <p className="text-red-400 text-xs mt-2">
                        {errors.startDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => {
                        setFormData({ ...formData, endDate: e.target.value });
                        if (errors.endDate)
                          setErrors({ ...errors, endDate: "" });
                      }}
                      className={`w-full px-4 py-3.5 bg-neutral-900/50 border ${
                        errors.endDate
                          ? "border-red-500/50"
                          : "border-neutral-800"
                      } rounded-xl text-neutral-200 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-2 focus:ring-[#1B9C5B]/20 transition-all`}
                    />
                    {errors.endDate && (
                      <p className="text-red-400 text-xs mt-2">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Posting Frequency */}
              <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Posting Frequency *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {postingFrequencyOptions.map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, postingFrequency: freq.id })
                      }
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.postingFrequency === freq.id
                          ? "border-[#1B9C5B] bg-[#1B9C5B]/10 shadow-lg shadow-[#1B9C5B]/10"
                          : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${formData.postingFrequency === freq.id ? "text-neutral-200" : "text-neutral-500"}`}
                      >
                        {freq.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Themes */}
              <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-neutral-200 mb-4">
                  Content Themes
                  <span className="text-neutral-600 font-normal ml-2">
                    (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.contentThemes}
                  onChange={(e) =>
                    setFormData({ ...formData, contentThemes: e.target.value })
                  }
                  placeholder="Product Launch, Behind the Scenes, Customer Stories"
                  className="w-full px-4 py-3.5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-2 focus:ring-[#1B9C5B]/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Metric & Target Value */}
              <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Campaign Metrics *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">
                      Metric to Track
                    </label>
                    <select
                      value={formData.metric}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metric: e.target.value as Metric,
                        })
                      }
                      className="w-full px-4 py-3.5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-2 focus:ring-[#1B9C5B]/20 transition-all"
                    >
                      {metricOptions.map((metric) => (
                        <option key={metric.id} value={metric.id}>
                          {metric.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">
                      Target Value
                    </label>
                    <input
                      type="number"
                      value={formData.targetValue}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          targetValue: e.target.value,
                        });
                        if (errors.targetValue)
                          setErrors({ ...errors, targetValue: "" });
                      }}
                      placeholder="100000"
                      className={`w-full px-4 py-3.5 bg-neutral-900/50 border ${
                        errors.targetValue
                          ? "border-red-500/50"
                          : "border-neutral-800"
                      } rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-2 focus:ring-[#1B9C5B]/20 transition-all`}
                    />
                    {errors.targetValue && (
                      <p className="text-red-400 text-xs mt-2">
                        {errors.targetValue}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Campaign Goal */}
              <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Campaign Goal *
                </label>
                <textarea
                  value={formData.goal}
                  onChange={(e) => {
                    setFormData({ ...formData, goal: e.target.value });
                    if (errors.goal) setErrors({ ...errors, goal: "" });
                  }}
                  placeholder="What do you want to achieve with this campaign?"
                  rows={4}
                  className={`w-full px-4 py-3.5 bg-neutral-900/50 border ${
                    errors.goal ? "border-red-500/50" : "border-neutral-800"
                  } rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-2 focus:ring-[#1B9C5B]/20 transition-all resize-none`}
                />
                {errors.goal && (
                  <p className="text-red-400 text-xs mt-2">{errors.goal}</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-800/50">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                currentStep === 1
                  ? "opacity-50 cursor-not-allowed text-neutral-600"
                  : "bg-neutral-900/80 hover:bg-neutral-900 text-neutral-300 border border-neutral-800"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/campaign")}
                className="px-6 py-3 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-400 rounded-xl transition-all duration-200 font-medium border border-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-[#1B9C5B] hover:bg-[#1B9C5B]/90 text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-[#1B9C5B]/20"
              >
                {currentStep === 3 ? "Create Campaign" : "Next"}
                {currentStep < 3 && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateCampaign;
