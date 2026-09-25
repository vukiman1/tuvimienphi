import { Flex, Spin } from 'antd';

export function PageLoader() {
  return (
    <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
      <Spin size="large" />
    </Flex>
  );
}
