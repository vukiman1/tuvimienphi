import { type ReactNode, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Leaf,
  Mail,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TextLink } from '@/components/ui/text-link';
import { AuthOptionButton } from './auth-option-button';
import { GoogleSignInButton } from './google-sign-in-button';

interface PanelCopy {
  /** Shown on the provider choice. */
  chooser: { title: string; description: string };
  /** Shown once email is picked. */
  email: { title: string; description: string; action: string };
  footer: { question: string; action: string; onAction: () => void };
}

interface AuthMethodPanelProps {
  copy: PanelCopy;
  renderEmailForm: () => ReactNode;
  /** Overrides where the back arrow goes — a nested step returns to its parent, not the chooser. */
  onBack?: () => void;
}

interface TrustBadge {
  readonly icon: LucideIcon;
  readonly label: string;
}

const TRUST_BADGES: readonly TrustBadge[] = [
  { icon: ShieldCheck, label: 'Bảo mật' },
  { icon: Leaf, label: 'Miễn phí' },
  { icon: Heart, label: 'Vì cộng đồng' },
];

/**
 * Opens on the choice of provider rather than on a form. Most people arrive with a Google account,
 * and showing fields first asks them to remember which one they used here.
 *
 * The heading lives in here rather than in the modal because it changes with the step, and so does
 * the back arrow that returns to the choice.
 */
export function AuthMethodPanel({ copy, renderEmailForm, onBack }: AuthMethodPanelProps) {
  const [isUsingEmail, setIsUsingEmail] = useState(false);
  const step = isUsingEmail ? copy.email : copy.chooser;

  return (
    <>
      <DialogHeader className="relative gap-1 text-center">
        {isUsingEmail && (
          <button
            aria-label="Quay lại các lựa chọn khác"
            className="absolute -left-1 top-1 flex size-9 items-center justify-center rounded-full text-[#6b5a4e] transition-colors outline-none hover:bg-white/70 hover:text-[#2b1d14] focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={onBack ?? (() => setIsUsingEmail(false))}
            type="button"
          >
            <ArrowLeft className="size-4" />
          </button>
        )}
        <DialogTitle className="px-8 font-display text-[1.75rem] leading-tight font-bold text-[#2b1d14]">
          {step.title}
        </DialogTitle>
        <DialogDescription
          className="text-[0.95rem] text-balance text-[#6b5a4e]"
          id="auth-modal-description"
        >
          {step.description}
        </DialogDescription>
      </DialogHeader>

      {isUsingEmail ? (
        renderEmailForm()
      ) : (
        <div className="mt-2 grid gap-3">
          <GoogleSignInButton />
          <AuthOptionButton
            icon={<Mail className="size-6 text-[#2b1d14]" strokeWidth={1.75} />}
            label={copy.email.action}
            onClick={() => setIsUsingEmail(true)}
          />
        </div>
      )}

      <div className="mx-auto flex w-3/4 items-center gap-4 text-[0.85rem] text-[#9a8a7a]">
        <span className="h-px flex-1 bg-[#dccbb5]" />
        hoặc
        <span className="h-px flex-1 bg-[#dccbb5]" />
      </div>

      <p className="text-center text-[0.95rem] text-[#5c4a3d]">
        {copy.footer.question}{' '}
        <TextLink
          className="inline-flex items-center gap-1.5 text-[#a0462a]"
          onClick={copy.footer.onAction}
        >
          {copy.footer.action}
          <ArrowRight className="size-4" />
        </TextLink>
      </p>

      <ul className="mt-6 flex items-center justify-center text-[0.72rem] whitespace-nowrap text-[#6b5a4e] sm:text-[0.8rem]">
        {TRUST_BADGES.map(({ icon: Icon, label }) => (
          <li
            className="flex items-center gap-1.5 border-[#dccbb5] px-2.5 not-last:border-r sm:gap-2 sm:px-4"
            key={label}
          >
            <Icon className="size-4" strokeWidth={1.75} />
            {label}
          </li>
        ))}
      </ul>
    </>
  );
}
