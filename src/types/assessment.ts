export interface Question {
  id: string;
  number: string;
  text: string;
  page: number;
  marks?: number;
}

export interface AnswerRegion {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StudentAnswer {
  id: string;
  questionNumber?: string;
  text: string;
  regions: AnswerRegion[];
  confidence: number;
}

export interface AnswerMapping {
  questionId: string;
  answerId?: string;
  status: "answered" | "unanswered" | "unmatched";
  confidence: number;
}

export interface Grade {
  questionId: string;
  marksObtained: number;
  maxMarks: number;
  feedback: string;
}

export interface AssessmentResult {
  questions: Question[];
  answers: StudentAnswer[];
  mappings: AnswerMapping[];
  grades: Grade[];
}