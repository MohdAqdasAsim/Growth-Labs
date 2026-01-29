import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  ArrowLeft, Target, Sparkles, Calendar, Clock, ChevronRight,
  CheckCircle2, Rocket, Zap, TrendingUp, Users,
  Youtube, Twitter, Linkedin, FileText, Video, MessageSquare,
  Loader2, ArrowRight, Edit3, Plus,
    Database, RefreshCcw, Download,
    Home, Settings, Pen,
Brain, Wand2, Terminal, Activity,
PanelLeft, PanelRight
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const mockSources = [
  { id: '1', name: 'Product_Roadmap.pdf', type: 'pdf', size: '2.4 MB' },
  { id: '2', name: 'https://youtube.com/watch?v=...', type: 'link', size: 'Video Transcript' },
]

const mockMilestones = [
  { id: 'm1', week: 1, title: 'Foundation Setup', tasks: ['Define content pillars', 'Create brand guidelines'], status: 'completed' },
  { id: 'm2', week: 2, title: 'Content Engine', tasks: ['Create content calendar', 'Batch record 4 videos'], status: 'in_progress' },
  { id: 'm3', week: 3, title: 'Launch Phase', tasks: ['Publish first 2 videos', 'Daily Twitter engagement'], status: 'pending' },
]

const visualBrands = [
  { id: 'modern-dark', name: 'Modern Dark', desc: 'Zinc accents, high contrast', color: 'bg-zinc-900 border-zinc-700' },
  { id: 'minimalist', name: 'Minimalist', desc: 'Clean, airy, focus on content', color: 'bg-white border-zinc-200 text-zinc-900' },
  { id: 'corporate', name: 'Trust', desc: 'Professional, stable, blue tones', color: 'bg-blue-900 border-blue-700' },
]

const socialPlatforms = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { id: 'twitter', name: 'X / Twitter', icon: Twitter, color: 'text-text' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
]

const strategyStream = [
  { id: '1', time: '2M AGO', type: 'performance', content: 'Post #3 is performing 40% above average. Strategy adjusted Day 5.' },
  { id: '2', time: '2M AGO', type: 'insight', content: 'Optimal posting window detected: 9:00 AM EST.' },
]

