import { appConfig } from '@/config/app-config';
import type { PagePainting } from '@/design-system';

/**
 * Every image and video the app serves, in one place. Paths are relative to the media origin, so
 * moving the whole set to a CDN is a single config change (`media.baseUrl` / `VITE_MEDIA_BASE_URL`)
 * rather than an edit in every component.
 *
 * The splash screen in index.html cannot read this — it renders before any script — so its three
 * URLs stay hard-coded there.
 */
function mediaUrl(path: string): string {
  return `${appConfig.media.baseUrl}${path}`;
}

export const MEDIA = {
  auth: {
    panelTop: mediaUrl('/auth/panel-top.webp'),
    panelMiddle: mediaUrl('/auth/panel-middle.webp'),
    panelBottom: mediaUrl('/auth/panel-bottom.webp'),
  },
  story: {
    nightSkySmall: mediaUrl('/story/night-768.webp'),
    nightSkyLarge: mediaUrl('/story/night-1536.webp'),
    starLakeSmall: mediaUrl('/story/star-lake-768.webp'),
    starLakeLarge: mediaUrl('/story/star-lake-1536.webp'),
    duskPineSmall: mediaUrl('/story/dusk-pine-768.webp'),
    duskPineLarge: mediaUrl('/story/dusk-pine-1536.webp'),
    sunsetSmall: mediaUrl('/story/sunset-768.webp'),
    sunsetLarge: mediaUrl('/story/sunset-1536.webp'),
    dawnPagodaSmall: mediaUrl('/story/dawn-pagoda-768.webp'),
    dawnPagodaLarge: mediaUrl('/story/dawn-pagoda-1536.webp'),
    sunriseMeadowSmall: mediaUrl('/story/sunrise-meadow-768.webp'),
    sunriseMeadowLarge: mediaUrl('/story/sunrise-meadow-1536.webp'),
    starChartSmall: mediaUrl('/story/star-chart-400.webp'),
    starChartLarge: mediaUrl('/story/star-chart-800.webp'),
  },
  tetHub: {
    nightSmall: mediaUrl('/tet/hero-night-768.webp'),
    nightLarge: mediaUrl('/tet/hero-night-1536.webp'),
  },
  home: {
    decorPhongCanh: mediaUrl('/home/decor-phong-canh.webp'),
  },
  laSo: {
    decorLeft: mediaUrl('/la-so/left.webp'),
    decorRight: mediaUrl('/la-so/right.webp'),
    luopan: mediaUrl('/la-so/luopan.webp'),
    heroNight: {
      small: mediaUrl('/la-so/hero-night-768.webp'),
      large: mediaUrl('/la-so/hero-night-1536.webp'),
    } satisfies PagePainting,
    boardNight: {
      small: mediaUrl('/la-so/board-night-768.webp'),
      large: mediaUrl('/la-so/board-night-1536.webp'),
    } satisfies PagePainting,
  },
  vanHan: {
    decorCloud: mediaUrl('/van-han/decor-cloud.png'),
  },
  kienThuc: {
    heroNight: {
      small: mediaUrl('/kien-thuc/hero-night-768.webp'),
      large: mediaUrl('/kien-thuc/hero-night-1536.webp'),
    } satisfies PagePainting,
  },
} as const;

export function conGiapPaintingUrl(conGiapSlug: string, width: number): string {
  return mediaUrl(`/tet/con-giap/${conGiapSlug}-${width}.webp`);
}

export function conGiapEmblemUrl(conGiapSlug: string): string {
  return mediaUrl(`/tet/emblem/${conGiapSlug}-128.webp`);
}

export function cungEmblemUrl(cungSlug: string, width: number): string {
  return mediaUrl(`/la-so/cung/cung-${cungSlug}-${width}.webp`);
}

export function luanGiaiPaintingUrl(cungSlug: string, width: number): string {
  return mediaUrl(`/la-so/than-cu/${cungSlug}-${width}.webp`);
}

export function hanhIconUrl(hanhSlug: string): string {
  return mediaUrl(`/la-so/hanh/hanh-${hanhSlug}-64.webp`);
}

export function kienThucEmblemUrl(emblemSlug: string, width: number): string {
  return mediaUrl(`/kien-thuc/emblems/${emblemSlug}-${width}.webp`);
}
