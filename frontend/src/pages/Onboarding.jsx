import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowRight, ArrowLeft, Check, User, Target, Sparkles,
  Youtube, Twitter, Linkedin, Pen, BrainCircuit
} from 'lucide-react'

const steps = [
  { id: 'basics', title: 'Creator Basics', icon: User },
  { id: 'goals', title: 'Your Goals', icon: Target },
  { id: 'platforms', title: 'Platforms', icon: Sparkles },
]

const platformOptions = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-cyan' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-500' },
]

const goalOptions = [
  'Grow my audience',
  'Monetize my content',
  'Build a personal brand',
  'Become a thought leader',
  'Launch a product/service',
  'Get more engagement',
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    style: '',
    goals: [],
    platforms: [],
    youtubeChannel: '',
    twitterHandle: '',
    linkedinUrl: '',
  })

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const togglePlatform = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    localStorage.setItem('creatorProfile', JSON.stringify({
      name: formData.name,
      niche: formData.niche,
      style: formData.style,
      goals: formData.goals,
      platforms: formData.platforms,
      youtubeChannel: formData.youtubeChannel,
      twitterHandle: formData.twitterHandle,
      linkedinUrl: formData.linkedinUrl,
      onboarded: true,
    }))
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 800)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() && formData.niche.trim()
      case 1:
        return formData.goals.length > 0
      case 2:
        return formData.platforms.length > 0
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text flex">
      <div className="w-64 bg-sidebar border-r border-border p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border">
            <Pen className="w-4 h-4 text-coral" />
          </div>
          <span className="font-bold">Super Engine</span>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                index === currentStep 
                  ? 'bg-surface text-coral border border-border' 
                  : index < currentStep
                  ? 'text-lime'
                  : 'text-text-muted'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index < currentStep ? 'bg-lime/20' : index === currentStep ? 'bg-bg border border-coral' : 'bg-surface'
              }`}>
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <p className="text-xs text-text-muted">
            Step {currentStep + 1} of {steps.length}
          </p>
          <div className="mt-2 h-1 bg-surface rounded-full overflow-hidden">
            <div 
              className="h-full bg-coral transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-xl w-full">
            {currentStep === 0 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Tell us about yourself</h1>
                  <p className="text-text-secondary text-sm">Help our AI agents understand your unique creator identity.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your name or brand name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Creator, TechWithAlex"
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-coral text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">What's your niche or topic area?</label>
                    <input
                      type="text"
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                      placeholder="e.g. AI & Tech, Personal Finance, Fitness"
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-coral text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Describe your content style (optional)</label>
                    <textarea
                      value={formData.style}
                      onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                      placeholder="e.g. Educational but entertaining, I use analogies and memes. My tone is casual and relatable."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-coral resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold mb-2">What are your goals?</h1>
                  <p className="text-text-secondary text-sm">Select all that apply. This helps us prioritize strategies.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {goalOptions.map(goal => (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          formData.goals.includes(goal)
                            ? 'bg-surface border-coral text-coral shadow-sm'
                            : 'bg-surface border-border hover:border-border-light'
                        }`}
                      >
                        <span className="text-xs font-medium">{goal}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">Where do you create?</h1>
                    <p className="text-text-secondary text-sm">Select platforms you're active on or want to grow.</p>
                  </div>

                  <div className="space-y-3">
                    {platformOptions.map(platform => (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${
                          formData.platforms.includes(platform.id)
                            ? 'bg-surface border-coral shadow-sm'
                            : 'bg-surface border-border hover:border-border-light'
                        }`}
                      >
                        <platform.icon className={`w-5 h-5 ${platform.color}`} />
                        <span className="text-sm font-medium">{platform.name}</span>
                        {formData.platforms.includes(platform.id) && (
                          <Check className="w-4 h-4 text-coral ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>

                {formData.platforms.includes('youtube') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">YouTube Channel URL (optional)</label>
                    <input
                      type="text"
                      value={formData.youtubeChannel}
                      onChange={(e) => setFormData({ ...formData, youtubeChannel: e.target.value })}
                      placeholder="https://youtube.com/@yourchannel"
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-coral text-sm"
                    />
                  </div>
                )}

                {formData.platforms.includes('twitter') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Twitter Handle (optional)</label>
                    <input
                      type="text"
                      value={formData.twitterHandle}
                      onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                      placeholder="@yourhandle"
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-coral text-sm"
                    />
                  </div>
                )}
              </div>
            )}

          <div className="flex items-center justify-between mt-12">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                currentStep === 0 
                  ? 'text-text-muted cursor-not-allowed' 
                  : 'text-text hover:bg-surface'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    canProceed()
                      ? 'bg-coral text-white hover:opacity-90 transition-opacity'
                      : 'bg-surface text-text-muted cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                    canProceed() && !loading
                      ? 'bg-coral text-white hover:opacity-90 transition-opacity'
                      : 'bg-surface text-text-muted cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4" />
                      Launch My AI Agents
                    </>
                  )}
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
