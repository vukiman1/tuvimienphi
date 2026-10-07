import { Card, Col, Flex, Form, Input, Rate, Row, Select, Tag, Typography } from 'antd';
import type { FormInstance } from 'antd';
import { VAN_HAN_ASPECTS, VAN_HAN_MAX_RATING, VAN_HAN_TEXT_LIMITS } from '@org/shared-contracts';
import type { VanHanBirthYearOption } from '../data/admin-van-han.query';
import { ageKey, type VanHanFormValues } from './van-han-form-model';

const OVERVIEW_ROWS = { minRows: 5, maxRows: 18 } as const;
const ASPECT_ROWS = { minRows: 3, maxRows: 14 } as const;
const AGE_ROWS = { minRows: 2, maxRows: 8 } as const;
const AGE_COLUMN = { xs: 24, md: 12 } as const;
const AGE_GUTTER = 16;

const OVERVIEW_REQUIRED = 'Viết phần lưu niên vận thế.';
const ASPECT_REQUIRED = 'Viết nội dung cho mục này.';
const BIRTH_YEARS_REQUIRED = 'Chọn ít nhất một năm sinh.';
const AGE_REQUIRED = 'Viết luận cho tuổi này.';

interface VanHanEntryFormProps {
  readonly form: FormInstance<VanHanFormValues>;
  readonly initialValues: VanHanFormValues;
  readonly options: readonly VanHanBirthYearOption[];
  readonly isPublished: boolean;
  readonly onSubmit: (values: VanHanFormValues) => void;
}

export function VanHanEntryForm({
  form,
  initialValues,
  options,
  isPublished,
  onSubmit,
}: VanHanEntryFormProps) {
  const watchedBirthYears = Form.useWatch('birthYears', form);
  const birthYears = [...(watchedBirthYears ?? initialValues.birthYears)].sort((a, b) => a - b);
  const requiredText = (message: string) => [
    { required: isPublished, whitespace: isPublished, message },
  ];

  return (
    <Form<VanHanFormValues>
      form={form}
      layout="vertical"
      initialValues={initialValues}
      scrollToFirstError
      onFinish={() => onSubmit(form.getFieldsValue(true))}
    >
      <Flex vertical gap={16}>
        <Card title="Lưu niên vận thế">
          <Form.Item
            name="luuNien"
            rules={requiredText(OVERVIEW_REQUIRED)}
            extra="Mỗi dòng là một đoạn văn trên trang công khai."
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea
              aria-label="Lưu niên vận thế"
              autoSize={OVERVIEW_ROWS}
              maxLength={VAN_HAN_TEXT_LIMITS.luuNien}
              showCount
            />
          </Form.Item>
        </Card>

        <Card title="Vận thế luận giải">
          <Typography.Paragraph type="secondary">
            Trang công khai tách mỗi câu thành một gạch đầu dòng.
          </Typography.Paragraph>
          {VAN_HAN_ASPECTS.map((label, index) => (
            <Form.Item key={label} label={label} required={isPublished}>
              <Flex vertical gap={8}>
                <Form.Item name={['luanGiai', index, 'rating']} noStyle>
                  <Rate count={VAN_HAN_MAX_RATING} />
                </Form.Item>
                <Form.Item
                  name={['luanGiai', index, 'body']}
                  rules={requiredText(ASPECT_REQUIRED)}
                  noStyle
                >
                  <Input.TextArea
                    aria-label={`Luận giải ${label}`}
                    autoSize={ASPECT_ROWS}
                    maxLength={VAN_HAN_TEXT_LIMITS.aspectBody}
                    showCount
                  />
                </Form.Item>
              </Flex>
            </Form.Item>
          ))}
        </Card>

        <Card title="Vận hạn từng tuổi">
          <Form.Item
            name="birthYears"
            label="Năm sinh"
            rules={[{ required: isPublished, type: 'array', message: BIRTH_YEARS_REQUIRED }]}
          >
            <Select
              mode="multiple"
              aria-label="Năm sinh"
              placeholder="Chọn các năm sinh sẽ có luận riêng"
              options={options.map((option) => ({
                value: option.birthYear,
                label: `${option.birthYear} · ${option.canChi} · ${option.age} tuổi`,
              }))}
            />
          </Form.Item>

          <Flex vertical gap={16}>
            {birthYears.map((birthYear) => (
              <AgeFields
                key={birthYear}
                birthYear={birthYear}
                option={options.find((candidate) => candidate.birthYear === birthYear)}
                rules={requiredText(AGE_REQUIRED)}
              />
            ))}
          </Flex>
        </Card>

        <Card title="Nguồn tham khảo">
          <Form.Item name="sourceUrl" style={{ marginBottom: 0 }}>
            <Input
              aria-label="Nguồn tham khảo"
              placeholder="Đường dẫn bài gốc, nếu có"
              maxLength={VAN_HAN_TEXT_LIMITS.sourceUrl}
            />
          </Form.Item>
        </Card>
      </Flex>
    </Form>
  );
}

interface AgeFieldsProps {
  readonly birthYear: number;
  readonly option: VanHanBirthYearOption | undefined;
  readonly rules: { required: boolean; whitespace: boolean; message: string }[];
}

function AgeFields({ birthYear, option, rules }: AgeFieldsProps) {
  return (
    <Card type="inner" size="small" title={<AgeTitle birthYear={birthYear} option={option} />}>
      <Row gutter={AGE_GUTTER}>
        <Col {...AGE_COLUMN}>
          <Form.Item name={['ages', ageKey(birthYear), 'male']} label="Nam" rules={rules}>
            <Input.TextArea
              aria-label={`Nam sinh năm ${birthYear}`}
              autoSize={AGE_ROWS}
              maxLength={VAN_HAN_TEXT_LIMITS.ageReading}
              showCount
            />
          </Form.Item>
        </Col>
        <Col {...AGE_COLUMN}>
          <Form.Item name={['ages', ageKey(birthYear), 'female']} label="Nữ" rules={rules}>
            <Input.TextArea
              aria-label={`Nữ sinh năm ${birthYear}`}
              autoSize={AGE_ROWS}
              maxLength={VAN_HAN_TEXT_LIMITS.ageReading}
              showCount
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}

function AgeTitle({ birthYear, option }: Pick<AgeFieldsProps, 'birthYear' | 'option'>) {
  if (!option) {
    return <>Sinh năm {birthYear}</>;
  }
  return (
    <Flex align="center" gap={8} wrap>
      <span>
        {option.canChi} · {birthYear}
      </span>
      <Tag>{option.menh}</Tag>
      <Tag>{option.age} tuổi</Tag>
    </Flex>
  );
}
