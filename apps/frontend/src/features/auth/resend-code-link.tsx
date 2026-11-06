import { TextLink } from '@/components/ui/text-link';
import type { ResendCooldown } from './use-resend-cooldown';

interface ResendCodeLinkProps {
  readonly cooldown: ResendCooldown;
  readonly isSending: boolean;
  readonly onResend: () => void;
}

function resendLabel(cooldown: ResendCooldown, isSending: boolean): string {
  if (isSending) return 'Sending...';
  if (!cooldown.canResend) return `Send another code in ${cooldown.secondsLeft}s`;
  return 'Send another code';
}

export function ResendCodeLink({ cooldown, isSending, onResend }: ResendCodeLinkProps) {
  return (
    <TextLink
      className="text-center"
      disabled={isSending || !cooldown.canResend}
      onClick={onResend}
      tone="muted"
    >
      {resendLabel(cooldown, isSending)}
    </TextLink>
  );
}
