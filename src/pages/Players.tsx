import React from "react";
import { Users, Search, Filter } from "lucide-react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import ComingSoonCard from "../components/ComingSoonCard";
import { useQuery } from "@/hooks/useQuery";
import {
  APP_NAME,
  APP_TAGLINE,
  LOADING_MESSAGE,
  ERROR_GENERIC,
} from "@/lib/constants";
import { appConfig } from "@/config/app";

const Players: React.FC = () => {
  return (
    <Layout isAuthenticated>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Players"
          subtitle="Discover and analyze player performance data"
          icon={<Users className="h-8 w-8 mr-3 text-emerald-400" />}
          actions={
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search players..."
                  className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 hover:text-white transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          }
        />
        {/* Content */}
        <ComingSoonCard
          icon={<Users className="h-16 w-16 text-slate-600 mx-auto" />}
          title="Player Database Coming Soon"
          description="Access comprehensive player statistics, projections, and analysis tools to make informed roster decisions."
        />
      </div>
    </Layout>
  );
};

export default Players;
