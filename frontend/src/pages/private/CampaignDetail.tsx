import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Target,
  Clock,
  TrendingUp,
  FileText,
  Lightbulb,
  Video,
  CheckCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Edit2,
  Play,
  Pause,
  MoreVertical,
  Trash2,
  Copy,
  Archive,
  Download,
  Sparkles,
  BarChart3,
  Zap,
  Eye,
  Activity,
  Plus,
  Rocket,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
} from "lucide-react";
import { campaigns, type Platform } from "../../data";

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

const platformColors: Record<Platform, string> = {
  instagram: "from-pink-500 to-purple-500",
  facebook: "from-blue-500 to-blue-600",
  twitter: "from-sky-400 to-blue-500",
  tiktok: "from-gray-800 to-gray-900",
  linkedin: "from-blue-600 to-blue-700",
  youtube: "from-red-500 to-red-600",
};

const statusColors = {
  active: {
    bg: "bg-[#1B9C5B]/10",
    text: "text-[#1B9C5B]",
    dot: "bg-[#1B9C5B]",
    border: "border-[#1B9C5B]/20",
  },
  draft: {
    bg: "bg-neutral-700/20",
    text: "text-neutral-400",
    dot: "bg-neutral-500",
    border: "border-neutral-700/20",
  },
  paused: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    dot: "bg-amber-500",
    border: "border-amber-500/20",
  },
  completed: {
    bg: "bg-neutral-600/20",
    text: "text-neutral-400",
    dot: "bg-neutral-500",
    border: "border-neutral-600/20",
  },
};

const tabs = [
  { id: "brief", label: "Brief", icon: FileText },
  { id: "plan", label: "Plan", icon: Lightbulb },
  { id: "studio", label: "Studio", icon: Video },
  { id: "review", label: "Review", icon: BarChart3 },
];

interface DayTask {
  id: string;
  platform: Platform;
  title: string;
  completed: boolean;
}

interface DayPlan {
  id: string;
  day: number;
  tasks: DayTask[];
}

const CampaignDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("brief");
  const [showMenu, setShowMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [planViewMode, setPlanViewMode] = useState<"list" | "grid">("list");
  const [studioLayout, setStudioLayout] = useState<"horizontal" | "vertical">(
    "horizontal",
  );

  // Day Plan state with drag and drop
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([
    {
      id: "day-1",
      day: 1,
      tasks: [
        {
          id: "1-1",
          platform: "youtube",
          title: "Define content pillars",
          completed: false,
        },
        {
          id: "1-2",
          platform: "twitter",
          title: "Create brand guidelines",
          completed: true,
        },
      ],
    },
    {
      id: "day-2",
      day: 2,
      tasks: [
        {
          id: "2-1",
          platform: "youtube",
          title: "Batch record 4 videos",
          completed: false,
        },
        {
          id: "2-2",
          platform: "twitter",
          title: "Create content calendar",
          completed: false,
        },
      ],
    },
    {
      id: "day-3",
      day: 3,
      tasks: [
        {
          id: "3-1",
          platform: "youtube",
          title: "Edit and optimize videos",
          completed: false,
        },
        {
          id: "3-2",
          platform: "twitter",
          title: "Schedule tweet threads",
          completed: true,
        },
      ],
    },
  ]);

  // Find campaign by id
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-300 mb-2">
            Campaign not found
          </h2>
          <button
            onClick={() => navigate("/campaign")}
            className="text-[#1B9C5B] hover:underline"
          >
            Back to campaigns
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = statusColors[campaign.status];
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newPlans = [...dayPlans];
    const draggedPlan = newPlans[draggedItem];
    newPlans.splice(draggedItem, 1);
    newPlans.splice(index, 0, draggedPlan);
    setDraggedItem(index);
    setDayPlans(newPlans);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // AI Generated Post
  const aiGeneratedPost = {
    title: "Building Leverage Through AI Agents in 2026",
    tagline: "How autonomous systems are reshaping business operations",
    description:
      "AI agents are no longer just tools—they're becoming integral members of modern teams. From automating complex workflows to making intelligent decisions, these systems are creating unprecedented leverage for businesses.",
    platforms: ["twitter", "youtube"] as Platform[],
    hashtags: ["#AIAgents", "#Automation", "#BusinessGrowth", "#TechTrends"],
  };

  const totalTasks = dayPlans.reduce((acc, day) => acc + day.tasks.length, 0);
  const completedTasks = dayPlans.reduce(
    (acc, day) => acc + day.tasks.filter((t) => t.completed).length,
    0,
  );

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-neutral-50 selection:bg-[#1B9C5B]/20 overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-neutral-800/50 px-8 flex items-center justify-between z-10 bg-[#0a0a0a]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-4">
              <Link
                to="/campaign"
                className="p-2 hover:bg-neutral-800/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-400" />
              </Link>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B9C5B]/10 border border-[#1B9C5B]/20 flex items-center justify-center shadow-sm">
                  <Target className="w-5 h-5 text-[#1B9C5B]" />
                </div>
                <div>
                  <h1 className="font-bold text-base tracking-tight text-neutral-100">
                    {campaign.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${campaign.status === "active" ? "animate-pulse" : ""}`}
                    />
                    <p
                      className={`text-[9px] uppercase tracking-[0.2em] font-bold ${statusStyle.text}`}
                    >
                      {campaign.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-8 flex-1 justify-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab.id
                      ? "text-[#1B9C5B]"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B9C5B]" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {campaign.status === "active" ? (
              <button className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-2">
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            ) : (
              <button className="px-4 py-2 bg-[#1B9C5B] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#1B9C5B]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#1B9C5B]/20">
                <Rocket className="w-3.5 h-3.5" />
                Launch
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-neutral-800/50 rounded-lg transition-colors border border-neutral-800/40"
              >
                <MoreVertical className="w-4 h-4 text-neutral-400" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/60 rounded-xl shadow-2xl z-50 py-2">
                  <button className="w-full px-4 py-2.5 text-left text-sm text-neutral-300 hover:bg-neutral-800/70 flex items-center gap-3 transition-all">
                    <Edit2 className="w-4 h-4" />
                    Edit Campaign
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-sm text-neutral-300 hover:bg-neutral-800/70 flex items-center gap-3 transition-all">
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-sm text-neutral-300 hover:bg-neutral-800/70 flex items-center gap-3 transition-all">
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-sm text-neutral-300 hover:bg-neutral-800/70 flex items-center gap-3 transition-all">
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                  <div className="border-t border-neutral-800/50 my-1"></div>
                  <button className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-neutral-800/70 flex items-center gap-3 transition-all">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-12 no-scrollbar bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto">
            {/* Brief Tab */}
            {activeTab === "brief" && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-[#1B9C5B]/5 via-transparent to-transparent border border-[#1B9C5B]/10 rounded-2xl p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-[#1B9C5B]/10 rounded-xl">
                      <Target className="w-6 h-6 text-[#1B9C5B]" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-[#1B9C5B] mb-3">
                        Campaign Goal
                      </h2>
                      <p className="text-2xl font-bold text-neutral-100 leading-tight">
                        {campaign.goal}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800/50">
                      <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                        Duration
                      </div>
                      <div className="text-2xl font-bold text-neutral-100">
                        {campaign.duration}
                        <span className="text-sm text-neutral-500 ml-1">
                          days
                        </span>
                      </div>
                    </div>
                    <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800/50">
                      <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                        Type
                      </div>
                      <div className="text-2xl font-bold text-neutral-100 capitalize">
                        {campaign.type}
                      </div>
                    </div>
                    <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800/50">
                      <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                        Platforms
                      </div>
                      <div className="text-2xl font-bold text-neutral-100">
                        {campaign.platforms.length}
                      </div>
                    </div>
                    <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800/50">
                      <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                        Frequency
                      </div>
                      <div className="text-lg font-bold text-neutral-100 capitalize">
                        {campaign.postingFrequency?.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-5 h-5 text-[#1B9C5B]" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                        Timeline
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500">
                          Start Date
                        </span>
                        <span className="text-sm font-semibold text-neutral-200">
                          {formatDate(campaign.startDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500">
                          End Date
                        </span>
                        <span className="text-sm font-semibold text-neutral-200">
                          {formatDate(campaign.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-[#1B9C5B]" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                        Target Metrics
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500 capitalize">
                          {campaign.metric?.replace("_", " ")}
                        </span>
                        <span className="text-sm font-semibold text-neutral-200">
                          {campaign.targetValue?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                    Active Platforms
                  </h3>
                  <div className="flex items-center gap-3">
                    {campaign.platforms.map((platform) => {
                      const Icon = platformIcons[platform];
                      const gradient = platformColors[platform];
                      return (
                        <div
                          key={platform}
                          className={`p-4 bg-gradient-to-br ${gradient} rounded-xl shadow-lg hover:scale-105 transition-transform`}
                          title={platform}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {campaign.contentThemes && (
                  <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="w-5 h-5 text-[#1B9C5B]" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                        Content Themes
                      </h3>
                    </div>
                    <p className="text-base text-neutral-300 leading-relaxed">
                      {campaign.contentThemes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Plan Tab */}
            {activeTab === "plan" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">
                      Content Plan
                    </h2>
                    <p className="text-sm text-neutral-500">
                      {dayPlans.length} days · {totalTasks} tasks ·{" "}
                      {completedTasks} completed
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-neutral-900/40 border border-neutral-800/50 rounded-lg p-1">
                      <button
                        onClick={() => setPlanViewMode("list")}
                        className={`p-2 rounded transition-all ${
                          planViewMode === "list"
                            ? "bg-[#1B9C5B] text-white"
                            : "text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPlanViewMode("grid")}
                        className={`p-2 rounded transition-all ${
                          planViewMode === "grid"
                            ? "bg-[#1B9C5B] text-white"
                            : "text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1B9C5B] hover:bg-[#1B9C5B]/90 text-white rounded-lg transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#1B9C5B]/20">
                      <Plus className="w-4 h-4" />
                      Add Day
                    </button>
                  </div>
                </div>

                {planViewMode === "list" && (
                  <div className="space-y-4">
                    {dayPlans.map((dayPlan, index) => (
                      <div
                        key={dayPlan.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-6 hover:border-[#1B9C5B]/30 transition-all cursor-move ${
                          draggedItem === index ? "opacity-50 scale-95" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <GripVertical className="w-5 h-5 text-neutral-600" />
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-neutral-100">
                              Day {dayPlan.day}
                            </h3>
                            <p className="text-xs text-neutral-500">
                              {dayPlan.tasks.length} tasks
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 ml-8">
                          {dayPlan.tasks.map((task) => {
                            const Icon = platformIcons[task.platform];
                            const gradient = platformColors[task.platform];
                            return (
                              <div
                                key={task.id}
                                className="flex items-center gap-3 bg-neutral-900/50 rounded-lg p-4 border border-neutral-800/30"
                              >
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => {
                                    const newPlans = [...dayPlans];
                                    const taskIndex = newPlans[
                                      index
                                    ].tasks.findIndex((t) => t.id === task.id);
                                    newPlans[index].tasks[taskIndex].completed =
                                      !task.completed;
                                    setDayPlans(newPlans);
                                  }}
                                  className="w-5 h-5 rounded border-2 border-neutral-700 checked:bg-[#1B9C5B] checked:border-[#1B9C5B] cursor-pointer"
                                />
                                <div
                                  className={`p-2 bg-gradient-to-br ${gradient} rounded-lg`}
                                >
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                <span
                                  className={`flex-1 text-sm font-medium ${
                                    task.completed
                                      ? "text-neutral-500 line-through"
                                      : "text-neutral-200"
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {planViewMode === "grid" && (
                  <div className="grid grid-cols-3 gap-4">
                    {dayPlans.map((dayPlan, index) => (
                      <div
                        key={dayPlan.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-5 hover:border-[#1B9C5B]/30 transition-all cursor-move ${
                          draggedItem === index ? "opacity-50 scale-95" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <GripVertical className="w-4 h-4 text-neutral-600" />
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-neutral-100">
                              Day {dayPlan.day}
                            </h3>
                            <p className="text-xs text-neutral-500">
                              {dayPlan.tasks.length} tasks
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {dayPlan.tasks.map((task) => {
                            const Icon = platformIcons[task.platform];
                            const gradient = platformColors[task.platform];
                            return (
                              <div
                                key={task.id}
                                className="flex items-center gap-2 bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/30"
                              >
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => {
                                    const newPlans = [...dayPlans];
                                    const taskIndex = newPlans[
                                      index
                                    ].tasks.findIndex((t) => t.id === task.id);
                                    newPlans[index].tasks[taskIndex].completed =
                                      !task.completed;
                                    setDayPlans(newPlans);
                                  }}
                                  className="w-4 h-4 rounded border-2 border-neutral-700 checked:bg-[#1B9C5B] checked:border-[#1B9C5B] cursor-pointer flex-shrink-0"
                                />
                                <div
                                  className={`p-1.5 bg-gradient-to-br ${gradient} rounded-md flex-shrink-0`}
                                >
                                  <Icon className="w-3 h-3 text-white" />
                                </div>
                                <span
                                  className={`flex-1 text-xs font-medium ${
                                    task.completed
                                      ? "text-neutral-500 line-through"
                                      : "text-neutral-200"
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Studio Tab - With Layout Toggle */}
            {activeTab === "studio" && (
              <div className="space-y-6">
                {/* Header with Layout Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">
                      Content Studio
                    </h2>
                    <p className="text-sm text-neutral-500">
                      AI-powered content generation
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Layout Toggle with Icons */}
                    <div className="flex items-center gap-1 bg-neutral-900/40 border border-neutral-800/50 rounded-lg p-1">
                      <button
                        onClick={() => {
                          setStudioLayout("horizontal");
                          setSidebarCollapsed(false);
                        }}
                        className={`p-2 rounded transition-all ${
                          studioLayout === "horizontal"
                            ? "bg-[#1B9C5B] text-white"
                            : "text-neutral-500 hover:text-neutral-300"
                        }`}
                        title="Side by Side"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStudioLayout("vertical")}
                        className={`p-2 rounded transition-all ${
                          studioLayout === "vertical"
                            ? "bg-[#1B9C5B] text-white"
                            : "text-neutral-500 hover:text-neutral-300"
                        }`}
                        title="Stacked"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horizontal Layout */}
                {studioLayout === "horizontal" && (
                  <div className="flex gap-6">
                    {/* Main Content */}
                    <div
                      className={`transition-all duration-300 ${sidebarCollapsed ? "flex-1" : "w-[65%]"}`}
                    >
                      <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-[#1B9C5B]/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-[#1B9C5B]" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                            AI Generated
                          </span>
                        </div>

                        <h2 className="text-3xl font-bold text-neutral-100 mb-3 leading-tight">
                          {aiGeneratedPost.title}
                        </h2>
                        <p className="text-lg text-neutral-400 mb-6 font-light">
                          {aiGeneratedPost.tagline}
                        </p>
                        <p className="text-neutral-300 leading-relaxed mb-8 text-base">
                          {aiGeneratedPost.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {aiGeneratedPost.hashtags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1.5 bg-[#1B9C5B]/10 text-[#1B9C5B] text-sm rounded-lg border border-[#1B9C5B]/20 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar - Preview & Activity (No Scrollbar - Display All Content) */}
                    {!sidebarCollapsed && (
                      <div className="w-[35%] bg-neutral-900/20 border border-neutral-800/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                            Preview & Activity
                          </h3>
                          <button
                            onClick={() => setSidebarCollapsed(true)}
                            className="p-1.5 hover:bg-neutral-800/50 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 text-neutral-500" />
                          </button>
                        </div>

                        <div className="space-y-8">
                          {/* Live Preview Section - Compact */}
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Eye className="w-4 h-4 text-[#1B9C5B]" />
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                Live Preview
                              </span>
                            </div>
                            <div className="bg-black rounded-xl p-4 border border-neutral-800">
                              <div className="flex gap-2">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#1B9C5B] to-emerald-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                      B
                                    </span>
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-2 flex-wrap">
                                    <span className="text-white font-bold text-[13px]">
                                      Brand Name
                                    </span>
                                    <svg
                                      viewBox="0 0 22 22"
                                      className="w-[14px] h-[14px] fill-[#1d9bf0] flex-shrink-0"
                                    >
                                      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                                    </svg>
                                    <span className="text-[#71767b] text-[12px]">
                                      @brandname · 2h
                                    </span>
                                  </div>

                                  <div className="text-white text-[13px] leading-[18px] mb-2">
                                    <p className="mb-2 font-medium">
                                      {aiGeneratedPost.title}
                                    </p>
                                    <p className="text-[#71767b] text-[12px] mb-2">
                                      {aiGeneratedPost.tagline}
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {aiGeneratedPost.hashtags
                                      .slice(0, 3)
                                      .map((tag) => (
                                        <span
                                          key={tag}
                                          className="text-[#1d9bf0] text-[12px]"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                  </div>

                                  <div className="flex items-center justify-between pt-2 text-[#71767b] border-t border-neutral-800">
                                    <div className="flex items-center gap-1">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-[14px] h-[14px] fill-current"
                                      >
                                        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                                      </svg>
                                      <span className="text-[11px]">42</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-[14px] h-[14px] fill-current"
                                      >
                                        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
                                      </svg>
                                      <span className="text-[11px]">128</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-[14px] h-[14px] fill-current"
                                      >
                                        <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                                      </svg>
                                      <span className="text-[11px]">892</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-[14px] h-[14px] fill-current"
                                      >
                                        <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
                                      </svg>
                                      <span className="text-[11px]">2.4K</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-neutral-800/50"></div>

                          {/* Analytics Section */}
                          <div className="space-y-6">
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <Target className="w-4 h-4 text-[#1B9C5B]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                  Goal Tracking
                                </span>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between mb-2">
                                    <span className="text-xs text-neutral-500">
                                      Progress
                                    </span>
                                    <span className="text-xs font-bold text-[#1B9C5B]">
                                      67%
                                    </span>
                                  </div>
                                  <div className="w-full bg-neutral-800 rounded-full h-2">
                                    <div
                                      className="bg-[#1B9C5B] h-2 rounded-full"
                                      style={{ width: "67%" }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-neutral-500">
                                    Current
                                  </span>
                                  <span className="font-bold text-neutral-200">
                                    67K
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-4 h-4 text-[#1B9C5B]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                  Metrics
                                </span>
                              </div>
                              <div className="space-y-3">
                                {["Leads", "Conversion", "Projects"].map(
                                  (metric) => (
                                    <div
                                      key={metric}
                                      className="flex justify-between text-xs"
                                    >
                                      <span className="text-neutral-500">
                                        {metric}
                                      </span>
                                      <span className="font-bold text-neutral-200">
                                        {Math.floor(Math.random() * 1000)}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-4 h-4 text-[#1B9C5B]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                  Strategy
                                </span>
                              </div>
                              <div className="space-y-2">
                                {["Engagement Focus", "Authority Build"].map(
                                  (strategy) => (
                                    <div
                                      key={strategy}
                                      className="text-xs text-neutral-300 py-1"
                                    >
                                      • {strategy}
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Collapse Button */}
                    {sidebarCollapsed && (
                      <button
                        onClick={() => setSidebarCollapsed(false)}
                        className="p-2 hover:bg-neutral-800/50 rounded-lg transition-colors h-fit"
                      >
                        <ChevronLeft className="w-5 h-5 text-neutral-500" />
                      </button>
                    )}
                  </div>
                )}

                {/* Vertical Layout */}
                {studioLayout === "vertical" && (
                  <div className="space-y-6">
                    {/* Main Content */}
                    <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#1B9C5B]/10 rounded-lg">
                          <Sparkles className="w-5 h-5 text-[#1B9C5B]" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                          AI Generated
                        </span>
                      </div>

                      <h2 className="text-3xl font-bold text-neutral-100 mb-3 leading-tight">
                        {aiGeneratedPost.title}
                      </h2>
                      <p className="text-lg text-neutral-400 mb-6 font-light">
                        {aiGeneratedPost.tagline}
                      </p>
                      <p className="text-neutral-300 leading-relaxed mb-8 text-base">
                        {aiGeneratedPost.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {aiGeneratedPost.hashtags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 bg-[#1B9C5B]/10 text-[#1B9C5B] text-sm rounded-lg border border-[#1B9C5B]/20 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Preview & Activity - Below */}
                    <div className="bg-neutral-900/20 border border-neutral-800/30 rounded-xl p-8">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-8">
                        Preview & Activity
                      </h3>

                      <div className="grid grid-cols-2 gap-8">
                        {/* Left Column - Live Preview (Bigger) */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Eye className="w-5 h-5 text-[#1B9C5B]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                              Live Preview
                            </span>
                          </div>
                          {/* Full-size Twitter/X Post Preview */}
                          <div className="bg-black rounded-2xl p-6 border border-neutral-800">
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#1B9C5B] to-emerald-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">
                                    B
                                  </span>
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 mb-2">
                                  <span className="text-white font-bold text-[15px] hover:underline">
                                    Brand Name
                                  </span>
                                  <svg
                                    viewBox="0 0 22 22"
                                    className="w-[18px] h-[18px] fill-[#1d9bf0]"
                                  >
                                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                                  </svg>
                                  <span className="text-[#71767b] text-[15px]">
                                    @brandname
                                  </span>
                                  <span className="text-[#71767b] text-[15px]">
                                    ·
                                  </span>
                                  <span className="text-[#71767b] text-[15px] hover:underline">
                                    2h
                                  </span>
                                </div>

                                <div className="text-white text-[15px] leading-[20px] mb-3">
                                  <p className="mb-3">
                                    {aiGeneratedPost.title}
                                  </p>
                                  <p className="text-[#71767b] mb-3">
                                    {aiGeneratedPost.tagline}
                                  </p>
                                  <p className="text-[14px] leading-[19px]">
                                    {aiGeneratedPost.description}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-3">
                                  {aiGeneratedPost.hashtags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[#1d9bf0] text-[15px] hover:underline"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                <div className="flex items-center justify-between pt-3 max-w-md text-[#71767b] border-t border-neutral-800">
                                  <button className="flex items-center gap-2 group hover:text-[#1d9bf0] transition-colors">
                                    <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-[18px] h-[18px] fill-current"
                                      >
                                        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                                      </svg>
                                    </div>
                                    <span className="text-[13px]">42</span>
                                  </button>

                                  <button className="flex items-center gap-2 group hover:text-[#00ba7c] transition-colors">
                                    <div className="p-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-[18px] h-[18px] fill-current"
                                      >
                                        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
                                      </svg>
                                    </div>
                                    <span className="text-[13px]">128</span>
                                  </button>

                                  <button className="flex items-center gap-2 group hover:text-[#f91880] transition-colors">
                                    <div className="p-2 rounded-full group-hover:bg-[#f91880]/10 transition-colors">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-[18px] h-[18px] fill-current"
                                      >
                                        <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                                      </svg>
                                    </div>
                                    <span className="text-[13px]">892</span>
                                  </button>

                                  <button className="flex items-center gap-2 group hover:text-[#1d9bf0] transition-colors">
                                    <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-[18px] h-[18px] fill-current"
                                      >
                                        <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
                                      </svg>
                                    </div>
                                    <span className="text-[13px]">2.4K</span>
                                  </button>

                                  <button className="flex items-center gap-2 group hover:text-[#1d9bf0] transition-colors">
                                    <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-[18px] h-[18px] fill-current"
                                      >
                                        <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
                                      </svg>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Analytics */}
                        <div className="space-y-6">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Target className="w-4 h-4 text-[#1B9C5B]" />
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                Goal Tracking
                              </span>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-xs text-neutral-500">
                                    Progress
                                  </span>
                                  <span className="text-xs font-bold text-[#1B9C5B]">
                                    67%
                                  </span>
                                </div>
                                <div className="w-full bg-neutral-800 rounded-full h-2">
                                  <div
                                    className="bg-[#1B9C5B] h-2 rounded-full"
                                    style={{ width: "67%" }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-neutral-500">
                                  Current
                                </span>
                                <span className="font-bold text-neutral-200">
                                  67K
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Activity className="w-4 h-4 text-[#1B9C5B]" />
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                Metrics
                              </span>
                            </div>
                            <div className="space-y-3">
                              {["Leads", "Conversion", "Projects"].map(
                                (metric) => (
                                  <div
                                    key={metric}
                                    className="flex justify-between text-xs"
                                  >
                                    <span className="text-neutral-500">
                                      {metric}
                                    </span>
                                    <span className="font-bold text-neutral-200">
                                      {Math.floor(Math.random() * 1000)}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Zap className="w-4 h-4 text-[#1B9C5B]" />
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                Strategy
                              </span>
                            </div>
                            <div className="space-y-2">
                              {["Engagement Focus", "Authority Build"].map(
                                (strategy) => (
                                  <div
                                    key={strategy}
                                    className="text-xs text-neutral-300 py-1"
                                  >
                                    • {strategy}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Review Tab */}
            {activeTab === "review" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">
                    Campaign Analysis
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Performance metrics and insights
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {[
                    { label: "Total Reach", val: "2.4M", change: "+18%" },
                    { label: "Engagement", val: "67K", change: "+24%" },
                    { label: "Conversion", val: "3.8%", change: "+2%" },
                    { label: "Posts", val: "124", change: "On track" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-6"
                    >
                      <div className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
                        {stat.label}
                      </div>
                      <div className="text-3xl font-bold text-neutral-100 mb-2">
                        {stat.val}
                      </div>
                      <div
                        className={`text-sm font-bold ${i < 3 ? "text-[#1B9C5B]" : "text-neutral-500"}`}
                      >
                        {stat.change}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-6">
                    Performance Analytics
                  </h3>
                  <div className="space-y-6">
                    {campaign.platforms.slice(0, 3).map((platform, index) => {
                      const Icon = platformIcons[platform];
                      const performance = [78, 65, 82][index];
                      return (
                        <div key={platform} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-neutral-400" />
                              <span className="text-sm font-medium text-neutral-300 capitalize">
                                {platform}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-neutral-200">
                              {performance}%
                            </span>
                          </div>
                          <div className="w-full bg-neutral-800 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-[#1B9C5B] to-emerald-400 h-3 rounded-full transition-all"
                              style={{ width: `${performance}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-6">
                    Engagement Trends
                  </h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {[40, 65, 55, 80, 70, 90, 85, 75, 95, 88, 78, 92].map(
                      (height, i) => (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div
                            className="w-full bg-gradient-to-t from-[#1B9C5B] to-emerald-400 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                            style={{ height: `${height}%` }}
                          ></div>
                          <span className="text-xs text-neutral-600">
                            {i + 1}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CampaignDetail;
