"use client";
import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState } from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

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

  useEffect(() => setNumPages(0), [file]);

  if (!file) return <div className="text-gray-400 text-center py-20">No file loaded</div>;

  return (
    <Document
      file={file}
      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      className="flex flex-col gap-4"
    >
      {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => {
        const pageRegions = regions.filter((r) => r.pageNumber === p);
        const dim = pageDimensions[p];
        return (
          <div key={p} className="relative shadow-lg">
            <Page
              pageNumber={p}
              width={700}
              onRenderSuccess={({ width, height }) =>
                setPageDimensions((d) => ({ ...d, [p]: { w: width, h: height } }))
              }
            />
            {dim &&
              pageRegions.map((r, idx) => (
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
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              Page {p}
            </div>
          </div>
        );
      })}
    </Document>
  );
}