import type { ResumeData } from "@/types/resume";
import { parseJsonResume } from "@/lib/parsers/json-resume";
import { parseMarkdownResume } from "@/lib/parsers/markdown-resume";

/**
 * Read a File as text and parse it into ResumeData.
 * Supports .json (JSON Resume Schema) and .md (Markdown template).
 * Throws on unsupported formats or parse errors.
 */
export function parseResumeFile(file: File): Promise<ResumeData> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith(".json") && !file.name.endsWith(".md")) {
      reject(new Error("Unsupported file format. Please use a .json or .md file."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        if (file.name.endsWith(".json")) {
          resolve(parseJsonResume(JSON.parse(content)));
        } else {
          resolve(parseMarkdownResume(content));
        }
      } catch (err: any) {
        reject(new Error(err.message || "Failed to parse file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

/**
 * Parse a raw string as either JSON or Markdown resume data.
 * Auto-detects format: strings starting with '{' are treated as JSON.
 */
export function parseResumeText(text: string): ResumeData {
  if (text.trim().startsWith("{")) {
    return parseJsonResume(JSON.parse(text));
  }
  return parseMarkdownResume(text);
}
