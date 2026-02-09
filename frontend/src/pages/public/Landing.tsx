import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Target,
  Search,
  Zap,
  BarChart2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Activity,
  PieChart,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  FaYoutube,
  FaInstagram,
  FaXTwitter,
  FaFacebook,
  FaTiktok,
  FaLinkedin,
  FaReddit,
  FaPinterest,
  FaSlack,
  FaDiscord,
  FaMastodon,
  FaTelegram,
  FaVk,
  FaDev,
  FaMedium,
  FaWordpress,
  FaDribbble,
} from "react-icons/fa6";
import { SiBluesky, SiLemmy, SiHashnode, SiThreads } from "react-icons/si";

const icons = [
  { Icon: FaYoutube, color: "#FF0000", name: "YouTube" },
  { Icon: FaInstagram, color: "#E4405F", name: "Instagram" },
  { Icon: FaXTwitter, color: "#1DA1F2", name: "X (Twitter)" },
  { Icon: FaFacebook, color: "#1877F2", name: "Facebook" },
  { Icon: FaTiktok, color: "#000000", name: "TikTok" },
  { Icon: FaLinkedin, color: "#0A66C2", name: "LinkedIn" },
  { Icon: FaReddit, color: "#FF4500", name: "Reddit" },
  { Icon: FaPinterest, color: "#E60023", name: "Pinterest" },
  { Icon: SiThreads, color: "#000000", name: "Threads" },
  { Icon: FaSlack, color: "#4A154B", name: "Slack" },
  { Icon: FaDiscord, color: "#5865F2", name: "Discord" },
  { Icon: FaMastodon, color: "#6364FF", name: "Mastodon" },
  { Icon: SiBluesky, color: "#1185FE", name: "Bluesky" },
  { Icon: SiLemmy, color: "#00BC8C", name: "Lemmy" },
  { Icon: FaTelegram, color: "#26A5E4", name: "Telegram" },
  { Icon: FaVk, color: "#0077FF", name: "VK" },
  { Icon: FaDev, color: "#0A0A0A", name: "Dev.to" },
  { Icon: FaMedium, color: "#000000", name: "Medium" },
  { Icon: SiHashnode, color: "#2962FF", name: "Hashnode" },
  { Icon: FaWordpress, color: "#21759B", name: "WordPress" },
  { Icon: FaDribbble, color: "#EA4C89", name: "Dribbble" },
];

const majorPlatforms = [
  { Icon: FaYoutube, color: "#FF0000" },
  { Icon: FaInstagram, color: "#E4405F" },
  { Icon: FaXTwitter, color: "#fff" },
  { Icon: FaLinkedin, color: "#0A66C2" },
  { Icon: FaTiktok, color: "#000000" },
];

const AtomicOrbitBackground = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full left-3/4 border border-white/5"
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        {icons.slice(0, 3).map(({ Icon, color }, i) => (
          <div
            key={i}
            className="absolute p-1 top-1/2 left-1/2"
            style={{
              transform: `
          translate(-50%, -50%)
          rotate(${i * 120}deg)
          translateX(350px)
        `,
            }}
          >
            <Icon size={40} style={{ color }} className="rotate-180" />
          </div>
        ))}
      </motion.div>

      <motion.div
        className="absolute w-[420px] h-[420px] rounded-full left-[83%] border border-white/8"
        animate={{ rotate: -360 }}
        transition={{ duration: 65, repeat: Infinity, ease: "linear" }}
      >
        {majorPlatforms.slice(3).map(({ Icon, color }, i) => (
          <div
            key={i}
            className="absolute p-1 top-1/2 left-1/2"
            style={{
              transform: `
          translate(-50%, -50%)
          rotate(${i * 180}deg)
          translateX(260px)
        `,
            }}
          >
            <Icon size={48} style={{ color }} className="rotate-180" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] p-12 pb-24 flex flex-col items-start justify-center text-center w-full pt-24 overflow-hidden">
      <AtomicOrbitBackground />
      <div className="relative z-10 max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl text-start font-extrabold text-white mb-6 font-plus-jakarta tracking-wider"
        >
          Where Creators
          <br />
          <span className="bg-linear-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent">
            Grow
          </span>{" "}
          Into Brands
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-300 max-w-3xl text-start mb-8 leading-relaxed"
        >
          Unlock your content's full potential with AI-driven insights. Analyze,
          optimize, and grow across platforms with data-backed strategies
          tailored for your niche.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-start items-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/signup"
              className="px-8 py-4 border-2 border-[#10B981] bg-[#10B981] text-white rounded-lg font-inter font-semibold hover:bg-[#0f9a72] hover:border-[#0f9a72] transition-all shadow-lg shadow-[#10B981]/30 hover:shadow-xl hover:shadow-[#10B981]/40"
            >
              Get Started
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/docs"
              className="px-8 py-4 border-2 border-[#10B981] text-[#10B981] rounded-lg font-inter font-semibold hover:bg-[#10B981] hover:text-white transition-all"
            >
              Watch Demo
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const DemoViewSection = ({ videoId }: { videoId: string }) => {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    const checkVideo = async () => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        );
        if (res.ok) setExists(true);
        else setExists(false);
      } catch {
        setExists(false);
      }
    };

    checkVideo();
  }, [videoId]);

  if (!exists) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-[85%] max-w-6xl mx-auto aspect-video mb-24 relative group"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#10B981]/20 to-[#059669]/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-0 group-hover:opacity-100" />

      <iframe
        className="relative w-full h-full rounded-2xl shadow-2xl border border-gray-800"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </motion.div>
  );
};
import { AnimatePresence } from "framer-motion";

const HowItWorksSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const steps = [
    {
      icon: Target,
      title: "Add Your Profiles",
      description: "Connect your YouTube and X accounts and set your niche.",
      gradient: "from-[#162C20] to-[#1F3A2C]",
    },
    {
      icon: Search,
      title: "Analyze Competitors",
      description: "Discover patterns in top-performing content in your niche.",
      gradient: "from-[#1F3A2C] to-[#16332A]",
    },
    {
      icon: Zap,
      title: "Generate Campaigns",
      description:
        "Create multi-day social media campaigns with optimized hooks, titles, and thumbnails.",
      gradient: "from-[#3A2C16] to-[#1F3A2C]",
    },
    {
      icon: BarChart2,
      title: "Track Performance",
      description:
        "Get insights, recommendations, and actionable growth strategies.",
      gradient: "from-[#1F3A2C] to-[#3A2C16]",
    },
  ];

  return (
    <section
      className="p-16 w-full py-32 bg-white mx-auto relative"
      style={{
        background: `linear-gradient(
          to bottom,
          #0F0F1200 0%,
          #0F0F1233 5%,
          #0F0F1266 10%,
          #0F0F12 20%,
          #0F0F12 80%,
          #0F0F1266 90%,
          #0F0F1233 95%,
          #0F0F1200 100%
        )`,
      }}
    >
      {/* Header */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-semibold text-white mb-4 text-center"
      >
        How It Works
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-gray-400 text-center mb-16 max-w-2xl mx-auto"
      >
        Get started in minutes and watch your content strategy transform
      </motion.p>

      {/* Cards */}
      <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;

          return (
            <motion.div
              key={index}
              onClick={() => setActiveIndex(index)}
              layout
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`
                relative cursor-pointer rounded-3xl overflow-hidden
                bg-gradient-to-br ${step.gradient}
                border border-white/5 shadow-xl
                flex items-center justify-center
                ${isActive ? "w-[560px]" : "w-[120px] hover:w-[100px]"}
                h-[560px]
              `}
            >
              {/* Content */}
              <AnimatePresence initial={false}>
                {isActive ? (
                  <motion.div
                    key="open"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center text-white"
                  >
                    <step.icon
                      size={42}
                      stroke="#45B778"
                      strokeWidth={2}
                      className="mb-6"
                    />
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-sm opacity-90 leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white"
                  >
                    <step.icon size={28} stroke="#45B778" strokeWidth={2} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Activity,
      title: "Experiments",
      items: [
        "Run structured growth tests with AI guidance.",
        "Quickly iterate content ideas based on results.",
        "Tailored suggestions for your niche and audience.",
      ],
    },
    {
      icon: PieChart,
      title: "Analytics",
      items: [
        "Measure what actually works across platforms.",
        "Track engagement, reach, and audience growth.",
        "Detailed post-campaign reports for decisions.",
      ],
    },
    {
      icon: Activity,
      title: "Forensics",
      items: [
        "Post-campaign insights to refine strategies.",
        "Identify patterns in high-performing content.",
        "Actionable recommendations for future campaigns.",
      ],
    },
  ];

  return (
    <section className="py-24 px-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-semibold text-white mb-4 text-center"
      >
        Core Features
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-gray-400 text-center mb-16 max-w-2xl mx-auto"
      >
        Everything you need to grow your social media presence
      </motion.p>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            whileHover={{
              scale: 1.03,
              y: -8,
              transition: { duration: 0.3 },
            }}
            className="relative p-8 rounded-2xl hover:shadow-2xl transition-all bg-gradient-to-br from-[#111113] to-[#1a1a1c] text-white border border-gray-800 hover:border-[#10B981]/30 group"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-[#10B981]/10 flex items-center justify-center mb-6 group-hover:bg-[#10B981]/20 transition-colors">
                <feature.icon size={28} stroke="#45B778" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-2xl mb-4">{feature.title}</h3>
              <ul className="text-sm text-gray-400 space-y-3">
                {feature.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      className="text-[#10B981] mt-0.5 flex-shrink-0"
                    />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      question: "Which platforms does Growth Labs support?",
      answer:
        "Growth Labs currently supports YouTube and X (Twitter). It analyzes your content and competitor activity to generate optimized multi-day campaigns for these platforms.",
    },
    {
      question: "Do I need to track my content performance manually?",
      answer:
        "No. Our AI automatically tracks engagement metrics, reach, and audience growth, giving you clear insights and actionable recommendations without extra effort.",
    },
    {
      question: "Can I run multiple campaigns simultaneously?",
      answer:
        "Yes. You can create, manage, and monitor multiple campaigns at once. Each campaign receives tailored guidance based on your niche, competitors, and past performance.",
    },
    {
      question: "How does Growth Labs help me improve my content?",
      answer:
        "It studies your content and your competitors' top-performing posts to generate optimized titles, hooks, thumbnails, and posting strategies. Every recommendation is evidence-based and actionable.",
    },
    {
      question: "Is my account data secure?",
      answer:
        "Absolutely. All data is encrypted and stored securely. Your content, profiles, and analytics are used only to provide AI-powered insights and campaign recommendations.",
    },
    {
      question: "Do I need technical skills to use Growth Labs?",
      answer:
        "No. The platform is designed for creators of all experience levels. The interface is intuitive, and AI guidance makes campaign creation and analysis simple and actionable.",
    },
    {
      question: "How does Growth Labs generate campaign ideas?",
      answer:
        "Our AI analyzes your niche, competitor strategies, and content performance patterns to generate multi-day campaigns with optimized hooks, titles, and thumbnails that maximize engagement.",
    },
    {
      question: "Can I customize the AI suggestions?",
      answer:
        "Yes. All AI-generated campaigns and recommendations are fully editable, so you remain in control of your content strategy while benefiting from AI insights.",
    },
    {
      question: "Is Growth Labs suitable for small niche creators?",
      answer:
        "Definitely. The platform works with all content sizes and niches, helping smaller creators identify growth opportunities based on competitor insights and audience behavior.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-8 w-full flex items-center justify-center flex-col">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-semibold text-white mb-4 text-center"
      >
        Frequently Asked Questions
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-gray-400 text-center mb-16 max-w-2xl"
      >
        Got questions? We've got answers.
      </motion.p>
      <div className="flex flex-col w-full max-w-3xl gap-4">
        {faqs.map((faq, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="p-5 border border-gray-800 rounded-xl bg-gradient-to-br from-[#111113] to-[#1a1a1c] cursor-pointer hover:shadow-lg hover:border-[#10B981]/30 transition-all"
            onClick={() => toggleFAQ(idx)}
          >
            <div className="flex justify-between items-center gap-4">
              <h3 className="font-bold text-lg text-white">{faq.question}</h3>
              <motion.div
                animate={{ rotate: openIndex === idx ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                {openIndex === idx ? (
                  <ChevronUp size={24} className="text-[#10B981]" />
                ) : (
                  <ChevronDown size={24} className="text-[#10B981]" />
                )}
              </motion.div>
            </div>
            <motion.div
              initial={false}
              animate={{
                height: openIndex === idx ? "auto" : 0,
                opacity: openIndex === idx ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <p className="mt-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-24 px-8 text-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10B981]/5 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10 border border-[#10B981]/30 rounded-3xl p-12 md:p-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Ready to grow your audience?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Join Growth Labs today and get AI-powered insights, competitor
            analysis, and optimized campaigns to take your content to the next
            level.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                y: -4,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                to="/signup"
                className="px-10 py-5 bg-[#10B981] text-white rounded-lg font-semibold hover:bg-[#0f9a72] transition-all shadow-lg shadow-[#10B981]/40 hover:shadow-xl hover:shadow-[#10B981]/50 inline-block"
              >
                Start Free Trial
              </Link>
            </motion.div>
            <motion.div
              whileHover={{
                scale: 1.05,
                y: -4,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                to="/contact"
                className="px-10 py-5 border-2 border-[#10B981] text-[#10B981] rounded-lg font-semibold hover:bg-[#10B981] hover:text-white transition-all inline-block"
              >
                Contact Sales
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Landing = () => {
  const videoId = import.meta.env.VITE_GRAPHICS_VIDEO_ID;
  return (
    <div className="">
      <HeroSection />
      <DemoViewSection videoId={videoId} />
      <HowItWorksSection />
      <FeaturesSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default Landing;
