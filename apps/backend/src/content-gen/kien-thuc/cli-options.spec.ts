import { KienThucBatch } from './batches';
import { KienThucCommandName, parseKienThucCommand } from './cli-options';
import {
  InvalidKienThucArgumentError,
  MissingBriefTargetError,
  UnknownBatchError,
  UnknownPageRefError,
} from './errors';

describe('parseKienThucCommand', () => {
  it('reads brief for one page and for a batch', () => {
    expect(parseKienThucCommand(['brief', 'sao/thien-co'])).toEqual({
      name: KienThucCommandName.Brief,
      target: { ref: 'sao/thien-co' },
    });
    expect(parseKienThucCommand(['brief', '--batch=step-01'])).toEqual({
      name: KienThucCommandName.Brief,
      target: { batch: KienThucBatch.Step01 },
    });
  });

  it('rejects brief with neither', () => {
    expect(() => parseKienThucCommand(['brief'])).toThrow(MissingBriefTargetError);
  });

  it('reads approve with several refs and rejects approve with none or with a path', () => {
    expect(parseKienThucCommand(['approve', 'sao/thien-co', 'cung/menh'])).toEqual({
      name: KienThucCommandName.Approve,
      refs: ['sao/thien-co', 'cung/menh'],
    });
    expect(() => parseKienThucCommand(['approve'])).toThrow(InvalidKienThucArgumentError);
    expect(() => parseKienThucCommand(['approve', 'tmp/x.json'])).toThrow(UnknownPageRefError);
  });

  it('reads check with and without --only', () => {
    expect(parseKienThucCommand(['check'])).toEqual({
      name: KienThucCommandName.Check,
      only: null,
    });
    expect(parseKienThucCommand(['check', '--only=sao/thien-co'])).toEqual({
      name: KienThucCommandName.Check,
      only: 'sao/thien-co',
    });
  });

  it('reads preview with and without a batch', () => {
    expect(parseKienThucCommand(['preview'])).toEqual({
      name: KienThucCommandName.Preview,
      batch: null,
    });
    expect(parseKienThucCommand(['preview', '--batch=cung'])).toEqual({
      name: KienThucCommandName.Preview,
      batch: KienThucBatch.Cung,
    });
  });

  it('rejects an unknown batch, an unknown ref and an unknown flag', () => {
    expect(() => parseKienThucCommand(['brief', '--batch=nope'])).toThrow(UnknownBatchError);
    expect(() => parseKienThucCommand(['brief', 'sao/khong-co'])).toThrow(UnknownPageRefError);
    expect(() => parseKienThucCommand(['check', '--bad=x'])).toThrow(InvalidKienThucArgumentError);
  });
});
