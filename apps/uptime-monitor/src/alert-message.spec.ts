import { formatAlertMessage } from './alert-message';
import { AlertKind } from './uptime-transition';

const HEALTH_URL = 'https://api.xemtuvimienphi.top/health/readiness';
const MS_PER_MINUTE = 60_000;

describe('formatAlertMessage', () => {
  it('shows the failure and when it started in Vietnam time', () => {
    const message = formatAlertMessage(
      { kind: AlertKind.Down, reason: 'HTTP 502', downSinceMs: Date.UTC(2026, 10, 16, 7, 5) },
      HEALTH_URL,
    );

    expect(message).toBe(
      [
        '**🔴 {red}Backend production không phản hồi{/red}**',
        `- 🌐 ${HEALTH_URL}`,
        '- 🚫 lỗi: HTTP 502',
        '- 🕒 từ: 14:05 16/11/2026 (giờ Việt Nam)',
      ].join('\n'),
    );
  });

  it('escapes Zalo markdown in the failure reason', () => {
    const message = formatAlertMessage(
      { kind: AlertKind.Down, reason: 'lỗi mạng: *bad_gateway*', downSinceMs: 0 },
      HEALTH_URL,
    );

    expect(message).toContain('- 🚫 lỗi: lỗi mạng: \\*bad\\_gateway\\*');
  });

  it('shows how long the backend was down in hours and minutes', () => {
    const message = formatAlertMessage(
      {
        kind: AlertKind.Recovered,
        downtimeMs: 70 * MS_PER_MINUTE,
        recoveredAtMs: Date.UTC(2026, 10, 16, 17, 30),
      },
      HEALTH_URL,
    );

    expect(message).toBe(
      [
        '**🟢 {green}Backend production đã hoạt động lại{/green}**',
        `- 🌐 ${HEALTH_URL}`,
        '- ⏱️ gián đoạn: 1 giờ 10 phút',
        '- 🕒 lúc: 00:30 17/11/2026 (giờ Việt Nam)',
      ].join('\n'),
    );
  });

  it('shows a short outage in minutes only', () => {
    const message = formatAlertMessage(
      { kind: AlertKind.Recovered, downtimeMs: 5 * MS_PER_MINUTE, recoveredAtMs: 0 },
      HEALTH_URL,
    );

    expect(message).toContain('- ⏱️ gián đoạn: 5 phút');
  });
});
