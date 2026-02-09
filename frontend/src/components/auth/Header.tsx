import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const Header = () => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between px-16 py-8"
    >
      <Link to="/" className="flex items-center gap-3">
        <img src="./logo.svg" alt="Growth Labs logo" className="h-8 w-8" />
        <span className="font-russo text-lg tracking-wide">Growth Labs</span>
      </Link>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Link
          to="/docs"
          className="px-2 py-1 rounded-md font-medium text-white border-white/20 bg-white/10 border-2 transition flex items-center gap-2"
        >
          <BookOpen size={18} />
          Documentation
        </Link>
      </motion.div>
    </motion.header>
  );
};

export default Header;