export default function PlanCampaign() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const initialGoal = location.state?.initialGoal || ''
  
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState(initialGoal)
  const [sources] = useState(mockSources)
  const [selectedBrand, setSelectedBrand] = useState('modern-dark')
  const [syncedAccounts, setSyncedAccounts] = useState(['twitter'])
  const [generating, setGenerating] = useState(false)
  const [campaignPlan, setCampaignPlan] = useState(null)
      const [viewMode, setViewMode] = useState('plan') 
      const [isLoading, setIsLoading] = useState(false)
      const [leftCollapsed, setLeftCollapsed] = useState(false)
      const [rightCollapsed, setRightCollapsed] = useState(false)

    const handleViewModeChange = (newMode) => {
      if (newMode === viewMode) return
      setIsLoading(true)
      setViewMode(newMode)
      setTimeout(() => setIsLoading(false), 400)
    }

    const Skeleton = ({ type }) => {
      if (type === 'studio') {
        return (
          <div className="h-full flex animate-pulse overflow-hidden">
            <div className="w-[20%] bg-card/50 border-r border-border p-6 space-y-6">
              <div className="h-4 bg-secondary rounded w-1/2 mb-8" />
              <div className="space-y-3">
                <div className="h-8 bg-secondary rounded w-full" />
                <div className="h-8 bg-secondary rounded w-full" />
                <div className="h-8 bg-secondary rounded w-3/4" />
              </div>
            </div>
            <div className="flex-1 p-12 space-y-8">
              <div className="h-10 bg-secondary rounded w-3/4 max-w-md" />
              <div className="space-y-4">
                <div className="h-4 bg-secondary rounded w-full" />
                <div className="h-4 bg-secondary rounded w-full" />
                <div className="h-4 bg-secondary rounded w-2/3" />
              </div>
            </div>
            <div className="w-[30%] bg-card/50 border-l border-border p-6 space-y-8">
              <div className="h-40 bg-secondary rounded-2xl w-full" />
              <div className="space-y-4">
                <div className="h-2 bg-secondary rounded w-full" />
                <div className="h-2 bg-secondary rounded w-full" />
              </div>
            </div>
          </div>
        )
      }
      return (
        <div className="max-w-4xl mx-auto p-12 space-y-12 animate-pulse">
          <div className="h-10 bg-secondary rounded w-1/3" />
          <div className="bg-card/50 border border-border rounded-2xl p-10 h-64" />
          <div className="grid grid-cols-3 gap-8">
            <div className="h-96 bg-secondary/20 rounded-2xl" />
            <div className="h-96 bg-secondary/20 rounded-2xl" />
            <div className="h-96 bg-secondary/20 rounded-2xl" />
          </div>
        </div>
      )
    }
  
  const handleGeneratePlan = () => {
    if (!goal.trim()) return
    setGenerating(true)
    setTimeout(() => {
      setCampaignPlan({
        name: goal.length > 30 ? goal.substring(0, 30) + '...' : goal,
        milestones: mockMilestones,
        stats: { reach: '124K', engagement: '4.2%', conversion: '1.8%' }
      })
      setGenerating(false)
      setStep(4)
      setViewMode('plan')
    }, 1500)
  }

  const toggleAccount = (id) => {
    setSyncedAccounts(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

    if (step === 4) {
    return (
      <div className="flex h-screen bg-background text-text selection:bg-primary/20 overflow-hidden font-sans">
        {/* Main Canvas */}
          <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
            <header className="h-[54px] border-b border-border px-8 flex items-center justify-between z-10 bg-background/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-12">
                <nav className="flex items-center gap-8">
                  {['brief', 'plan', 'studio', 'review'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => handleViewModeChange(tab)}
                      className={`relative py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                        viewMode === tab ? 'text-primary' : 'text-text-muted hover:text-text'
                      }`}
                    >
                      {tab}
                      {viewMode === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1 duration-300" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-4">
                {viewMode === 'studio' && (
                  <div className="flex items-center gap-2 mr-4">
                    <button className="px-3 py-1.5 bg-secondary border border-border rounded text-[9px] font-bold uppercase hover:bg-surface-hover transition-colors text-text-muted">Refine</button>
                    <button className="px-4 py-1.5 bg-primary text-background rounded text-[9px] font-bold uppercase shadow-sm hover:opacity-90 transition-opacity">Generate</button>
                  </div>
                )}
                <button className="bg-primary text-background px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
                  <Rocket className="w-4 h-4" /> Launch
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-hidden relative">
              {isLoading ? (
                <Skeleton type={viewMode === 'studio' ? 'studio' : 'general'} />
              ) : viewMode === 'studio' ? (
                <div className="h-full flex animate-in fade-in duration-500 overflow-hidden">
                  {/* Studio Left: Assets & Context (The Vault) - 20% */}
                  <div className={`bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 relative ${leftCollapsed ? 'w-0 border-none' : 'w-[20%]'}`}>
                    <button 
                      onClick={() => setLeftCollapsed(!leftCollapsed)}
                      className={`absolute top-4 -right-3 z-20 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-all shadow-sm ${leftCollapsed ? 'rotate-180 -right-8' : ''}`}
                    >
                      <ChevronRight className="w-3 h-3 text-text-muted" />
                    </button>
                    
                    {!leftCollapsed && (
                      <>
                        <div className="h-12 flex items-center px-6 border-b border-border">
                          <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                            <Database className="w-3 h-3" /> Assets & Context
                          </h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                          <section className="space-y-4">
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-muted/60">Knowledge Base</h4>
                            <div className="space-y-1">
                              {sources.map(source => (
                                <div key={source.id} className="p-2 rounded-lg flex items-center gap-2 hover:bg-secondary transition-colors cursor-pointer group">
                                  <FileText className="w-3.5 h-3.5 text-text-muted" />
                                  <span className="text-[11px] font-medium truncate text-text-secondary group-hover:text-text">{source.name}</span>
                                </div>
                              ))}
                              <button className="w-full py-2 border border-dashed border-border rounded-lg flex items-center justify-center gap-2 hover:bg-secondary transition-all text-[9px] font-bold uppercase tracking-widest text-text-muted mt-2">
                                <Plus className="w-2.5 h-2.5" /> Add Research
                              </button>
                            </div>
                          </section>
                        </div>
                        <div className="p-4 border-t border-border">
                          <button className="w-full py-2.5 bg-secondary border border-border rounded-lg flex items-center justify-center gap-2 hover:bg-surface-hover transition-all text-[9px] font-bold uppercase tracking-widest text-text">
                            <Download className="w-3.5 h-3.5" /> Export DNA
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Studio Center: Workspace (Editor) - Remaining Space */}
                  <div className="flex-1 bg-background flex flex-col min-w-0 relative">
                    <div className="flex-1 p-12 overflow-y-auto">
                      <div className="max-w-2xl mx-auto">
                        <h1 className="text-4xl font-bold tracking-tight mb-8">The Future of AI Agencies</h1>
                        <div className="space-y-8 text-[15px] text-text-secondary leading-relaxed font-light">
                          <p className="bg-secondary/20 p-6 border-l-2 border-primary/30 rounded-r-xl text-text">Building leverage through agents is the 2026 standard.</p>
                          <p>One person, infinite scale. This is the Engine.</p>
                          <p>The traditional agency model is fundamentally broken. High overhead, slow turnaround times, and inconsistent quality are no longer acceptable in an era where speed and precision are the ultimate competitive advantages. By integrating specialized AI agents into every layer of the workflow, we don't just optimize—we transform.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Studio Right: Preview & Activity (Live Feed) - 30% */}
                  <div className={`bg-card border-l border-border flex flex-col shrink-0 transition-all duration-300 relative ${rightCollapsed ? 'w-0 border-none' : 'w-[30%]'}`}>
                    <button 
                      onClick={() => setRightCollapsed(!rightCollapsed)}
                      className={`absolute top-4 -left-3 z-20 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-all shadow-sm ${rightCollapsed ? 'rotate-180 -left-8' : ''}`}
                    >
                      <ChevronRight className="w-3 h-3 text-text-muted rotate-180" />
                    </button>
                    
                    {!rightCollapsed && (
                      <>
                        <div className="h-12 flex items-center px-6 border-b border-border">
                          <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">Preview & Activity</h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                          {/* Preview Mockup */}
                          <section className="space-y-4">
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-muted/60 flex justify-between items-center">
                              <span>Live Preview</span>
                              <Twitter className="w-3 h-3" />
                            </h4>
                            <div className="bg-secondary/30 border border-border p-5 rounded-2xl shadow-sm space-y-4">
                              <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary border border-border shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold">Creator DNA</p>
                                  <p className="text-[9px] text-text-muted">@creatordna</p>
                                </div>
                              </div>
                              <p className="text-[12px] text-text-secondary leading-normal">The agency model is shifting. Hiring is out, Agent deployment is in. 🧵</p>
                            </div>
                          </section>

                          {/* Goal Tracking */}
                          <section className="space-y-5 pt-8 border-t border-border">
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-muted/60">Goal Tracking</h4>
                            <div className="space-y-6">
                              {[
                                { label: 'Projected Reach', val: '12.4K', p: '65%' },
                                { label: 'Conversion', val: '84%', p: '84%' }
                              ].map(stat => (
                                <div key={stat.label} className="space-y-2">
                                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-text-muted">{stat.label}</span>
                                    <span className="text-text">{stat.val}</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: stat.p }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* Live Activity (Strategy Stream) */}
                          <section className="space-y-4 pt-8 border-t border-border">
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-muted/60 flex items-center gap-2">
                              <Activity className="w-3 h-3" /> Strategy Stream
                            </h4>
                            <div className="space-y-3">
                              {strategyStream.map(item => (
                                <div key={item.id} className="p-4 bg-secondary/10 border border-border rounded-xl space-y-2 group hover:border-text-muted/30 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-2.5 h-2.5 text-text-muted" />
                                    <span className="text-[8px] font-bold uppercase text-text-muted">{item.time}</span>
                                  </div>
                                  <p className="text-[11px] text-text-secondary leading-relaxed">{item.content}</p>
                                </div>
                              ))}
                            </div>
                          </section>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
              /* Non-Studio Views: Centered Content */
              <div className="h-full overflow-y-auto p-12 no-scrollbar bg-background">
                <div className="max-w-4xl mx-auto space-y-12">
                  {viewMode === 'brief' && (
                    <div className="max-w-2xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between border-b border-border pb-8">
                        <div>
                          <h2 className="text-4xl font-bold tracking-tight mb-2">Campaign Brief</h2>
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">Mission Documentation & Strategy</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text transition-all hover:scale-105">
                          <Sparkles className="w-3.5 h-3.5" /> Smart Document
                        </button>
                      </div>
                      
                      <div className="space-y-12">
                        <section className="space-y-4">
                          <div className="flex items-center gap-3 text-primary">
                            <FileText className="w-5 h-5" />
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Mission Goal</h3>
                          </div>
                          <p className="text-2xl font-bold tracking-tight leading-tight pl-8">{goal}</p>
                        </section>

                        <section className="space-y-6">
                          <div className="flex items-center gap-3 text-primary">
                            <Brain className="w-5 h-5" />
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Strategic Direction</h3>
                          </div>
                          <div className="pl-8 space-y-4">
                            <p className="text-lg text-text-secondary leading-relaxed font-light">
                              Educational focus drives conversion. Prioritize technical depth over broad visibility. Focus on long-form authority building to establish trust within the developer ecosystem.
                            </p>
                            <div className="flex gap-2">
                              {['Authority Building', 'Technical Depth', 'Developer Trust'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-secondary rounded-full text-[9px] font-bold uppercase tracking-widest text-text-muted border border-border">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  )}

                  {viewMode === 'plan' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-3xl font-bold tracking-tight">Execution Kanban</h2>
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">3-Day Strategic Path</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text">Live Tracking Active</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((day) => (
                          <div key={day} className="flex flex-col gap-5">
                            <div className="flex items-center justify-between px-1">
                              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">Day {day}</h3>
                              <span className="text-[9px] font-bold text-text-muted/50">{mockMilestones[day-1]?.tasks.length} Tasks</span>
                            </div>
                            <div className="flex-1 space-y-3 p-3 bg-secondary/20 border border-border rounded-2xl min-h-[500px] shadow-inner">
                              {mockMilestones[day-1]?.tasks.map((task, ti) => (
                                <div key={ti} className="bg-card border border-border p-4 rounded-xl hover:border-primary/50 transition-all cursor-pointer shadow-sm group">
                                  <div className="flex items-center gap-2 mb-3">
                                    {ti === 0 ? <Youtube className="w-3.5 h-3.5 text-red-500" /> : <Twitter className="w-3.5 h-3.5 text-text" />}
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted group-hover:text-text transition-colors">{ti === 0 ? 'YouTube' : 'X/Twitter'}</span>
                                  </div>
                                  <p className="text-[12px] font-medium text-text-secondary leading-snug group-hover:text-text transition-colors">{task}</p>
                                </div>
                              ))}
                              <button className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:bg-secondary/50 hover:text-text rounded-xl mt-2 transition-all border border-dashed border-border/50">
                                <Plus className="w-3.5 h-3.5" /> Add Task
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewMode === 'review' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="text-center space-y-3">
                        <h2 className="text-4xl font-bold tracking-tight">Campaign Analysis</h2>
                        <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.3em]">Performance Metrics & Insights</p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-card border border-border p-12 rounded-[2rem] h-80 shadow-sm flex flex-col items-center justify-center gap-6 group cursor-pointer hover:border-primary/20 transition-all">
                          <TrendingUp className="w-12 h-12 text-text-muted/20 group-hover:text-primary/40 transition-all" />
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">Interactive Performance Analytics</p>
                        </div>
                        <div className="bg-secondary/30 border border-border rounded-[2rem] p-10 flex flex-col shadow-sm">
                          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-8 flex items-center gap-3">
                            <Sparkles className="w-4 h-4" /> Strategy Debrief
                          </h4>
                          <p className="text-[13px] text-text-secondary leading-relaxed mb-10 italic font-light">"Engagement on Day 2 exceeded targets by 40%. Recommend doubling down on video content for next sprint."</p>
                          <div className="mt-auto space-y-3">
                            <button className="w-full py-4 bg-primary text-background rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:opacity-90 transition-all">Apply Optimized Path</button>
                            <button className="w-full py-4 bg-secondary border border-border rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-hover transition-all">Archive Campaign</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

    return (
      <div className="min-h-screen bg-background text-text selection:bg-primary/20 font-sans">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3">
          <div className="flex items-center justify-between max-w-3xl mx-auto">

          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
                <Target className="w-5 h-5 text-text" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight">Campaign Setup</h1>
                <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-bold">Content Architect</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {[1, 2, 3].map(s => (
              <div 
                key={s}
                className={`w-12 h-1 rounded-full transition-all duration-500 ${
                  s === step ? 'bg-primary w-16' : s < step ? 'bg-primary/40' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 py-12">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
            <div className="mb-10">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 block">Step 01 / Brief</span>
              <h2 className="text-3xl font-bold tracking-tight mb-2">The Mission</h2>
              <p className="text-text-secondary text-sm font-light">Define your campaign objectives.</p>
            </div>
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <label className="text-[10px] font-bold text-text-muted mb-4 block uppercase tracking-[0.2em]">Campaign Goal</label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Scale my design agency on Twitter..."
                  className="w-full bg-transparent border-none text-xl font-bold tracking-tight focus:ring-0 placeholder:text-text-muted/20 resize-none h-32 leading-tight p-0"
                />
              </div>
              <button onClick={() => setStep(2)} disabled={!goal.trim()} className="w-full py-4 bg-primary text-background rounded-xl text-sm font-bold flex items-center justify-center gap-3 shadow-sm disabled:opacity-50">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-xl mx-auto">
            <div className="mb-10">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 block">Step 02 / Identity</span>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Brand DNA</h2>
              <p className="text-text-secondary text-sm font-light">Select a visual direction.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-10">
              {visualBrands.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-6 ${
                    selectedBrand === brand.id ? 'border-primary bg-card shadow-sm' : 'border-border bg-card/50'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-xl border border-border shrink-0 ${brand.color}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold tracking-tight mb-1">{brand.name}</h3>
                    <p className="text-[11px] text-text-muted font-light">{brand.desc}</p>
                  </div>
                  {selectedBrand === brand.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="px-8 py-4 rounded-xl border border-border font-bold text-[10px] uppercase tracking-widest">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 py-4 bg-primary text-background rounded-xl text-sm font-bold flex items-center justify-center gap-3 shadow-sm">Continue <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-xl mx-auto">
            <div className="mb-10">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 block">Step 03 / Sync</span>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Deployment</h2>
              <p className="text-text-secondary text-sm font-light">Connect your platforms.</p>
            </div>
            <div className="space-y-4 mb-10">
              {socialPlatforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => toggleAccount(platform.id)}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                    syncedAccounts.includes(platform.id) ? 'border-primary bg-primary/5' : 'border-border bg-card/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
                      <platform.icon className="w-5 h-5 text-text-secondary" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">{platform.name}</span>
                  </div>
                  {syncedAccounts.includes(platform.id) ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <span className="text-[9px] font-bold text-text-muted uppercase">Sync</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="px-8 py-4 rounded-xl border border-border font-bold text-[10px] uppercase tracking-widest">Back</button>
              <button onClick={handleGeneratePlan} disabled={generating} className="flex-1 py-4 bg-primary text-background rounded-xl text-sm font-bold flex items-center justify-center gap-3 shadow-sm">
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Architect Campaign'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
