
import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, BarChart3, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

const Index: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <Trophy className="h-4 w-4 text-emerald-400 mr-2" />
              <span className="text-emerald-400 text-sm font-medium">Advanced Fantasy Analytics</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Dominate Your
              <span className="text-emerald-400 block">Fantasy Leagues</span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Make data-driven decisions with advanced analytics, player insights, and predictive modeling. 
              Turn your fantasy football passion into championship wins.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="btn-primary px-8 py-4 text-lg inline-flex items-center justify-center"
            >
              Start Winning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              to="/login" 
              className="btn-secondary px-8 py-4 text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Fantasy Football Guru?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Professional-grade analytics tools that give you the competitive edge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-gradient rounded-xl p-8 text-center">
              <div className="bg-emerald-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Advanced Analytics</h3>
              <p className="text-slate-400">
                Deep statistical analysis, trend identification, and performance predictions 
                to optimize your lineup decisions.
              </p>
            </div>

            <div className="card-gradient rounded-xl p-8 text-center">
              <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Predictive Modeling</h3>
              <p className="text-slate-400">
                AI-powered projections that factor in matchups, weather, injuries, 
                and historical performance patterns.
              </p>
            </div>

            <div className="card-gradient rounded-xl p-8 text-center">
              <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">League Management</h3>
              <p className="text-slate-400">
                Track multiple leagues, monitor competition, and get instant alerts 
                on player news that affects your roster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card-gradient rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Become a Fantasy Football Guru?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join thousands of fantasy players who are already using data to dominate their leagues.
            </p>
            <Link 
              to="/signup" 
              className="btn-primary px-8 py-4 text-lg inline-flex items-center justify-center"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
