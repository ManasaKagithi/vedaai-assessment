"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-pdf components to avoid SSR issues with DOMMatrix
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);

const Page = dynamic(
  () => import("react-pdf").then((mod) => mod.Page),
  { ssr: false }
);

interface Region {
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PdfViewer({
  file,
  regions,
  highlightColor = "rgba(59,130,246,0.25)",
  borderColor = "#2563eb",
}: {
  file: File | string | null;
  regions: Region[];
  highlightColor?: string;
  borderColor?: string;
}) {
  const [numPages, setNumPages] = useState(0);
  const [pageDimensions, setPageDimensions] = useState<Record<number, { w: number; h: number }>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Dynamically import pdfjs-dist to set worker safely on client only
    import("pdfjs-dist").then((pdfjsModule) => {
      pdfjsModule.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsModule.version}/pdf.worker.min.mjs`;
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    setNumPages(0);
    setPageDimensions({});
  }, [file]);

  if (!file) {
    return (
      <div className="text-gray-400 text-center py-20 border-2 border-dashed border-gray-200 rounded-lg">
        No file loaded
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="text-gray-400 text-center py-20">
        Loading PDF engine...
      </div>
    );
  }

  return (
    <Document
      file={file}
      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      className="flex flex-col gap-4"
      loading={<div className="text-center py-10 text-gray-500">Loading PDF...</div>}
      error={<div className="text-center py-10 text-red-500">Failed to load PDF. Make sure it is a valid file.</div>}
    >
      {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => {
        const pageRegions = regions.filter((r) => r.pageNumber === p);
        const dim = pageDimensions[p];
        
        return (
          <div key={p} className="relative shadow-lg inline-block mx-auto">
            <Page
              pageNumber={p}
              width={700}
              onRenderSuccess={({ width, height }) =>
                setPageDimensions((d) => ({ ...d, [p]: { w: width, h: height } }))
              }
              loading={<div className="text-center py-10 text-gray-500">Loading page {p}...</div>}
            />
            {dim && pageRegions.map((r, idx) => (
              <div
                key={idx}
                className="absolute pointer-events-none animate-pulse"
                style={{
                  left: `${(r.x / 100) * dim.w}px`,
                  top: `${(r.y / 100) * dim.h}px`,
                  width: `${(r.width / 100) * dim.w}px`,
                  height: `${(r.height / 100) * dim.h}px`,
                  backgroundColor: highlightColor,
                  border: `3px solid ${borderColor}`,
                  borderRadius: 4,
                }}
              />
            ))}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded shadow">
              Page {p}
            </div>
          </div>
        );
      })}
    </Document>
  );
}
