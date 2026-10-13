import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ApiKeyField, type KeyCheck } from './api-key-field';

const LABEL = 'Khoá API Gemini';
const TYPED = 'AIzaSyD-very-secret-middle-part-Xk7Q';

interface HarnessProps {
  readonly savedHint: string | null;
  readonly check?: KeyCheck;
  readonly onCheck?: () => void;
}

function Harness({ savedHint, check = { status: 'IDLE' }, onCheck = vi.fn() }: HarnessProps) {
  const [value, setValue] = useState('');
  return (
    <ApiKeyField
      label="Gemini"
      savedHint={savedHint}
      hasSavedKey={savedHint !== null}
      value={value}
      check={check}
      onChange={setValue}
      onCheck={onCheck}
    />
  );
}

function field(): HTMLInputElement {
  return screen.getByLabelText(LABEL) as HTMLInputElement;
}

function typeAndLeave(value: string): void {
  fireEvent.focus(field());
  fireEvent.change(field(), { target: { value } });
  fireEvent.blur(field());
}

describe('ApiKeyField', () => {
  it('shows a stored key by its two ends and nothing in between', () => {
    render(<Harness savedHint="AIza…Xk7Q" />);

    expect(field().value).toBe('AIza••••••••Xk7Q');
    expect(field().readOnly).toBe(true);
  });

  it('asks for a key when none is stored', () => {
    render(<Harness savedHint={null} />);

    expect(field().type).toBe('password');
    expect(field().placeholder).toBe('Dán khoá API');
    expect(screen.getByRole('button', { name: 'Kiểm tra' })).toHaveProperty('disabled', true);
  });

  it('folds a typed key down to its two ends once the field is left, marked as not saved', () => {
    render(<Harness savedHint={null} />);

    typeAndLeave(TYPED);

    expect(field().value).toBe('AIza••••••••Xk7Q');
    expect(document.body.textContent).not.toContain('very-secret');
    expect(screen.getByText('Khoá mới, chưa lưu.')).toBeTruthy();
  });

  it('drops the spaces and line breaks a paste drags along', () => {
    render(<Harness savedHint={null} />);

    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: `  ${TYPED}\n` } });

    expect(field().value).toBe(TYPED);
  });

  it('keeps a key too short to be one open, with the reason', () => {
    render(<Harness savedHint={null} />);

    typeAndLeave('sk-1');

    expect(field().type).toBe('password');
    expect(screen.getByText('Khoá quá ngắn.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Kiểm tra' })).toHaveProperty('disabled', true);
  });

  it('opens a stored key for replacing and goes back to it when nothing is typed', () => {
    render(<Harness savedHint="AIza…Xk7Q" />);

    fireEvent.click(screen.getByRole('button', { name: 'Đổi khoá' }));
    expect(field().type).toBe('password');
    expect(field().value).toBe('');

    fireEvent.blur(field());
    expect(field().value).toBe('AIza••••••••Xk7Q');
  });

  it('checks the key from the button beside it', () => {
    const onCheck = vi.fn();
    render(<Harness savedHint="AIza…Xk7Q" onCheck={onCheck} />);

    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));

    expect(onCheck).toHaveBeenCalledTimes(1);
  });

  it('says how many models a working key opens', () => {
    render(<Harness savedHint="AIza…Xk7Q" check={{ status: 'OK', modelCount: 23 }} />);

    expect(screen.getByText(/Khoá dùng được, 23 model sẵn sàng\./)).toBeTruthy();
  });

  it('puts a refused key in plain words', () => {
    render(
      <Harness
        savedHint="AIza…Xk7Q"
        check={{ status: 'FAILED', reason: 'GEMINI would not list its models: API key not valid' }}
      />,
    );

    expect(screen.getByText(/Khoá API không đúng hoặc đã bị thu hồi\./)).toBeTruthy();
  });
});
