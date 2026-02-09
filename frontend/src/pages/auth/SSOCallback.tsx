import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";

const SSOCallback = () => {
  const navigate = useNavigate();
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback();
        navigate("/dashboard");
      } catch (error) {
        console.error("SSO callback error:", error);
        navigate("/signin");
      }
    };

    handleCallback();
  }, [handleRedirectCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[48px_48px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="inline-block">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-white text-lg">Completing sign in...</p>
      </motion.div>
    </div>
  );
};

export default SSOCallback;
