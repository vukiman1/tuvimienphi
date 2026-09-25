import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, Pie } from '@ant-design/charts';
import {
  DatabaseOutlined,
  FileAddOutlined,
  GoogleOutlined,
  LockOutlined,
  LoginOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Card, Col, DatePicker, Flex, Row, Segmented, Skeleton, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { errorMessage } from '@/lib/api-error';
import { selectUser, useAuthStore } from '@/stores/auth-store';
import { CHART_LINE_COLOR, STAT_ACCENT } from '../components/stat-accent';
import { StatTile } from '../components/stat-tile';
import { activeUsersSeriesQuery } from '../data/active-users-series.query';
import { OVERVIEW_DEFAULT_DAYS, adminOverviewQuery } from '../data/admin-overview.query';

const LOAD_FAILED = 'Không tải được số liệu tổng quan.';
const CHART_HEIGHT = 260;
const TILE_SPAN = { xs: 24, sm: 12, lg: 6 } as const;
const DATE_FORMAT = 'YYYY-MM-DD';
const SEGMENTED_PADDING = 4;

const PRESET_DAYS = [7, 30, 90] as const;

const RANGE_PRESETS = PRESET_DAYS.map((days) => ({
  label: `${days} ngày`,
  value: presetRange(days),
}));

const SEGMENTED_OPTIONS = PRESET_DAYS.map((days) => ({ label: `${days} ngày`, value: days }));

export function OverviewPage() {
  const [range, setRange] = useState<[Dayjs, Dayjs]>(presetRange(OVERVIEW_DEFAULT_DAYS));
  const [from, to] = range;
  const { data, isPending, isError, error } = useQuery(
    adminOverviewQuery({ from: from.format(DATE_FORMAT), to: to.format(DATE_FORMAT) }),
  );

  const overview = data?.overview;
  const user = useAuthStore(selectUser);

  const [chartDays, setChartDays] = useState<number>(OVERVIEW_DEFAULT_DAYS);
  const chartRange = presetRange(chartDays);
  const chart = useQuery(
    activeUsersSeriesQuery({
      from: chartRange[0].format(DATE_FORMAT),
      to: chartRange[1].format(DATE_FORMAT),
    }),
  );

  const periodTiles = [
    {
      title: 'Người dùng hoạt động',
      metric: overview?.activeUsers,
      icon: <TeamOutlined />,
      accent: STAT_ACCENT.blue,
    },
    {
      title: 'Lượt đăng nhập',
      metric: overview?.logins,
      icon: <LoginOutlined />,
      accent: STAT_ACCENT.green,
    },
    {
      title: 'Người dùng mới',
      metric: overview?.newUsers,
      icon: <UserAddOutlined />,
      accent: STAT_ACCENT.purple,
    },
    {
      title: 'Lá số mới',
      metric: overview?.newCharts,
      icon: <FileAddOutlined />,
      accent: STAT_ACCENT.amber,
    },
  ];

  const totalTiles = [
    {
      title: 'Tổng người dùng',
      value: overview?.totalUsers,
      icon: <UserOutlined />,
      accent: STAT_ACCENT.blue,
    },
    {
      title: 'Lá số đã lưu',
      value: overview?.savedCharts,
      icon: <DatabaseOutlined />,
      accent: STAT_ACCENT.neutral,
    },
    {
      title: 'Tài khoản Google',
      value: overview?.googleUsers,
      icon: <GoogleOutlined />,
      accent: STAT_ACCENT.neutral,
    },
    {
      title: 'Tài khoản mật khẩu',
      value: overview?.passwordUsers,
      icon: <LockOutlined />,
      accent: STAT_ACCENT.amber,
    },
  ];

  return (
    <Flex vertical gap={16}>
      <Flex align="flex-end" justify="space-between" gap={16} wrap>
        <Flex vertical gap={2}>
          <Typography.Text type="secondary">
            Chào mừng trở lại, {user?.displayName ?? user?.email}
          </Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Tổng quan
          </Typography.Title>
          <Typography.Text type="secondary">
            Theo dõi hiệu suất và hoạt động của website trong khoảng thời gian vừa qua.
          </Typography.Text>
        </Flex>
        <DatePicker.RangePicker
          allowClear={false}
          value={range}
          presets={RANGE_PRESETS}
          maxDate={dayjs()}
          onChange={(next) => {
            if (next?.[0] && next[1]) {
              setRange([next[0], next[1]]);
            }
          }}
        />
      </Flex>

      {isError ? <Alert type="error" showIcon title={errorMessage(error, LOAD_FAILED)} /> : null}

      <Row gutter={[16, 16]}>
        {periodTiles.map((tile) => (
          <Col key={tile.title} {...TILE_SPAN}>
            <StatTile
              title={tile.title}
              value={tile.metric?.value}
              icon={tile.icon}
              accent={tile.accent}
              trend={tile.metric}
              series={tile.metric?.series}
              loading={isPending}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {totalTiles.map((tile) => (
          <Col key={tile.title} {...TILE_SPAN}>
            <StatTile
              title={tile.title}
              value={tile.value}
              icon={tile.icon}
              accent={tile.accent}
              loading={isPending}
              compact
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card
            title="Người dùng hoạt động theo ngày"
            extra={
              <Segmented
                size="large"
                options={SEGMENTED_OPTIONS}
                value={chartDays}
                onChange={setChartDays}
                style={{ padding: SEGMENTED_PADDING }}
              />
            }
          >
            <Skeleton active loading={chart.isPending}>
              <Area
                height={CHART_HEIGHT}
                data={chart.data?.activeUsersSeries ?? []}
                xField="date"
                yField="count"
                shapeField="smooth"
                style={{
                  fill: `linear-gradient(-90deg, ${CHART_LINE_COLOR}00 0%, ${CHART_LINE_COLOR}55 100%)`,
                  lineWidth: 2,
                  stroke: CHART_LINE_COLOR,
                }}
                axis={{
                  x: { labelFormatter: toDayMonth, line: false, tick: false },
                  y: { tickFilter: Number.isInteger },
                }}
                tooltip={{ title: (row: { date: string }) => toDayMonth(row.date) }}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="Thiết bị đăng nhập">
            <Skeleton active loading={isPending}>
              <Pie
                height={CHART_HEIGHT}
                data={overview?.devices ?? []}
                angleField="count"
                colorField="label"
                innerRadius={0.6}
              />
            </Skeleton>
          </Card>
        </Col>
      </Row>

      <Alert
        type="info"
        showIcon
        title={
          <>
            &ldquo;Lượt đăng nhập&rdquo; đếm phiên đăng nhập, không phải lượt truy cập. &ldquo;Lá
            số&rdquo; chỉ tính lá số của người đã đăng nhập — khách vãng lai không được ghi nhận.
          </>
        }
      />
    </Flex>
  );
}

function presetRange(days: number): [Dayjs, Dayjs] {
  const today = dayjs();
  return [today.subtract(days - 1, 'day'), today];
}

function toDayMonth(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}
