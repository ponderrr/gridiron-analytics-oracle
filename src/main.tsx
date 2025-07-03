import * as Sentry from "@sentry/react";
// Initialize Sentry for error monitoring (production only)
if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "YOUR_SENTRY_DSN_HERE", // TODO: Replace with your Sentry DSN
    tracesSampleRate: 1.0,
  });
}
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
