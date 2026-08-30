import { NextRequest, NextResponse } from "next/server";
import { extractQuestions, extractAnswers, gradeAssessment } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const questionFile = formData.get("questionFile") as File;
    const answerFile = formData.get("answerFile") as File;
    const enableGrading = formData.get("enableGrading") === "true";

    if (!questionFile || !answerFile) {
      return NextResponse.json({ error: "Both files required" }, { status: 400 });
    }

    const qData = await extractQuestions(questionFile);
    const questions = qData.questions.map((q: any) => ({
      ...q,
      id: `${q.number}${q.subPart ? `-${q.subPart}` : ""}`,
    }));

    const aData = await extractAnswers(answerFile, questions);
    const answers = (aData.answers || []).map((a: any, i: number) => ({
      ...a,
      id: `a-${i}`,
    }));
    const unmappedAnswers = (aData.unmappedAnswers || []).map((a: any, i: number) => ({
      ...a,
      id: `u-${i}`,
    }));

    let grading;
    if (enableGrading) {
      const gData = await gradeAssessment(questions, answers);
      const grades = gData.grades || [];
      const totalMarks = questions.reduce((s: number, q: any) => s + (q.marks || 5), 0);
      const obtainedMarks = grades.reduce((s: number, g: any) => s + (g.awardedMarks || 0), 0);
      grading = {
        totalMarks,
        obtainedMarks,
        percentage: totalMarks ? (obtainedMarks / totalMarks) * 100 : 0,
        grades,
        overallFeedback: gData.overallFeedback || "",
      };
    }

    return NextResponse.json({
      questions,
      answers,
      unmappedAnswers,
      grading,
      questionPageCount: 1,
      answerPageCount: 1,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Processing failed" }, { status: 500 });
  }
}