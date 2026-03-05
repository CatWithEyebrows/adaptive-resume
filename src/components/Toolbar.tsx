import { useState, type ReactElement } from "react";
import { Button } from "./ui/button";
import { useResumeStore } from "@/store/useResumeStore";
import { exportDocx } from "@/export/exportDocx";
import { ImportResumeModal } from "./ImportResumeModal";
import { generateMarkdownFromResume } from "@/lib/export/markdown-template";
import { Upload, Download, FileText, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Toolbar with export buttons. PDF is primary, DOCX is secondary.
 * @returns The toolbar element.
 */
export function Toolbar(): ReactElement {
  const { data, isMockData } = useResumeStore();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleExportDocx = async (): Promise<void> => {
    if (!data) return;
    try {
      await exportDocx(data);
    } catch (err) {
      console.error("DOCX export failed:", err);
    }
  };

  const handleExportPdf = (): void => {
    window.print();
  };

  const downloadTemplate = () => {
    if (!data) return;
    const markdown = generateMarkdownFromResume(data);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-template.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b bg-background" data-print-hide>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">AdaptiveResume</h1>
        </div>
        <div className="flex gap-2">
          {/* Update Resume Button Container */}
          <div className="relative">
            <AnimatePresence>
              {isMockData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute -inset-1 bg-blue-400 rounded-lg blur opacity-75"
                />
              )}
            </AnimatePresence>
            <Button 
              variant={isMockData ? "default" : "outline"}
              className="relative gap-2 z-10" 
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload size={16} /> Update Resume
            </Button>
          </div>

          <Button variant="outline" className="gap-2" onClick={downloadTemplate}>
            <Download size={16} /> Template
          </Button>
          
          <Button variant="outline" className="gap-2" onClick={handleExportDocx} disabled={isMockData}>
            <FileText size={16} /> Export .docx
          </Button>

          {/* Export PDF Button Container */}
          <div className="relative">
            <AnimatePresence>
              {!isMockData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.5, 0.8, 0.5], scale: 1 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute -inset-1 bg-fuchsia-400 rounded-lg blur opacity-75"
                />
              )}
            </AnimatePresence>
            <Button 
              className={`relative gap-2 z-10 transition-colors ${!isMockData ? "bg-fuchsia-600 hover:bg-fuchsia-700 text-white" : ""}`}
              variant={!isMockData ? "default" : "outline"} 
              onClick={handleExportPdf}
              disabled={isMockData}
            >
              <FileDown size={16} /> Export .pdf
            </Button>
          </div>
        </div>
      </div>
      <ImportResumeModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </>
  );
}
