import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Sparkles,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ArrowRight,
  Zap,
  Target,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  CheckCircle2,
} from "lucide-react";

type Platform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "tiktok"
  | "linkedin"
  | "youtube";

const platformIcons: Record<Platform, React.FC<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  tiktok: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
  linkedin: Linkedin,
  youtube: Youtube,
};

// Mock data
const recentPosts = [
  {
    id: 1,
    platform: "instagram" as Platform,
    content: "Building Leverage Through AI Agents in 2026",
    time: "2 hours ago",
    engagement: "high",
    likes: 234,
    comments: 18,
  },
  {
    id: 2,
    platform: "twitter" as Platform,
    content: "5 ways AI is transforming business automation...",
    time: "5 hours ago",
    engagement: "medium",
    likes: 156,
    comments: 12,
  },
  {
    id: 3,
    platform: "linkedin" as Platform,
    content: "The future of work is here. Here's what you need to know",
    time: "1 day ago",
    engagement: "high",
    likes: 421,
    comments: 34,
  },
];

const upcomingPosts = [
  {
    id: 1,
    platform: "instagram" as Platform,
    title: "Product Launch Announcement",
    scheduledFor: "Today, 3:00 PM",
    campaign: "Summer Campaign 2024",
  },
  {
    id: 2,
    platform: "facebook" as Platform,
    title: "Behind the Scenes Content",
    scheduledFor: "Tomorrow, 10:00 AM",
    campaign: "Brand Awareness Q1",
  },
  {
    id: 3,
    platform: "youtube" as Platform,
    title: "Tutorial: Getting Started Guide",
    scheduledFor: "Mar 20, 2:00 PM",
    campaign: "Educational Series",
  },
];

