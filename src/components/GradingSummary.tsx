import { GradingResult } from "@/types";
import { Award } from "lucide-react";

export default function GradingSummary({ grading }: { grading: GradingResult }) {
  const color =
    grading.percentage >= 75 ? "text-green-600" :
    grading.percentage >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold">Grading Summary</h2>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className={`text-3xl font-bold ${color}`}>{grading.percentage.toFixed(1)}%</div>
          <div className="text-xs text-gray-600">Score</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-3xl font-bold">{grading.obtainedMarks}/{grading.totalMarks}</div>
          <div className="text-xs text-gray-600">Marks</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-3xl font-bold">
            {grading.grades.filter((g) => g.status === "correct").length}
          </div>
          <div className="text-xs text-gray-600">Correct</div>
        </div>
      </div>
      <div className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-900">
        <strong>Feedback:</strong> {grading.overallFeedback}
      </div>
    </div>
  );
}