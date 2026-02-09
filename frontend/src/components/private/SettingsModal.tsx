import { useState } from "react";
import {
  X,
  User,
  Mail,
  Crown,
  Link as LinkIcon,
  Sparkles,
  Settings as SettingsIcon,
  Shield,
  FileText,
  Brain,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import ContextMemoryModal from "./ContextMemoryModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<
    "account" | "platforms" | "context"
  >("account");
  const [isContextMemoryOpen, setIsContextMemoryOpen] = useState(false);

  if (!isOpen) return null;

  const tabs = [
    { id: "account" as const, label: "Account", icon: User },
    { id: "platforms" as const, label: "Connected Platforms", icon: LinkIcon },
    { id: "context" as const, label: "Context Memory", icon: Brain },
  ];

  const connectedPlatforms = [
    { name: "YouTube", connected: true, color: "from-red-500 to-red-600" },
    { name: "Twitter", connected: true, color: "from-sky-400 to-blue-500" },
    {
      name: "Instagram",
      connected: false,
      color: "from-pink-500 to-purple-500",
    },
    { name: "TikTok", connected: false, color: "from-gray-800 to-gray-900" },
    { name: "LinkedIn", connected: true, color: "from-blue-600 to-blue-700" },
    { name: "Facebook", connected: false, color: "from-blue-500 to-blue-600" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] border border-neutral-800/60 rounded-2xl w-full max-w-5xl h-[75vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1B9C5B]/10 rounded-lg">
                <SettingsIcon className="w-5 h-5 text-[#1B9C5B]" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-100">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-64 border-r border-neutral-800/50 p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-[#1B9C5B]/10 text-[#1B9C5B] border border-[#1B9C5B]/20"
                        : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Account Tab */}
              {activeTab === "account" && (
                <div className="space-y-8 max-w-3xl">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-100 mb-1">
                      Account Settings
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Manage your account information and preferences
                    </p>
                  </div>

                  {/* Profile Section */}
                  <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-6">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6">
                      Profile Information
                    </h4>

                    <div className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex items-center gap-6">
                        {user?.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt={user.fullName || "Profile"}
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-neutral-800/60"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1B9C5B] to-emerald-600 flex items-center justify-center ring-2 ring-neutral-800/60">
                            <User className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <div>
                          <button className="px-4 py-2 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-200 rounded-lg text-sm font-medium transition-colors">
                            Change Photo
                          </button>
                          <p className="text-xs text-neutral-500 mt-2">
                            JPG, PNG or GIF. Max size 2MB
                          </p>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                          <input
                            type="text"
                            value={user?.fullName || ""}
                            readOnly
                            className="w-full pl-10 pr-4 py-3 bg-neutral-900/50 border border-neutral-800/50 rounded-lg text-neutral-200 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-1 focus:ring-[#1B9C5B]/20"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                          <input
                            type="email"
                            value={
                              user?.primaryEmailAddress?.emailAddress || ""
                            }
                            readOnly
                            className="w-full pl-10 pr-4 py-3 bg-neutral-900/50 border border-neutral-800/50 rounded-lg text-neutral-200 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-1 focus:ring-[#1B9C5B]/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Section */}
                  <div className="bg-gradient-to-br from-[#1B9C5B]/5 via-transparent to-transparent border border-[#1B9C5B]/20 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[#1B9C5B] mb-2 flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Current Plan
                        </h4>
                        <p className="text-2xl font-bold text-neutral-100">
                          Free Plan
                        </p>
                        <p className="text-sm text-neutral-500 mt-1">
                          Limited features and campaigns
                        </p>
                      </div>
                      <button className="px-6 py-3 bg-gradient-to-r from-[#1B9C5B] to-emerald-600 text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#1B9C5B]/20 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Upgrade Plan
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-neutral-900/40 rounded-lg p-4">
                        <p className="text-xs text-neutral-500 mb-1">
                          Campaigns
                        </p>
                        <p className="text-xl font-bold text-neutral-200">
                          3 / 5
                        </p>
                      </div>
                      <div className="bg-neutral-900/40 rounded-lg p-4">
                        <p className="text-xs text-neutral-500 mb-1">
                          Posts/Month
                        </p>
                        <p className="text-xl font-bold text-neutral-200">
                          45 / 100
                        </p>
                      </div>
                      <div className="bg-neutral-900/40 rounded-lg p-4">
                        <p className="text-xs text-neutral-500 mb-1">
                          AI Credits
                        </p>
                        <p className="text-xl font-bold text-neutral-200">
                          250 / 500
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Legal */}
                  <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-6">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6">
                      Privacy & Legal
                    </h4>

                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-neutral-400 group-hover:text-neutral-300" />
                          <span className="text-sm font-medium text-neutral-300">
                            Privacy Policy
                          </span>
                        </div>
                        <svg
                          className="w-4 h-4 text-neutral-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>

                      <button className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-neutral-400 group-hover:text-neutral-300" />
                          <span className="text-sm font-medium text-neutral-300">
                            Terms of Service
                          </span>
                        </div>
                        <svg
                          className="w-4 h-4 text-neutral-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Platforms Tab */}
              {activeTab === "platforms" && (
                <div className="space-y-8 max-w-3xl">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-100 mb-1">
                      Connected Platforms
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Manage your social media platform connections
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {connectedPlatforms.map((platform) => (
                      <div
                        key={platform.name}
                        className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-6 hover:border-neutral-700/50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${platform.color} rounded-xl flex items-center justify-center`}
                          >
                            <span className="text-white font-bold text-lg">
                              {platform.name[0]}
                            </span>
                          </div>
                          {platform.connected ? (
                            <span className="px-3 py-1 bg-[#1B9C5B]/10 text-[#1B9C5B] text-xs font-bold rounded-full border border-[#1B9C5B]/20">
                              Connected
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-neutral-800/50 text-neutral-500 text-xs font-bold rounded-full border border-neutral-700/50">
                              Not Connected
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-neutral-100 mb-2">
                          {platform.name}
                        </h4>

                        {platform.connected ? (
                          <button className="w-full px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-all">
                            Disconnect
                          </button>
                        ) : (
                          <button className="w-full px-4 py-2 bg-[#1B9C5B]/10 border border-[#1B9C5B]/20 text-[#1B9C5B] rounded-lg text-sm font-medium hover:bg-[#1B9C5B]/20 transition-all">
                            Connect
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Context Memory Tab */}
              {activeTab === "context" && (
                <div className="space-y-8 max-w-3xl">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-100 mb-1">
                      Context Memory
                    </h3>
                    <p className="text-sm text-neutral-500">
                      AI remembers your preferences and context for better
                      content generation
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-[#1B9C5B]/5 via-transparent to-transparent border border-[#1B9C5B]/20 rounded-xl p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 bg-[#1B9C5B]/10 rounded-xl">
                        <Brain className="w-6 h-6 text-[#1B9C5B]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-neutral-100 mb-2">
                          Personalized AI Content Generation
                        </h4>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                          Your context memory helps our AI understand your
                          unique voice, audience, and goals. This information is
                          used to generate more relevant and personalized
                          content suggestions.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsContextMemoryOpen(true)}
                      className="w-full px-6 py-3 bg-[#1B9C5B] hover:bg-[#1B9C5B]/90 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-[#1B9C5B]/20 flex items-center justify-center gap-2"
                    >
                      <Brain className="w-4 h-4" />
                      Manage Context Memory
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-4">
                      <p className="text-xs text-neutral-500 mb-1">
                        Stored Contexts
                      </p>
                      <p className="text-2xl font-bold text-neutral-200">12</p>
                    </div>
                    <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-4">
                      <p className="text-xs text-neutral-500 mb-1">
                        Last Updated
                      </p>
                      <p className="text-2xl font-bold text-neutral-200">
                        2d ago
                      </p>
                    </div>
                    <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-4">
                      <p className="text-xs text-neutral-500 mb-1">
                        AI Accuracy
                      </p>
                      <p className="text-2xl font-bold text-[#1B9C5B]">94%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Context Memory Modal */}
      <ContextMemoryModal
        isOpen={isContextMemoryOpen}
        onClose={() => setIsContextMemoryOpen(false)}
      />
    </>
  );
};

export default SettingsModal;
