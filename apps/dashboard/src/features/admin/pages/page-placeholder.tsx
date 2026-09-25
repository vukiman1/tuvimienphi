import { Empty, Typography } from 'antd';

interface PagePlaceholderProps {
  title: string;
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <>
      <Typography.Title level={3}>{title}</Typography.Title>
      <Empty description="Chưa có dữ liệu" />
    </>
  );
}
