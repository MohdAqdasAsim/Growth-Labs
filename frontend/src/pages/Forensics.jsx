import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, SearchCode, TrendingUp, Eye, Users, Heart,
  MessageCircle, Share2, Play, Calendar, ExternalLink,
  Youtube, Twitter, Linkedin, Sparkles, Target, AlertCircle
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const mockCompetitors = [
  {
    id: '1',
    name: 'Alex Hormozi',
    handle: '@AlexHormozi',
    platform: 'twitter',
    avatar: 'AH',
    followers: '2.4M',
    avgEngagement: '4.2%',
    topContent: [
      { title: 'The $100M framework for offers', views: '2.1M', likes: '45K', comments: '1.2K' },
      { title: 'Why most businesses fail in year 1', views: '1.8M', likes: '38K', comments: '890' },
      { title: 'How I built Gym Launch', views: '1.5M', likes: '32K', comments: '756' },
    ],
    patterns: ['Posts 3-5x daily', 'Uses contrarian hooks', 'Heavy on value-first threads', 'Personal stories convert best'],
    growth: '+12.5%',
  },
  {
    id: '2',
    name: 'Ali Abdaal',
    handle: '@aliabdaal',
    platform: 'youtube',
    avatar: 'AA',
    followers: '5.2M',
    avgEngagement: '3.8%',
    topContent: [
      { title: 'How I Type Really Fast', views: '15M', likes: '450K', comments: '12K' },
      { title: 'My Productivity System', views: '8.2M', likes: '280K', comments: '8.5K' },
      { title: 'How to Study for Exams', views: '12M', likes: '380K', comments: '9.2K' },
    ],
    patterns: ['Consistent weekly uploads', 'Evergreen productivity topics', 'Clean thumbnails with face', 'Long-form deep dives'],
    growth: '+8.3%',
  },
  {
    id: '3',
    name: 'Justin Welsh',
    handle: '@thejustinwelsh',
    platform: 'linkedin',
    avatar: 'JW',
    followers: '580K',
    avgEngagement: '5.1%',
    topContent: [
      { title: 'The Solopreneur Playbook', views: '890K', likes: '12K', comments: '456' },
      { title: '10 lessons from $5M solo', views: '720K', likes: '9.8K', comments: '380' },
      { title: 'Why I quit my $400K job', views: '650K', likes: '8.5K', comments: '320' },
    ],
    patterns: ['Posts daily at 8am EST', 'Personal narrative style', 'Short punchy paragraphs', 'One big idea per post'],
    growth: '+15.2%',
  },
]

const mockInsights = [
  {
    type: 'opportunity',
    title: 'Untapped Topic Gap',
    description: 'Competitors rarely cover "AI tools for creators" - high search volume, low competition.',
    impact: 'High',
  },
  {
    type: 'pattern',
    title: 'Optimal Posting Time',
    description: 'Top performers post between 8-10am on weekdays. Your current schedule misses this window.',
    impact: 'Medium',
  },
  {
    type: 'warning',
    title: 'Content Format Shift',
    description: 'Short-form video is outperforming long threads by 3x in your niche. Consider format diversification.',
    impact: 'High',
  },
]

const platformIcons = { youtube: Youtube, twitter: Twitter, linkedin: Linkedin }
const platformColors = { youtube: 'text-red-500', twitter: 'text-sky-500', linkedin: 'text-blue-600' }

export default function Forensics() {
  const { theme } = useTheme()
  const [selectedCompetitor, setSelectedCompetitor] = useState(mockCompetitors[0])
  const [analyzing, setAnalyzing] = useState(false)

  const handleAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => setAnalyzing(false), 2000)
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-surface rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center">
                <SearchCode className="w-5 h-5 text-amber" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Forensics Agent</h1>
                <p className="text-xs text-text-muted">Competitor Intelligence</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleAnalyze}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm rounded-lg"
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Analysis
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber" />
                Tracked Competitors
              </h2>
              <div className="space-y-2">
                {mockCompetitors.map(comp => {
                  const PlatformIcon = platformIcons[comp.platform]
                  return (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedCompetitor(comp)}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                        selectedCompetitor.id === comp.id 
                          ? 'bg-amber/10 border border-amber/30' 
                          : 'hover:bg-surface-hover border border-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center font-bold text-sm">
                        {comp.avatar}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{comp.name}</p>
                        <p className="text-xs text-text-muted flex items-center gap-1">
                          <PlatformIcon className={`w-3 h-3 ${platformColors[comp.platform]}`} />
                          {comp.handle}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-lime">{comp.growth}</p>
                        <p className="text-xs text-text-muted">{comp.followers}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              <button className="w-full mt-4 p-2 border border-dashed border-border rounded-lg text-sm text-text-secondary hover:border-amber/50 hover:text-amber transition-colors">
                + Add Competitor
              </button>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-coral" />
                AI Insights
              </h2>
              <div className="space-y-3">
                {mockInsights.map((insight, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      insight.type === 'opportunity' ? 'bg-lime/5 border-lime/20' :
                      insight.type === 'warning' ? 'bg-coral/5 border-coral/20' :
                      'bg-cyan/5 border-cyan/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium">{insight.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        insight.impact === 'High' ? 'bg-coral/20 text-coral' : 'bg-amber/20 text-amber'
                      }`}>
                        {insight.impact}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center font-bold text-xl">
                    {selectedCompetitor.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedCompetitor.name}</h2>
                    <p className="text-text-muted flex items-center gap-2">
                      {(() => {
                        const PlatformIcon = platformIcons[selectedCompetitor.platform]
                        return <PlatformIcon className={`w-4 h-4 ${platformColors[selectedCompetitor.platform]}`} />
                      })()}
                      {selectedCompetitor.handle}
                      <ExternalLink className="w-3 h-3" />
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{selectedCompetitor.followers}</p>
                    <p className="text-xs text-text-muted">Followers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-lime">{selectedCompetitor.avgEngagement}</p>
                    <p className="text-xs text-text-muted">Engagement</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber">{selectedCompetitor.growth}</p>
                    <p className="text-xs text-text-muted">30d Growth</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan" />
                    Top Performing Content
                  </h3>
                  <div className="space-y-3">
                    {selectedCompetitor.topContent.map((content, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-bg border border-border">
                        <p className="text-sm font-medium mb-2">{content.title}</p>
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {content.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {content.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {content.comments}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber" />
                    Content Patterns
                  </h3>
                  <div className="space-y-2">
                    {selectedCompetitor.patterns.map((pattern, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-bg border border-border flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber/20 flex items-center justify-center text-xs font-bold text-amber">
                          {idx + 1}
                        </div>
                        <p className="text-sm">{pattern}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-coral" />
                Recommended Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 rounded-lg bg-coral/10 border border-coral/20 text-left hover:bg-coral/20 transition-colors group">
                  <p className="font-medium text-sm mb-1">Replicate Hook Style</p>
                  <p className="text-xs text-text-secondary">Generate 5 hooks inspired by {selectedCompetitor.name}'s best performers</p>
                </button>
                <button className="p-4 rounded-lg bg-cyan/10 border border-cyan/20 text-left hover:bg-cyan/20 transition-colors group">
                  <p className="font-medium text-sm mb-1">Fill Content Gap</p>
                  <p className="text-xs text-text-secondary">Create content for topics they haven't covered yet</p>
                </button>
                <button className="p-4 rounded-lg bg-lime/10 border border-lime/20 text-left hover:bg-lime/20 transition-colors group">
                  <p className="font-medium text-sm mb-1">Optimize Schedule</p>
                  <p className="text-xs text-text-secondary">Adjust posting times based on engagement data</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
