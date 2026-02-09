import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, Plus, Calendar, Target, Search } from "lucide-react";
import { campaigns, type Platform } from "../../data";
import { Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";

// Platform icon mapping
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

const statusColors = {
  active: {
    bg: "bg-[#1B9C5B]/10",
    text: "text-[#1B9C5B]",
    dot: "bg-[#1B9C5B]",
  },
  draft: {
    bg: "bg-neutral-700/20",
    text: "text-neutral-400",
    dot: "bg-neutral-500",
  },
  paused: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    dot: "bg-amber-500",
  },
  completed: {
    bg: "bg-neutral-600/20",
    text: "text-neutral-400",
    dot: "bg-neutral-500",
  },
};

const Campaign = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatDate = (date: Date) => {
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const day = date.getDate();
      return `${month} ${day}`;
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const handleCampaignClick = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`);
  };

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.goal?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen p-8" style={{ background: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-50 mb-2">
              Campaigns
            </h1>
            <p className="text-neutral-500 text-sm">
              Manage and track all your marketing campaigns
              {searchTerm && (
                <span className="ml-2 text-[#1B9C5B]">
                  · {filteredCampaigns.length} result
                  {filteredCampaigns.length !== 1 ? "s" : ""} for "{searchTerm}"
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 pl-10 pr-4 py-2.5 bg-neutral-900/80 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-2 focus:ring-[#1B9C5B]/20 transition-all"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-neutral-900/80 p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-neutral-800 text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-neutral-800 text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* New Campaign Button */}
            <button
              onClick={() => navigate("/campaign/create")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1B9C5B] hover:bg-[#1B9C5B]/90 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg shadow-[#1B9C5B]/20"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </button>
          </div>
        </div>

        {/* Campaigns Display */}
        {filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 bg-neutral-900/50 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-neutral-700" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-300 mb-2">
              {searchTerm ? "No campaigns found" : "No campaigns yet"}
            </h3>
            <p className="text-neutral-600 text-sm mb-6 text-center max-w-md">
              {searchTerm
                ? `No campaigns match "${searchTerm}". Try a different search term.`
                : "Get started by creating your first campaign to reach your audience and achieve your marketing goals."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/campaign/create")}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1B9C5B] hover:bg-[#1B9C5B]/90 text-white rounded-lg transition-all duration-200 font-medium shadow-lg shadow-[#1B9C5B]/20"
              >
                <Plus className="w-4 h-4" />
                Create Your First Campaign
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                : "space-y-4"
            }
          >
            {filteredCampaigns.map((campaign) => {
              const dateRange = formatDateRange(
                campaign.startDate,
                campaign.endDate,
              );
              const statusStyle = statusColors[campaign.status];

              return (
                <div
                  key={campaign.id}
                  onClick={() => handleCampaignClick(campaign.id)}
                  className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6 hover:border-neutral-700/60 hover:bg-neutral-950/70 transition-all duration-300 cursor-pointer group"
                >
                  {/* Header with Status */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-[#1B9C5B] transition-colors flex-1 pr-3">
                      {campaign.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${statusStyle.dot}`}
                      />
                      <span
                        className={`text-xs font-medium ${statusStyle.text} capitalize`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                  </div>

                  {/* Goal Preview */}
                  {campaign.goal && (
                    <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                      {campaign.goal}
                    </p>
                  )}

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-800/50">
                    <Calendar className="w-4 h-4" />
                    <span>{dateRange}</span>
                    <span className="text-neutral-700">•</span>
                    <span>{campaign.duration} days</span>
                  </div>

                  {/* Platforms - Simplified */}
                  <div className="flex items-center gap-2">
                    {campaign.platforms.slice(0, 4).map((platform) => {
                      const Icon = platformIcons[platform];
                      return (
                        <div
                          key={platform}
                          className="p-2 bg-neutral-900/50 rounded-lg hover:bg-neutral-900 transition-colors"
                          title={platform}
                        >
                          <Icon className="w-4 h-4 text-neutral-500" />
                        </div>
                      );
                    })}
                    {campaign.platforms.length > 4 && (
                      <div className="p-2 bg-neutral-900/50 rounded-lg text-xs text-neutral-600 font-medium">
                        +{campaign.platforms.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaign;
