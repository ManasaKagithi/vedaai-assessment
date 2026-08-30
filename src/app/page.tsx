"use client";
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import PdfViewer from "@/components/PdfViewer";
import QuestionList from "@/components/QuestionList";
import GradingSummary from "@/components/GradingSummary";
import { ExtractionResult } from "@/types";
import { Loader2, Sparkles } from "lucide-react";

export default function Home() {
  const [qFile, setQFile] = useState<File | null>(null);
  const [aFile, setAFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [selectedQ, setSelectedQ] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [enableGrading, setEnableGrading] = useState(true);

  const process = async () => {
    if (!qFile || !aFile) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSelectedQ(null);

    try {
      setStage("Extracting questions...");
      const fd = new FormData();
      fd.append("questionFile", qFile);
      fd.append("answerFile", aFile);
      fd.append("enableGrading", String(enableGrading));

      const res = await fetch("/api/process", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
      setStage("Done!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedAnswer = result?.answers.find((a) => a.questionId === selectedQ);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold">VedaAI — Assessment Mapper</h1>
          </div>
          {result && (
            <button
              onClick={() => {
                setResult(null);
                setQFile(null);
                setAFile(null);
              }}
              className="text-sm text-indigo-600 hover:underline"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!result && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Upload Files</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <FileUpload label="Question Paper" file={qFile} onChange={setQFile} />
              <FileUpload label="Answer Sheet" file={aFile} onChange={setAFile} />
            </div>
            <label className="flex items-center gap-2 mb-6 text-sm">
              <input
                type="checkbox"
                checked={enableGrading}
                onChange={(e) => setEnableGrading(e.target.checked)}
                className="rounded"
              />
              Enable AI grading & feedback
            </label>
            <button
              onClick={process}
              disabled={!qFile || !aFile || loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {stage}
                </>
              ) : (
                "Process Files"
              )}
            </button>
            {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
          </div>
        )}

        {result && (
          <>
            {result.grading && <GradingSummary grading={result.grading} />}

            <div className="grid lg:grid-cols-5 gap-6 mt-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 max-h-[80vh] overflow-y-auto">
                <QuestionList
                  questions={result.questions}
                  answers={result.answers}
                  unmapped={result.unmappedAnswers}
                  grading={result.grading}
                  selectedQ={selectedQ}
                  onSelect={setSelectedQ}
                />
              </div>

              <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5 max-h-[80vh] overflow-y-auto">
                <h3 className="font-bold mb-3">
                  Answer Sheet{" "}
                  {selectedAnswer && (
                    <span className="text-sm font-normal text-indigo-600">
                      — Highlighting answer for Q{selectedQ}
                    </span>
                  )}
                </h3>
                <PdfViewer file={aFile} regions={selectedAnswer?.regions || []} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}