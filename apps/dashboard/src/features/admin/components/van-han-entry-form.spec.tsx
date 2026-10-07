import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Form } from 'antd';
import type { VanHanBirthYearOption, VanHanEntryContent } from '../data/admin-van-han.query';
import { VanHanEntryForm } from './van-han-entry-form';
import { toFormValues, type VanHanFormValues } from './van-han-form-model';

const OPTIONS: VanHanBirthYearOption[] = [
  { birthYear: 1990, canChi: 'Canh Ngọ', menh: 'Lộ Bàng Thổ', age: 37 },
  { birthYear: 2002, canChi: 'Nhâm Ngọ', menh: 'Dương Liễu Mộc', age: 25 },
];

const WRITTEN: VanHanEntryContent = {
  id: 'entry-ngo',
  luuNien: 'Năm nay vận trình nhiều chuyển biến.',
  sourceUrl: '',
  updatedAt: '2026-10-07T03:00:00.000Z',
  luanGiai: ['Tài Vận', 'Sức Khoẻ', 'Sự Nghiệp', 'Tình Duyên'].map((aspect) => ({
    aspect,
    rating: 3,
    body: 'Giữ ổn định.',
  })),
  tungTuoi: [{ birthYear: 1990, male: 'Nam gặp La Hầu.', female: 'Nữ gặp Kế Đô.' }],
};

interface HarnessProps {
  readonly initialValues: VanHanFormValues;
  readonly isPublished: boolean;
  readonly onSubmit: (values: VanHanFormValues) => void;
}

function Harness({ initialValues, isPublished, onSubmit }: HarnessProps) {
  const [form] = Form.useForm<VanHanFormValues>();
  return (
    <>
      <VanHanEntryForm
        form={form}
        initialValues={initialValues}
        options={OPTIONS}
        isPublished={isPublished}
        onSubmit={onSubmit}
      />
      <button type="button" onClick={() => form.submit()}>
        save
      </button>
    </>
  );
}

function renderForm(entry: VanHanEntryContent | null, isPublished = false) {
  const onSubmit = vi.fn<(values: VanHanFormValues) => void>();
  render(
    <Harness
      initialValues={toFormValues(entry, OPTIONS)}
      isPublished={isPublished}
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit };
}

function type(label: string, text: string): void {
  fireEvent.change(screen.getByLabelText(label), { target: { value: text } });
}

function save(): void {
  fireEvent.click(screen.getByRole('button', { name: 'save' }));
}

describe('VanHanEntryForm', () => {
  it('gives each chosen birth year its own readings, labelled with pillar and nạp âm', () => {
    renderForm(null);

    expect(screen.getByText('Canh Ngọ · 1990')).toBeTruthy();
    expect(screen.getByText('Lộ Bàng Thổ')).toBeTruthy();
    expect(screen.getByLabelText('Nam sinh năm 2002')).toBeTruthy();
    expect(screen.getByLabelText('Nữ sinh năm 2002')).toBeTruthy();
  });

  it('hands back what was typed, keyed to the birth year it was typed under', async () => {
    const { onSubmit } = renderForm(null);

    type('Lưu niên vận thế', 'Năm 2026 nhiều thuận lợi.');
    type('Luận giải Tài Vận', 'Tài lộc hanh thông.');
    type('Nam sinh năm 1990', 'Nam 37 tuổi gặp La Hầu.');
    save();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const [values] = onSubmit.mock.calls[0];
    expect(values.luuNien).toBe('Năm 2026 nhiều thuận lợi.');
    expect(values.luanGiai[0].body).toBe('Tài lộc hanh thông.');
    expect(values.ages['1990'].male).toBe('Nam 37 tuổi gặp La Hầu.');
  });

  it('lets a draft be saved half written', async () => {
    const { onSubmit } = renderForm(null);

    save();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it('holds back a published entry that would go live with a part empty', async () => {
    const { onSubmit } = renderForm(WRITTEN, true);

    type('Lưu niên vận thế', '');
    save();

    expect(await screen.findByText('Viết phần lưu niên vận thế.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('saves a published entry once every part is written', async () => {
    const { onSubmit } = renderForm(WRITTEN, true);

    type('Lưu niên vận thế', 'Bản đã sửa.');
    save();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].luuNien).toBe('Bản đã sửa.');
  });
});
