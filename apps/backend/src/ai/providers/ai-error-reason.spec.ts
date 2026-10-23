import { MAX_REASON_LENGTH, readableReason } from './ai-error-reason';

describe('readableReason', () => {
  it('pulls the sentence out of the JSON body Gemini throws', () => {
    const error = new Error(
      '{"error":{"code":400,"message":"API key not valid. Please pass a valid API key.","status":"INVALID_ARGUMENT"}}',
    );

    expect(readableReason(error)).toBe('API key not valid. Please pass a valid API key.');
  });

  it('keeps the status in front of the sentence Anthropic sends', () => {
    const error = new Error(
      '401 {"type":"error","error":{"type":"authentication_error","message":"API key is invalid."},"request_id":null}',
    );

    expect(readableReason(error)).toBe('401 API key is invalid.');
  });

  it('leaves a message that is already a sentence alone', () => {
    expect(readableReason(new Error('401 Incorrect API key provided: sk-proj-****0002.'))).toBe(
      '401 Incorrect API key provided: sk-proj-****0002.',
    );
    expect(readableReason(new Error('UNAVAILABLE'))).toBe('UNAVAILABLE');
  });

  it('does not choke on a brace that opens no JSON', () => {
    expect(readableReason(new Error('unexpected token { in reply'))).toBe(
      'unexpected token { in reply',
    );
  });

  it('describes something thrown that is not an Error', () => {
    expect(readableReason('timeout')).toBe('timeout');
  });

  it('keeps a long reason short enough to show', () => {
    expect(readableReason(new Error('x'.repeat(5_000)))).toHaveLength(MAX_REASON_LENGTH);
  });
});
