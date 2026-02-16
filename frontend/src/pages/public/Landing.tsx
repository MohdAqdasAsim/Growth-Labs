import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

// Marquee ticker
const MarqueeTicker = ({ messages }: { messages: string[] }) => {
  return (
    <div className="w-full border-t border-white/10 bg-black py-4 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...messages, ...messages].map((msg, i) => (
          <span key={i} className="mx-12 font-mono text-sm text-gray-500 tracking-[0.2em]">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between border-b border-white/10 bg-black overflow-hidden">
      {/* Grid lines */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundSize: '50px 50px',
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow px-8 md:px-16 py-20 max-w-7xl mx-auto w-full text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-bold text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tighter mb-10"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          GROW<br />
          YOUR<br />
          <span className="bg-gradient-to-r from-[#10B981] via-[#3B82F6] to-[#A855F7] bg-clip-text text-transparent">
            AUDIENCE.
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-[#10B981] text-sm md:text-base uppercase tracking-[0.2em] mb-12 border border-[#10B981]/30 bg-[#10B981]/5 px-6 py-4 backdrop-blur-sm"
        >
          <span className="block md:inline mr-4">// ANALYZING 2.4M CREATORS</span>
          <span className="block md:inline mr-4">// VIRAL PATTERNS DETECTED</span>
          <span className="block md:inline">// SUCCESS RATE: 99.2%</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-0 border border-white/20 w-fit mx-auto"
        >
          <Link
            to="/signup"
            className="px-10 py-5 bg-white text-black font-bold uppercase tracking-[0.15em] hover:bg-[#10B981] transition-colors text-sm md:text-base text-center"
          >
            BEGIN CONQUEST
          </Link>
          <Link
            to="/docs"
            className="px-10 py-5 bg-black border-l border-white/20 text-white font-bold uppercase tracking-[0.15em] hover:bg-white/10 transition-colors text-sm md:text-base text-center"
          >
            VIEW ARSENAL
          </Link>
        </motion.div>
      </div>

      <MarqueeTicker messages={[
        "// 10,000+ CREATORS",
        "// 50M+ VIEWS GENERATED",
        "// VIRAL HOOKS IDENTIFIED",
        "// COMPETITOR INTELLIGENCE ACTIVE"
      ]} />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
};

// Platforms Grid
const PlatformsGrid = () => {
  const platforms = [
    { name: "YouTube", color: "#FF0000", icon: "▶", metric: "10M+ Views" },
    { name: "X (Twitter)", color: "#1DA1F2", icon: "𝕏", metric: "500K+ Reach" },
    { name: "TikTok", color: "#000000", icon: "♪", metric: "5M+ Impressions", hasBg: true },
    { name: "Instagram", color: "#E4405F", icon: "◉", metric: "2M+ Engagement" },
  ];

  return (
    <section className="border-b border-white/10 bg-black relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {platforms.map((platform, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative border-r border-b border-white/10 p-12 h-96 flex flex-col justify-between hover:bg-white/[0.02] transition-colors overflow-hidden"
          >
            {/* Pixel icon */}
            <div className="relative h-32 flex items-center justify-center">
              <motion.div
                className={`text-8xl font-bold ${platform.hasBg ? 'px-4 py-2 bg-white' : ''}`}
                style={{ color: platform.color }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {platform.icon}
              </motion.div>
            </div>

            <div>
              <h3 
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                {platform.name}
              </h3>
              <p 
                className="font-mono text-sm tracking-wider"
                style={{ color: platform.color }}
              >
                {platform.metric}
              </p>
            </div>

            {/* Hover effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ 
                background: `radial-gradient(circle at center, ${platform.color}15, transparent 70%)` 
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// How It Works
const HowItWorks = () => {
  const steps = [
    {
      num: "1",
      title: "CONNECT ACCOUNTS",
      desc: "Link your YouTube, X, and Instagram profiles",
      color: "#10B981",
    },
    {
      num: "2",
      title: "AI ANALYZES",
      desc: "Our engine studies your niche and top performers",
      color: "#3B82F6",
    },
    {
      num: "3",
      title: "DOMINATE",
      desc: "Launch optimized campaigns and watch growth explode",
      color: "#A855F7",
    },
  ];

  return (
    <section className="py-24 px-8 bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl font-bold mb-20 tracking-tight"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          CLICK, CLICK, DONE.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-0">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="border-r border-white/10 last:border-r-0 p-8"
            >
              <div 
                className="w-16 h-16 flex items-center justify-center font-bold text-3xl mb-6"
                style={{ 
                  backgroundColor: step.color,
                  fontFamily: '"Space Grotesk", sans-serif'
                }}
              >
                {step.num}
              </div>
              <h3 
                className="text-2xl font-bold mb-3"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                {step.title}
              </h3>
              <p className="text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Feature Section Component
const FeatureSection = ({ 
  title, 
  subtitle,
  description, 
  visual, 
  bgColor, 
  reverse = false 
}: any) => {
  return (
    <section 
      className="py-32 px-8 border-b border-white/10 relative overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundSize: '50px 50px',
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
        }}
      />

      <div className={`max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10 ${reverse ? 'lg:grid-flow-dense' : ''}`}>
        <motion.div
          initial={{ opacity: 0, x: reverse ? 20 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className={reverse ? 'lg:col-start-2' : ''}
        >
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#10B981] mb-4">
            {subtitle}
          </div>
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            {title}
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            {description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: reverse ? -20 : 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="h-96 border border-white/10 bg-black/50 relative"
        >
          {visual}
        </motion.div>
      </div>
    </section>
  );
};

// Feature Sections
const Features = () => {
  return (
    <>
      <FeatureSection
        subtitle="// MODULE 01"
        title="CAMPAIGN ARCHITECT"
        description="Plan multi-day content strategies that keep your audience engaged. AI-powered narrative arcs designed for maximum retention and viral potential."
        bgColor="#991B1B"
        visual={
          <div className="absolute inset-0 p-8 flex items-center justify-center">
            <div className="grid grid-cols-7 gap-2 w-full">
              {[...Array(28)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`aspect-square ${
                    [3, 10, 17, 24].includes(i) 
                      ? 'bg-[#F97316]' 
                      : 'bg-white/10'
                  }`}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                />
              ))}
            </div>
          </div>
        }
      />

      <FeatureSection
        subtitle="// MODULE 02"
        title="COMPETITOR INTELLIGENCE"
        description="X-ray vision for your niche. See exactly what's working for top creators and replicate their success with AI-guided strategies."
        bgColor="#581C87"
        reverse
        visual={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 border-2 border-[#EC4899] rounded-full"
                  style={{ width: `${100 - i * 25}%`, height: `${100 - i * 25}%`, margin: 'auto' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-[#EC4899] rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        }
      />

      <FeatureSection
        subtitle="// MODULE 03"
        title="CONTENT OPTIMIZER"
        description="Transform mediocre posts into viral sensations. AI analyzes hooks, thumbnails, titles, and timing to maximize every piece of content."
        bgColor="#1E3A8A"
        visual={
          <div className="absolute inset-0 p-8">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="border border-white/20 p-4 flex flex-col justify-between">
                <div className="text-gray-500 text-xs font-mono">BEFORE</div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-2 bg-gray-700" style={{ width: `${60 + Math.random() * 20}%` }} />
                  ))}
                </div>
              </div>
              <div className="border border-[#10B981] p-4 flex flex-col justify-between">
                <div className="text-[#10B981] text-xs font-mono">AFTER</div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-2 bg-[#10B981]" style={{ width: `${85 + Math.random() * 15}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
      />

      <FeatureSection
        subtitle="// MODULE 04"
        title="ANALYTICS COMMAND CENTER"
        description="Real-time performance tracking across all platforms. Heatmaps show exactly what drives engagement, conversions, and growth."
        bgColor="#000000"
        reverse
        visual={
          <div className="absolute inset-0 p-8">
            <div className="grid grid-cols-8 gap-1 w-full h-full">
              {[...Array(64)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square transition-all duration-300 hover:scale-110"
                  style={{
                    backgroundColor: `rgba(16, 185, 129, ${Math.random() * 0.8 + 0.2})`
                  }}
                />
              ))}
            </div>
          </div>
        }
      />
    </>
  );
};

// Social Proof
const SocialProof = () => {
  const creators = [
    { type: "GAMER", growth: "+234%", color: "#A855F7" },
    { type: "BEAUTY", growth: "10X", color: "#EC4899" },
    { type: "TECH", growth: "+892%", color: "#3B82F6" },
    { type: "FITNESS", growth: "VIRAL", color: "#10B981" },
  ];

  return (
    <section className="py-24 px-8 bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold mb-16"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          CREATORS ALREADY <span className="text-[#10B981]">WINNING</span>
        </motion.h2>

        <div className="grid md:grid-cols-4 gap-8">
          {creators.map((creator, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="border border-white/10 p-8 hover:border-white/30 transition-colors"
            >
              <div 
                className="w-20 h-20 mx-auto mb-6"
                style={{ backgroundColor: creator.color }}
              />
              <div className="font-mono text-xs tracking-wider text-gray-500 mb-2">
                {creator.type}
              </div>
              <div 
                className="text-3xl font-bold"
                style={{ color: creator.color }}
              >
                {creator.growth}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// FAQ
const FAQSection = () => {
  const faqs = [
    {
      q: "WHICH PLATFORMS DOES GROWTH LABS SUPPORT?",
      a: "Currently YouTube, X (Twitter), and Instagram. TikTok integration coming Q2 2026.",
    },
    {
      q: "HOW FAST WILL I SEE RESULTS?",
      a: "Most creators see measurable growth within 48-72 hours of their first optimized campaign launch.",
    },
    {
      q: "DO I NEED TECHNICAL SKILLS?",
      a: "Zero. Our AI handles everything. You focus on creating; we handle the strategy and optimization.",
    },
    {
      q: "CAN I RUN MULTIPLE CAMPAIGNS?",
      a: "Yes. Manage unlimited campaigns across all platforms simultaneously with our dashboard.",
    },
    {
      q: "IS MY DATA SECURE?",
      a: "Absolutely. Enterprise-grade encryption. Your content and analytics are never shared or sold.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-32 px-8 bg-black border-b border-white/10">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold mb-16"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          SYSTEM FAQ
        </motion.h2>

        <div className="space-y-0">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border-t border-white/10 hover:bg-white/[0.02] transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-6 flex justify-between items-start gap-4 text-left"
              >
                <div className="flex items-start gap-4 flex-1">
                  <span className="font-mono text-[#10B981] text-sm flex-shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-bold text-sm tracking-[0.1em]">{faq.q}</h3>
                </div>
                <div className="text-[#10B981] text-2xl flex-shrink-0">
                  {openIndex === idx ? "−" : "+"}
                </div>
              </button>

              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: openIndex === idx ? "200px" : "0",
                }}
              >
                <p className="px-6 pb-6 pl-[4.5rem] text-gray-400">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA
const CTASection = () => {
  return (
    <section className="py-32 px-8 bg-gradient-to-b from-[#581C87] to-black border-b border-white/10 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundSize: '50px 50px',
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Pixel trophy */}
          <div className="w-32 h-32 mx-auto mb-12 bg-[#FFD700] relative">
            <div className="absolute inset-4 bg-black" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#FFD700]" />
          </div>

          <h2 
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            CLAIM YOUR <br />
            <span className="bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent">
              THRONE
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join 10,000+ creators who've transformed their channels into empires. Start dominating your niche today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-0 border border-white/20 w-fit mx-auto">
            <Link
              to="/signup"
              className="px-12 py-6 bg-white text-black font-bold uppercase tracking-[0.15em] hover:bg-[#10B981] transition-colors"
            >
              INITIATE SEQUENCE
            </Link>
            <Link
              to="/contact"
              className="px-12 py-6 bg-black border-l border-white/20 text-white font-bold uppercase tracking-[0.15em] hover:bg-white/10 transition-colors"
            >
              CONTACT TEAM
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-black py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-12">
          <div>
            <h2 
              className="text-7xl md:text-9xl font-bold text-white/10 tracking-tighter leading-none -ml-2"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              GROWTH
            </h2>
            <div className="flex gap-6 mt-8">
              <a href="#" className="text-sm font-bold uppercase tracking-[0.15em] hover:text-[#10B981] transition-colors">
                TWITTER
              </a>
              <a href="#" className="text-sm font-bold uppercase tracking-[0.15em] hover:text-[#10B981] transition-colors">
                INSTAGRAM
              </a>
              <a href="#" className="text-sm font-bold uppercase tracking-[0.15em] hover:text-[#10B981] transition-colors">
                DISCORD
              </a>
            </div>
          </div>
          <div className="text-right mt-10 md:mt-0">
            <p className="text-gray-500 text-sm font-mono">// EST. 2024</p>
            <p className="text-gray-500 text-sm font-mono">// ALL SYSTEMS NOMINAL</p>
            <p className="text-gray-500 text-sm font-mono">// UPTIME: 99.9%</p>
          </div>
        </div>

        <MarqueeTicker messages={[
          "// 10,000+ CREATORS",
          "// 50M+ VIEWS GENERATED",
          "// 99.2% SUCCESS RATE",
          "// TRUSTED BY TOP BRANDS"
        ]} />
      </div>
    </footer>
  );
};

// Main Component
const Landing = () => {
  return (
    <div className="bg-[#030303] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        * {
          border-radius: 0 !important;
        }
      `}</style>
      
      <HeroSection />
      <PlatformsGrid />
      <HowItWorks />
      <Features />
      <SocialProof />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Landing;