import { formatAlertMessage } from './alert-message';
import { probeHealth } from './health-probe';
import { upSince } from './uptime-state';
import { KeyValueStore, readUptimeState, writeUptimeState } from './uptime-store';
import { nextUptime } from './uptime-transition';
import { ZaloCredentials, sendZaloMarkdown } from './zalo-client';

const HEALTH_URL = 'https://api.xemtuvimienphi.top/health/readiness';
const HEALTH_TIMEOUT_MS = 10_000;

interface ScheduledController {
  readonly scheduledTime: number;
}

interface Env {
  readonly UPTIME_STATE: KeyValueStore;
  readonly ZALO_BOT_TOKEN: string | undefined;
  readonly ZALO_CHAT_ID: string | undefined;
}

class MissingSecretError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingSecretError';
  }
}

function zaloCredentials(env: Env): ZaloCredentials {
  if (!env.ZALO_BOT_TOKEN || !env.ZALO_CHAT_ID) {
    throw new MissingSecretError(
      'ZALO_BOT_TOKEN or ZALO_CHAT_ID is not set on the tuvimienphi-uptime Worker',
    );
  }
  return { botToken: env.ZALO_BOT_TOKEN, chatId: env.ZALO_CHAT_ID };
}

async function checkUptime(env: Env, checkedAtMs: number): Promise<void> {
  const credentials = zaloCredentials(env);
  const previous = await readUptimeState(env.UPTIME_STATE, upSince(checkedAtMs));
  const probe = await probeHealth(HEALTH_URL, HEALTH_TIMEOUT_MS);
  const { state, alert } = nextUptime(previous, probe, checkedAtMs);

  if (alert !== null) {
    await sendZaloMarkdown(credentials, formatAlertMessage(alert, HEALTH_URL));
  }
  await writeUptimeState(env.UPTIME_STATE, state);
}

export default {
  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    await checkUptime(env, controller.scheduledTime);
  },
};
