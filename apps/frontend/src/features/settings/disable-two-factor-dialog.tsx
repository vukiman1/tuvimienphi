import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { TitledDialog } from '@/components/ui/titled-dialog';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DisableTwoFactorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
  isPending: boolean;
  error: string | null;
}

export function DisableTwoFactorDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  error,
}: DisableTwoFactorDialogProps) {
  return (
    <TitledDialog
      onOpenChange={onOpenChange}
      open={open}
      title="Turn off two-factor authentication?"
      description="Your account will be protected by its password alone."
    >
      {open && <ConfirmForm error={error} isPending={isPending} onConfirm={onConfirm} />}
    </TitledDialog>
  );
}

function ConfirmForm({
  onConfirm,
  isPending,
  error,
}: Pick<DisableTwoFactorDialogProps, 'onConfirm' | 'isPending' | 'error'>) {
  const [password, setPassword] = useState('');

  return (
    <Form className="grid gap-4" onSubmit={() => onConfirm(password)}>
      <FormError message={error} />

      <div className="grid gap-2">
        <Label htmlFor="disable-2fa-password">Current password</Label>
        <Input
          autoComplete="current-password"
          id="disable-2fa-password"
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
      </div>

      <Button disabled={isPending || !password} type="submit" variant="destructive">
        {isPending ? 'Turning off...' : 'Turn off'}
      </Button>
    </Form>
  );
}
