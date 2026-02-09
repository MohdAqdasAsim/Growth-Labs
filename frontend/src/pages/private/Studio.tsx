import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Image,
  Video,
  FileText,
  Folder,
  Search,
  Filter,
  Calendar,
  Eye,
  Download,
  MoreVertical,
  Zap,
} from "lucide-react";

const contentItems = [
  {
    id: 1,
    type: "image",
    name: "Product Launch Hero",
    date: "2024-03-15",
    size: "2.4 MB",
    dimensions: "1920x1080",
  },
  {
    id: 2,
    type: "video",
    name: "Behind the Scenes",
    date: "2024-03-14",
    size: "45.2 MB",
    duration: "1:24",
  },
  {
    id: 3,
    type: "document",
    name: "Campaign Brief Q1",
    date: "2024-03-12",
    size: "156 KB",
    pages: 8,
  },
  {
    id: 4,
    type: "image",
    name: "Social Media Graphics",
    date: "2024-03-10",
    size: "1.8 MB",
    dimensions: "1080x1080",
  },
];

const Studio = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return Image;
      case "video":
        return Video;
      case "document":
        return FileText;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "text-blue-400 bg-blue-400/10";
      case "video":
        return "text-purple-400 bg-purple-400/10";
      case "document":
        return "text-amber-400 bg-amber-400/10";
      default:
        return "text-neutral-400 bg-neutral-400/10";
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-50 mb-2">Studio</h1>
          <p className="text-neutral-500 text-sm">
            Create content and manage your media library
          </p>
        </div>

        {/* Standalone Post Generation - Featured */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-[#1B9C5B]/20 via-[#1B9C5B]/10 to-transparent border-2 border-[#1B9C5B]/30 rounded-2xl p-8 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B9C5B]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#1B9C5B]/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-[#1B9C5B]/20 rounded-xl">
                      <Sparkles className="w-7 h-7 text-[#1B9C5B]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-50">
                        AI Post Generator
                      </h2>
                      <p className="text-sm text-neutral-400">
                        Create engaging posts instantly with AI
                      </p>
                    </div>
                  </div>
                  <p className="text-neutral-300 max-w-2xl leading-relaxed mb-6">
                    Generate professional social media posts in seconds. Just
                    provide your topic and preferences, and our AI will craft
                    compelling content tailored to your audience across any
                    platform.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                      <Zap className="w-4 h-4 text-[#1B9C5B]" />
                      <span className="text-sm text-neutral-400">
                        Instant Generation
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                      <Sparkles className="w-4 h-4 text-[#1B9C5B]" />
                      <span className="text-sm text-neutral-400">
                        Multi-Platform
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                      <Eye className="w-4 h-4 text-[#1B9C5B]" />
                      <span className="text-sm text-neutral-400">
                        Live Preview
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/studio/create-post")}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#1B9C5B] hover:bg-[#1B9C5B]/90 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-[#1B9C5B]/30 hover:shadow-xl hover:shadow-[#1B9C5B]/40 hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                Generate New Post
              </button>
            </div>
          </div>
        </div>

        {/* Content Library */}
        <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl overflow-hidden">
          {/* Library Header */}
          <div className="p-6 border-b border-neutral-800/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Folder className="w-5 h-5 text-[#1B9C5B]" />
                <h2 className="text-xl font-bold text-neutral-50">
                  Content Library
                </h2>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-300 rounded-lg transition-all duration-200 border border-neutral-800 text-sm font-medium">
                <Plus className="w-4 h-4" />
                Upload
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search content..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-[#1B9C5B]/50 focus:ring-2 focus:ring-[#1B9C5B]/20 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-400 rounded-lg transition-all duration-200 border border-neutral-800">
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {contentItems.map((item) => {
                const Icon = getIcon(item.type);
                const colorClass = getTypeColor(item.type);

                return (
                  <div
                    key={item.id}
                    className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-4 hover:border-neutral-700/60 hover:bg-neutral-900/50 transition-all duration-200 cursor-pointer group"
                  >
                    {/* Preview Area */}
                    <div className="aspect-video bg-neutral-800/50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      <div className={`p-4 rounded-xl ${colorClass}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-2">
                          <button className="p-2 bg-neutral-900/90 rounded-lg hover:bg-neutral-800 transition-colors">
                            <Eye className="w-4 h-4 text-neutral-300" />
                          </button>
                          <button className="p-2 bg-neutral-900/90 rounded-lg hover:bg-neutral-800 transition-colors">
                            <Download className="w-4 h-4 text-neutral-300" />
                          </button>
                          <button className="p-2 bg-neutral-900/90 rounded-lg hover:bg-neutral-800 transition-colors">
                            <MoreVertical className="w-4 h-4 text-neutral-300" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-200 mb-1 truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </div>
                        <span>{item.size}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-neutral-800/50">
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`px-2 py-0.5 rounded ${colorClass} capitalize`}
                          >
                            {item.type}
                          </span>
                          {item.type === "image" && item.dimensions && (
                            <span className="text-neutral-600">
                              {item.dimensions}
                            </span>
                          )}
                          {item.type === "video" && item.duration && (
                            <span className="text-neutral-600">
                              {item.duration}
                            </span>
                          )}
                          {item.type === "document" && item.pages && (
                            <span className="text-neutral-600">
                              {item.pages} pages
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State (when no content) */}
            {contentItems.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-neutral-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Folder className="w-8 h-8 text-neutral-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-300 mb-2">
                  No content yet
                </h3>
                <p className="text-neutral-600 text-sm mb-6">
                  Upload your first file to get started
                </p>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1B9C5B] hover:bg-[#1B9C5B]/90 text-white rounded-lg transition-all duration-200 font-medium mx-auto shadow-lg shadow-[#1B9C5B]/20">
                  <Plus className="w-4 h-4" />
                  Upload File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;
