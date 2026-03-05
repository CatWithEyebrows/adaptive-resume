import { useEffect } from "react";
import { useResumeStore } from "./store/useResumeStore";
import { Toolbar, ControlPanel, LivePreview } from "./components";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center p-8 h-screen w-full gap-4 bg-background text-foreground dark">
      <div className="bg-card border shadow-xl rounded-xl p-8 max-w-lg w-full flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-destructive flex items-center gap-2">
          <span>⚠️</span> Application Error
        </h2>
        <p className="text-muted-foreground text-sm">
          The application encountered an unexpected failure, likely due to an invalid configuration or malformed data payload.
        </p>
        <pre className="text-xs bg-muted p-4 rounded-md text-left overflow-auto text-muted-foreground border">
          {error instanceof Error ? error.message : String(error)}
        </pre>
        <div className="flex justify-end mt-4">
          <button 
            onClick={resetErrorBoundary} 
            className="px-4 py-2 bg-primary hover:bg-primary/90 transition-colors shadow-sm text-primary-foreground text-sm font-medium rounded-lg"
          >
            Restart Application
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const init = useResumeStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground dark">
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <ControlPanel />
          <LivePreview />
        </div>
      </ErrorBoundary>
    </div>
  );
}

export default App;
