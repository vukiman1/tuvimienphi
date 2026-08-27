import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function AdEditorDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Thêm liên kết chuyển hướng</DialogTitle>
          <DialogDescription>
            Tạo một đường dẫn rút gọn đo lường lượt nhấp, chuyển tới trang đích.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="ad-label">Tên chiến dịch</Label>
            <Input id="ad-label" placeholder="Ví dụ: Ưu đãi luận giải chuyên sâu" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ad-slug">Đường dẫn</Label>
              <Input id="ad-slug" placeholder="/go/uu-dai" required />
            </div>
            <div className="flex items-end justify-between gap-2 rounded-md border border-input px-3 py-2">
              <Label htmlFor="ad-active" className="mb-0">
                Kích hoạt
              </Label>
              <Switch id="ad-active" defaultChecked />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="ad-target">Đích đến (URL)</Label>
            <Input id="ad-target" type="url" placeholder="https://…" required />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Huỷ
              </Button>
            </DialogClose>
            <Button type="submit">
              <Sparkles /> Tạo liên kết
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
