import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const Header = () => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    {
      title: "Experiments",
      description: "Run structured growth tests",
    },
    {
      title: "Analytics",
      description: "Measure what actually worked",
    },
    {
      title: "Forensics",
      description: "Post-experiment insights",
    },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 h-20 flex items-center justify-between px-8 py-3 border-b bg-opacity-30 backdrop-blur"
    >
      <Link to="/" className="flex items-center justify-center gap-3">
        <img src="./logo.svg" alt="Growth Labs logo" className="h-8 w-8" />
        <span className="font-luckiest text-3xl">Growth Labs</span>
      </Link>

      <nav className="flex items-center gap-8 font-inter text-sm">
        <div
          className="relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="font-medium text-white/80 font-inter hover:text-[#17B880] transition-colors"
          >
            Product <ChevronDown size={16} className="inline-block ml-1" />
          </motion.button>

          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-3 w-64 rounded-lg border bg-card shadow-lg"
            >
              <ul className="py-2">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="px-4 py-3 hover:bg-surface transition cursor-pointer"
                  >
                    <div className="font-medium text-text">{item.title}</div>
                    <div className="text-xs text-text-muted">
                      {item.description}
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/docs"
            className="font-medium text-white/80 font-inter hover:text-[#17B880] transition-colors"
          >
            Docs
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/pricing"
            className="font-medium text-white/80 font-inter hover:text-[#17B880] transition-colors"
          >
            Pricing
          </Link>
        </motion.div>
      </nav>

      <div className="flex items-center gap-5 font-inter text-sm">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/signin"
            className="font-medium text-text-secondary hover:text-[#229F63] transition-colors"
          >
            Sign in
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link
            to="/signup"
            className="px-4 py-2 rounded-md font-medium text-white bg-[#229F63] hover:bg-[#1f8f58] transition"
          >
            Sign up
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
