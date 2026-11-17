import { forbiddenPhraseViolations, isAffirmedAt, normalize } from './check-text';

describe('forbiddenPhraseViolations', () => {
  it.each([
    ['Theo quan hệ trong brief, đây là năm khắc mệnh.', 'brief'],
    ['Theo các dữ kiện bên dưới, tuổi này gặp hạn Thiên La.', 'dữ kiện'],
    ['Dựa trên thông tin được cung cấp, sao chiếu mệnh là Vân Hớn.', 'thông tin được cung cấp'],
    ['Dữ liệu được cung cấp cho thấy tuổi này phạm Kim lâu.', 'dữ liệu được cung cấp'],
    ['Phần này theo đúng schema đã cho.', 'schema'],
    ['Trả lời theo prompt, tuổi này hợp làm nhà.', 'prompt'],
    ['Nội dung JSON ghi rõ mệnh Lô Trung Hỏa.', 'json'],
    ['Là một mô hình ngôn ngữ, tôi không thể đoán vận hạn.', 'mô hình ngôn ngữ'],
    ['Bài này do trí tuệ nhân tạo viết.', 'trí tuệ nhân tạo'],
  ])('rejects the generation wording in "%s"', (text, phrase) => {
    expect(forbiddenPhraseViolations(text)).toEqual([`dùng cụm bị cấm "${phrase}"`]);
  });

  it('accepts ordinary folk prose that shares words with the generation vocabulary', () => {
    const text = [
      'Ai sinh năm Bính Dần thì năm nay gặp sao Vân Hớn.',
      'Thông tin trên lá số mới cho biết vận hạn riêng của từng người.',
      'Nên kiểm tra kỹ dữ liệu giấy tờ trước khi ký.',
      'Mô hình gia đình nhiều thế hệ cần giữ hòa khí.',
      'Chuẩn bị đầu vào cho công việc kinh doanh một cách cẩn thận.',
    ].join(' ');
    expect(forbiddenPhraseViolations(text)).toEqual([]);
  });
});

describe('isAffirmedAt', () => {
  it('tells a negated position from an affirmed one', () => {
    const sentence = normalize('Tả Phù không miếu, Thiên Cơ miếu');
    const first = sentence.indexOf('miếu');
    const second = sentence.indexOf('miếu', first + 1);

    expect(isAffirmedAt(sentence, first)).toBe(false);
    expect(isAffirmedAt(sentence, second)).toBe(true);
  });
});
