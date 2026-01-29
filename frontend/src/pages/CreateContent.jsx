import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Pen, Sparkles, Youtube, Twitter, Linkedin, FileText,
  MessageSquare, Video, Image, Newspaper, Mail, ChevronRight,
  Wand2, RefreshCw, Copy, Check, Send, Zap, Target, Clock,
  ThumbsUp, ThumbsDown, ArrowRight, Loader2
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const contentTypes = [
  { id: 'thread', label: 'Thread', icon: MessageSquare, desc: 'Multi-part tweet thread', platforms: ['twitter'] },
  { id: 'video_script', label: 'Video Script', icon: Video, desc: 'YouTube/TikTok script', platforms: ['youtube'] },
  { id: 'post', label: 'Post', icon: FileText, desc: 'Single social post', platforms: ['twitter', 'linkedin'] },
  { id: 'carousel', label: 'Carousel', icon: Image, desc: 'Multi-slide visual content', platforms: ['linkedin'] },
  { id: 'newsletter', label: 'Newsletter', icon: Mail, desc: 'Email newsletter edition', platforms: [] },
  { id: 'article', label: 'Article', icon: Newspaper, desc: 'Long-form blog post', platforms: [] },
]

const platforms = [
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'text-sky-500 bg-sky-500/10' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500 bg-red-500/10' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600 bg-blue-600/10' },
]

const tones = [
  { id: 'casual', label: 'Casual', desc: 'Friendly, conversational' },
  { id: 'professional', label: 'Professional', desc: 'Polished, authoritative' },
  { id: 'educational', label: 'Educational', desc: 'Informative, teacherly' },
  { id: 'inspirational', label: 'Inspirational', desc: 'Motivating, uplifting' },
  { id: 'controversial', label: 'Controversial', desc: 'Bold, provocative' },
]

const mockHooks = [
  { id: '1', text: "Most creators fail because they focus on virality over value. Here's the framework that changed everything for me:", score: 92 },
  { id: '2', text: "I spent 6 months analyzing 500+ viral posts. The pattern nobody talks about:", score: 88 },
  { id: '3', text: "Stop creating content. Start creating conversations. Let me explain:", score: 85 },
  { id: '4', text: "The creator economy is lying to you. Here's what actually works:", score: 82 },
]

const mockContent = {
  thread: [
    "Most creators fail because they focus on virality over value.\n\nHere's the framework that changed everything for me:\n\n🧵",
    "1/ The Value-First Approach\n\nBefore creating anything, ask: \"Would someone pay for this information?\"\n\nIf the answer is no, don't post it.",
    "2/ The 80/20 Rule of Content\n\n80% of your content should educate or entertain.\n20% can be promotional.\n\nMost creators flip this ratio and wonder why they're not growing.",
    "3/ The Compound Effect\n\nOne piece of content won't change your life.\n\n100 will.\n\nConsistency beats creativity every time.",
    "4/ The Engagement Loop\n\nDon't just post and ghost.\n\nReply to every comment for the first hour.\n\nThis signals to the algorithm that your content is worth promoting.",
    "5/ The Remix Strategy\n\nYour best content deserves multiple lives.\n\n• Turn threads into carousels\n• Turn videos into tweets\n• Turn newsletters into threads\n\nRepurpose relentlessly.",
  ],
}

const topicSuggestions = [
  'AI tools for productivity',
  'Building in public lessons',
  'Remote work tips',
  'Solopreneur mindset',
  'Content creation workflow',
]

