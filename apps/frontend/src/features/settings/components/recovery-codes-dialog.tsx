import { Button } from '@/components/ui/button';
import { TitledDialog } from '@/components/ui/titled-dialog';
import { notify } from '@/lib/toast';

interface RecoveryCodesDialogProps {
  codes: string[] | null;
  onClose: () => void;
}

export function RecoveryCodesDialog({ codes, onClose }: RecoveryCodesDialogProps) {
  const copy = async () => {
    if (!codes) {
      return;
    }
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      notify.success('Đã sao chép mã phục hồi.');
    } catch {
      notify.error('Chưa sao chép được. Bạn hãy chép tay các mã này nhé.');
    }
  };

  return (
    <TitledDialog
      onOpenChange={(open) => !open && onClose()}
      open={Boolean(codes)}
      title="Lưu mã phục hồi"
      description="Mỗi mã chỉ dùng được một lần, và đây là lần duy nhất các mã được hiển thị. Bạn hãy cất chúng ở nơi lấy được mà không cần điện thoại."
    >
      <ul className="grid grid-cols-2 gap-2 rounded-md border bg-muted/40 p-4 font-mono text-sm">
        {(codes ?? []).map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <Button onClick={copy} type="button" variant="outline">
          Sao chép mã
        </Button>
        <Button onClick={onClose} type="button">
          Đã lưu xong
        </Button>
      </div>
    </TitledDialog>
  );
}
