import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Home, FileText, Target, Calendar, Settings, Plus, Search,
  Youtube, Twitter, Linkedin, ChevronRight, MoreHorizontal,
  TrendingUp, Clock, CheckCircle2, ChevronLeft, Sun, Moon, Pen,
  Sparkles, Zap, ShieldAlert, BarChart3, ArrowRight, UserPlus,
  Rocket, BrainCircuit, SearchCode, History
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const platformIcons = { youtube: Youtube, twitter: Twitter, linkedin: Linkedin }

const mockContent = [
  { id: '1', title: '5 AI tools every creator needs', platform: 'twitter', status: 'draft', campaign: 'AI Tools Deep Dive', updated: '2h ago', scheduledDate: null },
  { id: '2', title: 'Introduction to Solopreneur Life', platform: 'youtube', status: 'published', campaign: 'The Solopreneur Pivot', updated: '1d ago', scheduledDate: '2026-01-20' },
  { id: '3', title: 'Week 1 Results: What worked', platform: 'youtube', status: 'scheduled', campaign: 'The Solopreneur Pivot', updated: '3d ago', scheduledDate: '2026-01-25' },
  { id: '4', title: 'Building in public thread', platform: 'twitter', status: 'draft', campaign: 'Creator Economy 101', updated: '5h ago', scheduledDate: null },
  { id: '5', title: 'Remote work setup guide', platform: 'linkedin', status: 'published', campaign: 'Digital Nomad Series', updated: '1w ago', scheduledDate: '2026-01-18' },
]

const statusColors = {
  draft: 'text-text-secondary',
  scheduled: 'text-amber',
  published: 'text-lime',
  planning: 'text-amber',
  active: 'text-cyan',
  completed: 'text-lime',
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'content', icon: FileText, label: 'Content' },
  { id: 'campaigns', icon: Target, label: 'Campaigns' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
]

