import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  TrendingUp,
  Users,
  ArrowRight,
  ArrowLeftRight,
  BarChart3,
  Brain,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses, SPACING_SCALE } from "@/lib/constants";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

const Index: React.FC = () => {
  const { user } = useAuth();
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (user) return null;

  return (
    <Layout>
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center"
        style={{ padding: `${SPACING_SCALE["2xl"]} ${SPACING_SCALE.md}` }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div style={{ marginBottom: SPACING_SCALE.xl }}>
            <div
              className="inline-flex items-center bg-emerald-500/10 border border-emerald-500/20 rounded-full"
              style={{
                padding: `${SPACING_SCALE.sm} ${SPACING_SCALE.md}`,
                marginBottom: SPACING_SCALE.lg,
              }}
            >
              <Trophy className="h-4 w-4 text-emerald-400 mr-2" />
              <span className="text-emerald-400 text-sm font-medium">
                Advanced Fantasy Analytics
              </span>
            </div>

            <h1
              className={`text-4xl md:text-7xl font-bold ${themeClasses.TEXT_PRIMARY}`}
              style={{ marginBottom: SPACING_SCALE.xl, lineHeight: 1.1 }}
            >
              Dominate Your{" "}
              <span className="text-emerald-400 block">Fantasy League</span>
              <span
                className="text-2xl md:text-4xl text-slate-300 block"
                style={{ marginTop: SPACING_SCALE.sm }}
              >
                with Data-Driven Insights
              </span>
            </h1>

            <p
              className="text-xl text-slate-400 max-w-3xl mx-auto"
              style={{ marginBottom: SPACING_SCALE.xl }}
            >
              Make smarter decisions with advanced analytics, AI-powered
              projections, and real-time market intelligence.
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row justify-center"
            style={{
              gap: SPACING_SCALE.md,
              marginBottom: SPACING_SCALE["2xl"],
            }}
          >
            <Link
              to="/signup"
              className="btn-primary text-lg inline-flex items-center justify-center group"
              style={{ padding: `${SPACING_SCALE.md} ${SPACING_SCALE.xl}` }}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary text-lg"
              style={{ padding: `${SPACING_SCALE.md} ${SPACING_SCALE.xl}` }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{ padding: `${SPACING_SCALE["2xl"]} ${SPACING_SCALE.md}` }}
        className="bg-slate-800/30"
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="text-center"
            style={{ marginBottom: SPACING_SCALE["2xl"] }}
          >
            <h2
              className="text-3xl md:text-5xl font-bold text-white"
              style={{ marginBottom: SPACING_SCALE.md }}
            >
              Everything You Need to Win
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Professional-grade analytics tools that give you the competitive
              edge in every matchup
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            style={{ gap: SPACING_SCALE.xl }}
          >
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-indigo-400" />}
              title="Rankings"
              description="Dynamic, real-time rankings tailored to your league format."
              bgColor="indigo-500/20"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-orange-400" />}
              title="League Integration"
              description="Connect all your leagues for unified management and insights."
              bgColor="orange-500/20"
            />
            <FeatureCard
              icon={<ArrowLeftRight className="h-6 w-6 text-purple-400" />}
              title="Trade Tool"
              description="AI-powered trade analytics using your rankings and insights."
              bgColor="purple-500/20"
            />
            <FeatureCard
              icon={<Brain className="h-6 w-6 text-emerald-400" />}
              title="Projections"
              description="AI-powered projections using advanced algorithms and real-time data."
              bgColor="emerald-500/20"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-800/70 transition-colors">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-${bgColor}`}
    >
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm">{description}</p>
  </div>
);

export default Index;
