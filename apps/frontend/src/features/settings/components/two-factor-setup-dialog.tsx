import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { TitledDialog } from '@/components/ui/titled-dialog';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { errorMessage } from '@/lib/api-error';
import { authService } from '@/services/auth-service';

const SETUP_FAILED_MESSAGE = 'Chưa tạo được mã QR. Bạn đóng hộp thoại rồi thử lại nhé.';

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnabled: (recoveryCodes: string[]) => void | Promise<void>;
}

export function TwoFactorSetupDialog({ open, onOpenChange, onEnabled }: TwoFactorSetupDialogProps) {
  return (
    <TitledDialog
      onOpenChange={onOpenChange}
      open={open}
      title="Bật xác thực 2 bước"
      description="Quét mã QR bằng ứng dụng xác thực, rồi nhập mã mà ứng dụng hiển thị."
    >
      {open && <SetupSteps onEnabled={onEnabled} />}
    </TitledDialog>
  );
}

function SetupSteps({ onEnabled }: Pick<TwoFactorSetupDialogProps, 'onEnabled'>) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // A query, not a mutation: the endpoint is idempotent, so React Query dedupes StrictMode's
  // duplicate call instead of spending two of the five requests the throttle allows.
  const setupQuery = useQuery({
    queryKey: ['auth', '2fa', 'setup'],
    queryFn: () => authService.startTwoFactorSetup(),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });

  const confirmMutation = useMutation({
    mutationFn: () => authService.confirmTwoFactorSetup(code.trim()),
    onSuccess: ({ recoveryCodes }) => onEnabled(recoveryCodes),
    onError: (caught: unknown) =>
      setError(errorMessage(caught, 'Chưa bật được xác thực 2 bước. Bạn thử lại nhé.')),
  });

  const { data } = setupQuery;

  useEffect(() => {
    if (data?.otpauthUri) {
      void QRCode.toDataURL(data.otpauthUri, { width: 220 }).then(setQrDataUrl);
    }
  }, [data?.otpauthUri]);

  return (
    <Form
      className="grid gap-4"
      onSubmit={() => {
        setError(null);
        confirmMutation.mutate();
      }}
    >
      <FormError message={error ?? (setupQuery.isError ? SETUP_FAILED_MESSAGE : null)} />

      <div className="flex justify-center">
        {qrDataUrl ? (
          <img alt="Mã QR để bật xác thực 2 bước" className="rounded-md border" src={qrDataUrl} />
        ) : (
          <p className="py-10 text-sm text-muted-foreground">Đang tạo mã QR...</p>
        )}
      </div>

      {data?.otpauthUri && (
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer">Không quét được?</summary>
          <p className="mt-2 wrap-break-words font-mono text-xs">{data.otpauthUri}</p>
        </details>
      )}

      <div className="grid gap-2">
        <Label htmlFor="setup-code">Mã trong ứng dụng</Label>
        <Input
          autoComplete="one-time-code"
          id="setup-code"
          inputMode="numeric"
          onChange={(event) => setCode(event.target.value)}
          placeholder="123456"
          value={code}
        />
      </div>

      <Button disabled={confirmMutation.isPending || code.trim().length !== 6} type="submit">
        {confirmMutation.isPending ? 'Đang xác thực...' : 'Bật'}
      </Button>
    </Form>
  );
}
