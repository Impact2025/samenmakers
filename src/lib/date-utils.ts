export function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function subMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

export function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "zojuist";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}u`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Toekomstige deadline: "vandaag", "morgen", "over 3 dagen", "verlopen". */
export function formatDueIn(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (days < 0) return "verlopen";
  if (days === 0) return "vandaag";
  if (days === 1) return "morgen";
  if (days < 14) return `over ${days} dagen`;
  return `over ${Math.round(days / 7)} weken`;
}
