import React from "react";

interface SidebarFooterProps {
  isCollapsed?: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ isCollapsed = false }) => {
  // No content, just spacing for now
  return <div className="py-4" />;
};

export default SidebarFooter;
