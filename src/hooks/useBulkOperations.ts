import { useReducer, useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface BulkOperation {
  id: string;
  type: "bulk-mapping" | "stats-sync" | "system-health";
  status: "idle" | "running" | "completed" | "failed";
  progress: number;
  startTime?: Date;
  endTime?: Date;
  results?: any;
  logs: Array<{
    timestamp: string;
    level: "info" | "warning" | "error";
    message: string;
  }>;
}

interface SystemHealth {
  overall: "healthy" | "degraded" | "down" | "unknown";
  database: { status: string };
  edgeFunctions: { status: string };
  nflverseApi: { status: string };
  sleeperCache: { status: string };
}

interface StartOperationParams {
  type: BulkOperation["type"];
  endpoint: string;
  payload: any;
}

// Reducer and actions for BulkOperation state

type OperationAction =
  | { type: "ADD_OPERATION"; payload: BulkOperation }
  | {
      type: "UPDATE_PROGRESS_AND_LOGS";
      payload: {
        id: string;
        progress: number;
        log?: {
          timestamp: string;
          level: "info" | "warning" | "error";
          message: string;
        };
      };
    }
  | { type: "COMPLETE_OPERATION"; payload: { id: string; results: any } }
  | { type: "FAIL_OPERATION"; payload: { id: string; error: string } };

function operationsReducer(
  state: BulkOperation[],
  action: OperationAction
): BulkOperation[] {
  switch (action.type) {
    case "ADD_OPERATION":
      return [...state, action.payload];
    case "UPDATE_PROGRESS_AND_LOGS": {
      const { id, progress, log } = action.payload;
      return state.map((op) =>
        op.id === id
          ? {
              ...op,
              progress,
              logs: log ? [...op.logs, log] : op.logs,
            }
          : op
      );
    }
    case "COMPLETE_OPERATION": {
      const { id, results } = action.payload;
      return state.map((op) =>
        op.id === id
          ? {
              ...op,
              status: "completed",
              progress: 100,
              endTime: new Date(),
              results,
            }
          : op
      );
    }
    case "FAIL_OPERATION": {
      const { id, error } = action.payload;
      return state.map((op) =>
        op.id === id
          ? {
              ...op,
              status: "failed",
              endTime: new Date(),
              results: { error },
            }
          : op
      );
    }
    default:
      return state;
  }
}

export function useBulkOperations() {
  const [operations, dispatch] = useReducer(operationsReducer, []);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  const startOperation = useCallback(
    async ({ type, endpoint }: StartOperationParams) => {
      const id = uuidv4();
      const newOperation: BulkOperation = {
        id,
        type,
        status: "running",
        progress: 0,
        startTime: new Date(),
        logs: [],
      };
      dispatch({ type: "ADD_OPERATION", payload: newOperation });

      // Helper to batch log and progress
      const batchUpdate = (
        progress: number,
        logMsg?: { level: "info" | "warning" | "error"; message: string }
      ) => {
        dispatch({
          type: "UPDATE_PROGRESS_AND_LOGS",
          payload: {
            id,
            progress,
            log: logMsg
              ? {
                  timestamp: new Date().toLocaleTimeString(),
                  ...logMsg,
                }
              : undefined,
          },
        });
      };

      try {
        // Parameter validation
        const validTypes = ["bulk-mapping", "stats-sync", "system-health"];
        if (!validTypes.includes(type)) {
          const errMsg = `Invalid operation type: ${type}`;
          batchUpdate(0, { level: "error", message: errMsg });
          throw new Error(errMsg);
        }
        if (typeof endpoint !== "string" || endpoint.trim() === "") {
          const errMsg = `Invalid endpoint: ${endpoint}`;
          batchUpdate(0, { level: "error", message: errMsg });
          throw new Error(errMsg);
        }
        batchUpdate(0, {
          level: "info",
          message: `Starting operation: ${type}`,
        });
        // Simulate progress
        for (let i = 1; i <= 10; i++) {
          await new Promise((res) => setTimeout(res, 300));
          const progress = i * 10;
          batchUpdate(progress, {
            level: "info",
            message: `Progress: ${progress}%`,
          });
        }
        // Simulate API call
        let results = null;
        if (endpoint === "system-health-check") {
          // Simulate system health check result
          results = {
            overall: "healthy" as const,
            database: { status: "healthy" },
            edgeFunctions: { status: "healthy" },
            nflverseApi: { status: "healthy" },
            sleeperCache: { status: "healthy" },
          };
          setSystemHealth(results);
          batchUpdate(100, {
            level: "info",
            message: "System health check completed",
          });
        } else {
          // Simulate generic operation result
          results = { message: `${type} completed successfully` };
          batchUpdate(100, {
            level: "info",
            message: `${type} completed successfully`,
          });
        }
        dispatch({ type: "COMPLETE_OPERATION", payload: { id, results } });
      } catch (error: any) {
        let errorMsg = "Operation failed";
        if (error instanceof Error) {
          errorMsg = error.message;
        } else if (typeof error === "string") {
          errorMsg = error;
        } else if (error && typeof error === "object" && "message" in error) {
          errorMsg = (error as any).message;
        }
        batchUpdate(0, { level: "error", message: `Error: ${errorMsg}` });
        dispatch({ type: "FAIL_OPERATION", payload: { id, error: errorMsg } });
      }
    },
    []
  );

  return {
    operations,
    startOperation,
    systemHealth,
  };
}
