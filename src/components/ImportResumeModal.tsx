import { useState } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { parseJsonResume } from '../lib/parsers/json-resume';
import { parseMarkdownResume } from '../lib/parsers/markdown-resume';
import { Download, Upload } from 'lucide-react';
import { FileDropzone } from './ui/FileDropzone';

import { generateMarkdownFromResume } from '../lib/export/markdown-template';

export function ImportResumeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [importMode, setImportMode] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const importResume = useResumeStore((state) => state.importResume);
  const data = useResumeStore((state) => state.data);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          const resumeData = parseJsonResume(jsonData);
          importResume(resumeData);
          onClose();
        } else if (file.name.endsWith('.md')) {
          const resumeData = parseMarkdownResume(content);
          importResume(resumeData);
          onClose();
        } else {
          setError('Unsupported file format. Please upload a .json or .md file.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to parse file.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePasteSubmit = () => {
    setError(null);
    if (!pasteText.trim()) {
      setError('Please paste some content first.');
      return;
    }
    try {
      // Try to parse as JSON first
      if (pasteText.trim().startsWith('{')) {
        const jsonData = JSON.parse(pasteText);
        const resumeData = parseJsonResume(jsonData);
        importResume(resumeData);
      } else {
        // Otherwise treat as Markdown
        const resumeData = parseMarkdownResume(pasteText);
        importResume(resumeData);
      }
      onClose();
    } catch (err: any) {
         setError(err.message || 'Failed to parse pasted text.');
    }
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground">Import Resume</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2 rounded-lg hover:bg-muted"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-6 bg-destructive/10 text-destructive p-4 rounded-lg text-sm border border-destructive/20 flex items-start gap-3">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setImportMode('upload')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                importMode === 'upload'
                  ? 'bg-primary/10 text-primary border-2 border-primary/30'
                  : 'bg-muted text-muted-foreground border-2 border-transparent hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              Upload File (.json, .md)
            </button>
            <button
              onClick={() => setImportMode('paste')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                importMode === 'paste'
                  ? 'bg-primary/10 text-primary border-2 border-primary/30'
                  : 'bg-muted text-muted-foreground border-2 border-transparent hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              Paste Text
            </button>
          </div>

          {importMode === 'upload' ? (
            <div className="space-y-6">
              <FileDropzone onFileDrop={processFile}>
                {(isDragOver) => (
                  <label className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden group ${
                    isDragOver 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:bg-muted/50 hover:border-primary/50'
                  }`}>
                    {/* Drag State Overlay overlay */}
                    <div className={`absolute inset-0 z-10 bg-primary/5 text-primary flex flex-col items-center justify-center transition-opacity duration-200 ${isDragOver ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="p-4 bg-background rounded-full shadow-lg mb-3 animate-bounce">
                           <Upload size={32} />
                        </div>
                        <p className="font-semibold">Drop file to upload</p>
                    </div>

                    <div className={`flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground transition-all duration-200 ${isDragOver ? 'opacity-0 scale-95' : 'opacity-100 scale-100 group-hover:text-primary'}`}>
                      <span className="text-4xl mb-3 opacity-80 group-hover:opacity-100 transition-opacity">📄</span>
                      <p className="mb-2 text-sm font-semibold text-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs">JSON (JSON Resume Schema) or Markdown (.md)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".json,.md"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </FileDropzone>

              <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-2">Need a Markdown template?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download our structured Markdown template to easily format your resume text before uploading.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <Download size={18} /> Download template.md
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste your JSON or structured Markdown here..."
                className="w-full h-64 p-4 text-sm bg-background border border-input rounded-xl focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all resize-none font-mono text-foreground placeholder-muted-foreground"
              />
              <div className="flex justify-end">
                <button
                  onClick={handlePasteSubmit}
                  className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Import Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
