import { appConfig } from '@/config/app-config';

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
    readerGalaxy: mediaUrl('/home/reader-galaxy.webp'),
    decorPhongCanh: mediaUrl('/home/decor-phong-canh.webp'),
  },
  laSo: {
    decorLeft: mediaUrl('/la-so/left.webp'),
    decorRight: mediaUrl('/la-so/right.webp'),
    illustrationCrane: mediaUrl('/la-so/crane-pine.webp'),
    sealSmall: mediaUrl('/la-so/seal-sm.webp'),
    luopan: mediaUrl('/la-so/luopan.webp'),
  },
  ngayTot: {
    sceneTop: mediaUrl('/ngay-tot/scene-top.webp'),
    decorCrane: mediaUrl('/ngay-tot/decor-crane.webp'),
  },
  vanHan: {
    decorCloud: mediaUrl('/van-han/decor-cloud.png'),
  },
} as const;

/** Ảnh minh hoạ hero vẽ tay của từng con giáp, theo slug con giáp (ví dụ "07-ngo"). */
export function vanHanHeroUrl(slug: string): string {
  return mediaUrl(`/van-han/hero-${slug}.png`);
}

/** Đồng xu ngũ hành cho card năm sinh, theo slug hành (thuy/hoa/tho/moc/kim). */
export function vanHanCoinUrl(slug: string): string {
  return mediaUrl(`/van-han/coin-${slug}.png`);
}

/** Named separately from MEDIA because the file is picked at runtime, not known upfront. */
export function zodiacIconUrl(fileName: string): string {
  return mediaUrl(`/zodiac/${fileName}.png`);
}

/** Hand-drawn feng-shui glyph for a Kiến Thức topic chip (icon_1..icon_8, in category order). */
export function categoryIconUrl(index: number): string {
  return mediaUrl(`/separated_icons/icon_${index}.webp`);
}

export function conGiapPaintingUrl(conGiapSlug: string, width: number): string {
  return mediaUrl(`/tet/con-giap/${conGiapSlug}-${width}.webp`);
}

export function conGiapEmblemUrl(conGiapSlug: string): string {
  return mediaUrl(`/tet/emblem/${conGiapSlug}-128.webp`);
}
