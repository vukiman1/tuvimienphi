import { parsePageRef, type PageRef } from '@org/shared-contracts';
import { plannedPage } from '@org/shared-kien-thuc';
import { isKienThucBatch, type KienThucBatch } from './batches';
import {
  InvalidKienThucArgumentError,
  MissingBriefTargetError,
  UnknownBatchError,
  UnknownPageRefError,
} from './errors';

export enum KienThucCommandName {
  Brief = 'brief',
  Approve = 'approve',
  Check = 'check',
  Preview = 'preview',
}

export type BriefTarget = { readonly ref: PageRef } | { readonly batch: KienThucBatch };

export type KienThucCommand =
  | { readonly name: KienThucCommandName.Brief; readonly target: BriefTarget }
  | { readonly name: KienThucCommandName.Approve; readonly refs: readonly PageRef[] }
  | { readonly name: KienThucCommandName.Check; readonly only: PageRef | null }
  | { readonly name: KienThucCommandName.Preview; readonly batch: KienThucBatch | null };

function parseRef(value: string): PageRef {
  const parsed = parsePageRef(value);
  if (parsed === null || plannedPage(value as PageRef) === undefined) {
    throw new UnknownPageRefError(value);
  }
  return value as PageRef;
}

function parseBatch(value: string): KienThucBatch {
  if (!isKienThucBatch(value)) throw new UnknownBatchError(value);
  return value;
}

function flagValue(arg: string, name: string): string | null {
  const prefix = `--${name}=`;
  return arg.startsWith(prefix) ? arg.slice(prefix.length) : null;
}

export function parseKienThucCommand(args: readonly string[]): KienThucCommand {
  const [name, ...rest] = args;
  switch (name) {
    case KienThucCommandName.Brief: {
      if (rest.length === 0) throw new MissingBriefTargetError();
      const batch = flagValue(rest[0], 'batch');
      if (batch !== null)
        return { name: KienThucCommandName.Brief, target: { batch: parseBatch(batch) } };
      if (rest[0].startsWith('--')) throw new InvalidKienThucArgumentError(rest[0]);
      return { name: KienThucCommandName.Brief, target: { ref: parseRef(rest[0]) } };
    }
    case KienThucCommandName.Approve: {
      if (rest.length === 0) throw new InvalidKienThucArgumentError('approve cần ít nhất một ref');
      return { name: KienThucCommandName.Approve, refs: rest.map(parseRef) };
    }
    case KienThucCommandName.Check: {
      if (rest.length === 0) return { name: KienThucCommandName.Check, only: null };
      const only = flagValue(rest[0], 'only');
      if (only === null) throw new InvalidKienThucArgumentError(rest[0]);
      return { name: KienThucCommandName.Check, only: parseRef(only) };
    }
    case KienThucCommandName.Preview: {
      if (rest.length === 0) return { name: KienThucCommandName.Preview, batch: null };
      const batch = flagValue(rest[0], 'batch');
      if (batch === null) throw new InvalidKienThucArgumentError(rest[0]);
      return { name: KienThucCommandName.Preview, batch: parseBatch(batch) };
    }
    default:
      throw new InvalidKienThucArgumentError(name ?? '');
  }
}
