import React from "react";
import Layout from "@/components/Layout";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ComingSoonTest: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">ComingSoon Component Test</h1>
          <p className="text-muted-foreground mb-8">
            Testing the ComingSoon component with different configurations.
          </p>
        </div>

        {/* Default message */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Default Message</h2>
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
        </div>

        {/* Custom message */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Custom Message</h2>
          <div
            className={cn(
              "flex flex-col items-center justify-center min-h-[200px] p-8"
            )}
          >
            <div className="text-center">
              <p
                className={`text-lg ${themeClasses.TEXT_MUTED} font-medium tracking-wide`}
              >
                This feature is under development...
              </p>
            </div>
          </div>
        </div>

        {/* Another custom message */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Another Custom Message</h2>
          <div
            className={cn(
              "flex flex-col items-center justify-center min-h-[200px] p-8"
            )}
          >
            <div className="text-center">
              <p
                className={`text-lg ${themeClasses.TEXT_MUTED} font-medium tracking-wide`}
              >
                Stay tuned for updates!
              </p>
            </div>
          </div>
        </div>

        {/* With custom className */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">With Custom Styling</h2>
          <div
            className={cn(
              "flex flex-col items-center justify-center min-h-[200px] p-8",
              "bg-slate-100 dark:bg-slate-800 rounded-lg"
            )}
          >
            <div className="text-center">
              <p
                className={`text-lg ${themeClasses.TEXT_MUTED} font-medium tracking-wide`}
              >
                Custom styled coming soon message
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ComingSoonTest;
