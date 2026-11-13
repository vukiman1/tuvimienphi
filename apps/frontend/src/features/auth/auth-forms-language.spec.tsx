import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { ForgotPasswordForm } from './forgot-password-form';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';

jest.mock('@/services/auth-service', () => ({ authService: {} }));
jest.mock('@/lib/toast', () => ({
  notify: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const ENGLISH_COPY =
  /\b(password|sign in|email address|remember me|forgot|create account|confirm|your name|show|hide|send)\b/i;
const NAMED_ATTRIBUTES = ['aria-label', 'placeholder', 'title', 'alt'] as const;

interface FormCase {
  readonly name: string;
  readonly element: ReactElement;
}

const FORM_CASES: readonly FormCase[] = [
  { name: 'login', element: <LoginForm onForgotPassword={jest.fn()} /> },
  { name: 'register', element: <RegisterForm onVerified={jest.fn()} /> },
  { name: 'forgot password', element: <ForgotPasswordForm onDone={jest.fn()} /> },
];

async function renderInRouter(element: ReactElement): Promise<void> {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => element }),
    history: createMemoryHistory({ initialEntries: ['/?auth=login'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  await screen.findAllByRole('button');
}

function visibleAndNamedCopy(): string[] {
  const attributeCopy = NAMED_ATTRIBUTES.flatMap((attribute) =>
    Array.from(document.body.querySelectorAll(`[${attribute}]`), (element) =>
      element.getAttribute(attribute),
    ),
  );
  return [document.body.textContent, ...attributeCopy].filter(
    (copy): copy is string => typeof copy === 'string',
  );
}

describe('auth forms copy', () => {
  it.each(FORM_CASES)('shows the $name form in Vietnamese only', async ({ element }) => {
    await renderInRouter(element);

    expect(visibleAndNamedCopy().filter((copy) => ENGLISH_COPY.test(copy))).toEqual([]);
  });
});
