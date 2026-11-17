import { writeFile } from 'node:fs/promises';
import { pagesOfBatch, type KienThucBatch } from './batches';
import { KienThucCommandName, parseKienThucCommand } from './cli-options';
import { approvePages } from './commands/approve';
import { briefOutput } from './commands/brief';
import {
  checkKienThucContent,
  checkOnePage,
  hasCheckFailures,
  renderPageCheck,
} from './commands/check';
import { buildCorpus } from './commands/corpus';
import { renderPreview } from './commands/preview';
import { readContent } from './store/content-store';
import { readAllDrafts } from './store/draft-store';
import {
  KIEN_THUC_CONTENT_DIRECTORY,
  KIEN_THUC_DRAFTS_DIRECTORY,
  type KienThucDirectories,
} from './store/kien-thuc-paths';

const PREVIEW_FILE = 'tmp/kien-thuc-preview.html';

function print(text: string): void {
  process.stdout.write(`${text}\n`);
}

async function runApprove(
  refs: readonly string[],
  directories: KienThucDirectories,
): Promise<number> {
  const result = await approvePages(refs as never, directories, new Date());
  for (const ref of result.approved) print(`duyệt ${ref}`);
  for (const rejection of result.rejected) {
    print(`từ chối ${rejection.ref}:`);
    for (const violation of rejection.violations) print(`  - ${violation}`);
  }
  return result.rejected.length > 0 ? 1 : 0;
}

async function runCheckAll(directories: KienThucDirectories): Promise<number> {
  const report = await checkKienThucContent(directories);
  for (const page of report.pages) print(renderPageCheck(page));
  for (const pair of report.similarPairs)
    print(`trùng: ${pair.a} ~ ${pair.b} (${pair.score.toFixed(2)})`);
  for (const drift of report.planDrift)
    print(`lệch danh mục ${drift.ref}: ${drift.fields.join(', ')}`);
  for (const stale of report.staleIndexes) print(`chỉ mục cũ: ${stale}`);
  return hasCheckFailures(report) ? 1 : 0;
}

async function runPreview(
  batch: KienThucBatch | null,
  directories: KienThucDirectories,
): Promise<number> {
  const allDrafts = await readAllDrafts(directories);
  const refs =
    batch === null ? null : new Set(pagesOfBatch(batch).map((page) => `${page.kind}/${page.slug}`));
  const drafts = refs === null ? allDrafts : allDrafts.filter((stored) => refs.has(stored.ref));
  const html = renderPreview(
    drafts,
    await readContent(directories.content),
    await buildCorpus(directories),
  );
  await writeFile(PREVIEW_FILE, html, 'utf8');
  print(PREVIEW_FILE);
  return 0;
}

async function main(): Promise<number> {
  const command = parseKienThucCommand(process.argv.slice(2));
  const directories: KienThucDirectories = {
    content: KIEN_THUC_CONTENT_DIRECTORY,
    drafts: KIEN_THUC_DRAFTS_DIRECTORY,
  };
  switch (command.name) {
    case KienThucCommandName.Brief:
      print(briefOutput(command.target));
      return 0;
    case KienThucCommandName.Approve:
      return runApprove(command.refs, directories);
    case KienThucCommandName.Check: {
      if (command.only === null) return runCheckAll(directories);
      const check = await checkOnePage(command.only, directories);
      print(renderPageCheck(check));
      return check.validation.violations.length > 0 ? 1 : 0;
    }
    case KienThucCommandName.Preview:
      return runPreview(command.batch, directories);
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    process.stdout.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
