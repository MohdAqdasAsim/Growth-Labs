import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Clock,
} from "lucide-react";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#1B9C5B]/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-[#1B9C5B]" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-50">Analytics</h1>
          </div>
          <p className="text-neutral-400 text-base">
            Track your performance and insights across all platforms
          </p>
        </div>

        {/* Coming Soon Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900/50 via-neutral-900/30 to-transparent border border-neutral-800/50 rounded-2xl p-12 mb-8">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1B9C5B]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B9C5B]/10 border border-[#1B9C5B]/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#1B9C5B]" />
              <span className="text-sm font-medium text-[#1B9C5B]">
                Coming Soon
              </span>
            </div>

            <h2 className="text-4xl font-bold text-neutral-100 mb-4">
              Advanced Analytics Dashboard
            </h2>

            <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
              Get deep insights into your content performance with real-time
              analytics, audience demographics, engagement metrics, and
              AI-powered recommendations.
            </p>

            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-300">In Development</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Feature Card 1 */}
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6 hover:border-neutral-700/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#1B9C5B]/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#1B9C5B]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-100">
                Performance Tracking
              </h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Monitor your growth metrics, engagement rates, and content
              performance across all platforms in real-time.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6 hover:border-neutral-700/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-100">
                Audience Insights
              </h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Understand your audience demographics, behavior patterns, and
              preferences to create better content.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6 hover:border-neutral-700/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-100">
                AI Recommendations
              </h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Get personalized suggestions on optimal posting times, content
              types, and engagement strategies.
            </p>
          </div>

          {/* Feature Card 4 */}
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6 hover:border-neutral-700/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <Eye className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-100">
                Content Analytics
              </h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Deep dive into individual post performance with detailed metrics
              on reach, impressions, and engagement.
            </p>
          </div>

          {/* Feature Card 5 */}
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6 hover:border-neutral-700/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-pink-500/10 rounded-lg">
                <Heart className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-100">
                Engagement Metrics
              </h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Track likes, comments, shares, and saves to understand what
              content resonates with your audience.
            </p>
          </div>

          {/* Feature Card 6 */}
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-6 hover:border-neutral-700/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-cyan-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-100">
                Historical Data
              </h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Access historical performance data and compare trends over time to
              identify growth opportunities.
            </p>
          </div>
        </div>

        {/* Mock Metrics Preview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-5 opacity-50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-neutral-800/50 rounded-lg">
                <Eye className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>12.5%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-100 mb-1">--</div>
            <p className="text-sm text-neutral-400">Total Reach</p>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-5 opacity-50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-neutral-800/50 rounded-lg">
                <Heart className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>8.2%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-100 mb-1">--</div>
            <p className="text-sm text-neutral-400">Engagement</p>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-5 opacity-50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-neutral-800/50 rounded-lg">
                <MessageCircle className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>15.3%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-100 mb-1">--</div>
            <p className="text-sm text-neutral-400">Comments</p>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-5 opacity-50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-neutral-800/50 rounded-lg">
                <Share2 className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>9.7%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-100 mb-1">--</div>
            <p className="text-sm text-neutral-400">Shares</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
