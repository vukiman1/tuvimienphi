import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiError } from '@org/frontend-shared';
import { TwoFactorCodeForm } from './two-factor-code-form';

const HTTP_UNAUTHORIZED = 401;
const HTTP_GONE = 410;
const CODE_LABEL = 'Mã xác thực';
const SUBMIT_LABEL = 'Xác nhận';

function apiError(statusCode: number, message: string): ApiError {
  return new ApiError({ statusCode, errors: { message } } as never);
}

function submitCode(code: string): void {
  fireEvent.change(screen.getByLabelText(CODE_LABEL), { target: { value: code } });
  fireEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }));
}

describe('TwoFactorCodeForm', () => {
  it('sends the typed code without surrounding spaces', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TwoFactorCodeForm onExpired={vi.fn()} onSubmit={onSubmit} />);

    submitCode(' 123456 ');

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('123456'));
  });

  it('keeps the form and shows why when the code is wrong', async () => {
    const onExpired = vi.fn();
    const onSubmit = vi
      .fn()
      .mockRejectedValue(apiError(HTTP_UNAUTHORIZED, 'That code is not valid'));
    render(<TwoFactorCodeForm onExpired={onExpired} onSubmit={onSubmit} />);

    submitCode('000000');

    expect(await screen.findByText('That code is not valid')).toBeTruthy();
    expect(onExpired).not.toHaveBeenCalled();
  });

  it('goes back to Google sign-in when the attempt has expired', async () => {
    const onExpired = vi.fn();
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        apiError(HTTP_GONE, 'That sign-in attempt has expired. Please start again.'),
      );
    render(<TwoFactorCodeForm onExpired={onExpired} onSubmit={onSubmit} />);

    submitCode('123456');

    await waitFor(() =>
      expect(onExpired).toHaveBeenCalledWith(
        'That sign-in attempt has expired. Please start again.',
      ),
    );
  });
});
