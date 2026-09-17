import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import {
  AdminOverview,
  GenTypeSlice,
  KpiStat,
  SourceSlice,
  TrafficPoint,
} from '../models/overview.model';

const TRAFFIC_DAYS = 30;

const SEEDED_SOURCES: SourceSlice[] = [
  { source: 'Trực tiếp', visits: 4210, element: 'Kim' },
  { source: 'Google', visits: 8320, element: 'Mộc' },
  { source: 'Facebook', visits: 2640, element: 'Thủy' },
  { source: 'Zalo', visits: 1180, element: 'Hỏa' },
  { source: 'Khác', visits: 760, element: 'Thổ' },
];

const SEEDED_GEN_BY_TYPE: GenTypeSlice[] = [
  { type: 'Lá số tử vi', count: 5230 },
  { type: 'Luận giải', count: 3110 },
  { type: 'Vận hạn', count: 1980 },
  { type: 'Xem ngày', count: 1240 },
];

@Injectable()
export class AdminOverviewService {
  constructor(@InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>) {}

  async getOverview(): Promise<AdminOverview> {
    const totalUsers = await this.userRepo.count();

    return {
      kpis: this.buildKpis(totalUsers),
      traffic: this.buildTraffic(),
      sources: SEEDED_SOURCES.map((slice) => ({ ...slice })),
      genByType: SEEDED_GEN_BY_TYPE.map((slice) => ({ ...slice })),
    };
  }

  private buildKpis(totalUsers: number): KpiStat[] {
    return [
      {
        key: 'users',
        label: 'Người dùng',
        value: totalUsers,
        deltaPct: 12.4,
        trend: 'up',
        spark: [3, 5, 4, 6, 7, 8, 9, 11, 10, 12],
        format: 'number',
      },
      {
        key: 'generations',
        label: 'Lượt lập lá số',
        value: 11560,
        deltaPct: 8.1,
        trend: 'up',
        spark: [40, 42, 45, 44, 48, 52, 55, 58, 60, 63],
        format: 'number',
      },
      {
        key: 'revenue',
        label: 'Doanh thu',
        value: 42800000,
        deltaPct: -3.2,
        trend: 'down',
        spark: [30, 34, 33, 31, 29, 28, 30, 27, 26, 25],
        format: 'currency',
      },
      {
        key: 'conversion',
        label: 'Tỉ lệ chuyển đổi',
        value: 4.7,
        deltaPct: 1.5,
        trend: 'up',
        spark: [3.1, 3.4, 3.6, 3.9, 4.0, 4.2, 4.4, 4.5, 4.6, 4.7],
        format: 'percent',
      },
    ];
  }

  private buildTraffic(): TrafficPoint[] {
    const points: TrafficPoint[] = [];
    const base = new Date('2026-09-01T00:00:00.000Z');
    for (let i = 0; i < TRAFFIC_DAYS; i += 1) {
      const day = new Date(base.getTime());
      day.setUTCDate(base.getUTCDate() + i);
      const wave = Math.round(400 + 180 * Math.sin(i / 3));
      points.push({
        date: day.toISOString().slice(0, 10),
        views: 1200 + wave * 4,
        users: 300 + wave,
      });
    }
    return points;
  }
}
