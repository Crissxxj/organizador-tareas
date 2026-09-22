export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  professor: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string;
  priority: Priority;
  status: TaskStatus;
  reminderMinutesBefore: number;
  reminderSent: boolean;
  source: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  subjectId: string | null;
  subject: Subject | null;
}

export interface GithubIssue {
  id: number;
  title: string;
  html_url: string;
  repository: string;
  due?: string | null;
}
