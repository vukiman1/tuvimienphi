import { AlertKind, DownAlert, RecoveredAlert, UptimeAlert } from './uptime-transition';

const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const MAX_REASON_CHARS = 300;
const MARKDOWN_SPECIAL_CHARACTERS = /[[\]\\*_~`{}]/g;

const VIETNAM_CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: VIETNAM_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function formatAlertMessage(alert: UptimeAlert, healthUrl: string): string {
  const lines =
    alert.kind === AlertKind.Down ? downLines(alert, healthUrl) : recoveredLines(alert, healthUrl);
  return lines.join('\n');
}

function downLines(alert: DownAlert, healthUrl: string): readonly string[] {
  return [
    '**🔴 {red}Backend production không phản hồi{/red}**',
    `- 🌐 ${escapeMarkdown(healthUrl)}`,
    `- 🚫 lỗi: ${escapeMarkdown(alert.reason.slice(0, MAX_REASON_CHARS))}`,
    `- 🕒 từ: ${formatVietnamTime(alert.downSinceMs)}`,
  ];
}

function recoveredLines(alert: RecoveredAlert, healthUrl: string): readonly string[] {
  return [
    '**🟢 {green}Backend production đã hoạt động lại{/green}**',
    `- 🌐 ${escapeMarkdown(healthUrl)}`,
    `- ⏱️ gián đoạn: ${formatDuration(alert.downtimeMs)}`,
    `- 🕒 lúc: ${formatVietnamTime(alert.recoveredAtMs)}`,
  ];
}

function escapeMarkdown(text: string): string {
  return text.replace(MARKDOWN_SPECIAL_CHARACTERS, '\\$&');
}

function formatDuration(durationMs: number): string {
  const totalMinutes = Math.max(1, Math.round(durationMs / MS_PER_MINUTE));
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  if (hours === 0) {
    return `${minutes} phút`;
  }
  if (minutes === 0) {
    return `${hours} giờ`;
  }
  return `${hours} giờ ${minutes} phút`;
}

function formatVietnamTime(epochMs: number): string {
  const parts = new Map(
    VIETNAM_CLOCK.formatToParts(epochMs).map((part) => [part.type, part.value]),
  );
  const read = (type: Intl.DateTimeFormatPartTypes): string => parts.get(type) ?? '';
  return `${read('hour')}:${read('minute')} ${read('day')}/${read('month')}/${read('year')} (giờ Việt Nam)`;
}
