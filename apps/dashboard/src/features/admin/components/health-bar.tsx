import { Badge, Flex, Switch, Tooltip, Typography, theme } from 'antd';
import type { AiProvider } from '@/gql/graphql';
import type { AiHealthView } from '../data/admin-ai.query';
import { sampleLabel } from './ai-provider-model';
import { MAX_HEALTH_SAMPLES, monitorView, nextCheckLabel } from './health-monitor-model';
import { useNow, type HealthMonitor } from './use-health-monitor';

interface HealthBarProps {
  readonly provider: AiProvider;
  readonly monitor: HealthMonitor;
  readonly isWatchable: boolean;
  readonly isDirty: boolean;
  readonly isOn: boolean;
  readonly onToggle: (isOn: boolean) => void;
}

const SLOT_HEIGHT = 28;
const SLOT_GAP = 3;
const SLOT_RADIUS = 3;
const UNSAVED_NOTE = 'Thanh này theo dõi cấu hình đã lưu, chưa tính phần bạn đang sửa.';

export function HealthBar({
  provider,
  monitor,
  isWatchable,
  isDirty,
  isOn,
  onToggle,
}: HealthBarProps) {
  const { token } = theme.useToken();
  const now = useNow(isWatchable && isOn);
  const view = monitorView({
    provider,
    isWatchable,
    latest: monitor.samples[monitor.samples.length - 1] ?? null,
    requestError: monitor.requestError,
  });
  const next = nextCheckLabel({
    isWatchable,
    isOn,
    isChecking: monitor.isChecking,
    dueAt: monitor.dueAt,
    now,
  });
  const emptySlots = Math.max(0, MAX_HEALTH_SAMPLES - monitor.samples.length);
  const colorOf = (health: AiHealthView): string =>
    health.status === 'OK' ? token.colorSuccess : token.colorError;

  return (
    <Flex vertical gap={8}>
      <Flex align="center" justify="space-between" gap={12} wrap>
        <Flex align="center" gap={8}>
          <Badge status={view.badge} />
          <Typography.Text strong>{view.headline}</Typography.Text>
        </Flex>
        {isWatchable ? (
          <Flex align="center" gap={8}>
            <Typography.Text type="secondary">{next}</Typography.Text>
            <Switch
              size="small"
              checked={isOn}
              onChange={onToggle}
              aria-label="Tự gọi thử mỗi phút"
            />
          </Flex>
        ) : null}
      </Flex>

      <div
        role="list"
        aria-label="Các lần gọi thử gần đây"
        style={{ display: 'flex', gap: SLOT_GAP }}
      >
        {Array.from({ length: emptySlots }, (_unused, index) => (
          <span
            key={`empty-${index}`}
            aria-hidden
            style={{
              flex: 1,
              height: SLOT_HEIGHT,
              borderRadius: SLOT_RADIUS,
              background: token.colorFillSecondary,
            }}
          />
        ))}
        {monitor.samples.map((health) => {
          const label = sampleLabel(provider, health);
          return (
            <Tooltip key={health.checkedAt} title={label}>
              <span
                role="listitem"
                aria-label={label}
                style={{
                  flex: 1,
                  height: SLOT_HEIGHT,
                  borderRadius: SLOT_RADIUS,
                  background: colorOf(health),
                }}
              />
            </Tooltip>
          );
        })}
      </div>

      <Typography.Text type="secondary">{view.detail}</Typography.Text>
      {view.raw ? <FailureDetail raw={view.raw} /> : null}
      {isWatchable && isDirty ? (
        <Typography.Text type="secondary">{UNSAVED_NOTE}</Typography.Text>
      ) : null}
    </Flex>
  );
}

export function FailureDetail({ raw }: { readonly raw: string }) {
  return (
    <Typography.Paragraph
      type="secondary"
      style={{ margin: 0 }}
      ellipsis={{
        rows: 1,
        expandable: 'collapsible',
        symbol: (isExpanded) => (isExpanded ? 'Thu gọn' : 'Chi tiết'),
      }}
    >
      {raw}
    </Typography.Paragraph>
  );
}
