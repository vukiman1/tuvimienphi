import type { ComponentType } from 'react';
import { IconThienBan, IconMenhChu, IconScroll, IconLantern, IconLaBan } from './nav-icons';

export interface NavItem {
  to: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Tổng quan',
    description: 'Lượt xem & người dùng',
    icon: IconThienBan,
  },
  {
    to: '/users',
    label: 'Người dùng',
    description: 'Lịch sử lập lá số',
    icon: IconMenhChu,
  },
  {
    to: '/blog',
    label: 'Bài viết',
    description: 'Quản lý blog',
    icon: IconScroll,
  },
  {
    to: '/ads',
    label: 'Quảng cáo',
    description: 'Redirect & popup',
    icon: IconLantern,
  },
  {
    to: '/van-han',
    label: 'Vận hạn',
    description: 'Dữ liệu sao chiếu mệnh',
    icon: IconLaBan,
  },
];
