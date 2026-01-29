import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Youtube, Twitter, Linkedin, Save, 
  MoreHorizontal, Clock, Calendar as CalendarIcon, ChevronDown,
  Home, FileText, Target, Settings, Search, MessageSquare,
  AlertTriangle, Sparkles, History, ChevronUp, Zap, Lightbulb,
  Eye, Pen, RefreshCw, Sun, Moon
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const platformIcons = { youtube: Youtube, twitter: Twitter, linkedin: Linkedin }
const platformColors = {
  youtube: 'bg-coral/20 text-coral',
  twitter: 'bg-cyan/20 text-cyan',
  linkedin: 'bg-purple/20 text-purple',
}

const mockContentData = {
  '1': {
    id: '1',
    title: '5 AI tools every creator needs',
    platform: 'twitter',
    status: 'draft',
    campaign: 'AI Tools Deep Dive',
    updated: '2h ago',
    scores: { hook: 65, clarity: 78, platformFit: 'Medium' },
    sections: [
      { id: 's1', type: 'hook', title: 'Hook', timestamp: null, content: 'Thread: 5 AI tools that will 10x your content creation', highlight: true },
      { id: 's2', type: 'body', title: 'Tool 1', timestamp: null, content: '1/ ChatGPT for ideation\nStop staring at blank pages. Use it to brainstorm angles, outlines, and hooks. The key is specific prompts.', highlight: false },
      { id: 's3', type: 'body', title: 'Tool 2', timestamp: null, content: '2/ Midjourney for visuals\nCustom thumbnails, social graphics, brand imagery. No design skills needed. Just describe what you want.', highlight: false },
      { id: 's4', type: 'body', title: 'Tool 3', timestamp: null, content: '3/ Descript for video editing\nEdit video by editing text. Remove filler words automatically. Game changer for YouTube creators.', highlight: false },
      { id: 's5', type: 'body', title: 'Tool 4', timestamp: null, content: '4/ Notion AI for organization\nSummarize notes, generate action items, draft responses. Your second brain just got smarter.', highlight: false },
      { id: 's6', type: 'body', title: 'Tool 5', timestamp: null, content: '5/ Eleven Labs for voiceovers\nClone your voice or use AI voices. Perfect for repurposing content into audio format.', highlight: false },
      { id: 's7', type: 'cta', title: 'CTA', timestamp: null, content: 'Which tool are you most excited to try?\n\n---\n\nSave this thread and thank me later.', highlight: false },
    ],
    aiSuggestions: {
      section: 'Hook',
      status: 'Improvement ready',
      confidence: 'Medium',
      headline: 'This hook could be more specific to stop the scroll.',
      reasons: [
        'Generic "10x" claim is overused',
        'Could mention a specific pain point',
        'Add a curiosity element'
      ],
      suggestion: '"Most creators waste 20+ hours/week on tasks AI can do in minutes. Here are 5 tools I use daily:"'
    },
    versionHistory: [
      { id: 'v1', title: 'Current version', time: 'Now', agent: null },
      { id: 'v2', title: 'Added CTA section', time: '1h ago', agent: null },
      { id: 'v3', title: 'Initial draft', time: '2h ago', agent: null },
    ]
  },
  '2': {
    id: '2',
    title: 'Introduction to Solopreneur Life',
    platform: 'youtube',
    status: 'published',
    campaign: 'The Solopreneur Pivot',
    updated: '1d ago',
    scores: { hook: 72, clarity: 88, platformFit: 'High' },
    sections: [
      { id: 's1', type: 'hook', title: 'Hook', timestamp: '0:00 - 0:30', content: '"What if I told you that the 9-5 grind isn\'t the only path to success?"', highlight: true, note: 'Open with B-roll of office workers, then cut to me working from a coffee shop.' },
      { id: 's2', type: 'problem', title: 'The Problem', timestamp: '0:30 - 2:00', content: '- Traditional career path feels limiting\n- Trading time for money\n- No ownership of your work\n- Someone else controls your schedule', highlight: false },
      { id: 's3', type: 'story', title: 'My Story', timestamp: '2:00 - 4:00', content: '- Left my corporate job 18 months ago\n- Started with nothing but an idea\n- Built a 6-figure business\n- Now work 4 hours a day', highlight: false },
      { id: 's4', type: 'solution', title: 'The Solopreneur Model', timestamp: '4:00 - 7:00', content: 'Three pillars:\n1. **Leverage** - Build once, sell forever\n2. **Audience** - Your distribution is your moat\n3. **Systems** - Automate everything', highlight: false },
      { id: 's5', type: 'action', title: 'Getting Started', timestamp: '7:00 - 9:00', content: '- Pick one skill you\'re good at\n- Document your journey\n- Build in public\n- Iterate based on feedback', highlight: false },
      { id: 's6', type: 'cta', title: 'CTA', timestamp: '9:00 - 10:00', content: 'Subscribe for weekly videos on building your solopreneur empire.', highlight: false, note: 'Filming notes: Use natural lighting, casual setting, direct to camera' },
    ],
    aiSuggestions: {
      section: 'Hook',
      status: 'Improvement ready',
      confidence: 'Medium',
      headline: 'This opening will not stop scrolling on X.',
      reasons: [
        'Leads with a question',
        'Tweaked to spark curiosity without jargon',
        'Tighter and more specific structure'
      ],
      suggestion: '"I quit my $120k job to work 4 hours a day. 18 months later, here\'s what happened..."'
    },
    versionHistory: [
      { id: 'v1', title: 'Improved opening', time: '2h ago', agent: 'Hook Agent' },
      { id: 'v2', title: 'Before agent changes', time: '3h ago', agent: null },
      { id: 'v3', title: 'Initial script', time: '1d ago', agent: null },
    ]
  },
  '3': {
    id: '3',
    title: 'Week 1 Results: What worked',
    platform: 'youtube',
    status: 'scheduled',
    campaign: 'The Solopreneur Pivot',
    updated: '3d ago',
    scores: { hook: 58, clarity: 82, platformFit: 'High' },
    sections: [
      { id: 's1', type: 'hook', title: 'Intro', timestamp: '0:00 - 0:30', content: 'Quick recap of what we\'re doing and why transparency matters.', highlight: false },
      { id: 's2', type: 'body', title: 'The Numbers', timestamp: '0:30 - 2:00', content: '- Followers gained: +234\n- Revenue: $0 (expected)\n- Content pieces: 7\n- Hours worked: 15', highlight: true },
      { id: 's3', type: 'body', title: 'What Worked', timestamp: '2:00 - 4:00', content: '1. **Consistent posting** - Daily tweets performed better than sporadic\n2. **Personal stories** - My failure post got 10x engagement\n3. **Engaging with others** - 30 min/day replying to people in my niche', highlight: false },
      { id: 's4', type: 'body', title: 'What Failed', timestamp: '4:00 - 5:30', content: '1. Educational threads underperformed\n2. Posting at wrong times\n3. Tried to cover too many topics', highlight: false },
      { id: 's5', type: 'body', title: 'Lessons', timestamp: '5:30 - 7:00', content: '- Focus beats variety\n- Authenticity > polish\n- Show the process, not just results', highlight: false },
      { id: 's6', type: 'cta', title: 'Next Week Goals', timestamp: '7:00 - 8:00', content: '- Double down on storytelling\n- Test posting times\n- Launch first free resource', highlight: false },
    ],
    aiSuggestions: {
      section: 'Intro',
      status: 'Needs attention',
      confidence: 'High',
      headline: 'The intro is too vague. Hook with specific numbers.',
      reasons: [
        'Missing specific hook',
        'Doesn\'t create urgency',
        'Numbers in intro perform better'
      ],
      suggestion: '"I gained 234 followers in 7 days with zero ad spend. Here\'s exactly what worked and what flopped."'
    },
    versionHistory: [
      { id: 'v1', title: 'Current version', time: 'Now', agent: null },
    ]
  },
  '4': {
    id: '4',
    title: 'Building in public thread',
    platform: 'twitter',
    status: 'draft',
    campaign: 'Creator Economy 101',
    updated: '5h ago',
    scores: { hook: 70, clarity: 85, platformFit: 'High' },
    sections: [
      { id: 's1', type: 'hook', title: 'Hook', timestamp: null, content: 'I\'m going to build a $10k/month business in 90 days.\n\nHere\'s my plan (and I\'ll share everything along the way):', highlight: true },
      { id: 's2', type: 'body', title: 'Timeline', timestamp: null, content: 'Day 1: Choose my niche\nDay 7: First piece of content\nDay 14: Build email list\nDay 30: First product idea\nDay 60: Launch MVP\nDay 90: $10k goal', highlight: false },
      { id: 's3', type: 'body', title: 'Why Public', timestamp: null, content: 'Why am I sharing this publicly?\n\nBecause accountability works.', highlight: false },
      { id: 's4', type: 'cta', title: 'CTA', timestamp: null, content: 'Follow along for the real, unfiltered journey.\n\nThe wins AND the failures.\n\nLet\'s go.', highlight: false },
    ],
    aiSuggestions: {
      section: 'Hook',
      status: 'Looking good',
      confidence: 'Low',
      headline: 'Strong hook with clear promise and timeline.',
      reasons: [
        'Specific monetary goal',
        'Clear timeframe creates urgency',
        'Promise of transparency'
      ],
      suggestion: null
    },
    versionHistory: [
      { id: 'v1', title: 'Current version', time: 'Now', agent: null },
      { id: 'v2', title: 'Added timeline', time: '5h ago', agent: null },
    ]
  },
  '5': {
    id: '5',
    title: 'Remote work setup guide',
    platform: 'linkedin',
    status: 'published',
    campaign: 'Digital Nomad Series',
    updated: '1w ago',
    scores: { hook: 75, clarity: 90, platformFit: 'High' },
    sections: [
      { id: 's1', type: 'hook', title: 'Hook', timestamp: null, content: 'After 3 years of working remotely from 12 countries, here\'s my essential setup:', highlight: true },
      { id: 's2', type: 'body', title: 'Hardware', timestamp: null, content: '• MacBook Air M2 (light, powerful, all-day battery)\n• AirPods Pro (noise cancellation is non-negotiable)\n• Roost laptop stand (save your neck)\n• Portable monitor (game changer for productivity)', highlight: false },
      { id: 's3', type: 'body', title: 'Software', timestamp: null, content: '• Notion - my second brain\n• Loom - async video communication\n• Krisp - AI noise cancellation for calls\n• 1Password - security across devices', highlight: false },
      { id: 's4', type: 'body', title: 'Non-obvious Tips', timestamp: null, content: '• Local SIM cards > international roaming\n• Co-working day passes > cafes\n• Time zone overlap > perfect location\n• Reliable backup internet (phone hotspot)', highlight: false },
      { id: 's5', type: 'lesson', title: 'Biggest Lesson', timestamp: null, content: 'Your setup is only as good as your systems.\n\nBuild routines that work anywhere, and you\'ll be productive everywhere.', highlight: false },
      { id: 's6', type: 'cta', title: 'CTA', timestamp: null, content: 'What\'s one tool you can\'t work without?', highlight: false },
    ],
    aiSuggestions: {
      section: 'Hook',
      status: 'Looking good',
      confidence: 'Low',
      headline: 'Solid credibility + specific promise.',
      reasons: [
        'Establishes authority (3 years, 12 countries)',
        'Clear value proposition',
        'LinkedIn-appropriate tone'
      ],
      suggestion: null
    },
    versionHistory: [
      { id: 'v1', title: 'Published version', time: '1w ago', agent: null },
    ]
  }
}

