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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VanHanEntry } from '../data/types';

export function VanHanEditorDialog({
  open,
  onOpenChange,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: VanHanEntry | null;
}) {
  const editing = !!entry;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Sửa dòng vận hạn' : 'Thêm dòng vận hạn'}</DialogTitle>
          <DialogDescription>
            Luận giải sao chiếu mệnh theo tuổi cho năm Bính Ngọ 2026.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
          }}
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="vh-age">Tuổi</Label>
              <Input
                id="vh-age"
                type="number"
                inputMode="numeric"
                min={1}
                defaultValue={entry?.age ?? 18}
                required
              />
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="vh-star">Sao chiếu mệnh</Label>
              <Input
                id="vh-star"
                defaultValue={entry?.star ?? ''}
                placeholder="Ví dụ: Thái Dương"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Mức</Label>
              <Select defaultValue={entry?.rating ?? 'binh'}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cat">Cát</SelectItem>
                  <SelectItem value="binh">Bình</SelectItem>
                  <SelectItem value="hung">Hung</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end justify-between gap-2 rounded-md border border-input px-3 py-2">
              <Label htmlFor="vh-pub" className="mb-0">
                Xuất bản
              </Label>
              <Switch id="vh-pub" defaultChecked={entry?.published ?? true} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="vh-summary">Luận giải</Label>
            <Textarea
              id="vh-summary"
              defaultValue={entry?.summary ?? ''}
              placeholder="Nội dung luận giải cho tuổi này…"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Huỷ
              </Button>
            </DialogClose>
            <Button type="submit">
              <Sparkles /> {editing ? 'Lưu thay đổi' : 'Thêm dòng'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