const activeCampaigns = [
  {
    id: 1,
    name: "Summer Campaign 2024",
    status: "active",
    progress: 67,
    platforms: ["instagram", "facebook", "twitter"] as Platform[],
  },
  {
    id: 2,
    name: "Brand Awareness Q1",
    status: "active",
    progress: 45,
    platforms: ["linkedin", "twitter"] as Platform[],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "high":
        return "text-[#1B9C5B] bg-[#1B9C5B]/10";
      case "medium":
        return "text-amber-500 bg-amber-500/10";
      case "low":
        return "text-neutral-500 bg-neutral-500/10";
      default:
        return "text-neutral-500 bg-neutral-500/10";
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-50 mb-2">
            Welcome back!
          </h1>
          <p className="text-neutral-500 text-sm">
            Here's what's happening with your content
          </p>
        </div>

        {/* Quick Stats - Minimal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#1B9C5B]/10 to-transparent border border-[#1B9C5B]/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1B9C5B]/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#1B9C5B]/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#1B9C5B]" />
                </div>
                <span className="text-sm text-neutral-400">This Week</span>
              </div>
              <div className="text-3xl font-bold text-neutral-100 mb-1">
                Growing
              </div>
              <p className="text-sm text-neutral-500">
                Your content is reaching more people
              </p>
            </div>
          </div>

          <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-neutral-800/50 rounded-lg">
                <Sparkles className="w-5 h-5 text-neutral-400" />
              </div>
              <span className="text-sm text-neutral-400">Active</span>
            </div>
            <div className="text-3xl font-bold text-neutral-100 mb-1">
              {activeCampaigns.length}
            </div>
            <p className="text-sm text-neutral-500">Campaigns running</p>
          </div>

          <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-neutral-800/50 rounded-lg">
                <Calendar className="w-5 h-5 text-neutral-400" />
              </div>
              <span className="text-sm text-neutral-400">Scheduled</span>
            </div>
            <div className="text-3xl font-bold text-neutral-100 mb-1">
              {upcomingPosts.length}
            </div>
            <p className="text-sm text-neutral-500">Posts ready to go</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-neutral-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-[#1B9C5B]" />
                    <h2 className="text-lg font-semibold text-neutral-200">
                      Recent Posts
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate("/studio")}
                    className="text-sm text-[#1B9C5B] hover:text-[#1B9C5B]/80 font-medium flex items-center gap-1"
                  >
                    View all
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {recentPosts.map((post) => {
                  const Icon = platformIcons[post.platform];
                  const engagementColor = getEngagementColor(post.engagement);

                  return (
                    <div
                      key={post.id}
                      className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-5 hover:border-neutral-700/60 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-neutral-900/50 rounded-lg">
                          <Icon className="w-5 h-5 text-neutral-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-neutral-200 font-medium mb-2 group-hover:text-[#1B9C5B] transition-colors">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-neutral-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.time}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {post.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {post.comments}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${engagementColor}`}
                            >
                              {post.engagement}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Campaigns */}
            <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-neutral-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-[#1B9C5B]" />
                    <h2 className="text-lg font-semibold text-neutral-200">
                      Active Campaigns
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate("/campaign")}
                    className="text-sm text-[#1B9C5B] hover:text-[#1B9C5B]/80 font-medium flex items-center gap-1"
                  >
                    View all
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {activeCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => navigate(`/campaign/${campaign.id}`)}
                    className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-5 hover:border-neutral-700/60 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-neutral-200 font-semibold group-hover:text-[#1B9C5B] transition-colors">
                        {campaign.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#1B9C5B]"></div>
                        <span className="text-xs text-[#1B9C5B] capitalize">
                          {campaign.status}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-neutral-500">
                          Progress
                        </span>
                        <span className="text-xs font-semibold text-neutral-400">
                          {campaign.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1.5">
                        <div
                          className="bg-[#1B9C5B] h-1.5 rounded-full transition-all"
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {campaign.platforms.map((platform) => {
                        const Icon = platformIcons[platform];
                        return (
                          <div
                            key={platform}
                            className="p-1.5 bg-neutral-900/50 rounded-md"
                          >
                            <Icon className="w-3 h-3 text-neutral-500" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Right 1 column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-neutral-200 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/studio/create-post")}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-[#1B9C5B]/10 to-transparent border border-[#1B9C5B]/20 rounded-xl hover:border-[#1B9C5B]/40 transition-all duration-200 group"
                >
                  <div className="p-2 bg-[#1B9C5B]/10 rounded-lg group-hover:bg-[#1B9C5B]/20 transition-colors">
                    <Sparkles className="w-5 h-5 text-[#1B9C5B]" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-semibold text-neutral-200 group-hover:text-[#1B9C5B] transition-colors">
                      Generate Post
                    </div>
                    <div className="text-xs text-neutral-500">
                      Create with AI
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-[#1B9C5B] transition-colors" />
                </button>

                <button
                  onClick={() => navigate("/campaign/create")}
                  className="w-full flex items-center gap-3 p-4 bg-neutral-900/30 border border-neutral-800/50 rounded-xl hover:border-neutral-700/60 transition-all duration-200 group"
                >
                  <div className="p-2 bg-neutral-900/50 rounded-lg">
                    <Target className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-semibold text-neutral-200 group-hover:text-neutral-100 transition-colors">
                      New Campaign
                    </div>
                    <div className="text-xs text-neutral-500">
                      Start planning
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-500 transition-colors" />
                </button>

                <button
                  onClick={() => navigate("/studio")}
                  className="w-full flex items-center gap-3 p-4 bg-neutral-900/30 border border-neutral-800/50 rounded-xl hover:border-neutral-700/60 transition-all duration-200 group"
                >
                  <div className="p-2 bg-neutral-900/50 rounded-lg">
                    <Eye className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-semibold text-neutral-200 group-hover:text-neutral-100 transition-colors">
                      View Studio
                    </div>
                    <div className="text-xs text-neutral-500">
                      Manage content
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-500 transition-colors" />
                </button>
              </div>
            </div>

            {/* Upcoming Posts */}
            <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-neutral-800/50">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#1B9C5B]" />
                  <h2 className="text-lg font-semibold text-neutral-200">
                    Coming Up
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {upcomingPosts.map((post) => {
                  const Icon = platformIcons[post.platform];
                  return (
                    <div
                      key={post.id}
                      className="border-l-2 border-[#1B9C5B]/30 pl-4 py-2"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-neutral-900/50 rounded-lg mt-1">
                          <Icon className="w-4 h-4 text-neutral-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-neutral-200 mb-1">
                            {post.title}
                          </h4>
                          <div className="text-xs text-neutral-600 mb-1">
                            {post.scheduledFor}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {post.campaign}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insights Card */}
            <div className="bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 border border-neutral-800/50 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-200 mb-1">
                    Pro Tip
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Posts with visuals get 2.3x more engagement. Try adding
                    images to your next post!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
