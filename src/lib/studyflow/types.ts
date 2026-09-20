export type Difficulty = "Easy" | "Medium" | "Hard";
export type TaskType = "Assignment" | "Quiz" | "Exam" | "Project" | "Study";
export type PriorityLevel = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  subject: string;
  title: string;
  description: string;
  deadline: string; // ISO string
  difficulty: Difficulty;
  hours: number;
  type: TaskType;
  completed: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  topic: string;
  score: number;
  total: number;
  takenAt: string;
}

export interface StudySession {
  id: string;
  taskId: string;
  title: string;
  subject: string;
  day: string; // e.g. "Mon"
  date: string; // ISO
  start: string; // "16:00"
  end: string;
  hours: number;
}
