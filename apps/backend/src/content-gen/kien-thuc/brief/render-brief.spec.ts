import type { PageRef } from '@org/shared-contracts';
import { plannedPage, type PlannedPage } from '@org/shared-kien-thuc';
import { buildPageBrief } from './build-page-brief';
import { renderBrief } from './render-brief';

function page(ref: PageRef): PlannedPage {
  const found = plannedPage(ref);
  if (found === undefined) throw new Error(`no page ${ref}`);
  return found;
}

describe('renderBrief', () => {
  it('prints the same brief every time and holds no date', () => {
    const brief = buildPageBrief(page('sao/thien-co'));
    const first = renderBrief(brief);
    expect(renderBrief(brief)).toBe(first);
    expect(/\d{4}-\d{2}-\d{2}/.test(first)).toBe(false);
  });

  it('gives Thiên Cơ its facts, range, targets, file and check', () => {
    const output = renderBrief(buildPageBrief(page('sao/thien-co')));
    expect(output).toContain('hành Mộc');
    expect(output).toContain('chòm Tử Vi');
    expect(output).toContain('450–800 âm tiết');
    expect(output.split('\n').filter((line) => line.startsWith('- [[')).length).toBe(75);
    expect(output).toContain('tmp/kien-thuc/drafts/sao/thien-co.json');
    expect(output).toContain('check --only=sao/thien-co');
    expect(output).toContain('"writtenBy": "claude-code"');
  });

  it('gives an entry outside the core groups the 300–700 range', () => {
    expect(renderBrief(buildPageBrief(page('sao/ta-phu')))).toContain('300–700 âm tiết');
  });

  it('gives a lesson its neighbours and owned concepts', () => {
    const output = renderBrief(buildPageBrief(page('bai/tam-hop-xung-chieu')));
    expect(output).toContain('bai/cung-menh-va-cung-than');
    expect(output).toContain('bai/y-nghia-chinh-tinh');
    expect(output).toContain('## Khái niệm bài khác sở hữu');
  });
});
