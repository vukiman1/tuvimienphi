import { Alert, Button, Popconfirm } from 'antd';
import { formatDateTime } from '@/lib/format-date-time';
import type { VanHanYearView } from '../data/admin-van-han.query';
import { ZODIAC_COUNT, completeCount } from './van-han-year-model';

interface VanHanPublicationBarProps {
  readonly view: VanHanYearView;
  readonly isChanging: boolean;
  readonly onPublish: () => void;
  readonly onUnpublish: () => void;
}

export function VanHanPublicationBar({
  view,
  isChanging,
  onPublish,
  onUnpublish,
}: VanHanPublicationBarProps) {
  const name = `${view.canChi} ${view.year}`;

  if (view.publishedAt) {
    return (
      <Alert
        type="success"
        showIcon
        title={`Năm ${name} đang hiển thị trên trang công khai`}
        description={`Xuất bản lúc ${formatDateTime(view.publishedAt)}. Sửa nội dung nào thì có hiệu lực ngay khi lưu.`}
        action={
          <Popconfirm
            title={`Gỡ xuất bản năm ${view.year}?`}
            description="Trang công khai sẽ quay về năm đã xuất bản gần nhất trước đó."
            okText="Gỡ xuất bản"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
            onConfirm={onUnpublish}
          >
            <Button danger loading={isChanging}>
              Gỡ xuất bản
            </Button>
          </Popconfirm>
        }
      />
    );
  }

  const done = completeCount(view.slots);
  const isReady = done === ZODIAC_COUNT;

  return (
    <Alert
      type="info"
      showIcon
      title={`Năm ${name} là bản nháp`}
      description={`${done}/${ZODIAC_COUNT} con giáp đủ nội dung. Trang công khai chưa hiển thị năm này cho tới khi bạn xuất bản.`}
      action={
        <Popconfirm
          disabled={!isReady}
          title={`Xuất bản năm ${view.year}?`}
          description={`Trang công khai sẽ chuyển sang hiển thị vận hạn năm ${name}.`}
          okText="Xuất bản"
          cancelText="Huỷ"
          onConfirm={onPublish}
        >
          <Button type="primary" disabled={!isReady} loading={isChanging}>
            Xuất bản năm {view.year}
          </Button>
        </Popconfirm>
      }
    />
  );
}
