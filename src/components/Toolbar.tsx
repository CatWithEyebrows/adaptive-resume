import { useState, type ReactElement } from "react";
import { Button } from "./ui/button";
import { useResumeStore } from "@/store/useResumeStore";
import { exportDocx } from "@/export/exportDocx";
import { ImportResumeModal } from "./ImportResumeModal";
import { generateMarkdownFromResume } from "@/lib/export/markdown-template";
import { downloadBlob } from "@/lib/downloadBlob";
import { Upload, Download, FileText, FileDown, Braces, Edit3, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditStore } from "@/store/useEditStore";

/**
 * Toolbar with export buttons. PDF is primary, DOCX is secondary.
 * @returns The toolbar element.
 */
export function Toolbar(): ReactElement {
  const { data, isMockData } = useResumeStore();
  const { isEditMode, setEditMode } = useEditStore();
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

  const handleExportJson = (): void => {
    if (!data) return;
    const json = JSON.stringify(data, null, 2);
    downloadBlob(new Blob([json], { type: 'application/json' }), 'resume-data.json');
  };

  const downloadTemplate = () => {
    if (!data) return;
    const markdown = generateMarkdownFromResume(data);
    downloadBlob(new Blob([markdown], { type: 'text/markdown' }), 'resume-template.md');
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

          <Button 
            variant={isEditMode ? "default" : "outline"} 
            className={`gap-2 ${isEditMode ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
            onClick={() => setEditMode(!isEditMode)}
          >
            {isEditMode ? (
              <>
                <Check size={16} /> Done Editing
              </>
            ) : (
              <>
                <Edit3 size={16} /> Edit Mode
              </>
            )}
          </Button>

          <Button variant="outline" className="gap-2" onClick={downloadTemplate}>
            <Download size={16} /> Template
          </Button>

          <Button variant="outline" className="gap-2" onClick={handleExportJson} disabled={isMockData}>
            <Braces size={16} /> Export .json
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
