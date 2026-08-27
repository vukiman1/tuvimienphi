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
  brand: {
    logo: mediaUrl('/brand/logo.png'),
    icon: mediaUrl('/brand/icon.png'),
  },
  home: {
    heroVideo: mediaUrl('/home/hero-video.mp4'),
    heroPoster: mediaUrl('/home/hero-poster.webp'),
    heroAmDuong: mediaUrl('/home/hero-am-duong.webp'),
    ctaPlate: mediaUrl('/home/cta-plate.webp'),
    laSoDemo: mediaUrl('/home/la-so-demo.webp'),
    readerGalaxy: mediaUrl('/home/reader-galaxy.webp'),
    decorPhongCanh: mediaUrl('/home/decor-phong-canh.webp'),
  },
  laSo: {
    decorLeft: mediaUrl('/la-so/left.webp'),
    decorRight: mediaUrl('/la-so/right.webp'),
    illustrationCrane: mediaUrl('/la-so/crane-pine.webp'),
    seal: mediaUrl('/la-so/seal.webp'),
    cloudDivider: mediaUrl('/la-so/cloud-divider.webp'),
    luopan: mediaUrl('/la-so/luopan.webp'),
    headerOrnament: mediaUrl('/la-so/header-ornament.webp'),
    taiji: mediaUrl('/la-so/taiji.webp'),
    badge: mediaUrl('/la-so/badge.webp'),
  },
  ngayTot: {
    lichBackground: mediaUrl('/ngay-tot/lich-bg.svg'),
    barWood: mediaUrl('/ngay-tot/bar-wood.png'),
    barMarble: mediaUrl('/ngay-tot/bar-marble.png'),
    calendarFoot: mediaUrl('/ngay-tot/calendar-foot.webp'),
    sceneTop: mediaUrl('/ngay-tot/scene-top.webp'),
    decorCrane: mediaUrl('/ngay-tot/decor-crane.webp'),
    decorPine: mediaUrl('/ngay-tot/decor-pine.webp'),
    labelPlateDark: mediaUrl('/ngay-tot/label-plate-dark.webp'),
    labelPlateLight: mediaUrl('/ngay-tot/label-plate-light.webp'),
    labelIconMoon: mediaUrl('/ngay-tot/label-icon-moon.webp'),
    labelIconSun: mediaUrl('/ngay-tot/label-icon-sun.webp'),
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

/** Huy hiệu của từng mục luận giải. Tách riêng vì tên file được chọn lúc chạy, không cố định. */
export function laSoIconUrl(name: string): string {
  return mediaUrl(`/la-so/icons/${name}.webp`);
}

/** The six Lục Diệu discs, keyed by the slot's slug. */
export function xuatHanhIconUrl(slug: string): string {
  return mediaUrl(`/ngay-tot/icons/${slug}.webp`);
}

/** Named separately from MEDIA because the file is picked at runtime, not known upfront. */
export function homeIconUrl(name: string): string {
  return mediaUrl(`/home/icons/${name}.webp`);
}

export function zodiacIconUrl(fileName: string): string {
  return mediaUrl(`/zodiac/${fileName}.png`);
}

/** Icon tròn cho toast theo loại (scroll/success/info/warning/error). */
export function toastIconUrl(type: string): string {
  return mediaUrl(`/toast/icon-${type}.webp`);
}

/** Nền panel (có cảnh núi/mây) cho toast theo loại. */
export function toastPanelUrl(type: string): string {
  return mediaUrl(`/toast/panel-${type}.webp`);
}
