import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  const footerLinks = [
    { name: "Support", href: "#" },
    { name: "Terms", href: "/terms" },
    { name: "Privacy", href: "/privacy" },
  ];

  return (
    <footer className="flex flex-col md:flex-row items-center justify-between px-8 py-6 border-t font-inter text-sm gap-4 md:gap-0">
      <div className="flex gap-6 text-text-secondary">
        {footerLinks.map((link, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={link.href}
              className="cursor-pointer hover:text-[#229F63] transition-colors"
            >
              {link.name}
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="text-text-muted">© 2026 Growth Labs</div>
    </footer>
  );
};

export default Footer;
