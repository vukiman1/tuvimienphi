import { ApiError, isApiErrorEnvelope, errorMessage, DEFAULT_ERROR_MESSAGE } from './api-error.js';

describe('ApiError', () => {
  it('prefers the envelope message field', () => {
    const error = new ApiError({
      statusCode: 400,
      success: false,
      errors: { message: 'Sai mật khẩu' },
    });
    expect(error.message).toBe('Sai mật khẩu');
    expect(error.statusCode).toBe(400);
    expect(error).toBeInstanceOf(Error);
  });

  it('falls back to the first string field when there is no message', () => {
    const error = new ApiError({
      statusCode: 422,
      success: false,
      errors: { email: 'Email không hợp lệ' },
    });
    expect(error.message).toBe('Email không hợp lệ');
  });

  it('uses the default fallback when the payload carries no wording', () => {
    const error = new ApiError({ statusCode: 500, success: false, errors: {} });
    expect(error.message).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it('honours a caller-supplied fallback', () => {
    const error = new ApiError({ statusCode: 500, success: false, errors: {} }, 'Request failed');
    expect(error.message).toBe('Request failed');
  });
});

describe('isApiErrorEnvelope', () => {
  it('accepts a well-formed failure envelope', () => {
    expect(isApiErrorEnvelope({ success: false, statusCode: 400, errors: {} })).toBe(true);
  });

  it('rejects success envelopes and non-objects', () => {
    expect(isApiErrorEnvelope({ success: true, statusCode: 200, data: {} })).toBe(false);
    expect(isApiErrorEnvelope(null)).toBe(false);
    expect(isApiErrorEnvelope('nope')).toBe(false);
  });
});

describe('errorMessage', () => {
  it('returns the ApiError message and the fallback for anything else', () => {
    const apiError = new ApiError({
      statusCode: 400,
      success: false,
      errors: { message: 'Hết phiên' },
    });
    expect(errorMessage(apiError, 'fallback')).toBe('Hết phiên');
    expect(errorMessage(new Error('boom'), 'fallback')).toBe('fallback');
    expect(errorMessage('boom', 'fallback')).toBe('fallback');
  });
});
