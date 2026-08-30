"use client";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";

export default function FileUpload({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && onChange(files[0]),
    accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
  });

  if (file) {
    return (
      <div className="border-2 border-green-400 rounded-lg p-4 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold truncate">{file.name}</p>
              <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button onClick={() => onChange(null)} className="text-red-500 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
        isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-indigo-400"
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto w-10 h-10 text-gray-400 mb-2" />
      <p className="font-medium">{label}</p>
      <p className="text-xs text-gray-500 mt-1">PDF or image • drag & drop</p>
    </div>
  );
}