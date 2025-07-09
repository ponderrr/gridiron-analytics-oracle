import React from "react";
import Layout from "@/components/Layout";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/constants";
import { cn } from "@/lib/utils";

const Dashboard: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  return (
    <Layout>
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[200px] p-8"
        )}
      >
        <div className="text-center">
          <p
            className={`text-lg ${themeClasses.TEXT_MUTED} font-medium tracking-wide`}
          >
            Coming soon...
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
