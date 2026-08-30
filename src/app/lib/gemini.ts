import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function fileToGenerativePart(file: File) {
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return {
    inlineData: {
      data: base64,
      mimeType: file.type,
    },
  };
}

export async function extractQuestions(file: File) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const imagePart = await fileToGenerativePart(file);

  const prompt = `You are analyzing a QUESTION PAPER. Extract every question in the exact printed order.

Rules:
- Treat labelled sub-parts as SEPARATE questions. Example: "11 (a)" and "11 (b)" are TWO entries.
- Preserve original numbering (number + subPart).
- If marks are mentioned (e.g. "[5 marks]", "(3)"), extract them.
- Report the page number (1-indexed) where each question starts.

Return STRICT JSON only, no markdown:
{
  "questions": [
    { "number": "1", "subPart": null, "text": "Define thermodynamics.", "marks": 2, "pageNumber": 1 },
    { "number": "11", "subPart": "a", "text": "...", "marks": 5, "pageNumber": 3 }
  ]
}`;

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

export async function extractAnswers(file: File, questions: any[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const imagePart = await fileToGenerativePart(file);

  const questionList = questions
    .map((q: any) => `Q${q.number}${q.subPart ? `(${q.subPart})` : ""}`)
    .join(", ");

  const prompt = `You are analyzing a STUDENT'S HANDWRITTEN ANSWER SHEET.

Known questions on the paper: ${questionList}

Your tasks:
1. Find every answer the student wrote.
2. Match each answer to a question from the list above.
3. If an answer doesn't match any question, mark it as unmapped.
4. For each answer, provide the EXACT bounding box of the answer region as percentages of the page (0-100).
5. If an answer spans multiple pages, provide multiple regions.

Return STRICT JSON only, no markdown:
{
  "answers": [
    {
      "questionId": "11-a",
      "text": "The student's answer text here...",
      "regions": [{ "pageNumber": 2, "x": 10, "y": 15, "width": 80, "height": 25 }],
      "confidence": 0.9
    }
  ],
  "unmappedAnswers": [
    {
      "rawLabel": "Extra Q",
      "text": "...",
      "regions": [{ "pageNumber": 3, "x": 5, "y": 50, "width": 90, "height": 20 }]
    }
  ]
}

Important:
- questionId format: "number" or "number-subPart" (e.g. "11", "11-a")
- Coordinates are percentages (0-100) of page width/height`;

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

export async function gradeAssessment(questions: any[], answers: any[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const pairs = questions.map((q) => {
    const id = `${q.number}${q.subPart ? `-${q.subPart}` : ""}`;
    const ans = answers.find((a: any) => a.questionId === id);
    return {
      questionId: id,
      question: q.text,
      maxMarks: q.marks || 5,
      studentAnswer: ans?.text || null,
    };
  });

  const prompt = `You are a fair, strict teacher grading a student's exam.

For each question, award marks based on correctness, completeness, and clarity.
If studentAnswer is null, award 0 and mark as "unanswered".

Return STRICT JSON only:
{
  "grades": [
    {
      "questionId": "1",
      "awardedMarks": 4,
      "status": "partial",
      "feedback": "Good definition but missing the second law."
    }
  ],
  "overallFeedback": "Overall the student shows strong understanding..."
}

Status must be one of: "correct", "partial", "incorrect", "unanswered"

Questions and answers:
${JSON.stringify(pairs, null, 2)}`;

  const result = await model.generateContent([prompt]);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}