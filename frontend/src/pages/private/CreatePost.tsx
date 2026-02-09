import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Target,
  Type,
  Hash,
  Wand2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Eye,
  Copy,
  Download,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

type Platform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "tiktok"
  | "linkedin"
  | "youtube";
type Tone =
  | "professional"
  | "casual"
  | "friendly"
  | "enthusiastic"
  | "informative";
type Length = "short" | "medium" | "long";

const platformOptions: {
  id: Platform;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "twitter", label: "Twitter/X", icon: Twitter },
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

const toneOptions: { id: Tone; label: string; description: string }[] = [
  {
    id: "professional",
    label: "Professional",
    description: "Formal and polished",
  },
  { id: "casual", label: "Casual", description: "Relaxed and approachable" },
  { id: "friendly", label: "Friendly", description: "Warm and welcoming" },
  {
    id: "enthusiastic",
    label: "Enthusiastic",
    description: "Energetic and exciting",
  },
  {
    id: "informative",
    label: "Informative",
    description: "Educational and clear",
  },
];

const lengthOptions: { id: Length; label: string; description: string }[] = [
  { id: "short", label: "Short", description: "Quick and concise" },
  { id: "medium", label: "Medium", description: "Balanced length" },
  { id: "long", label: "Long", description: "Detailed and comprehensive" },
];

const CreatePost = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    topic: "",
    platform: "instagram" as Platform,
    tone: "professional" as Tone,
    length: "medium" as Length,
    keywords: "",
    includeHashtags: true,
    includeEmojis: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGenerate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.topic.trim()) {
      newErrors.topic = "Please enter a topic or description";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsGenerating(true);
    setErrors({});

    // Simulate AI generation
    setTimeout(() => {
      const mockPost = `🚀 Excited to share our latest insights on ${formData.topic}!

In today's rapidly evolving landscape, understanding ${formData.topic} is more crucial than ever. Here's what you need to know:

✨ Key trends shaping the industry
📊 Data-driven strategies that work
💡 Actionable tips for immediate impact

The future of ${formData.topic} is here, and it's transforming the way we approach innovation. Whether you're just starting out or looking to scale, these insights will help you stay ahead of the curve.

What's your experience with ${formData.topic}? Share your thoughts in the comments! 👇

#${formData.topic.replace(/\s+/g, "")} #Innovation #Growth #DigitalTransformation #BusinessStrategy`;

      setGeneratedPost(mockPost);
      setIsGenerating(false);
    }, 2000);
  };

  const handleRegenerate = () => {
    setGeneratedPost(null);
    handleGenerate();
  };

  const handleCopy = () => {
    if (generatedPost) {
      navigator.clipboard.writeText(generatedPost);
      // You could add a toast notification here
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "#0a0a0a" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/studio")}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Studio</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-7 h-7 text-[#1B9C5B]" />
            <h1 className="text-3xl font-bold text-neutral-50">
              AI Post Generator
            </h1>
          </div>
          <p className="text-neutral-500 text-sm">
            Create engaging social media content in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* Topic/Description */}
            <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Topic or Description *
              </label>
              <textarea
                value={formData.topic}
                onChange={(e) => {
                  setFormData({ ...formData, topic: e.target.value });
                  if (errors.topic) setErrors({ ...errors, topic: "" });
                }}
                placeholder="e.g., AI agents transforming business automation, sustainable fashion trends, productivity tips for remote teams..."
                rows={4}
                className={`w-full px-4 py-3.5 bg-neutral-900/50 border ${
                  errors.topic ? "border-red-500/50" : "border-neutral-800"
                } rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-2 focus:ring-[#1B9C5B]/20 transition-all resize-none`}
              />
              {errors.topic && (
                <p className="text-red-400 text-xs mt-2">{errors.topic}</p>
              )}
            </div>

            {/* Platform */}
            <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-neutral-200 mb-4">
                Target Platform *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {platformOptions.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = formData.platform === platform.id;
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, platform: platform.id })
                      }
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
            </div>

            {/* Tone */}
            <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-neutral-200 mb-4">
                Tone & Style *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {toneOptions.map((tone) => {
                  const isSelected = formData.tone === tone.id;
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, tone: tone.id })
                      }
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? "border-[#1B9C5B] bg-[#1B9C5B]/10 shadow-lg shadow-[#1B9C5B]/10"
                          : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-semibold ${isSelected ? "text-neutral-200" : "text-neutral-400"}`}
                        >
                          {tone.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#1B9C5B]" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-600">
                        {tone.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Length */}
            <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Content Length *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {lengthOptions.map((length) => {
                  const isSelected = formData.length === length.id;
                  return (
                    <button
                      key={length.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, length: length.id })
                      }
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                        isSelected
                          ? "border-[#1B9C5B] bg-[#1B9C5B]/10 shadow-lg shadow-[#1B9C5B]/10"
                          : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"
                      }`}
                    >
                      <div
                        className={`text-sm font-semibold mb-1 ${isSelected ? "text-neutral-200" : "text-neutral-400"}`}
                      >
                        {length.label}
                      </div>
                      <p className="text-xs text-neutral-600">
                        {length.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Keywords & Options */}
            <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Keywords & Options
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
                placeholder="innovation, technology, growth (comma separated)"
                className="w-full px-4 py-3.5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-2 focus:ring-[#1B9C5B]/20 transition-all mb-4"
              />

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeHashtags}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        includeHashtags: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-[#1B9C5B] focus:ring-[#1B9C5B] focus:ring-offset-0"
                  />
                  <span className="text-sm text-neutral-300">
                    Include hashtags
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeEmojis}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        includeEmojis: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-[#1B9C5B] focus:ring-[#1B9C5B] focus:ring-offset-0"
                  />
                  <span className="text-sm text-neutral-300">
                    Include emojis
                  </span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1B9C5B] hover:bg-[#1B9C5B]/90 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-[#1B9C5B]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Post
                </>
              )}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#1B9C5B]" />
                  <h2 className="text-lg font-semibold text-neutral-200">
                    Preview
                  </h2>
                </div>
                {generatedPost && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRegenerate}
                      className="p-2 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-400 rounded-lg transition-all duration-200 border border-neutral-800"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-400 rounded-lg transition-all duration-200 border border-neutral-800"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-400 rounded-lg transition-all duration-200 border border-neutral-800"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {generatedPost ? (
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-neutral-200 whitespace-pre-wrap leading-relaxed">
                      {generatedPost}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-900/30 border-2 border-dashed border-neutral-800 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-neutral-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-neutral-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-400 mb-2">
                    Your post will appear here
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Fill in the details and click "Generate Post" to see your
                    AI-crafted content
                  </p>
                </div>
              )}

              {generatedPost && (
                <div className="mt-6 pt-6 border-t border-neutral-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Character count:</span>
                    <span className="text-neutral-300 font-semibold">
                      {generatedPost.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CreatePost;
