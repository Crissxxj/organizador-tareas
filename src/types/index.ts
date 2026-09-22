export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string;
  priority: Priority;
  category: string | null;
  status: TaskStatus;
  reminderMinutesBefore: number;
  reminderSent: boolean;
  source: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GithubIssue {
  id: number;
  title: string;
  html_url: string;
  repository: string;
  due?: string | null;
}
