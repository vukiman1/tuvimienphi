export interface StatAccent {
  readonly surface: string;
  readonly icon: string;
}

export const STAT_ACCENT = {
  blue: { surface: '#f2f6ff', icon: '#3b74f0' },
  green: { surface: '#f0fbf4', icon: '#22a06b' },
  purple: { surface: '#f8f4fe', icon: '#8b5cf6' },
  amber: { surface: '#fdf8f0', icon: '#d98f2a' },
  neutral: { surface: '#ffffff', icon: '#94a3b8' },
} as const satisfies Record<string, StatAccent>;

export const CHART_LINE_COLOR = '#3b74f0';
