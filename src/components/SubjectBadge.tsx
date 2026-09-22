import type { Subject } from "@/types";

export function SubjectBadge({
  subject,
  size = "sm",
}: {
  subject: Subject | null | undefined;
  size?: "sm" | "md";
}) {
  if (!subject) return null;

  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${padding}`}
      style={{
        backgroundColor: `${subject.color}22`,
        color: subject.color,
      }}
    >
      <span aria-hidden>{subject.icon}</span>
      {subject.name}
    </span>
  );
}
