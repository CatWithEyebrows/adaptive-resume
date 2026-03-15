import { useState, useCallback, useRef, useEffect } from "react";
import { ResumeSheet } from "./ResumeSheet";
import { F } from "@/data/formatting";
import { useResumeStore } from "@/store/useResumeStore";
import { parseResumeFile } from "@/lib/parseResumeFile";
import { Upload } from "lucide-react";
import { FileDropzone } from "./ui/FileDropzone";

export function LivePreview() {
  const { isMockData, importResume } = useResumeStore();
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.85);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Page width in pixels (8.5in * 96dpi = 816px) plus some padding
    const PAGE_WIDTH_PX = 830; 
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // If the container is smaller than the page, scale down
        if (width < PAGE_WIDTH_PX) {
          setScale(width / PAGE_WIDTH_PX);
        } else {
          setScale(0.85); // Default comfortable scale
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleFileDrop = useCallback((file: File) => {
    setError(null);
    parseResumeFile(file)
      .then((resumeData) => importResume(resumeData))
      .catch((err: Error) => {
        setError(err.message);
        setTimeout(() => setError(null), 3000);
      });
  }, [importResume]);

  return (
    <FileDropzone 
      onFileDrop={handleFileDrop} 
      className="relative flex-1 flex flex-col min-h-0 bg-zinc-200"
    >
      {(isDragOver) => (
        <div 
          ref={containerRef}
          className={`relative flex-1 overflow-auto p-4 sm:p-8 text-zinc-900 border-l border-border/10 shadow-inner group`} 
          data-print-preview
        >
          {/* Mock Data Overlay wrapper - completely readable, no blur on the resume itself */}
          <div className="transition-all duration-500 relative">
            <div
              className="bg-white shadow-2xl transition-all duration-300 ease-in-out mx-auto relative origin-top"
              data-print-page
              style={{
                width: `${F.page.widthIn}in`,
                minHeight: `${F.page.heightIn}in`,
                transform: `scale(${scale})`
              }}
            >
              {/* Apply blur directly to the content since backdrop-filter breaks inside CSS scale transforms */}
              <div className={`transition-all duration-500 ${isMockData && !isDragOver ? "blur-[0.75px] opacity-70" : ""}`}>
                <ResumeSheet />
              </div>
              
              {/* Glassmorphic Drop Overlay (Inside Page Container for Perfect Alignment) */}
              {isMockData && !isDragOver && (
                <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center border-[6px] border-dashed border-primary/30 overflow-hidden">
                  <div className="absolute inset-0 bg-background/5" />
                  <div className="relative z-10 opacity-[0.15] text-primary mix-blend-multiply dark:mix-blend-screen transition-opacity hover:opacity-20 pointer-events-auto">
                    <Upload size={400} strokeWidth={1} />
                  </div>
                </div>
              )}

              {/* Page Break Indicator */}
              <div 
                className="absolute left-0 right-0 border-b-2 border-dashed border-red-400/70 group-hover:border-red-500 transition-colors flex items-center justify-center pointer-events-none z-50 print:hidden"
                style={{ top: `${F.page.heightIn}in` }}
                title={`Page limit at ${F.page.heightIn} inches`}
              >
                <span className="bg-red-100 text-red-600 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full absolute -top-2.5 shadow-sm border border-red-200 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  1 Page Limit
                </span>
              </div>
            </div>
          </div>

          {/* Permanent Preview Mode Indicator - Sticky on Scroll */}
          {isMockData && (
            <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
              <div className="bg-background/85 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-2xl border border-primary/30 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">Preview mode: demo data</span>
              </div>
            </div>
          )}

          {/* Drag Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-[100] bg-primary/5 backdrop-blur-sm border-4 border-primary/40 border-dashed m-4 rounded-2xl flex flex-col items-center justify-center pointer-events-none">
              <div className="bg-background/95 p-10 rounded-2xl shadow-2xl flex flex-col items-center text-foreground transform scale-105 transition-transform duration-300 border border-primary/20">
                <div className="p-5 bg-primary/10 rounded-full text-primary shadow-inner mb-6 animate-bounce">
                  <Upload size={56} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-primary">Drop resume file here</h2>
                <p className="text-muted-foreground font-medium text-sm">Accepts .md (Template) or .json (Schema)</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-100 text-red-600 px-6 py-3 rounded-xl font-medium shadow-xl border border-red-200 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
        </div>
      )}
    </FileDropzone>
  );
}
