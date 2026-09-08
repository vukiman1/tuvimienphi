/** Mục con của một chuyên đề, gập lại thành từng thẻ mở riêng. */
export interface LuanGiaiSection {
  /** Khoá bền của mục con, dùng để nối với dữ liệu backend trả về. */
  readonly slug: string;
  readonly title: string;
  /** Cung trên lá số mà mục con này đọc từ đó. */
  readonly sourceCung: string;
  readonly paragraphs: readonly string[];
}

/**
 * Một bài luận giải. `**đậm**` bọc tên sao, `==tô nền==` bọc cụm chốt ý — xem `RichText` ở frontend.
 *
 * `illustrationUrl` và `sealUrl` là chuyện trình bày nên API không trả về; frontend tự gắn theo
 * chương. Để optional ở đây để một kiểu dùng được cho cả hai phía.
 */
export interface LuanGiaiArticle {
  readonly eyebrow: string;
  readonly title: string;
  readonly quote: string;
  readonly subheading: string;
  readonly paragraphs: readonly string[];
  readonly sections?: readonly LuanGiaiSection[];
  readonly summary: string;
  readonly closingLabel: string;
  readonly closing: string;
  readonly illustrationUrl?: string;
  readonly sealUrl?: string;
}

export enum LuanGiaiChapterStatus {
  /** Đã có bài, đọc được ngay. */
  Ready = 'ready',
  /** Đang sinh, client hỏi lại sau. */
  Pending = 'pending',
  /** Bảng luận chưa soạn tới lá số này; sẽ không có bài dù chờ bao lâu. */
  Unavailable = 'unavailable',
}

export type LuanGiaiChapterResponse =
  | { readonly status: LuanGiaiChapterStatus.Ready; readonly article: LuanGiaiArticle }
  | { readonly status: LuanGiaiChapterStatus.Pending }
  | { readonly status: LuanGiaiChapterStatus.Unavailable };
