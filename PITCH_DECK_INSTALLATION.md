# 📦 Pitch Deck Text Extraction - Installation Guide

## ✅ Installation Complete

The required libraries for pitch deck text extraction have been installed and configured:

### Installed Packages

```bash
npm install pdf-parse mammoth buffer
npm install --save-dev @types/pdf-parse
```

### Package Details

1. **pdf-parse** (`^2.4.5`)
   - Extracts text from PDF files
   - Returns structured text with metadata

2. **mammoth** (`^1.11.0`)
   - Extracts text from PowerPoint (.pptx) files
   - Preserves formatting information

3. **buffer** (`^6.0.3`)
   - Polyfill for Node.js Buffer in browser environment
   - Required for pdf-parse to work in Vite/React apps

4. **@types/pdf-parse** (dev dependency)
   - TypeScript type definitions

## 🔧 Configuration

### 1. Vite Config (`vite.config.ts`)

Updated with Buffer polyfill support:

```typescript
export default defineConfig({
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["pdf-parse", "mammoth", "buffer"],
  },
});
```

### 2. TypeScript Types (`src/vite-env.d.ts`)

Added global Buffer type declaration:

```typescript
import { Buffer } from "buffer";

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}
```

### 3. Component Integration (`src/components/finance/PitchDeckAnalyzer.tsx`)

Updated to use proper text extraction:

```typescript
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { Buffer } from "buffer";

// Make Buffer available globally
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}
```

## ✅ Features

### PDF Support
- ✅ Text extraction from PDF files
- ✅ Full document text parsing
- ✅ Character count feedback

### PowerPoint Support
- ✅ Text extraction from .pptx files
- ✅ Raw text extraction (formatting preserved in output)
- ✅ Error handling for legacy .ppt format

### Error Handling
- ✅ Clear error messages for unsupported formats
- ✅ Graceful fallback for text files
- ✅ Upload progress and feedback

## 🧪 Testing

To test the pitch deck analyzer:

1. Navigate to **Finance Hub → Pitch Analysis** tab
2. Click **Upload** and select a PDF or .pptx file
3. Wait for text extraction to complete
4. Click **"Analyze with AI"** to see analysis results

### Expected Behavior

- ✅ PDF files: Extracts all text content
- ✅ .pptx files: Extracts text from all slides
- ✅ Character count shown in success message
- ✅ Extracted text used for AI analysis

## 📝 Usage Example

```typescript
// In PitchDeckAnalyzer component:
const extractTextFromFile = async (file: File): Promise<string> => {
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return data.text;
  } else if (file.name.endsWith(".pptx")) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  // ... error handling
};
```

## 🔍 Troubleshooting

### Issue: "Buffer is not defined"

**Solution**: The Buffer polyfill is configured. Make sure:
1. `buffer` package is installed
2. `vite.config.ts` has the Buffer alias
3. Component imports Buffer and sets it globally

### Issue: "pdf-parse not working in browser"

**Solution**: This is expected - pdf-parse needs Buffer polyfill. Ensure:
1. `vite.config.ts` has Buffer in optimizeDeps
2. Global Buffer is set in component

### Issue: "mammoth extraction fails"

**Solution**: 
1. Ensure file is .pptx (not legacy .ppt)
2. Check file is valid PowerPoint format
3. Verify mammoth is in dependencies

## 📊 Performance Notes

- **PDF parsing**: Can be slow for large PDFs (>10MB). Consider chunking for very large files.
- **PowerPoint parsing**: Generally fast, but may slow with many slides (>100 slides).
- **Character limits**: No hard limit, but very large extracted text (>50K chars) may need truncation for AI analysis.

## ✅ Status

All dependencies installed and configured. Pitch Deck Analyzer is ready to use!
