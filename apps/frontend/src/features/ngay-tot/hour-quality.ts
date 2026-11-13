export interface HourQuality {
  readonly range: string;
  readonly canChi: string;
  readonly isHoangDao: boolean;
  readonly rating: number;
  readonly stars: string;
  readonly favorable: string;
  readonly unfavorable: string;
}

export interface HourEntry {
  readonly item: HourQuality;
  readonly chiIndex: number;
  readonly isNow: boolean;
}
