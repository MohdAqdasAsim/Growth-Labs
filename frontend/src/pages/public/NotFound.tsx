import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const suggestions = [
    {
      icon: Home,
      title: "Go Home",
      description: "Return to the homepage",
      link: "/",
    },
    {
      icon: Search,
      title: "View Docs",
      description: "Check our documentation",
      link: "/docs",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[48px_48px] px-4">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-9xl font-bold text-[#10B981] mb-4"
          >
            404
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl font-semibold text-text-primary mb-4"
          >
            Page Not Found
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-text-secondary mb-12"
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link
                to={suggestion.link}
                className="block p-6 border rounded-xl bg-[#111113] hover:shadow-xl transition"
              >
                <suggestion.icon
                  className="mx-auto mb-3"
                  size={32}
                  stroke="#45B778"
                />
                <h3 className="font-bold text-xl text-white mb-2">
                  {suggestion.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {suggestion.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
