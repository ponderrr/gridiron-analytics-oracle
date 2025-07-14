import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HealthIndicatorProps {
  status: "healthy" | "warning" | "critical" | "unknown";
  label: string;
  value?: string | number;
  description?: string;
  showIcon?: boolean;
}

export function HealthIndicator({
  status,
  label,
  value,
  description,
  showIcon = true,
}: HealthIndicatorProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          badgeVariant: "default" as const,
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          badgeVariant: "secondary" as const,
        };
      case "critical":
        return {
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          badgeVariant: "destructive" as const,
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          badgeVariant: "outline" as const,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "p-4 rounded-lg border-l-4",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {showIcon && <Icon className={cn("h-4 w-4", config.color)} />}
          <span className="font-medium">{label}</span>
        </div>
        <Badge variant={config.badgeVariant} className="text-xs">
          {status.toUpperCase()}
        </Badge>
      </div>

      {value && <div className="text-2xl font-bold mb-1">{value}</div>}

      {description && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}
    </div>
  );
}
