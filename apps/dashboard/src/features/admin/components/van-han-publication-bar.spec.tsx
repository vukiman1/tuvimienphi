import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { VanHanSlotRow, VanHanYearView } from '../data/admin-van-han.query';
import { VanHanPublicationBar } from './van-han-publication-bar';

const ZODIACS = [
  'Tý',
  'Sửu',
  'Dần',
  'Mão',
  'Thìn',
  'Tị',
  'Ngọ',
  'Mùi',
  'Thân',
  'Dậu',
  'Tuất',
  'Hợi',
];

function slots(finished: number): VanHanSlotRow[] {
  return ZODIACS.map((zodiac, index) => ({
    zodiacOrder: index + 1,
    zodiac,
    missing: index < finished ? [] : ['LUU_NIEN', 'LUAN_GIAI', 'TUNG_TUOI'],
    entry:
      index < finished ? { id: `entry-${index}`, updatedAt: '2026-10-07T03:00:00.000Z' } : null,
  }));
}

function renderBar(view: Partial<VanHanYearView>) {
  const onPublish = vi.fn();
  const onUnpublish = vi.fn();
  render(
    <VanHanPublicationBar
      view={{ year: 2027, canChi: 'Đinh Mùi', publishedAt: null, slots: slots(12), ...view }}
      isChanging={false}
      onPublish={onPublish}
      onUnpublish={onUnpublish}
    />,
  );
  return { onPublish, onUnpublish };
}

describe('VanHanPublicationBar', () => {
  it('holds publishing back until all twelve zodiacs are written', () => {
    renderBar({ slots: slots(11) });

    expect(screen.getByText(/11\/12 con giáp đủ nội dung/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Xuất bản năm 2027' })).toHaveProperty(
      'disabled',
      true,
    );
  });

  it('asks before switching the public site to the new year', async () => {
    const { onPublish } = renderBar({ slots: slots(12) });

    fireEvent.click(screen.getByRole('button', { name: 'Xuất bản năm 2027' }));
    expect(onPublish).not.toHaveBeenCalled();
    expect(await screen.findByText(/chuyển sang hiển thị vận hạn năm Đinh Mùi 2027/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Xuất bản' }));

    expect(onPublish).toHaveBeenCalledTimes(1);
  });

  it('says a published year is live and offers to take it down', async () => {
    const { onUnpublish } = renderBar({
      year: 2026,
      canChi: 'Bính Ngọ',
      publishedAt: '2026-10-07T03:00:00.000Z',
    });

    expect(screen.getByText('Năm Bính Ngọ 2026 đang hiển thị trên trang công khai')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Xuất bản năm/ })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Gỡ xuất bản' }));
    const confirm = await screen.findAllByRole('button', { name: 'Gỡ xuất bản' });
    fireEvent.click(confirm[confirm.length - 1]);

    expect(onUnpublish).toHaveBeenCalledTimes(1);
  });
});
