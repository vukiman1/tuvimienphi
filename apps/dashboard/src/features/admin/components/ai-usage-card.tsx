import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  InputNumber,
  Progress,
  Row,
  Segmented,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { formatNumber } from '@org/frontend-shared';
import type { AiProvider } from '@/gql/graphql';
import type { AiProviderView, AiUsageDayView } from '../data/admin-ai.query';
import { AI_PROVIDER_ICON } from './ai-provider-icon';
import { AI_PROVIDER_LABEL, modelName } from './ai-provider-model';
import {
  USAGE_PERIODS,
  USAGE_PERIOD_LABEL,
  USAGE_PURPOSE_LABEL,
  budgetStatus,
  formatUsd,
  monthSpend,
  periodRange,
  usageRows,
  usageTotals,
  type BudgetLevel,
  type DayRange,
  type UsagePeriod,
  type UsageRow,
  type UsageTotals,
} from './ai-usage-model';

interface AiUsageCardProps {
  readonly providers: readonly AiProviderView[];
  readonly days: readonly AiUsageDayView[];
  readonly today: string;
  readonly pricesCheckedOn: string;
  readonly isLoading: boolean;
  readonly loadError: string | null;
  readonly savingBudgetFor: AiProvider | null;
  readonly onSetBudget: (provider: AiProvider, monthlyBudgetUsd: number | null) => void;
  readonly onOpenCalls: (row: UsageRow, range: DayRange, periodLabel: string) => void;
}

const MIN_BUDGET_USD = 0.01;
const MAX_BUDGET_USD = 1_000_000;
const FULL = 100;
const STAT_COLUMN = { xs: 12, md: 6 } as const;
const STAT_GUTTER = 16;
const BUDGET_NAME_WIDTH = 200;
const BUDGET_BAR_MIN_WIDTH = 160;
const BUDGET_INPUT_WIDTH = 150;
const NO_PRICE = 'Chưa có giá';
const EMPTY = 'Chưa có lượt gọi nào trong khoảng này.';
const ROW_HINT = 'Bấm vào một dòng để xem từng lượt gọi và chi phí của từng lượt.';

const BUDGET_COLOR = {
  OK: 'normal',
  NEAR: 'active',
  OVER: 'exception',
} as const satisfies Record<BudgetLevel, 'normal' | 'active' | 'exception'>;

const COLUMNS: ColumnsType<UsageRow> = [
  {
    title: 'Model',
    key: 'model',
    render: (_value, row) => (
      <Flex align="center" gap={8}>
        {AI_PROVIDER_ICON[row.provider]}
        <Flex vertical>
          <Typography.Link strong>{modelName(row.provider, row.model)}</Typography.Link>
          <Typography.Text type="secondary">{AI_PROVIDER_LABEL[row.provider]}</Typography.Text>
        </Flex>
      </Flex>
    ),
  },
  {
    title: 'Việc',
    key: 'purpose',
    render: (_value, row) => (
      <Tag color={row.purpose === 'GENERATION' ? 'blue' : 'default'}>
        {USAGE_PURPOSE_LABEL[row.purpose]}
      </Tag>
    ),
  },
  { title: 'Lượt gọi', key: 'calls', align: 'right', render: (_v, row) => formatNumber(row.calls) },
  {
    title: 'Lỗi',
    key: 'failedCalls',
    align: 'right',
    render: (_value, row) => formatNumber(row.failedCalls),
  },
  {
    title: 'Hết hạn mức',
    key: 'quotaHits',
    align: 'right',
    render: (_value, row) =>
      row.quotaHits > 0 ? (
        <Typography.Text type="danger">{formatNumber(row.quotaHits)}</Typography.Text>
      ) : (
        '0'
      ),
  },
  {
    title: 'Token vào',
    key: 'inputTokens',
    align: 'right',
    render: (_value, row) => formatNumber(row.inputTokens),
  },
  {
    title: 'Token ra',
    key: 'outputTokens',
    align: 'right',
    render: (_value, row) => formatNumber(row.outputTokens),
  },
  {
    title: 'Chi phí',
    key: 'costUsd',
    align: 'right',
    render: (_value, row) =>
      row.costUsd === null ? (
        <Typography.Text type="secondary">{NO_PRICE}</Typography.Text>
      ) : (
        formatUsd(row.costUsd)
      ),
  },
];