const sidebarIcons = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Zap, label: 'AI Studio', path: null },
  { icon: MessageSquare, label: 'Comments', path: null },
  { icon: Lightbulb, label: 'Ideas', path: null },
  { icon: Search, label: 'Search', path: null },
  { icon: Target, label: 'Campaigns', path: null },
  { icon: Eye, label: 'Analytics', path: null },
  { icon: Settings, label: 'Settings', path: null },
]

function IconSidebar({ navigate }) {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <div className="w-14 bg-sidebar border-r border-border flex flex-col items-center py-4 gap-1">
      <div className="w-8 h-8 rounded-lg bg-coral/20 flex items-center justify-center mb-4 shadow-lg shadow-coral/20">
        <Pen className="w-4 h-4 text-coral" />
      </div>
      
      {sidebarIcons.map((item, index) => (
        <button
          key={index}
          onClick={() => item.path && navigate(item.path)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            item.path ? 'hover:bg-surface' : 'opacity-50 cursor-not-allowed'
          }`}
          title={item.label}
        >
          <item.icon className="w-5 h-5 text-text-secondary" />
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
    </div>
  )
}

function ScoreBar({ scores }) {
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-lime'
    if (score >= 50) return 'text-amber'
    return 'text-coral'
  }
  
  const getFitColor = (fit) => {
    if (fit === 'High') return 'text-lime'
    if (fit === 'Medium') return 'text-amber'
    return 'text-coral'
  }

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${getScoreColor(scores.hook) === 'text-lime' ? 'bg-lime' : getScoreColor(scores.hook) === 'text-amber' ? 'bg-amber' : 'bg-coral'}`} />
        <span className="text-text-secondary">Hook:</span>
        <span className={getScoreColor(scores.hook)}>{scores.hook}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${getScoreColor(scores.clarity) === 'text-lime' ? 'bg-lime' : getScoreColor(scores.clarity) === 'text-amber' ? 'bg-amber' : 'bg-coral'}`} />
        <span className="text-text-secondary">Clarity:</span>
        <span className={getScoreColor(scores.clarity)}>{scores.clarity}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-text-secondary">Platform Fit:</span>
        <span className={`w-2 h-2 rounded-full ${getFitColor(scores.platformFit) === 'text-lime' ? 'bg-lime' : getFitColor(scores.platformFit) === 'text-amber' ? 'bg-amber' : 'bg-coral'}`} />
        <span className={getFitColor(scores.platformFit)}>{scores.platformFit}</span>
      </div>
    </div>
  )
}

function ContentSection({ section, isSelected, onSelect, onChange }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(section.content)

  const handleBlur = () => {
    setIsEditing(false)
    if (editContent !== section.content) {
      onChange(section.id, editContent)
    }
  }

  return (
    <div 
      className={`group relative ${isSelected ? 'ring-1 ring-coral/50' : ''}`}
      onClick={() => onSelect(section.id)}
    >
      <div className="flex items-start gap-3 py-3">
        <div className={`w-1 self-stretch rounded-full ${section.highlight ? 'bg-coral' : 'bg-transparent group-hover:bg-border'}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-text-secondary text-sm font-medium">
              # {section.title}
            </span>
            {section.timestamp && (
              <span className="text-text-muted text-xs">({section.timestamp})</span>
            )}
          </div>
          
          {section.highlight ? (
            <div className="bg-coral/10 border-l-2 border-coral px-4 py-3 rounded-r-lg">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onBlur={handleBlur}
                  autoFocus
                  className="w-full bg-transparent text-text resize-none focus:outline-none"
                  rows={3}
                />
              ) : (
                <p 
                  className="text-text whitespace-pre-wrap cursor-text"
                  onClick={() => setIsEditing(true)}
                >
                  {section.content}
                </p>
              )}
            </div>
          ) : (
            <div>
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onBlur={handleBlur}
                  autoFocus
                  className="w-full bg-transparent text-text-secondary resize-none focus:outline-none leading-relaxed"
                  rows={Math.max(3, section.content.split('\n').length)}
                />
              ) : (
                <div 
                  className="text-text-secondary whitespace-pre-wrap cursor-text leading-relaxed"
                  onClick={() => setIsEditing(true)}
                >
                  {section.content.split('\n').map((line, i) => {
                    if (line.startsWith('- ') || line.startsWith('• ')) {
                      return <div key={i} className="flex gap-2"><span>•</span><span>{line.slice(2)}</span></div>
                    }
                    if (line.match(/^\d+\.\s/)) {
                      return <div key={i}>{line}</div>
                    }
                    if (line.includes('**')) {
                      const parts = line.split(/\*\*(.*?)\*\*/)
                      return (
                        <div key={i}>
                          {parts.map((part, j) => 
                            j % 2 === 1 ? <strong key={j} className="text-text">{part}</strong> : part
                          )}
                        </div>
                      )
                    }
                    return <div key={i}>{line || '\u00A0'}</div>
                  })}
                </div>
              )}
            </div>
          )}
          
          {section.note && (
            <p className="text-text-muted text-sm italic mt-3">{section.note}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function AISuggestionsPanel({ suggestions, versionHistory }) {
  const [whyExpanded, setWhyExpanded] = useState(true)
  const [historyExpanded, setHistoryExpanded] = useState(true)
  
  const getStatusColor = (status) => {
    if (status === 'Looking good') return 'text-lime'
    if (status === 'Improvement ready') return 'text-cyan'
    return 'text-amber'
  }
  
  const getStatusDot = (status) => {
    if (status === 'Looking good') return 'bg-lime'
    if (status === 'Improvement ready') return 'bg-cyan'
    return 'bg-amber'
  }

  return (
    <div className="w-80 border-l border-border bg-sidebar flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-text">AI Suggestions for {suggestions.section}</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${getStatusDot(suggestions.status)}`} />
          <span className="text-sm text-text">{suggestions.status}</span>
        </div>
        
        <div className="text-xs text-text-muted">
          Confidence: <span className={getStatusColor(suggestions.status)}>{suggestions.confidence}</span>
        </div>
        
        <div className="border-t border-border pt-4">
          <button 
            onClick={() => setWhyExpanded(!whyExpanded)}
            className="flex items-center justify-between w-full text-sm font-medium text-text mb-3"
          >
            Why?
            {whyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {whyExpanded && (
            <>
              <p className="text-lg text-text mb-4 leading-snug">{suggestions.headline}</p>
              
              <div className="mb-4">
                <h4 className="text-sm text-text-secondary mb-2">Reasons</h4>
                <ul className="space-y-2">
                  {suggestions.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-text-muted">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
              
              {suggestions.suggestion && (
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-3 py-2 bg-coral text-bg rounded-lg text-sm font-medium hover:bg-coral/90 transition-colors">
                    Rewrite {suggestions.section.toLowerCase()}
                  </button>
                  <button className="px-3 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-surface transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="border-t border-border pt-4">
          <button 
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="flex items-center justify-between w-full text-sm font-medium text-text mb-3"
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Version Timeline
            </span>
            {historyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {historyExpanded && (
            <div className="space-y-3">
              {versionHistory.map((version, i) => (
                <div key={version.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-cyan' : 'bg-border'}`} />
                    {i < versionHistory.length - 1 && <div className="w-px h-8 bg-border" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate">{version.title}</p>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span>{version.time}</span>
                      {version.agent && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {version.agent}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InlineSuggestion({ onAccept }) {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+1rem)] z-10">
      <div className="bg-surface border border-border rounded-lg p-3 shadow-xl w-64">
        <div className="flex items-start gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber mt-0.5" />
          <span className="text-sm text-text">Opening seems too broad</span>
        </div>
        <p className="text-xs text-text-secondary mb-3">Write a more specific, intriguing question.</p>
        <div className="flex items-center justify-between">
          <button 
            onClick={onAccept}
            className="flex items-center gap-1.5 text-xs text-coral hover:text-coral/80"
          >
            <Pen className="w-3 h-3" />
            Accept
          </button>
          <span className="text-xs text-text-muted">177</span>
        </div>
      </div>
    </div>
  )
}

export default function ContentEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [sections, setSections] = useState([])

  useEffect(() => {
    const data = mockContentData[id]
    if (data) {
      setContent(data)
      setEditedTitle(data.title)
      setSections(data.sections)
      setSelectedSection(data.sections[0]?.id || null)
    }
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaving(false)
  }

  const handleSectionChange = (sectionId, newContent) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, content: newContent } : s
    ))
  }

  const wordCount = sections.reduce((acc, s) => acc + s.content.split(/\s+/).filter(Boolean).length, 0)

  if (!content) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-secondary">Content not found</p>
      </div>
    )
  }

  const PlatformIcon = platformIcons[content.platform]
  const platformColor = platformColors[content.platform]

  return (
    <div className="h-screen bg-bg flex overflow-hidden">
      <IconSidebar navigate={navigate} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-bg shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-1.5 rounded hover:bg-surface transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-text-secondary" />
            </button>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">{content.campaign}</span>
              <span className="text-text-muted">/</span>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${platformColor}`}>
                {PlatformIcon && <PlatformIcon className="w-3.5 h-3.5" />}
                <span className="text-xs font-medium capitalize">{content.platform}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 text-sm text-text-secondary hover:text-text border border-border rounded-lg hover:bg-surface transition-colors">
              Review
            </button>
            <button className="px-3 py-1.5 text-sm text-text-secondary hover:text-text border border-border rounded-lg hover:bg-surface transition-colors">
              Schedule
            </button>
            <button className="p-1.5 rounded-lg hover:bg-surface transition-colors">
              <MoreHorizontal className="w-4 h-4 text-text-secondary" />
            </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-4 py-1.5 text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
          </div>
        </header>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-3xl mx-auto px-8 py-8">
              <div className="mb-6">
                <ScoreBar scores={content.scores} />
              </div>
              
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full bg-transparent text-3xl font-semibold text-text placeholder:text-text-muted focus:outline-none mb-8"
                placeholder="Untitled"
              />
              
              <div className="space-y-2">
                {sections.map((section) => (
                  <ContentSection
                    key={section.id}
                    section={section}
                    isSelected={selectedSection === section.id}
                    onSelect={setSelectedSection}
                    onChange={handleSectionChange}
                  />
                ))}
              </div>
              
              <div className="mt-8 pt-4 border-t border-border flex items-center justify-end">
                <span className="text-xs text-text-muted">{wordCount} words</span>
              </div>
            </div>
          </div>
          
          <AISuggestionsPanel 
            suggestions={content.aiSuggestions} 
            versionHistory={content.versionHistory}
          />
        </div>
      </div>
    </div>
  )
}