function IconSidebar({ activeView, setActiveView }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="w-14 bg-sidebar border-r border-border flex flex-col items-center py-4 gap-1 fixed left-0 top-0 h-screen">
      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center mb-4 border border-border">
        <Pen className="w-4 h-4 text-coral" />
      </div>

      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveView(item.id)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            activeView === item.id
              ? 'bg-surface text-coral border border-border'
              : 'text-text-secondary hover:bg-surface hover:text-text'
          }`}
          title={item.label}
        >
          <item.icon className="w-5 h-5" />
        </button>
      ))}

      <div className="flex-1" />

      <button
        onClick={toggleTheme}
        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface transition-colors"
        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-text-secondary" /> : <Moon className="w-5 h-5 text-text-secondary" />}
      </button>

      <button
        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface transition-colors"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-text-secondary" />
      </button>
    </div>
  )
}

function OnboardingGate() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] max-w-2xl mx-auto text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center mb-8 border border-border shadow-xl">
        <BrainCircuit className="w-10 h-10 text-coral" />
      </div>
      <h1 className="text-3xl font-bold mb-4 tracking-tight">Complete your Creator Profile</h1>
      <p className="text-text-secondary text-lg mb-10 leading-relaxed">
        Our AI agents need to understand your style, goals, and audience before they can start helping you grow.
      </p>
      <Link to="/onboarding" className="btn-primary px-8 py-4 rounded-xl text-lg flex items-center gap-3 group transition-all hover:scale-105 active:scale-95">
        <UserPlus className="w-5 h-5" />
        Start Profile Setup
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>
      
      <div className="mt-16 grid grid-cols-3 gap-8 w-full">
        <div className="p-4 rounded-xl bg-surface/50 border border-border">
          <Sparkles className="w-5 h-5 text-cyan mb-3 mx-auto" />
          <p className="text-sm font-medium">Style Analysis</p>
          <p className="text-xs text-text-muted mt-1">Learns your unique voice</p>
        </div>
        <div className="p-4 rounded-xl bg-surface/50 border border-border">
          <Target className="w-5 h-5 text-amber mb-3 mx-auto" />
          <p className="text-sm font-medium">Goal Alignment</p>
          <p className="text-xs text-text-muted mt-1">Focuses on your targets</p>
        </div>
        <div className="p-4 rounded-xl bg-surface/50 border border-border">
          <Linkedin className="w-5 h-5 text-lime mb-3 mx-auto" />
          <p className="text-sm font-medium">Platform Prep</p>
          <p className="text-xs text-text-muted mt-1">Optimizes for each network</p>
        </div>
      </div>
    </div>
  )
}

function GoalInput({ onGoalSubmit }) {
  const [goal, setGoal] = useState('')
  const { theme } = useTheme()

  return (
    <div className="max-w-3xl mx-auto mb-20">
      <div className="relative group">
            {/* Subtle Glowing Background */}
            <div className={`absolute inset-3 rounded-[2rem] blur-lg transition-opacity duration-500 opacity-20 group-hover:opacity-30 ${
              theme === 'dark' ? 'bg-white' : 'bg-black'
            }`} />
            
            <div className="relative bg-surface border border-border rounded-2xl p-4 shadow-xl flex flex-col">
              <div className="flex items-center gap-4 px-2 py-1">
                <Sparkles className="w-5 h-5 text-coral shrink-0" />
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What should we build today?"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-lg placeholder:text-text-muted/40 font-medium"
                  onKeyDown={(e) => e.key === 'Enter' && onGoalSubmit(goal)}
                />
                <button 
                  onClick={() => onGoalSubmit(goal)}
                  className="bg-coral text-bg px-6 py-2.5 rounded-xl font-bold text-base transition-all flex items-center gap-2 hover:opacity-90 active:scale-95"
                >
                  Go <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 px-2">
                {['Plan YouTube series', 'Analyze competitors', 'Generate 5 tweets'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setGoal(tag)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-border/20 text-text-secondary hover:bg-border/40 hover:text-text transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
        </div>
      </div>
    )
  }
  
  function AgentCard({ title, desc, icon: Icon, color, onClick }) {
    return (
      <button 
        onClick={onClick}
        className="group relative flex flex-col p-3.5 rounded-xl bg-surface border border-border hover:border-border-light transition-all hover:shadow-xl text-left h-full"
      >
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
          <Icon className="w-4.5 h-4.5 text-bg" />
        </div>
        <h3 className="text-sm font-semibold mb-1 flex items-center justify-between">
          {title}
          <ChevronRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </h3>
        <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">{desc}</p>
      </button>
    )
  }

function ActiveCampaignCard({ campaign }) {
  if (!campaign) return null
  
  return (
    <div className="max-w-3xl mx-auto mb-8">
      <Link 
        to={`/campaigns/${campaign.id}`}
        className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:bg-surface-hover transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-cyan" />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Active Campaign</p>
            <h3 className="text-sm font-semibold text-text">{campaign.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-text-muted">Progress</p>
            <p className="text-sm font-medium text-text">{campaign.posts} posts scheduled</p>
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  )
}

export default function Dashboard() {
  const [activeView, setActiveView] = useState('home')
  const [onboardingComplete, setOnboardingComplete] = useState(null) // null, true, false
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [content, setContent] = useState(mockContent)
  const [campaigns, setCampaigns] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const checkOnboarding = () => {
      const profile = localStorage.getItem('creatorProfile')
      if (profile) {
        try {
          const parsed = JSON.parse(profile)
          setOnboardingComplete(parsed.onboarded === true)
        } catch {
          setOnboardingComplete(false)
        }
      } else {
        setOnboardingComplete(false)
      }
    }

    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns')
        if (response.ok) {
          const data = await response.json()
          setCampaigns(data)
          const active = data.find(c => c.status === 'active' || c.status === 'IN_PROGRESS')
          if (active) {
            setActiveCampaign({
              id: active.campaign_id,
              name: active.name || active.goal?.title || 'Current Campaign',
              posts: active.plan ? Object.keys(active.plan).length : 5
            })
          }
        }
      } catch {}
    }

    checkOnboarding()
    fetchCampaigns()
  }, [])

  const handleGoalSubmit = (goal) => {
    if (!goal.trim()) return
    navigate('/campaigns/plan', { state: { initialGoal: goal } })
  }

  return (
    <div className="min-h-screen flex bg-bg text-text selection:bg-coral/30">
      <IconSidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 ml-14">
        {onboardingComplete === false ? (
          <div className="p-6">
            <OnboardingGate />
          </div>
        ) : (
          <>
            <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-sm border-b border-border px-6 py-4">
              <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Pen className="w-5 h-5 text-coral" />
                    <span className="font-bold tracking-tight text-lg">Super Engine</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-sm text-text-secondary hover:text-text transition-colors">Docs</button>
                  <button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm rounded-lg">
                    <Plus className="w-4 h-4" />
                    New Content
                  </button>
                </div>
              </div>
            </header>

            <div className="p-6 max-w-7xl mx-auto w-full">
              {activeView === 'home' && (
                <div className="py-8">
                  <ActiveCampaignCard campaign={activeCampaign} />
                  
                  <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold mb-3 tracking-tight bg-gradient-to-r from-text to-text-muted bg-clip-text text-transparent">
                      What should we build today?
                    </h1>
                    <p className="text-text-secondary">Your AI agents are ready to help you grow.</p>
                  </div>

                  <GoalInput onGoalSubmit={handleGoalSubmit} />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <AgentCard 
                        title="Create Content"
                        desc="Generate scripts, titles, or posts optimized for your voice and audience."
                        icon={Pen}
                        color="bg-coral"
                        onClick={() => navigate('/content/new')}
                      />
                      <AgentCard 
                        title="Plan Campaign"
                        desc="Set a high-level goal and let Strategy & Planner agents build the roadmap."
                        icon={Target}
                        color="bg-cyan"
                        onClick={() => navigate('/campaigns/plan')}
                      />
                      <AgentCard 
                        title="Spy on Rivals"
                        desc="Forensics agent analyzes competitor patterns to find what's working for them."
                        icon={SearchCode}
                        color="bg-amber"
                        onClick={() => navigate('/forensics')}
                      />
                      <AgentCard 
                        title="Review Results"
                        desc="Outcome agent analyzes past performance to help you get smarter every day."
                        icon={BarChart3}
                        color="bg-lime"
                        onClick={() => navigate('/analytics')}
                      />
                  </div>

                  <div className="mt-20 pt-10 border-t border-border/50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                          <History className="w-5 h-5 text-text-muted" />
                          <h2 className="font-semibold">Recent Activity</h2>
                        </div>
                        <button onClick={() => setActiveView('content')} className="text-sm text-text-secondary hover:text-text hover:underline">View all activity</button>
                      </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.slice(0, 4).map(item => {
                        const PlatformIcon = platformIcons[item.platform] || FileText;
                        return (
                          <div key={item.id} className="p-4 rounded-xl bg-surface/30 border border-border flex items-center justify-between hover:bg-surface/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-border/50 flex items-center justify-center">
                                <PlatformIcon className="w-4 h-4 text-text-secondary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{item.title}</p>
                                <p className="text-xs text-text-muted">{item.updated}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full bg-surface ${statusColors[item.status]}`}>
                              {item.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'content' && (
                <div className="py-8">
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold">Content Library</h1>
                    <p className="text-text-secondary">Manage and organize all your content pieces.</p>
                  </div>
                  {/* Table content component from previous version could be moved here */}
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-text-secondary text-center py-20">Content list view goes here...</p>
                  </div>
                </div>
              )}

              {/* Other views would be similarly styled */}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
