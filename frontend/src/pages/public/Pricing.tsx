import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  Sparkles,
  Crown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      icon: Zap,
      price: "29",
      description: "Perfect for individual creators getting started",
      features: [
        "Up to 5 campaigns per month",
        "Basic competitor analysis",
        "YouTube & X integration",
        "Standard analytics",
        "Email support",
        "Campaign templates",
      ],
      highlight: false,
      cta: "Start Free Trial",
    },
    {
      name: "Pro",
      icon: Sparkles,
      price: "79",
      description: "Best for growing creators and small teams",
      features: [
        "Unlimited campaigns",
        "Advanced competitor analysis",
        "YouTube & X integration",
        "Advanced analytics & forensics",
        "Priority support",
        "Custom campaign templates",
        "API access",
        "Team collaboration (up to 3)",
      ],
      highlight: true,
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise",
      icon: Crown,
      price: "Custom",
      description: "For agencies and large content teams",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "White-label options",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced API access",
        "SLA guarantee",
        "Custom training & onboarding",
      ],
      highlight: false,
      cta: "Contact Sales",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes! All plans come with a 14-day free trial. No credit card required to start.",
    },
    {
      question: "Can I change plans later?",
      answer:
        "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, and can arrange invoicing for Enterprise customers.",
    },
    {
      question: "Is there a long-term contract?",
      answer:
        "No. All plans are month-to-month with no long-term commitment. Cancel anytime.",
    },
    {
      question: "Do you offer discounts for annual billing?",
      answer: "Yes! Save 20% when you choose annual billing on any plan.",
    },
    {
      question: "What happens when I reach my campaign limit?",
      answer:
        "On the Starter plan, you'll be notified when approaching your limit. You can upgrade anytime or wait for the next billing cycle.",
    },
  ];

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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your growth goals. All plans include a
            14-day free trial.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className={`relative p-8 rounded-2xl ${
                plan.highlight
                  ? "bg-linear-to-b from-[#10B981] to-[#0d9668] text-white shadow-2xl border-2 border-[#10B981]"
                  : "bg-[#111113] border border-gray-800"
              }`}
            >
              {plan.highlight && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white text-[#10B981] px-4 py-1 rounded-full text-sm font-bold"
                >
                  Most Popular
                </motion.div>
              )}

              <plan.icon
                className={`mb-4 ${plan.highlight ? "text-white" : "text-[#45B778]"}`}
                size={32}
              />

              <h3
                className={`text-2xl font-bold mb-2 ${plan.highlight ? "text-white" : "text-white"}`}
              >
                {plan.name}
              </h3>

              <div className="mb-4">
                <span
                  className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-white"}`}
                >
                  {plan.price === "Custom" ? plan.price : `$${plan.price}`}
                </span>
                {plan.price !== "Custom" && (
                  <span
                    className={`text-sm ${plan.highlight ? "text-white/80" : "text-text-secondary"}`}
                  >
                    /month
                  </span>
                )}
              </div>

              <p
                className={`mb-6 ${plan.highlight ? "text-white/90" : "text-text-secondary"}`}
              >
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check
                      size={20}
                      className={`shrink-0 ${plan.highlight ? "text-white" : "text-[#45B778]"}`}
                    />
                    <span
                      className={`text-sm ${plan.highlight ? "text-white/90" : "text-text-secondary"}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.div
                whileHover={{
                  scale: 1.05,
                  boxShadow: plan.highlight
                    ? "0 10px 30px rgba(255, 255, 255, 0.3)"
                    : "0 10px 30px rgba(16, 185, 129, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  to="/signup"
                  className={`block w-full py-3 rounded-lg font-semibold text-center transition ${
                    plan.highlight
                      ? "bg-white text-[#10B981] hover:bg-gray-100"
                      : "bg-[#10B981] text-white hover:bg-[#0f9a72]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-3 border rounded-xl bg-[#111113] cursor-pointer hover:shadow-lg transition"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-white">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {openIndex === index ? (
                      <ChevronUp size={24} stroke="#45B778" />
                    ) : (
                      <ChevronDown size={24} stroke="#45B778" />
                    )}
                  </motion.div>
                </div>
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="mt-4 text-text-secondary text-sm">
                    {faq.answer}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center py-16 px-8 border rounded-2xl bg-linear-to-r from-[#162C20] to-[#1F3A2C]"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Our team is here to help you choose the right plan for your needs.
          </p>
          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="inline-block"
          >
            <Link
              to="/docs"
              className="inline-block px-8 py-4 bg-white text-[#10B981] rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Contact Sales
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
