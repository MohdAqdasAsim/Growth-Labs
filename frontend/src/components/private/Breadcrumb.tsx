import { Link, useLocation } from "react-router-dom";
import {
  HelpCircle,
  User,
  Settings,
  LogOut,
  Slash,
  ChevronDown,
  Search,
  Plus,
  Boxes,
  Target,
  Shield,
  FileText,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useState, useRef, useEffect } from "react";
import { workspaces, campaigns } from "../../data";
import SettingsModal from "./SettingsModal";

const Breadcrumb = () => {
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [campaignSearch, setCampaignSearch] = useState("");

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);
  const campaignDropdownRef = useRef<HTMLDivElement>(null);

  const isCampaignListPage =
    location.pathname === "/campaign" || location.pathname === "/campaign/";

  const isCampaignDetailPage =
    location.pathname.startsWith("/campaign/") && !isCampaignListPage;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        workspaceDropdownRef.current &&
        !workspaceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsWorkspaceDropdownOpen(false);
      }
      if (
        campaignDropdownRef.current &&
        !campaignDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCampaignDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentWorkspace = workspaces[0]; // Using first workspace as default
  const currentCampaign = campaigns[0]; // Using first campaign as default

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(workspaceSearch.toLowerCase()),
  );

  const filteredCampaigns = campaigns.filter((camp) =>
    camp.name.toLowerCase().includes(campaignSearch.toLowerCase()),
  );

  // Determine which breadcrumb to show based on route
  const isDashboardPage =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isStudioPage = location.pathname.includes("/studio");
  const isCampaignPage = location.pathname.includes("/campaign");
  const isAnalyticsPage = location.pathname.includes("/analytics");

  // Show workspace dropdown on dashboard, studio, campaign, and analytics pages
  const showWorkspace =
    isDashboardPage || isStudioPage || isCampaignPage || isAnalyticsPage;
  // Only show campaign dropdown on campaign detail pages (not list page)
  const showCampaign = isCampaignDetailPage;

  return (
    <>
      <div className="border-b border-neutral-800/50 px-6 py-3 bg-[#0a0a0a]">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Breadcrumbs */}
          <div className="flex items-center gap-3 text-sm">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center">
              <img src="/logo.svg" className="w-6 h-6" alt="Logo" />
            </Link>

            {showWorkspace && (
              <>
                <Slash className="w-3.5 h-3.5 text-neutral-600 opacity-50" />

                {/* Workspace Section */}
                <div className="relative" ref={workspaceDropdownRef}>
                  <button
                    onClick={() =>
                      setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-neutral-800/50 transition-all duration-200 group"
                  >
                    <Boxes className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-200 font-medium text-sm">
                      {currentWorkspace.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                  </button>

                  {/* Workspace Dropdown */}
                  {isWorkspaceDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/60 rounded-xl shadow-2xl py-2 z-50">
                      {/* Search Bar */}
                      <div className="px-3 pb-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                          <input
                            type="text"
                            placeholder="Find workspace..."
                            value={workspaceSearch}
                            onChange={(e) => setWorkspaceSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-1 focus:ring-[#1B9C5B]/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Workspace List */}
                      <div className="max-h-64 overflow-y-auto px-2">
                        <div className="text-xs font-semibold text-neutral-500 px-3 py-2 uppercase tracking-wider">
                          Workspaces
                        </div>
                        {filteredWorkspaces.map((workspace) => (
                          <button
                            key={workspace.id}
                            onClick={() => {
                              setIsWorkspaceDropdownOpen(false);
                              setWorkspaceSearch("");
                            }}
                            className="w-full px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800/70 rounded-lg flex items-center gap-3 transition-all duration-150 group"
                          >
                            <Boxes className="w-4 h-4 text-neutral-400 group-hover:text-neutral-300" />
                            <span className="font-medium">
                              {workspace.name}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* New Workspace Button */}
                      <div className="border-t border-neutral-800/50 mt-2 pt-2 px-2">
                        <button
                          onClick={() => setIsWorkspaceDropdownOpen(false)}
                          className="w-full px-3 py-2.5 text-sm text-[#1B9C5B] hover:bg-[#1B9C5B]/10 rounded-lg flex items-center gap-3 transition-all duration-150 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          New Workspace
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Campaign Section - Only show on campaign detail pages */}
            {showCampaign && (
              <>
                <Slash className="w-3.5 h-3.5 text-neutral-600 opacity-50" />
                <div className="relative" ref={campaignDropdownRef}>
                  <button
                    onClick={() =>
                      setIsCampaignDropdownOpen(!isCampaignDropdownOpen)
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-neutral-800/50 transition-all duration-200 group"
                  >
                    <Target className="w-4 h-4 text-[#1B9C5B]" />
                    <span className="text-neutral-200 font-medium text-sm">
                      {currentCampaign.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                  </button>

                  {/* Campaign Dropdown */}
                  {isCampaignDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/60 rounded-xl shadow-2xl py-2 z-50">
                      {/* Search Bar */}
                      <div className="px-3 pb-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                          <input
                            type="text"
                            placeholder="Find campaign..."
                            value={campaignSearch}
                            onChange={(e) => setCampaignSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-1 focus:ring-[#1B9C5B]/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Campaign List */}
                      <div className="max-h-64 overflow-y-auto px-2">
                        <div className="text-xs font-semibold text-neutral-500 px-3 py-2 uppercase tracking-wider">
                          Campaigns
                        </div>
                        {filteredCampaigns.map((campaign) => (
                          <button
                            key={campaign.id}
                            onClick={() => {
                              setIsCampaignDropdownOpen(false);
                              setCampaignSearch("");
                            }}
                            className="w-full px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800/70 rounded-lg flex items-center gap-3 transition-all duration-150 group"
                          >
                            <Target className="w-4 h-4 text-[#1B9C5B] group-hover:text-[#1B9C5B]/80" />
                            <span className="font-medium">{campaign.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* New Campaign Button */}
                      <div className="border-t border-neutral-800/50 mt-2 pt-2 px-2">
                        <button
                          onClick={() => setIsCampaignDropdownOpen(false)}
                          className="w-full px-3 py-2.5 text-sm text-[#1B9C5B] hover:bg-[#1B9C5B]/10 rounded-lg flex items-center gap-3 transition-all duration-150 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          New Campaign
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right side - Help and Profile */}
          <div className="flex items-center gap-3">
            {/* Help Button */}
            <div className="relative group">
              <button className="p-2 hover:bg-neutral-800/70 border border-neutral-800/40 rounded-lg transition-all duration-200">
                <HelpCircle className="w-4 h-4 text-neutral-400 group-hover:text-neutral-300" />
              </button>
              {/* Tooltip */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-900 text-xs text-neutral-300 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 border border-neutral-800">
                Help
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 border-l border-t border-neutral-800 rotate-45"></div>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || "Profile"}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-800/60 hover:ring-neutral-700/60 transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B9C5B] to-emerald-600 flex items-center justify-center ring-2 ring-neutral-800/60 hover:ring-neutral-700/60 transition-all">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/60 rounded-xl shadow-2xl py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-neutral-800/50">
                    <div className="flex items-center gap-3">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.fullName || "Profile"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B9C5B] to-emerald-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-100 truncate">
                          {user?.fullName || "User"}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2 px-2">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsSettingsModalOpen(true);
                      }}
                      className="w-full px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800/70 rounded-lg flex items-center gap-3 transition-all duration-150 group"
                    >
                      <Settings className="w-4 h-4 text-neutral-400 group-hover:text-neutral-300" />
                      <span className="font-medium">Account Preferences</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800/70 rounded-lg flex items-center gap-3 transition-all duration-150 group"
                    >
                      <Shield className="w-4 h-4 text-neutral-400 group-hover:text-neutral-300" />
                      <span className="font-medium">Privacy Policy</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800/70 rounded-lg flex items-center gap-3 transition-all duration-150 group"
                    >
                      <FileText className="w-4 h-4 text-neutral-400 group-hover:text-neutral-300" />
                      <span className="font-medium">Terms of Service</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-neutral-800/50 pt-2 px-2">
                    <button
                      onClick={() => signOut()}
                      className="w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-3 transition-all duration-150 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </>
  );
};

export default Breadcrumb;
