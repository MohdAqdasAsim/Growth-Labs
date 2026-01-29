import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, BarChart3, TrendingUp, TrendingDown, Eye, Users,
  Heart, MessageCircle, Share2, Calendar, Clock, Target,
  Youtube, Twitter, Linkedin, Sparkles, ArrowUpRight, ArrowDownRight,
  Zap, Award, AlertTriangle, CheckCircle
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const mockPerformanceData = {
  overview: {
    totalViews: '2.4M',
    viewsChange: '+18.5%',
    totalEngagement: '89.2K',
    engagementChange: '+12.3%',
    followers: '45.2K',
    followersChange: '+8.7%',
    avgEngRate: '3.72%',
    engRateChange: '-0.3%',
  },
  topPerformers: [
    { id: '1', title: '5 AI tools every creator needs', platform: 'twitter', views: '125K', engagement: '8.2K', engRate: '6.5%', status: 'viral' },
    { id: '2', title: 'How I 10x my productivity', platform: 'youtube', views: '89K', engagement: '5.1K', engRate: '5.7%', status: 'trending' },
    { id: '3', title: 'The Solopreneur Pivot - Ep 1', platform: 'youtube', views: '67K', engagement: '4.2K', engRate: '6.2%', status: 'steady' },
    { id: '4', title: 'LinkedIn growth strategy thread', platform: 'linkedin', views: '45K', engagement: '3.8K', engRate: '8.4%', status: 'viral' },
  ],
  underperformers: [
    { id: '5', title: 'Weekly update #12', platform: 'twitter', views: '2.1K', engagement: '89', engRate: '4.2%', issue: 'Low reach' },
    { id: '6', title: 'Tech review: New laptop', platform: 'youtube', views: '5.2K', engagement: '156', engRate: '3.0%', issue: 'Off-brand' },
  ],
  platformBreakdown: [
    { platform: 'twitter', followers: '28K', posts: 45, avgEngRate: '4.2%', topPost: '5 AI tools thread', change: '+15%' },
    { platform: 'youtube', followers: '12K', posts: 8, avgEngRate: '5.8%', topPost: 'Productivity video', change: '+22%' },
    { platform: 'linkedin', followers: '5.2K', posts: 12, avgEngRate: '7.1%', topPost: 'Growth strategy', change: '+31%' },
  ],
  insights: [
    { type: 'success', title: 'Thread format wins', description: 'Your Twitter threads get 3.2x more engagement than single tweets.' },
    { type: 'warning', title: 'YouTube consistency', description: 'Upload frequency dropped 40% this month. Algorithm favors consistency.' },
    { type: 'opportunity', title: 'LinkedIn momentum', description: 'Highest engagement rate. Consider increasing post frequency here.' },
    { type: 'tip', title: 'Best posting time', description: 'Your content performs 45% better when posted between 9-11am EST.' },
  ],
  weeklyData: [
    { day: 'Mon', views: 45000, engagement: 2800 },
    { day: 'Tue', views: 52000, engagement: 3200 },
    { day: 'Wed', views: 48000, engagement: 2900 },
    { day: 'Thu', views: 61000, engagement: 4100 },
    { day: 'Fri', views: 55000, engagement: 3500 },
    { day: 'Sat', views: 38000, engagement: 2200 },
    { day: 'Sun', views: 42000, engagement: 2600 },
  ],
}

const platformIcons = { youtube: Youtube, twitter: Twitter, linkedin: Linkedin }
const platformColors = { youtube: 'text-red-500 bg-red-500/10', twitter: 'text-sky-500 bg-sky-500/10', linkedin: 'text-blue-600 bg-blue-600/10' }

