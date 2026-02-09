import { useState } from "react";
import {
  X,
  Save,
  Target,
  Users,
  Lightbulb,
  Trophy,
  Eye,
  TrendingUp,
  Briefcase,
  Heart,
  Zap,
  Sparkles,
} from "lucide-react";

interface ContextMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContextData {
  uniqueAngle: string;
  purpose: string;
  strengths: string;
  targetPlatforms: string;
  futurePlatforms: string;
  topics: string;
  targetAudience: string;
  competitorAccounts: string;
  assets: string;
  motivation: string;
}

const ContextMemoryModal = ({ isOpen, onClose }: ContextMemoryModalProps) => {
  const [contextData, setContextData] = useState<ContextData>({
    uniqueAngle: "",
    purpose: "",
    strengths: "",
    targetPlatforms: "",
    futurePlatforms: "",
    topics: "",
    targetAudience: "",
    competitorAccounts: "",
    assets: "",
    motivation: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    onClose();
  };

  const contextFields = [
    {
      id: "uniqueAngle",
      label: "Unique Angle",
      placeholder: "What makes you different from other creators?",
      icon: Sparkles,
      description: "Your unique perspective or approach to content",
    },
    {
      id: "purpose",
      label: "Content Purpose",
      placeholder: "Why do you create content? What's your mission?",
      icon: Target,
      description: "The core mission behind your content creation",
    },
    {
      id: "strengths",
      label: "Team Strengths",
      placeholder: "e.g., Video editing, storytelling, animation, research...",
      icon: Trophy,
      description: "What are you and your team particularly good at?",
    },
    {
      id: "targetPlatforms",
      label: "Current Platforms",
      placeholder: "YouTube, Twitter, Instagram...",
      icon: Eye,
      description: "Platforms you're currently active on",
    },
    {
      id: "futurePlatforms",
      label: "Future Platforms",
      placeholder: "TikTok, LinkedIn, Podcast...",
      icon: TrendingUp,
      description: "Platforms you're considering expanding to",
    },
    {
      id: "topics",
      label: "Content Topics",
      placeholder: "AI, productivity, entrepreneurship, tech reviews...",
      icon: Lightbulb,
      description: "Main topics and themes you cover",
    },
    {
      id: "targetAudience",
      label: "Target Audience",
      placeholder: "Age range, interests, profession, pain points...",
      icon: Users,
      description: "Who is your ideal viewer/follower?",
    },
    {
      id: "competitorAccounts",
      label: "Competitor Accounts",
      placeholder: "@creator1, @creator2, Channel Name...",
      icon: Zap,
      description: "Similar creators you respect or compete with",
    },
    {
      id: "assets",
      label: "Available Assets",
      placeholder: "Equipment, software, resources, team members...",
      icon: Briefcase,
      description: "Tools and resources at your disposal",
    },
    {
      id: "motivation",
      label: "Your Motivation",
      placeholder: "What drives you to keep creating?",
      icon: Heart,
      description: "Your 'why' - what keeps you going",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-neutral-800/60 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1B9C5B]/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-[#1B9C5B]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-100">
                Context Memory
              </h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                Help AI understand you better
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-[#1B9C5B]/10 to-transparent border border-[#1B9C5B]/20 rounded-xl p-4">
              <p className="text-sm text-neutral-300 leading-relaxed">
                <span className="font-bold text-[#1B9C5B]">Pro Tip:</span> The
                more detailed you are, the better our AI can tailor content
                suggestions to match your voice, style, and audience.
              </p>
            </div>

            {/* Context Fields */}
            <div className="space-y-6">
              {contextFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-neutral-900/50 rounded-lg mt-1">
                        <Icon className="w-4 h-4 text-[#1B9C5B]" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-neutral-200 mb-1">
                          {field.label}
                        </label>
                        <p className="text-xs text-neutral-500 mb-3">
                          {field.description}
                        </p>
                        <textarea
                          value={contextData[field.id as keyof ContextData]}
                          onChange={(e) =>
                            setContextData({
                              ...contextData,
                              [field.id]: e.target.value,
                            })
                          }
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800/50 rounded-lg text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-1 focus:ring-[#1B9C5B]/20 resize-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800/50 px-8 py-4 flex items-center justify-between bg-[#0a0a0a]">
          <p className="text-sm text-neutral-500">
            Last saved: <span className="text-neutral-400">2 days ago</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 rounded-lg font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#1B9C5B] hover:bg-[#1B9C5B]/90 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-[#1B9C5B]/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextMemoryModal;
