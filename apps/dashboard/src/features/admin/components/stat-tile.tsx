import type { ReactNode } from 'react';
import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons';
import { Tiny } from '@ant-design/charts';
import { Card, Flex, Statistic, theme } from 'antd';
import type { StatAccent } from './stat-accent';
import { formatNumber } from '@org/frontend-shared';

const ICON_SIZE = 42;
const COMPACT_ICON_SIZE = 28;
const VALUE_FONT_SIZE = 32;
const COMPACT_VALUE_FONT_SIZE = 22;
const SPARKLINE_WIDTH = 78;
const SPARKLINE_HEIGHT = 40;
const SPARKLINE_INSET = 16;
const BODY_PADDING = 24;
const COMPACT_BODY_PADDING = 16;
const TREND_FONT_SIZE = 13;
const PERCENT_BASE = 100;

export interface Trend {
  readonly value: number;
  readonly previous: number;
}

interface StatTileProps {
  readonly title: string;
  readonly value: number | undefined;
  readonly icon: ReactNode;
  readonly accent: StatAccent;
  readonly trend?: Trend;
  readonly series?: readonly { readonly date: string; readonly count: number }[];
  readonly loading?: boolean;
  readonly compact?: boolean;
}

export function StatTile({
  title,
  value,
  icon,
  accent,
  trend,
  series,
  loading,
  compact,
}: StatTileProps) {
  return (
    <Card
      loading={loading}
      variant="borderless"
      style={{ height: '100%', background: accent.surface }}
      styles={{
        body: {
          padding: compact ? COMPACT_BODY_PADDING : BODY_PADDING,
          position: 'relative',
          overflow: 'hidden',
        },
      }}
    >
      <Flex align="center" gap={compact ? 14 : 18}>
        <Flex
          align="center"
          justify="center"
          style={{
            color: accent.icon,
            fontSize: compact ? COMPACT_ICON_SIZE : ICON_SIZE,
            flexShrink: 0,
          }}
        >
          {icon}
        </Flex>
        <Statistic
          title={title}
          value={value ?? 0}
          formatter={(raw) => formatNumber(Number(raw))}
          suffix={trend ? <TrendBadge {...trend} /> : undefined}
          styles={{
            content: {
              fontSize: compact ? COMPACT_VALUE_FONT_SIZE : VALUE_FONT_SIZE,
              fontWeight: 600,
              lineHeight: 1.2,
            },
          }}
        />
      </Flex>

      {series?.length ? <Sparkline series={series} color={accent.icon} /> : null}
    </Card>
  );
}

function Sparkline({
  series,
  color,
}: {
  series: readonly { readonly date: string; readonly count: number }[];
  color: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: SPARKLINE_INSET,
        bottom: SPARKLINE_INSET,
        pointerEvents: 'none',
      }}
    >
      <Tiny.Line
        width={SPARKLINE_WIDTH}
        height={SPARKLINE_HEIGHT}
        data={[...series]}
        xField="date"
        yField="count"
        shapeField="smooth"
        padding={0}
        style={{ stroke: color, lineWidth: 2 }}
      />
    </div>
  );
}

function TrendBadge({ value, previous }: Trend) {
  const { token } = theme.useToken();
  const delta = value - previous;

  if (delta === 0) {
    return (
      <span style={{ fontSize: TREND_FONT_SIZE, color: token.colorTextTertiary }}>
        <MinusOutlined />
      </span>
    );
  }

  const isUp = delta > 0;
  const percent = previous === 0 ? null : Math.round((Math.abs(delta) / previous) * PERCENT_BASE);

  return (
    <span
      style={{
        fontSize: TREND_FONT_SIZE,
        color: isUp ? token.colorSuccess : token.colorError,
        whiteSpace: 'nowrap',
      }}
    >
      {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
      {percent === null ? `+${formatNumber(Math.abs(delta))}` : `${percent}%`}
    </span>
  );
}
