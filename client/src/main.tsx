import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add more detailed error logging
function logError(error: unknown) {
  console.error("Application error:", {
    error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    type: error instanceof Error ? error.constructor.name : typeof error
  });
}

function ErrorFallback({ error }: { error: Error }) {
  // Log the error when the fallback is rendered
  logError(error);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="p-6 max-w-sm mx-auto bg-card rounded-lg shadow-lg">
        <h1 className="text-xl font-semibold text-red-500 mb-4">Something went wrong</h1>
        <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
          {error.message}
          {process.env.NODE_ENV === 'development' && error.stack && (
            <div className="mt-2 text-xs opacity-75">
              {error.stack}
            </div>
          )}
        </pre>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

try {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  logError(error);
  root.render(
    <ErrorFallback error={error instanceof Error ? error : new Error(String(error))} />
  );
}

// Add global error handlers
window.addEventListener('error', (event) => {
  logError(event.error);
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  logError(event.reason);
  event.preventDefault();
});
