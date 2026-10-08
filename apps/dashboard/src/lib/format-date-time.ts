const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(isoDate: string): string {
  return dateTimeFormatter.format(new Date(isoDate));
}

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export function formatTime(isoDate: string): string {
  return timeFormatter.format(new Date(isoDate));
}

const dayMonthFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit' });

export function formatDateTimeSeconds(isoDate: string): string {
  return `${dayMonthFormatter.format(new Date(isoDate))} ${formatTime(isoDate)}`;
}
