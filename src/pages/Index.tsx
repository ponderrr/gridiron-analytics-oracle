import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BarChart3, ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

const Index: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (user) return null;

  return (
    <Layout>
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-3xl text-center mb-20"
        >
          <h1
            className={"text-4xl md:text-6xl font-bold mb-6 text-theme-primary"}
            style={{ letterSpacing: "-0.02em" }}
          >
            Make smarter decisions
            <br className="hidden md:block" /> with advanced analytics
          </h1>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.18 } },
          }}
          className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-12 px-4"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 32 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: "easeOut" },
              },
            }}
            className="flex flex-col items-center p-8"
          >
            <BarChart3 className="h-12 w-12 text-indigo-400 mb-6" />
            <h3
              className={"text-xl font-semibold mb-3 text-theme-primary"}
            >
              Rankings
            </h3>
            <p
              className={"text-base text-center text-theme-tertiary"}
            >
              Dynamic, real-time rankings tailored to your league format.
            </p>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 32 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: "easeOut" },
              },
            }}
            className="flex flex-col items-center p-8"
          >
            <Users className="h-12 w-12 text-sky-400 mb-6" />
            <h3
              className={"text-xl font-semibold mb-3 text-theme-primary"}
            >
              League Integration
            </h3>
            <p
              className={"text-base text-center text-theme-tertiary"}
            >
              Connect all your leagues for unified management and insights.
            </p>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 32 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: "easeOut" },
              },
            }}
            className="flex flex-col items-center p-8"
          >
            <ArrowLeftRight className="h-12 w-12 text-purple-400 mb-6" />
            <h3
              className={"text-xl font-semibold mb-3 text-theme-primary"}
            >
              Trade Tool
            </h3>
            <p
              className={"text-base text-center text-theme-tertiary"}
            >
              AI-powered trade analytics using your rankings and insights.
            </p>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default Index;
