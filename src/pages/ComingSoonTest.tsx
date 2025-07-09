import React from "react";
import Layout from "@/components/Layout";
import { ComingSoon } from "@/components/common";

const ComingSoonTest: React.FC = () => {
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
          <ComingSoon />
        </div>

        {/* Custom message */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Custom Message</h2>
          <ComingSoon message="This feature is under development..." />
        </div>

        {/* Another custom message */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Another Custom Message</h2>
          <ComingSoon message="Stay tuned for updates!" />
        </div>

        {/* With custom className */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">With Custom Styling</h2>
          <ComingSoon
            message="Custom styled coming soon message"
            className="bg-slate-100 dark:bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </Layout>
  );
};

export default ComingSoonTest;
