export const F = {
  font: "Carlito, Calibri, sans-serif",
  page: { 
    widthIn: 8.5, 
    heightIn: 11, 
    marginTop: 0.5, 
    marginBottom: 0.5, 
    marginLeft: 0.625, 
    marginRight: 0.5625 
  },
  name: { size: 14, bold: true, color: "#000000" },
  contact: { size: 9.5, linkColor: "#1E40AF", sepColor: "#666666" },
  summary: { size: 10, color: "#333333" },
  sectionHeader: { size: 11, bold: true, color: "#1E40AF", borderColor: "#1E40AF" },
  company: { size: 10.5, bold: true, color: "#000000" },
  role: { size: 10, italic: true, color: "#333333" },
  dates: { size: 10, color: "#666666" },
  bullet: { size: 9.5, color: "#333333" },
  skills: { size: 9.5, color: "#333333" },
  education: { size: 10, color: "#333333" },
} as const;

// DXA conversions for docx export
export const toDxa = (inches: number) => Math.round(inches * 1440);
export const toHalfPt = (pt: number) => pt * 2;
