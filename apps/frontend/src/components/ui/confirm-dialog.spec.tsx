import { type ReactElement, useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfirmProvider, useConfirm } from './confirm-dialog';

const mockAlertDialogLoaded = jest.fn();

jest.mock('./alert-dialog', () => {
  mockAlertDialogLoaded();
  return jest.requireActual('./alert-dialog');
});

const PENDING_ANSWER = 'pending';

function RevokeButton(): ReactElement {
  const confirm = useConfirm();
  const [answer, setAnswer] = useState<string>(PENDING_ANSWER);

  const ask = async (): Promise<void> => {
    const isConfirmed = await confirm({
      title: 'Revoke this session?',
      description: 'The device will be signed out.',
      confirmLabel: 'Revoke',
      cancelLabel: 'Keep',
      destructive: true,
    });
    setAnswer(String(isConfirmed));
  };

  return (
    <>
      <button onClick={() => void ask()} type="button">
        Revoke session
      </button>
      <output>{answer}</output>
    </>
  );
}

async function askToRevoke(): Promise<void> {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Revoke session' }));
  });
}

function renderWithConfirm(): void {
  render(
    <ConfirmProvider>
      <RevokeButton />
    </ConfirmProvider>,
  );
}

describe('ConfirmProvider', () => {
  it('leaves the dialog code unloaded until a confirmation is requested', () => {
    renderWithConfirm();

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(mockAlertDialogLoaded).not.toHaveBeenCalled();
  });

  it('resolves true when the action is confirmed', async () => {
    renderWithConfirm();

    await askToRevoke();
    expect(await screen.findByRole('alertdialog', { name: 'Revoke this session?' })).toBeTruthy();
    expect(mockAlertDialogLoaded).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('true'));
  });

  it('resolves false when the action is cancelled', async () => {
    renderWithConfirm();

    await askToRevoke();
    fireEvent.click(await screen.findByRole('button', { name: 'Keep' }));

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('false'));
  });

  it('closes the dialog once answered', async () => {
    renderWithConfirm();

    await askToRevoke();
    fireEvent.click(await screen.findByRole('button', { name: 'Keep' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });
});