export function AiUsageCard({
  providers,
  days,
  today,
  pricesCheckedOn,
  isLoading,
  loadError,
  savingBudgetFor,
  onSetBudget,
  onOpenCalls,
}: AiUsageCardProps) {
  const [period, setPeriod] = useState<UsagePeriod>('TODAY');
  const range = periodRange(period, today);
  const rows = usageRows(days, range);
  const totals = usageTotals(rows);
  const spend = monthSpend(days, today);
  const budgeted = providers.filter(
    (provider) =>
      provider.hasApiKey ||
      (provider.monthlyBudgetUsd ?? null) !== null ||
      (spend[provider.provider] ?? 0) > 0,
  );

  return (
    <Card title="Mức dùng">
      <Flex vertical gap={24}>
        <div>
          <Segmented<UsagePeriod>
            aria-label="Khoảng thời gian"
            value={period}
            onChange={setPeriod}
            options={USAGE_PERIODS.map((value) => ({ value, label: USAGE_PERIOD_LABEL[value] }))}
          />
        </div>
        {loadError ? <Alert type="error" showIcon title={loadError} /> : null}
        <BudgetAlerts providers={budgeted} spend={spend} />

        <UsageSummary totals={totals} />

        {budgeted.length > 0 ? (
          <Flex vertical gap={12}>
            <Typography.Text strong>Hạn mức tháng này</Typography.Text>
            {budgeted.map((provider) => (
              <BudgetRow
                key={`${provider.provider}-${provider.monthlyBudgetUsd ?? 'none'}`}
                provider={provider}
                spentUsd={spend[provider.provider] ?? 0}
                isSaving={savingBudgetFor === provider.provider}
                onSave={(value) => onSetBudget(provider.provider, value)}
              />
            ))}
          </Flex>
        ) : null}

        <Table<UsageRow>
          size="small"
          rowKey="key"
          loading={isLoading}
          columns={COLUMNS}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: EMPTY }}
          onRow={(row) => ({
            onClick: () => onOpenCalls(row, range, USAGE_PERIOD_LABEL[period]),
            style: { cursor: 'pointer' },
          })}
        />
        <Typography.Text type="secondary">{ROW_HINT}</Typography.Text>

        <Typography.Text type="secondary">
          Chi phí là ước tính: số token nhà cung cấp báo về nhân với giá công khai ngày{' '}
          {pricesCheckedOn}. Hoá đơn thật xem ở trang của nhà cung cấp; khoá Gemini gói miễn phí thì
          không mất tiền. Lượt gọi bị cắt vì hết giờ không có số token.
          {totals.unpricedModels.length > 0
            ? ` Chưa tính tiền cho: ${totals.unpricedModels.join(', ')}.`
            : ''}
        </Typography.Text>
      </Flex>
    </Card>
  );
}

function UsageSummary({ totals }: { readonly totals: UsageTotals }) {
  return (
    <Row gutter={[STAT_GUTTER, STAT_GUTTER]}>
      <Col {...STAT_COLUMN}>
        <Statistic title="Lượt gọi" value={formatNumber(totals.calls)} />
        <Typography.Text type="secondary">
          {formatNumber(totals.failedCalls)} lỗi · {formatNumber(totals.quotaHits)} lần hết hạn mức
        </Typography.Text>
      </Col>
      <Col {...STAT_COLUMN}>
        <Statistic title="Token vào" value={formatNumber(totals.inputTokens)} />
      </Col>
      <Col {...STAT_COLUMN}>
        <Statistic title="Token ra" value={formatNumber(totals.outputTokens)} />
      </Col>
      <Col {...STAT_COLUMN}>
        <Statistic title="Chi phí ước tính" value={formatUsd(totals.costUsd)} />
      </Col>
    </Row>
  );
}

interface BudgetAlertsProps {
  readonly providers: readonly AiProviderView[];
  readonly spend: Partial<Record<AiProvider, number>>;
}

function BudgetAlerts({ providers, spend }: BudgetAlertsProps) {
  const alerts = providers.flatMap((provider) => {
    const spent = spend[provider.provider] ?? 0;
    const budget = provider.monthlyBudgetUsd ?? null;
    const status = budgetStatus(spent, budget);
    if (!status || budget === null || status.level === 'OK') {
      return [];
    }
    const label = AI_PROVIDER_LABEL[provider.provider];
    const amounts = `${formatUsd(spent)} / ${formatUsd(budget)}`;
    return [
      <Alert
        key={provider.provider}
        showIcon
        type={status.level === 'OVER' ? 'error' : 'warning'}
        title={
          status.level === 'OVER'
            ? `${label} đã vượt hạn mức tháng: ${amounts}`
            : `${label} sắp chạm hạn mức tháng: ${amounts}`
        }
      />,
    ];
  });
  return alerts.length > 0 ? (
    <Flex vertical gap={8}>
      {alerts}
    </Flex>
  ) : null;
}

interface BudgetRowProps {
  readonly provider: AiProviderView;
  readonly spentUsd: number;
  readonly isSaving: boolean;
  readonly onSave: (monthlyBudgetUsd: number | null) => void;
}

function BudgetRow({ provider, spentUsd, isSaving, onSave }: BudgetRowProps) {
  const saved = provider.monthlyBudgetUsd ?? null;
  const [draft, setDraft] = useState<number | null>(saved);
  const label = AI_PROVIDER_LABEL[provider.provider];
  const status = budgetStatus(spentUsd, saved);

  return (
    <Flex align="center" gap={12} wrap>
      <Flex align="center" gap={8} style={{ width: BUDGET_NAME_WIDTH }}>
        {AI_PROVIDER_ICON[provider.provider]}
        {label}
      </Flex>
      <Progress
        aria-label={`Đã dùng trong tháng của ${label}`}
        percent={status ? Math.min(FULL, status.percent) : 0}
        status={status ? BUDGET_COLOR[status.level] : 'normal'}
        showInfo={false}
        style={{ flex: 1, minWidth: BUDGET_BAR_MIN_WIDTH }}
      />
      <Typography.Text>
        {formatUsd(spentUsd)} / {saved === null ? 'chưa đặt' : formatUsd(saved)}
      </Typography.Text>
      <InputNumber<number>
        aria-label={`Hạn mức tháng ${label}`}
        prefix="$"
        placeholder="Hạn mức"
        min={MIN_BUDGET_USD}
        max={MAX_BUDGET_USD}
        precision={2}
        value={draft}
        onChange={setDraft}
        style={{ width: BUDGET_INPUT_WIDTH }}
      />
      <Button disabled={draft === saved} loading={isSaving} onClick={() => onSave(draft)}>
        Lưu hạn mức
      </Button>
    </Flex>
  );
}
