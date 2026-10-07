import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, getRouteApi, useBlocker } from '@tanstack/react-router';
import { ArrowLeftOutlined, CopyOutlined, RobotOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Flex,
  Form,
  Modal,
  Popconfirm,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import { isSessionExpired, rejectionReason } from '@/lib/graphql-request';
import { VanHanEntryForm } from '../components/van-han-entry-form';
import {
  copyOfPreviousYear,
  isSameInput,
  toFormValues,
  toInput,
  type VanHanFormValues,
} from '../components/van-han-form-model';
import { isVanHanYear, isZodiacOrder } from '../components/van-han-year-model';
import {
  VAN_HAN_QUERY_KEY,
  saveVanHanEntry,
  vanHanEditorQuery,
  type VanHanEditorView,
} from '../data/admin-van-han.query';

const LOAD_FAILED = 'Không tải được nội dung để soạn.';
const INVALID_ADDRESS = 'Đường dẫn không trỏ tới một con giáp và một năm hợp lệ.';
const SAVED = 'Đã lưu.';
const SAVE_FAILED = 'Không lưu được nội dung. Thử lại sau ít phút.';
const SESSION_EXPIRED =
  'Phiên đăng nhập đã hết hạn. Đăng nhập lại ở một tab khác rồi bấm Lưu lần nữa, nội dung đang soạn vẫn còn ở đây.';
const AI_NOT_CONNECTED = 'Tính năng AI chưa được kết nối.';
const STICKY_Z_INDEX = 10;
const HEADER_PADDING = 12;

const route = getRouteApi('/van-han_/$year/$zodiacOrder');

export function VanHanEditorPage() {
  const { year, zodiacOrder } = route.useParams();
  const isAddressValid = isVanHanYear(year) && isZodiacOrder(zodiacOrder);
  const { data, isPending, isError } = useQuery({
    ...vanHanEditorQuery(year, zodiacOrder),
    enabled: isAddressValid,
  });

  if (!isAddressValid) {
    return <Alert type="error" showIcon title={INVALID_ADDRESS} />;
  }
  if (isError) {
    return <Alert type="error" showIcon title={LOAD_FAILED} />;
  }
  if (isPending) {
    return <Skeleton active />;
  }
  return <VanHanEditor key={`${year}-${zodiacOrder}`} editor={data.vanHanEditor} />;
}

function VanHanEditor({ editor }: { readonly editor: VanHanEditorView }) {
  const { year, slot, birthYearOptions, previousEntry } = editor;
  const { zodiacOrder } = slot;
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<VanHanFormValues>();
  const [initialValues] = useState(() => toFormValues(slot.entry, birthYearOptions));
  const [savedInput, setSavedInput] = useState(() => toInput(year, zodiacOrder, initialValues));
  const values = Form.useWatch([], { form, preserve: true });
  const isDirty = !isSameInput(savedInput, toInput(year, zodiacOrder, values ?? initialValues));
  const isPublished = editor.publishedAt !== null;

  const save = useMutation({
    mutationFn: saveVanHanEntry,
    onSuccess: (_result, input) => {
      setSavedInput(input);
      void message.success(SAVED);
      return queryClient.invalidateQueries({ queryKey: VAN_HAN_QUERY_KEY });
    },
    onError: (error) => {
      void message.error(saveFailureMessage(error));
    },
  });

  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: isDirty,
    withResolver: true,
  });

  const copyPreviousYear = () => {
    if (previousEntry) {
      form.setFieldsValue(copyOfPreviousYear(previousEntry, birthYearOptions));
    }
  };

  return (
    <Flex vertical gap={16}>
      <Flex
        align="center"
        justify="space-between"
        gap={16}
        wrap
        style={{
          position: 'sticky',
          top: 0,
          zIndex: STICKY_Z_INDEX,
          paddingBlock: HEADER_PADDING,
          background: token.colorBgLayout,
        }}
      >
        <Flex vertical gap={4}>
          <Link to="/van-han" search={{ year }}>
            <ArrowLeftOutlined /> Vận hạn {year}
          </Link>
          <Flex align="center" gap={12} wrap>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Tuổi {slot.zodiac} · năm {editor.canChi} {year}
            </Typography.Title>
            <Tag color={isPublished ? 'green' : 'default'}>
              {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
            </Tag>
            {isDirty ? <Tag color="orange">Chưa lưu thay đổi</Tag> : null}
          </Flex>
        </Flex>

        <Flex align="center" gap={8} wrap>
          <Tooltip title={AI_NOT_CONNECTED}>
            <Button icon={<RobotOutlined />} disabled>
              AI soạn nội dung
            </Button>
          </Tooltip>
          {previousEntry ? (
            <Popconfirm
              title={`Chép nội dung năm ${year - 1}?`}
              description="Nội dung đang soạn ở đây sẽ được thay bằng bản năm trước để bạn sửa lại."
              okText="Chép"
              cancelText="Huỷ"
              onConfirm={copyPreviousYear}
            >
              <Button icon={<CopyOutlined />}>Chép từ năm {year - 1}</Button>
            </Popconfirm>
          ) : null}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={save.isPending}
            onClick={() => form.submit()}
          >
            Lưu
          </Button>
        </Flex>
      </Flex>

      {isPublished ? (
        <Alert
          type="warning"
          showIcon
          title="Năm này đang hiển thị trên trang công khai"
          description="Thay đổi có hiệu lực ngay khi lưu, nên mọi phần phải được điền đủ."
        />
      ) : null}

      <VanHanEntryForm
        form={form}
        initialValues={initialValues}
        options={birthYearOptions}
        isPublished={isPublished}
        onSubmit={(submitted) => save.mutate(toInput(year, zodiacOrder, submitted))}
      />

      <Modal
        open={blocker.status === 'blocked'}
        title="Rời trang mà chưa lưu?"
        okText="Rời trang"
        cancelText="Ở lại"
        okButtonProps={{ danger: true }}
        onOk={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      >
        Thay đổi chưa lưu của tuổi {slot.zodiac} sẽ mất.
      </Modal>
    </Flex>
  );
}

function saveFailureMessage(error: unknown): string {
  if (isSessionExpired(error)) {
    return SESSION_EXPIRED;
  }
  const reason = rejectionReason(error);
  return reason ? `Không lưu được: ${reason}` : SAVE_FAILED;
}