export default function CreateContent() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState(null)
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [selectedTone, setSelectedTone] = useState('casual')
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [hooks, setHooks] = useState([])
  const [selectedHook, setSelectedHook] = useState(null)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleTypeSelect = (type) => {
    setSelectedType(type)
    if (type.platforms.length === 1) {
      setSelectedPlatform(type.platforms[0])
    }
  }

  const handleGenerateHooks = () => {
    if (!topic.trim()) return
    setGenerating(true)
    setTimeout(() => {
      setHooks(mockHooks)
      setGenerating(false)
      setStep(3)
    }, 1500)
  }

  const handleGenerateContent = () => {
    if (!selectedHook) return
    setGenerating(true)
    setTimeout(() => {
      setGeneratedContent(mockContent.thread)
      setGenerating(false)
      setStep(4)
    }, 2000)
  }

  const handleCopy = () => {
    const text = generatedContent.join('\n\n---\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendToEditor = () => {
    navigate('/editor/new', { 
      state: { 
        content: generatedContent,
        type: selectedType?.id,
        platform: selectedPlatform,
        tone: selectedTone 
      } 
    })
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-surface rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-coral/20 flex items-center justify-center">
                <Pen className="w-5 h-5 text-coral" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Create Content</h1>
                <p className="text-xs text-text-muted">AI-powered content generation</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s}
                className={`w-8 h-1 rounded-full transition-colors ${
                  s <= step ? 'bg-coral' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {step === 1 && (
          <div className="py-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">What type of content?</h2>
              <p className="text-text-secondary">Choose a format that fits your message</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {contentTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    selectedType?.id === type.id 
                      ? 'bg-coral/10 border-coral' 
                      : 'bg-surface border-border hover:border-border-hover'
                  }`}
                >
                  <type.icon className={`w-6 h-6 mb-3 ${selectedType?.id === type.id ? 'text-coral' : 'text-text-secondary'}`} />
                  <p className="font-semibold text-sm">{type.label}</p>
                  <p className="text-xs text-text-muted mt-1">{type.desc}</p>
                </button>
              ))}
            </div>

            {selectedType && selectedType.platforms.length > 1 && (
              <div className="mb-8">
                <p className="text-sm font-medium mb-3">Select platform</p>
                <div className="flex gap-3">
                  {platforms.filter(p => selectedType.platforms.includes(p.id)).map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        selectedPlatform === platform.id 
                          ? 'bg-coral/10 border-coral' 
                          : 'bg-surface border-border hover:border-border-hover'
                      }`}
                    >
                      <platform.icon className={`w-4 h-4 ${platform.color.split(' ')[0]}`} />
                      <span className="text-sm">{platform.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedType && (selectedPlatform || selectedType.platforms.length <= 1) && (
              <button 
                onClick={() => setStep(2)}
                className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 mx-auto"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="py-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">What's it about?</h2>
              <p className="text-text-secondary">Enter a topic and we'll generate hook options</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-surface border border-border rounded-xl p-6 mb-6">
                <label className="text-sm font-medium mb-2 block">Topic or idea</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. The 5 biggest mistakes I made as a content creator"
                  className="w-full bg-bg border border-border rounded-lg p-4 text-sm resize-none h-24 focus:ring-1 focus:ring-coral focus:border-coral"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {topicSuggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setTopic(suggestion)}
                      className="text-xs px-3 py-1.5 rounded-full bg-border/30 text-text-secondary hover:bg-border/50 hover:text-text transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6 mb-8">
                <label className="text-sm font-medium mb-3 block">Voice & tone</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {tones.map(tone => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        selectedTone === tone.id 
                          ? 'bg-coral/10 border-coral' 
                          : 'bg-bg border-border hover:border-border-hover'
                      }`}
                    >
                      <p className="text-xs font-medium">{tone.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-border hover:bg-surface transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button 
                  onClick={handleGenerateHooks}
                  disabled={!topic.trim() || generating}
                  className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Hooks
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">Pick your hook</h2>
              <p className="text-text-secondary">Select the opening that resonates most</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="space-y-4 mb-8">
                {hooks.map((hook, idx) => (
                  <button
                    key={hook.id}
                    onClick={() => setSelectedHook(hook)}
                    className={`w-full p-5 rounded-xl border text-left transition-all ${
                      selectedHook?.id === hook.id 
                        ? 'bg-coral/10 border-coral' 
                        : 'bg-surface border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-text-muted">Option {idx + 1}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            hook.score >= 90 ? 'bg-lime/20 text-lime' :
                            hook.score >= 85 ? 'bg-amber/20 text-amber' :
                            'bg-border text-text-muted'
                          }`}>
                            {hook.score}% match
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{hook.text}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedHook?.id === hook.id ? 'border-coral bg-coral' : 'border-border'
                      }`}>
                        {selectedHook?.id === hook.id && <Check className="w-3 h-3 text-bg" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={handleGenerateHooks}
                className="w-full p-3 rounded-lg border border-dashed border-border text-text-secondary hover:border-coral/50 hover:text-coral transition-colors flex items-center justify-center gap-2 mb-8"
              >
                <RefreshCw className="w-4 h-4" />
                Generate more options
              </button>

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl border border-border hover:bg-surface transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button 
                  onClick={handleGenerateContent}
                  disabled={!selectedHook || generating}
                  className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Full Content
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && generatedContent && (
          <div className="py-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">Your content is ready!</h2>
              <p className="text-text-secondary">Review, edit, or send to the full editor</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-surface border border-border rounded-xl overflow-hidden mb-6">
                <div className="p-4 border-b border-border flex items-center justify-between bg-bg/50">
                  <div className="flex items-center gap-3">
                    {selectedPlatform && (() => {
                      const platform = platforms.find(p => p.id === selectedPlatform)
                      return platform ? (
                        <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center`}>
                          <platform.icon className="w-4 h-4" />
                        </div>
                      ) : null
                    })()}
                    <div>
                      <p className="text-sm font-medium">{selectedType?.label}</p>
                      <p className="text-xs text-text-muted">{generatedContent.length} parts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-border/50 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-lime" /> : <Copy className="w-4 h-4 text-text-secondary" />}
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                  {generatedContent.map((part, idx) => (
                    <div key={idx} className="relative">
                      {idx > 0 && (
                        <div className="absolute -top-3 left-0 w-full border-t border-dashed border-border/50" />
                      )}
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-text-muted font-mono mt-1">{idx + 1}</span>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed flex-1">{part}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 bg-surface border border-border rounded-xl p-4 mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary">How's this content?</span>
                  <button className="p-2 rounded-lg hover:bg-lime/10 hover:text-lime transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-coral/10 hover:text-coral transition-colors">
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={handleGenerateContent}
                  className="text-sm text-text-secondary hover:text-coral transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => setStep(3)}
                  className="p-4 rounded-xl border border-border hover:bg-surface transition-colors text-center"
                >
                  <ArrowLeft className="w-5 h-5 mx-auto mb-2 text-text-secondary" />
                  <p className="text-sm font-medium">Back</p>
                  <p className="text-xs text-text-muted">Choose different hook</p>
                </button>
                <button 
                  onClick={handleSendToEditor}
                  className="p-4 rounded-xl border border-coral bg-coral/10 hover:bg-coral/20 transition-colors text-center"
                >
                  <Send className="w-5 h-5 mx-auto mb-2 text-coral" />
                  <p className="text-sm font-medium text-coral">Open in Editor</p>
                  <p className="text-xs text-text-muted">Fine-tune your content</p>
                </button>
                <button 
                  className="p-4 rounded-xl border border-lime bg-lime/10 hover:bg-lime/20 transition-colors text-center"
                >
                  <Target className="w-5 h-5 mx-auto mb-2 text-lime" />
                  <p className="text-sm font-medium text-lime">Add to Campaign</p>
                  <p className="text-xs text-text-muted">Schedule for later</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
