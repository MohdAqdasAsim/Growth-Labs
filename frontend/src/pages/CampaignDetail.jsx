import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Plus, Youtube, Twitter, Linkedin, 
  MoreHorizontal, Target
} from 'lucide-react'

const platformIcons = { youtube: Youtube, twitter: Twitter, linkedin: Linkedin }

const statusColors = {
  draft: 'text-text-secondary',
  scheduled: 'text-amber',
  published: 'text-lime',
}

const mockCampaignData = {
  '1': {
    id: '1',
    name: 'The Solopreneur Pivot',
    description: 'Building a creator empire from scratch',
    status: 'active',
    platforms: ['youtube', 'twitter'],
    content: [
      { id: '2', title: 'Introduction to Solopreneur Life', platform: 'youtube', status: 'published' },
      { id: '3', title: 'Week 1 Results: What worked', platform: 'youtube', status: 'scheduled' },
    ]
  },
  '2': {
    id: '2',
    name: 'Digital Nomad Series',
    description: 'Work from anywhere, live everywhere',
    status: 'planning',
    platforms: ['youtube', 'twitter', 'linkedin'],
    content: [
      { id: '5', title: 'Remote work setup guide', platform: 'linkedin', status: 'published' },
    ]
  },
  '3': {
    id: '3',
    name: 'AI Tools Deep Dive',
    description: 'Exploring cutting-edge AI for creators',
    status: 'completed',
    platforms: ['youtube', 'twitter'],
    content: [
      { id: '1', title: '5 AI tools every creator needs', platform: 'twitter', status: 'draft' },
    ]
  },
  '4': {
    id: '4',
    name: 'Creator Economy 101',
    description: 'Everything about monetization',
    status: 'active',
    platforms: ['twitter', 'linkedin'],
    content: [
      { id: '4', title: 'Building in public thread', platform: 'twitter', status: 'draft' },
    ]
  },
}

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)

  useEffect(() => {
    const data = mockCampaignData[id]
    if (data) {
      setCampaign(data)
    }
  }, [id])

  if (!campaign) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-secondary">Campaign not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 bg-bg border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
                <Target className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{campaign.name}</h1>
                <div className="flex items-center gap-2">
                  <span className={`text-xs capitalize ${
                    campaign.status === 'active' ? 'text-cyan' : 
                    campaign.status === 'planning' ? 'text-amber' : 'text-lime'
                  }`}>
                    {campaign.status}
                  </span>
                  <span className="text-xs text-text-muted">•</span>
                  <span className="text-xs text-text-muted">{campaign.content.length} pieces</span>
                </div>
              </div>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-coral text-bg rounded-lg text-sm font-medium hover:bg-coral/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Content
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="text-text-secondary mb-4">{campaign.description}</p>
          <div className="flex items-center gap-2">
            {campaign.platforms.map((platform) => {
              const Icon = platformIcons[platform]
              return Icon ? (
                <div key={platform} className="flex items-center gap-1.5 px-2 py-1 bg-surface rounded text-xs text-text-secondary">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="capitalize">{platform}</span>
                </div>
              ) : null
            })}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">Content</h2>
          
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface text-text-secondary text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium w-28">Platform</th>
                  <th className="text-left px-4 py-3 font-medium w-28">Status</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {campaign.content.map((item) => {
                  const PlatformIcon = platformIcons[item.platform]
                  return (
                    <tr 
                      key={item.id}
                      onClick={() => navigate(`/editor/${item.id}`)}
                      className="border-t border-border hover:bg-surface-hover cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm text-text">{item.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {PlatformIcon && <PlatformIcon className="w-4 h-4 text-text-secondary" />}
                          <span className="text-sm text-text-secondary capitalize">{item.platform}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm capitalize ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={(e) => { e.stopPropagation() }}
                          className="p-1 rounded hover:bg-border transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-text-muted" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {campaign.content.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">No content yet</p>
              <button className="text-sm text-coral hover:underline">Add your first piece</button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
