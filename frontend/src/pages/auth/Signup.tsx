import { SignUp } from "@clerk/clerk-react";
import { motion } from "framer-motion";

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Create an account
          </h1>
          <p className="text-text-secondary">Start your growth journey today</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#111113] border border-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <SignUp
            signInUrl="/signin"
            fallbackRedirectUrl="/dashboard"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
