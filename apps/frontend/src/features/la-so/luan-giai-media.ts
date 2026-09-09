import type { LuanGiaiArticle } from '@org/shared-contracts';
import { MEDIA } from '@/config/media';

type AnhBai = Pick<LuanGiaiArticle, 'illustrationUrl' | 'sealUrl'>;

/** API chỉ trả chữ; tranh và ấn triện là chuyện trình bày nên gắn ở đây theo cung bài đọc. */
export function articleMedia(article: LuanGiaiArticle): AnhBai {
  return {
    illustrationUrl: article.sourceCung
      ? MEDIA.laSo.cungIllustrations[article.sourceCung]
      : undefined,
    sealUrl: MEDIA.laSo.seal,
  };
}
