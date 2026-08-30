"use client";
import { Question, Answer, UnmappedAnswer, GradingResult } from "@/types";
import { CheckCircle2, XCircle, AlertCircle, MinusCircle, HelpCircle } from "lucide-react";
import clsx from "clsx";

export default function QuestionList({
  questions,
  answers,
  unmapped,
  grading,
  selectedQ,
  onSelect,
}: {
  questions: Question[];
  answers: Answer[];
  unmapped: UnmappedAnswer[];
  grading?: GradingResult;
  selectedQ: string | null;
  onSelect: (id: string) => void;
}) {
  const statusOf = (id: string) => {
    const g = grading?.grades.find((x) => x.questionId === id);
    if (g) return g.status;
    return answers.find((a) => a.questionId === id) ? "answered" : "unanswered";
  };

  const icon = (s: string) => {
    switch (s) {
      case "correct": return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "partial": return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "incorrect": return <XCircle className="w-5 h-5 text-red-600" />;
      case "unanswered": return <MinusCircle className="w-5 h-5 text-gray-400" />;
      default: return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div>
      <h3 className="font-bold mb-3">Questions ({questions.length})</h3>
      <div className="space-y-2">
        {questions.map((q) => {
          const ans = answers.find((a) => a.questionId === q.id);
          const grade = grading?.grades.find((g) => g.questionId === q.id);
          const status = statusOf(q.id);
          return (
            <div
              key={q.id}
              onClick={() => onSelect(q.id)}
              className={clsx(
                "p-3 rounded-lg border-2 cursor-pointer transition",
                selectedQ === q.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    Q{q.number}
                    {q.subPart && `(${q.subPart})`}
                  </span>
                  {icon(status)}
                </div>
                {grade && (
                  <span className="text-sm font-semibold text-gray-700">
                    {grade.awardedMarks}/{grade.maxMarks}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{q.text}</p>
              {grade?.feedback && (
                <p className="text-xs text-gray-500 mt-1 italic">{grade.feedback}</p>
              )}
            </div>
          );
        })}
      </div>

      {unmapped.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-2 flex items-center gap-2 text-amber-700">
            <HelpCircle className="w-4 h-4" /> Unmapped Answers ({unmapped.length})
          </h3>
          <div className="space-y-2">
            {unmapped.map((u) => (
              <div key={u.id} className="p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                <p className="font-semibold text-amber-900">Label: {u.rawLabel}</p>
                <p className="text-xs text-gray-700 line-clamp-2">{u.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}