function StatCard({ label, value, change, icon: Icon, color }) {
  const isPositive = change?.startsWith('+')
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        {change && (
          <span className={`text-xs font-medium flex items-center gap-1 ${isPositive ? 'text-lime' : 'text-coral'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  )
}

function MiniChart({ data }) {
  const max = Math.max(...data.map(d => d.views))
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full bg-cyan/30 rounded-t hover:bg-cyan/50 transition-colors"
            style={{ height: `${(d.views / max) * 100}%` }}
          />
          <span className="text-[10px] text-text-muted">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { theme } = useTheme()
  const [timeRange, setTimeRange] = useState('30d')

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-surface rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-lime" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Outcome Agent</h1>
                <p className="text-xs text-text-muted">Performance Analytics</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface border border-border rounded-lg p-1">
              {['7d', '30d', '90d'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    timeRange === range ? 'bg-coral text-bg' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm rounded-lg">
              <Sparkles className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Views" value={mockPerformanceData.overview.totalViews} change={mockPerformanceData.overview.viewsChange} icon={Eye} color="bg-cyan/10 text-cyan" />
          <StatCard label="Engagement" value={mockPerformanceData.overview.totalEngagement} change={mockPerformanceData.overview.engagementChange} icon={Heart} color="bg-coral/10 text-coral" />
          <StatCard label="Followers" value={mockPerformanceData.overview.followers} change={mockPerformanceData.overview.followersChange} icon={Users} color="bg-amber/10 text-amber" />
          <StatCard label="Avg Eng. Rate" value={mockPerformanceData.overview.avgEngRate} change={mockPerformanceData.overview.engRateChange} icon={TrendingUp} color="bg-lime/10 text-lime" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan" />
                  Weekly Performance
                </h2>
                <span className="text-xs text-text-muted">Views over time</span>
              </div>
              <MiniChart data={mockPerformanceData.weeklyData} />
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber" />
                Top Performers
              </h2>
              <div className="space-y-3">
                {mockPerformanceData.topPerformers.map((item, idx) => {
                  const PlatformIcon = platformIcons[item.platform]
                  return (
                    <div key={item.id} className="p-3 rounded-lg bg-bg border border-border flex items-center justify-between hover:border-border-hover transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-border/50 flex items-center justify-center font-bold text-sm text-text-muted">
                          #{idx + 1}
                        </div>
                        <div className={`w-8 h-8 rounded-lg ${platformColors[item.platform]} flex items-center justify-center`}>
                          <PlatformIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <div className="flex items-center gap-3 text-xs text-text-muted">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.views}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {item.engagement}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-lime">{item.engRate}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.status === 'viral' ? 'bg-coral/20 text-coral' :
                          item.status === 'trending' ? 'bg-amber/20 text-amber' :
                          'bg-surface text-text-muted'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-coral" />
                Needs Attention
              </h2>
              <div className="space-y-3">
                {mockPerformanceData.underperformers.map(item => {
                  const PlatformIcon = platformIcons[item.platform]
                  return (
                    <div key={item.id} className="p-3 rounded-lg bg-coral/5 border border-coral/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${platformColors[item.platform]} flex items-center justify-center`}>
                          <PlatformIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-coral">{item.issue}</p>
                        </div>
                      </div>
                      <button className="text-xs px-3 py-1 rounded-lg bg-coral/20 text-coral hover:bg-coral/30 transition-colors">
                        Analyze
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan" />
                Platform Breakdown
              </h2>
              <div className="space-y-3">
                {mockPerformanceData.platformBreakdown.map(platform => {
                  const PlatformIcon = platformIcons[platform.platform]
                  return (
                    <div key={platform.platform} className="p-3 rounded-lg bg-bg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${platformColors[platform.platform]} flex items-center justify-center`}>
                            <PlatformIcon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm capitalize">{platform.platform}</span>
                        </div>
                        <span className="text-xs text-lime">{platform.change}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-sm font-bold">{platform.followers}</p>
                          <p className="text-[10px] text-text-muted">Followers</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{platform.posts}</p>
                          <p className="text-[10px] text-text-muted">Posts</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-lime">{platform.avgEngRate}</p>
                          <p className="text-[10px] text-text-muted">Eng Rate</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-coral" />
                AI Insights
              </h2>
              <div className="space-y-3">
                {mockPerformanceData.insights.map((insight, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      insight.type === 'success' ? 'bg-lime/5 border-lime/20' :
                      insight.type === 'warning' ? 'bg-amber/5 border-amber/20' :
                      insight.type === 'opportunity' ? 'bg-cyan/5 border-cyan/20' :
                      'bg-surface border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {insight.type === 'success' && <CheckCircle className="w-3 h-3 text-lime" />}
                      {insight.type === 'warning' && <AlertTriangle className="w-3 h-3 text-amber" />}
                      {insight.type === 'opportunity' && <TrendingUp className="w-3 h-3 text-cyan" />}
                      {insight.type === 'tip' && <Zap className="w-3 h-3 text-coral" />}
                      <p className="text-xs font-medium">{insight.title}</p>
                    </div>
                    <p className="text-xs text-text-secondary">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-coral/20 to-amber/20 border border-coral/30 rounded-xl p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-coral" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full p-2 rounded-lg bg-bg/50 text-left text-sm hover:bg-bg/80 transition-colors">
                  Double down on threads
                </button>
                <button className="w-full p-2 rounded-lg bg-bg/50 text-left text-sm hover:bg-bg/80 transition-colors">
                  Schedule more LinkedIn posts
                </button>
                <button className="w-full p-2 rounded-lg bg-bg/50 text-left text-sm hover:bg-bg/80 transition-colors">
                  Republish underperformers
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
