import type { ConGiapArticle, TuoiNamArticle } from '@org/shared-contracts';
import { conGiapSlug, TET_HUB_VIEW_YEAR, tuoiNamFacts, tuoiNamSlug } from '@org/shared-tu-vi';
import type { AiClient } from '../../ai/port/ai.client';
import { runWithAiCallContext } from '../../ai/port/ai-call-context';
import { sinhVoiKiem, type CachSinh } from '../sinh-voi-kiem';
import { checkConGiap } from './con-giap/check-con-giap';
import { buildConGiapBrief, conGiapFacts } from './con-giap/con-giap.brief';
import { buildConGiapMessages, CON_GIAP_SYSTEM_PROMPT } from './con-giap/con-giap.prompt';
import { CON_GIAP_SCHEMA, parseConGiapDraft, type ConGiapDraft } from './con-giap/con-giap.schema';
import { checkTuoiNam } from './tuoi-nam/check-tuoi-nam';
import { buildTuoiNamBrief } from './tuoi-nam/tuoi-nam.brief';
import { buildTuoiNamMessages, TUOI_NAM_SYSTEM_PROMPT } from './tuoi-nam/tuoi-nam.prompt';
import { parseTuoiNamDraft, TUOI_NAM_SCHEMA, type TuoiNamDraft } from './tuoi-nam/tuoi-nam.schema';
import { logRejectedAttempt } from './rejected-attempts';

const PAGE_BUDGET_MS = 120_000;
const LABEL_PREFIX = 'tet-hub';

export async function generateTuoiNamArticle(
  ai: AiClient,
  birthYear: number,
  beforeAttempt: () => Promise<void>,
): Promise<TuoiNamArticle> {
  const slug = tuoiNamSlug(birthYear);
  const brief = buildTuoiNamBrief(tuoiNamFacts(birthYear, TET_HUB_VIEW_YEAR));
  const generation: CachSinh<TuoiNamDraft> = {
    system: TUOI_NAM_SYSTEM_PROMPT,
    schema: TUOI_NAM_SCHEMA,
    messages: (daThu) => buildTuoiNamMessages(brief, daThu),
    parse: parseTuoiNamDraft,
    check: (draft) => checkTuoiNam(draft, brief),
  };
  const { value, model } = await runWithAiCallContext({ label: `${LABEL_PREFIX}:${slug}` }, () =>
    sinhVoiKiem(ai, generation, PAGE_BUDGET_MS, logRejectedAttempt(slug), beforeAttempt),
  );
  return {
    slug,
    birthYear,
    viewYear: TET_HUB_VIEW_YEAR,
    tongQuan: value.tongQuan,
    saoHanNam: value.saoHanNam,
    saoHanNu: value.saoHanNu,
    menh: value.menh,
    cuoiNha: value.cuoiNha,
    loiKhuyen: value.loiKhuyen,
    faq: value.faq,
    model,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateConGiapArticle(
  ai: AiClient,
  chi: number,
  beforeAttempt: () => Promise<void>,
): Promise<ConGiapArticle> {
  const slug = conGiapSlug(chi);
  const brief = buildConGiapBrief(conGiapFacts(chi, TET_HUB_VIEW_YEAR));
  const generation: CachSinh<ConGiapDraft> = {
    system: CON_GIAP_SYSTEM_PROMPT,
    schema: CON_GIAP_SCHEMA,
    messages: (daThu) => buildConGiapMessages(brief, daThu),
    parse: parseConGiapDraft,
    check: (draft) => checkConGiap(draft, brief),
  };
  const { value, model } = await runWithAiCallContext({ label: `${LABEL_PREFIX}:${slug}` }, () =>
    sinhVoiKiem(ai, generation, PAGE_BUDGET_MS, logRejectedAttempt(slug), beforeAttempt),
  );
  return {
    slug,
    chi,
    viewYear: TET_HUB_VIEW_YEAR,
    tongQuan: value.tongQuan,
    tamTai: value.tamTai,
    thaiTue: value.thaiTue,
    xongDat: value.xongDat,
    model,
    generatedAt: new Date().toISOString(),
  };
}
