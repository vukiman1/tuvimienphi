import {
  buildVanHanBrief,
  buildVanHanMucBriefs,
  VanHanMucKey,
  vanHanYearOf,
  type NatalChart,
  type VanHanYear,
} from '@org/shared-tu-vi';
import {
  type ChapterContext,
  type ChapterDefinition,
  type MucCanSinh,
  MucKind,
} from '../../generation/chapter-definition';
import { VanHanYearUnavailableError } from '../../luan-giai.errors';
import { khungVanHan } from './van-han.khung';
import { VAN_HAN_SYSTEM_PROMPT, vanHanMucSystemPrompt } from './van-han.prompt';
import {
  renderDanGianSection,
  renderLinhVucSection,
  renderVanKeTiepSection,
} from './van-han.sections';

const REQUIRED_MUC_KEYS: readonly VanHanMucKey[] = [VanHanMucKey.DiemSang, VanHanMucKey.DieuCanGiu];

function yearOf(chart: NatalChart, context: ChapterContext): VanHanYear | null {
  if (context.viewYear === null) return null;
  return vanHanYearOf(chart, context.viewYear, context.currentYear);
}

function requireYear(chart: NatalChart, context: ChapterContext): VanHanYear {
  const year = yearOf(chart, context);
  if (!year) throw new VanHanYearUnavailableError(context.viewYear);
  return year;
}

function hasRequiredMucs(chart: NatalChart, year: VanHanYear): boolean {
  const keys = new Set(buildVanHanMucBriefs(chart, year).map((brief) => brief.muc));
  return REQUIRED_MUC_KEYS.every((key) => keys.has(key));
}

function buildMucs(chart: NatalChart, context: ChapterContext): readonly MucCanSinh[] {
  const year = yearOf(chart, context);
  if (!year) return [];

  const vanKeTiep = renderVanKeTiepSection(year);
  return [
    ...buildVanHanMucBriefs(chart, year).map((brief): MucCanSinh => ({
      kind: MucKind.PhuTinh,
      brief,
      systemPrompt: vanHanMucSystemPrompt(brief.cung),
      isRequired: REQUIRED_MUC_KEYS.includes(brief.muc),
    })),
    { kind: MucKind.Rendered, section: renderLinhVucSection(year) },
    ...(vanKeTiep ? [{ kind: MucKind.Rendered, section: vanKeTiep } as const] : []),
    { kind: MucKind.Rendered, section: renderDanGianSection(chart, year) },
  ];
}

export const VAN_HAN_CHAPTER = {
  name: 'van-han',
  buildBrief: (chart, context) => {
    const year = yearOf(chart, context);
    if (!year || !hasRequiredMucs(chart, year)) return null;
    return buildVanHanBrief(chart, year);
  },
  buildMucs,
  systemPrompt: VAN_HAN_SYSTEM_PROMPT,
  khung: (_brief, chart, context) => khungVanHan(requireYear(chart, context)),
} satisfies ChapterDefinition;
