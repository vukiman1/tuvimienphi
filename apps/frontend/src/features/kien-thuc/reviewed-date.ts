export function formatReviewedAt(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
