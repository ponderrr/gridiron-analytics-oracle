import React from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  TrendingUp,
  Users,
  ArrowRight,
  Brain,
} from "lucide-react";
import Layout from "@/components/Layout";

const Index: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <Trophy className="h-4 w-4 text-emerald-400 mr-2" />
              <span className="text-emerald-400 text-sm font-medium">
                Advanced Fantasy Analytics
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Dominate Your
              <span className="text-emerald-400 block">Fantasy League</span>
              <span className="text-2xl md:text-4xl text-slate-300 block mt-2">
                with Data-Driven Insights
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
              Make smarter decisions with advanced analytics, AI-powered
              projections, and real-time market intelligence. Turn your fantasy
              football passion into championship wins.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/signup"
              className="btn-primary px-8 py-4 text-lg inline-flex items-center justify-center group"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-4 text-lg">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                95%
              </div>
              <div className="text-sm text-slate-400">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                50K+
              </div>
              <div className="text-sm text-slate-400">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                $2.1M
              </div>
              <div className="text-sm text-slate-400">Won</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                24/7
              </div>
              <div className="text-sm text-slate-400">Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to Win
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Professional-grade analytics tools that give you the competitive
              edge in every matchup
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-800/70 transition-colors">
              <div className="bg-emerald-500/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Advanced Player Projections
              </h3>
              <p className="text-slate-400 text-sm">
                AI-powered projections using advanced algorithms and real-time
                data
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-800/70 transition-colors">
              <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                AI-Powered Trade Analysis
              </h3>
              <p className="text-slate-400 text-sm">
                Evaluate trades instantly with comprehensive impact analysis
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-800/70 transition-colors">
              <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Real-Time Market Intelligence
              </h3>
              <p className="text-slate-400 text-sm">
                Stay ahead with live market trends and opportunity alerts
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-800/70 transition-colors">
              <div className="bg-orange-500/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                League Integration
              </h3>
              <p className="text-slate-400 text-sm">
                Connect all your leagues for unified management and insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400">
              Three simple steps to fantasy football domination
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Connect Your League
              </h3>
              <p className="text-slate-400">
                Link your fantasy platforms and we'll sync all your team data
                automatically
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Get AI Insights
              </h3>
              <p className="text-slate-400">
                Our advanced algorithms analyze thousands of data points to
                provide actionable insights
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Dominate Your League
              </h3>
              <p className="text-slate-400">
                Make data-driven decisions and watch your win rate soar to new
                heights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/50 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Become a Fantasy Football Guru?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join thousands of fantasy players who are already using data to
              dominate their leagues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="btn-primary px-8 py-4 text-lg inline-flex items-center justify-center group"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-4 text-lg">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
