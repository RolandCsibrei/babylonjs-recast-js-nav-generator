import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global Error Caught:", {
    message,
    source,
    lineno,
    colno,
    error,
  });

  ErrorBoundary.showError(error ?? new Error(message.toString()));
};

window.onunhandledrejection = (event) => {
  console.error("Unhandled Promise Rejection:", {
    reason: event.reason,
  });

  ErrorBoundary.showError(
    event.reason instanceof Error ? event.reason : new Error(event.reason)
  );
};

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
