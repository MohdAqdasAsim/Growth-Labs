import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code,
  Zap,
  Settings,
  FileText,
  Target,
  BarChart2,
  ChevronRight,
} from "lucide-react";

const Docs = () => {
  const [selectedSection, setSelectedSection] = useState("getting-started");

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Zap,
      content: {
        title: "Getting Started with Growth Labs",
        description:
          "Learn how to set up your account and start your first campaign in minutes.",
        steps: [
          {
            title: "Create Your Account",
            description:
              "Sign up with your email and connect your social media accounts (YouTube, X).",
          },
          {
            title: "Set Your Niche",
            description:
              "Define your content niche so our AI can analyze relevant competitors and trends.",
          },
          {
            title: "Analyze Competitors",
            description:
              "Our AI will automatically identify top-performing content in your niche.",
          },
          {
            title: "Generate Your First Campaign",
            description:
              "Create a multi-day social media campaign with optimized hooks, titles, and thumbnails.",
          },
        ],
      },
    },
    {
      id: "experiments",
      title: "Experiments",
      icon: Target,
      content: {
        title: "Running Growth Experiments",
        description:
          "Learn how to create and manage structured growth tests with AI guidance.",
        steps: [
          {
            title: "Create an Experiment",
            description:
              "Define your hypothesis and goals for the growth test you want to run.",
          },
          {
            title: "AI Recommendations",
            description:
              "Get AI-powered suggestions for content variations based on competitor analysis.",
          },
          {
            title: "Execute & Monitor",
            description:
              "Publish your content and track real-time performance metrics.",
          },
          {
            title: "Analyze Results",
            description:
              "Review detailed insights and iterate based on what worked.",
          },
        ],
      },
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: BarChart2,
      content: {
        title: "Understanding Your Analytics",
        description:
          "Track engagement, reach, and audience growth across all your campaigns.",
        steps: [
          {
            title: "Dashboard Overview",
            description:
              "View key metrics including views, engagement rate, and follower growth.",
          },
          {
            title: "Campaign Performance",
            description:
              "Compare multiple campaigns to identify winning strategies.",
          },
          {
            title: "Content Insights",
            description:
              "See which titles, hooks, and thumbnails perform best in your niche.",
          },
          {
            title: "Export Reports",
            description:
              "Download detailed reports for stakeholder presentations.",
          },
        ],
      },
    },
    {
      id: "api",
      title: "API Reference",
      icon: Code,
      content: {
        title: "API Documentation",
        description:
          "Integrate Growth Labs into your workflow with our REST API.",
        steps: [
          {
            title: "Authentication",
            description:
              "Generate API keys from your account settings and authenticate requests.",
          },
          {
            title: "Endpoints",
            description:
              "Access campaigns, analytics, and content generation endpoints.",
          },
          {
            title: "Rate Limits",
            description:
              "Understand request limits and best practices for API usage.",
          },
          {
            title: "Webhooks",
            description:
              "Set up webhooks to receive real-time updates on campaign performance.",
          },
        ],
      },
    },
  ];

  const quickLinks = [
    { icon: BookOpen, title: "Tutorials", count: "12 guides" },
    { icon: FileText, title: "Case Studies", count: "8 stories" },
    { icon: Settings, title: "Best Practices", count: "15 tips" },
  ];

  const currentSection = sections.find((s) => s.id === selectedSection);

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[48px_48px]">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-text-primary mb-4">
            Documentation
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Everything you need to know to grow your audience with Growth Labs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {quickLinks.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 border rounded-xl bg-[#111113] hover:shadow-xl transition cursor-pointer"
            >
              <link.icon className="mb-3" size={28} stroke="#45B778" />
              <h3 className="font-bold text-xl text-white mb-1">
                {link.title}
              </h3>
              <p className="text-sm text-text-secondary">{link.count}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSection(section.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition ${
                  selectedSection === section.id
                    ? "bg-[#10B981] text-white"
                    : "bg-[#111113] text-text-secondary hover:bg-[#1a1a1c]"
                }`}
              >
                <section.icon size={20} />
                <span className="font-medium">{section.title}</span>
                <ChevronRight
                  size={16}
                  className={`ml-auto ${selectedSection === section.id ? "opacity-100" : "opacity-0"}`}
                />
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            key={selectedSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-3 p-8 border rounded-xl bg-[#111113]"
          >
            <h2 className="text-3xl font-bold text-white mb-3">
              {currentSection?.content.title}
            </h2>
            <p className="text-text-secondary mb-8">
              {currentSection?.content.description}
            </p>

            <div className="space-y-6">
              {currentSection?.content.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 pt-8 border-t border-gray-800"
            >
              <p className="text-text-secondary text-sm">
                Need more help? Contact our support team at{" "}
                <span className="text-[#10B981]">support@growthlabs.com</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
