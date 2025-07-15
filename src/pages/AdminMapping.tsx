import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Settings, Zap } from "lucide-react";
import Layout from "@/components/Layout";
import OptimizedMappingAnalytics from "@/components/admin/mapping/OptimizedMappingAnalytics";
import { MappingReview } from "@/components/admin/MappingReview";
import BulkOperationsPanel from "@/components/admin/mapping/BulkOperationsPanel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      retry: 1,
    },
  },
});

export default function AdminMapping() {
  const [activeTab, setActiveTab] = useState("analytics");

  const tabs = [
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      component: OptimizedMappingAnalytics,
      description: "Mapping statistics and system health",
    },
    {
      id: "review",
      label: "Manual Review",
      icon: Users,
      component: MappingReview,
      description: "Review and approve player mappings",
    },
    {
      id: "bulk",
      label: "Bulk Operations",
      icon: Zap,
      component: BulkOperationsPanel,
      description: "Run bulk mapping and sync operations",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      component: () => (
        <div className="text-center py-16 text-muted-foreground">
          <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Settings Panel</h3>
          <p>Configuration options coming soon</p>
        </div>
      ),
      description: "System configuration and preferences",
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab);

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Player Mapping System
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Manage player identity resolution between NFLverse and Sleeper
                data sources
              </p>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 lg:max-w-2xl lg:mx-auto h-14 bg-white dark:bg-slate-800 border shadow-sm">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          "flex flex-col items-center gap-1 py-2 px-3 transition-all duration-200",
                          "data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600",
                          "dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-medium">{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {/* Tab Content */}
                <div className="mt-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
                    >
                      {/* Tab Header */}
                      <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-3">
                          {activeTabConfig?.icon && (
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                              {React.createElement(activeTabConfig.icon, {
                                className:
                                  "h-5 w-5 text-blue-600 dark:text-blue-400",
                              })}
                            </div>
                          )}
                          <div>
                            <h2 className="text-xl font-semibold">
                              {activeTabConfig?.label}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              {activeTabConfig?.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tab Content */}
                      {ActiveComponent && <ActiveComponent />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </Layout>
    </QueryClientProvider>
  );
}
