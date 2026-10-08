import { useState } from 'react';
import { CheckCircleFilled, CloseCircleFilled, KeyOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Space, Tooltip, Typography, theme } from 'antd';
import { cleanApiKey, friendlyFailure, keyProblem } from './ai-provider-model';
import { keyPreview, maskApiKey } from './mask-api-key';

export type KeyCheck =
  | { readonly status: 'IDLE' }
  | { readonly status: 'CHECKING' }
  | { readonly status: 'OK'; readonly modelCount: number }
  | { readonly status: 'FAILED'; readonly reason: string };

const UNSAVED_KEY = 'Khoá mới, chưa lưu.';

interface ApiKeyFieldProps {
  readonly label: string;
  readonly savedHint: string | null;
  readonly hasSavedKey: boolean;
  readonly value: string;
  readonly check: KeyCheck;
  readonly onChange: (value: string) => void;
  readonly onCheck: () => void;
}

export function ApiKeyField({
  label,
  savedHint,
  hasSavedKey,
  value,
  check,
  onChange,
  onCheck,
}: ApiKeyFieldProps) {
  const [isEditing, setIsEditing] = useState(!hasSavedKey);
  const problem = value === '' ? null : keyProblem(value);
  const hasKeyToShow = value !== '' || hasSavedKey;
  const isShowingPreview = !isEditing && hasKeyToShow && problem === null;
  const canCheck = hasKeyToShow && problem === null;
  const fieldLabel = `Khoá API ${label}`;
  const checkButton = (
    <Button disabled={!canCheck} loading={check.status === 'CHECKING'} onClick={onCheck}>
      Kiểm tra
    </Button>
  );

  return (
    <Flex vertical gap={6}>
      {isShowingPreview ? (
        <Space.Compact block>
          <Input
            readOnly
            aria-label={fieldLabel}
            prefix={<KeyOutlined />}
            value={keyPreview(value === '' ? savedHint : maskApiKey(value))}
            suffix={
              <Button type="link" size="small" onClick={() => setIsEditing(true)}>
                Đổi khoá
              </Button>
            }
          />
          {checkButton}
        </Space.Compact>
      ) : (
        <Space.Compact block>
          <Input.Password
            autoFocus={hasKeyToShow}
            aria-label={fieldLabel}
            prefix={<KeyOutlined />}
            placeholder="Dán khoá API"
            autoComplete="new-password"
            status={problem ? 'error' : undefined}
            value={value}
            onChange={(event) => onChange(cleanApiKey(event.target.value))}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
          />
          {checkButton}
        </Space.Compact>
      )}
      {problem ? <Typography.Text type="danger">{problem}</Typography.Text> : null}
      {isShowingPreview && value !== '' ? (
        <Typography.Text type="warning">{UNSAVED_KEY}</Typography.Text>
      ) : null}
      <KeyCheckLine label={label} check={check} />
    </Flex>
  );
}

function KeyCheckLine({ label, check }: { readonly label: string; readonly check: KeyCheck }) {
  const { token } = theme.useToken();

  if (check.status === 'CHECKING') {
    return <Typography.Text type="secondary">Đang hỏi {label}…</Typography.Text>;
  }
  if (check.status === 'OK') {
    return (
      <Typography.Text type="success">
        <CheckCircleFilled style={{ color: token.colorSuccess }} /> Khoá dùng được,{' '}
        {check.modelCount} model sẵn sàng.
      </Typography.Text>
    );
  }
  if (check.status === 'FAILED') {
    return (
      <Tooltip title={check.reason}>
        <Typography.Text type="danger">
          <CloseCircleFilled style={{ color: token.colorError }} /> {friendlyFailure(check.reason)}
        </Typography.Text>
      </Tooltip>
    );
  }
  return null;
}
