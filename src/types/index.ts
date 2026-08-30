export interface Question {
  id: string;
  number: string;
  subPart?: string;
  text: string;
  marks?: number;
  pageNumber: number;
}

export interface AnswerRegion {
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Answer {
  id: string;
  questionId: string;
  text: string;
  regions: AnswerRegion[];
  confidence: number;
}

export interface UnmappedAnswer {
  id: string;
  rawLabel: string;
  text: string;
  regions: AnswerRegion[];
}

export interface QuestionGrade {
  questionId: string;
  maxMarks: number;
  awardedMarks: number;
  status: "correct" | "partial" | "incorrect" | "unanswered";
  feedback: string;
}

export interface GradingResult {
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grades: QuestionGrade[];
  overallFeedback: string;
}

export interface ExtractionResult {
  questions: Question[];
  answers: Answer[];
  unmappedAnswers: UnmappedAnswer[];
  grading?: GradingResult;
  questionPageCount: number;
  answerPageCount: number;
}