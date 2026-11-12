# Home page layout (from Kim An's mock, 2026-11-12)

The target layout for `/`, redrawn from Kim An's painted mock. Use it to review the layout before any illustration is generated or any chapter is rebuilt. The mock is a compressed poster of the whole page. Real chapter heights come from their content, and the hero stays one viewport tall.

Legend: `[CTA ▸]` gold pill button, `( )` gold-outline circle icon, `░` painted background, `·` gold dot, `—` thin gold rule.

## Whole page at a glance

```
┌──────────────────────────────── header (fixed, transparent over paint) ───────────────────────────────┐
│ ☯ Tử Vi Miễn Phí                                    Lá Số  Vận Hạn  Ngày Tốt  Kiến Thức  ( Đăng nhập ) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
 1  Khởi đầu            NIGHT   ░ starry sky, full moon, ridge silhouettes ░            ●─ 1. Khởi đầu
 2  Khoảnh khắc         NIGHT   ░ same sky continues, mountains at the bottom ░          ○─ 2. Khoả fix  nh khắc
 3  Lá số               DUSK    ░ violet dusk, twisted pine at the left edge ░           ○─ 3. Lá số
 4  Nhận thức           EMBER   ░ orange sunset, sun on the ridge ░                      ○─ 4. Nhận thức
 5  Ba sự thật          EMBER→DAWN  (same sunset painting fades to warm haze)            ○─ 5. Ba sự thật
 6  Kiến thức           DAWN    ░ cream haze, small pagoda bottom-left ░                 ○─ 6. Kiến thức
 7  Câu chuyện của bạn  DAY     ░ golden meadow at sunrise, grass in the foreground ░    ○─ 7. Câu chuyện
    footer              NIGHT   solid night band, logo + nav                                  của bạn
```

The background is **one continuous landscape** that moves from night to sunrise. Neighbouring chapters share the same painting at their seams, so no hard colour edge appears between them. The current build does have hard edges, because each chapter is a flat tone.

## 1. Khởi đầu (hero): Night

### Desktop (1440)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░ starry sky ░░░░░░░░░░░░░░░░░░░░░ Bỏ qua câu chuyện →  ░░░░░░░ │
│                                                         · ─ ─ ·  (faint constellation)       │
│   Mỗi người sinh ra trong một khoảnh khắc không lặp lại.         ◯ full moon      ●─ 1. Khởi đầu │
│                                                                                  ○─ 2. ...   │
│   Lập lá số  tử vi            ← h1: "Lập lá số" white sans,                       ○─ 3. ...   │
│                                  "tử vi" gold Playfair italic                     ○─ ...      │
│   Khám phá bản mệnh, định hướng tương lai qua khoa học Tử Vi.                                │
│                                                                                              │
│   [ LẬP LÁ SỐ CỦA BẠN  → ]                                                                   │
│                                        ⌄ Cuộn để khám phá                                    │
│ ░░░░░░░░░░░░░░░░░░░░░░░ ridge silhouettes, dark blue ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Text sits in the left half. The moon is part of the painting, upper right.
- The skip link moves to the **top right** under the header. Today it sits beside the CTA.
- The scroll hint is **centred at the bottom** with a chevron.

### Mobile (390)

```
┌──────────────────────────┐
│ ☯ Tử Vi Miễn Phí (Đăng nhập)│
│ Lá Số Vận Hạn Ngày Tốt K.T. │
│ ░ sky ░       ◯ moon (small)│
│ MỖI NGƯỜI SINH RA ...        │
│ Lập lá số                    │
│ tử vi                        │
│ Khám phá bản mệnh, ...       │
│ [ LẬP LÁ SỐ CỦA BẠN → ]      │
│ Bỏ qua câu chuyện →          │
│        ⌄ Cuộn để khám phá    │
│ ░ ridge ░                    │
└──────────────────────────┘
```

## 2. Khoảnh khắc: Night (continued)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ░ same sky, no seam with chapter 1 ░                                                         │
│                     ·            ·             ·            ·                                │
│              ·    ╭────────────────────────────────────────────╮    ·                        │
│                   │   12   ·   03   ·   1995      (thin, white) │         ← giant numeral,    │
│              ·    ╰────────────────────────────────────────────╯    ·      on a flat ellipse  │
│                        Một ngày. Một giờ. Một điểm bắt đầu.               orbit with 12 dots  │
│ ░░░░░░░░░░░░░░░░░░░ mountains, slightly lighter blue ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

- In the mock the orbit is a **flat ellipse** that wraps the date. Today it is three concentric circles.
- The eyebrow "02 / Khoảnh khắc" does not appear in the mock.
- Mobile: the date stays on one line at about 2.3rem, and the ellipse is 90vw wide.

## 3. Lá số: Dusk

### Desktop: three columns

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│░ pine │                     ┌────┬────┬────┬────┐                                          │
│  tree │ Lá số của bạn       │Phụ │Phúc│Điền│Quan│   ( ☺ ) Mệnh & tính cách                  │
│  ░░   │ có gì?  ← gold      │Mẫu │Đức │Trạch│Lộc │         Hiểu những đặc điểm nổi bật...    │
│       │         italic      ├────┼────┴────┼────┤   ( ≋ ) 12 cung trong lá số               │
│       │                     │MỆNH│    ✦    │ Nô │         Khám phá ý nghĩa của 12 cung...   │
│       │ Một lá số – nhiều   │ ▣  │ (glow,  │Bộc │   ( ☆ ) Hệ thống sao                      │
│       │ góc nhìn về cuộc    ├────┤ compass)├────┤         Phân tích sự kết hợp...           │
│       │ đời.                │Huynh│        │Thiên│  ( ♡ ) Tình duyên & gia đạo              │
│       │                     │ Đệ │         │ Di │         Nhìn nhận xu hướng...             │
│       │ [ Tạo lá số của tôi → ]├────┼────┬────┼────┤   ( ▭ ) Công danh & tài lộc          │
│       │                     │Phu │Tử  │Tài │Tật │         Phân tích công việc...            │
│       │                     │Thê │Tức │Bạch│Ách │   ( ⧗ ) Đại vận & vận hạn                 │
│       │                     └────┴────┴────┴────┘         Theo dõi những giai đoạn...       │
└────────────────────────────────────────────────────────────────────────────────────────────┘
       col 1: 3/12                 col 2: 4/12 (board)            col 3: 5/12 (statements)
```

- The CTA becomes a **gold pill** under the title. Today it is an outline pill under the list.
- The board has **gold** grid lines with a soft glow. The centre shows a faint compass or star chart, not the text "12 cung · 1 lá số".
- The active cung gets a gold frame and gold text.
- Each statement gets a **gold-outline circle icon**. Today statements have only a left rule.
- Board positions: in the mock Mệnh sits at row 2 on the left, which is not the clockwise order we use today. **Keep our order.** A real lá số puts the cung by địa chi, so the mock's order would teach readers a wrong board.

### Mobile

```
Lá số của bạn có gì?
Một lá số – nhiều góc nhìn ...
[ Tạo lá số của tôi → ]
┌──┬──┬──┬──┐  board, full width
│  │  │  │  │
└──┴──┴──┴──┘
( ☺ ) Mệnh & tính cách
      Hiểu những ...
( ≋ ) 12 cung trong lá số
...
```

## 4. Nhận thức: Ember (sunset)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ░ orange sky ░            ——◆ Hiểu đúng về tử vi ◆——                                         │
│                                                                                              │
│             Tử vi không phải để định đoán,                       ← centred, serif, cream    │
│          mà để  hiểu mình  và  chủ động hơn                      ← two phrases gold italic  │
│                       trong cuộc sống.                                                       │
│ ░░░░░░░░░░░░░░░░░░░░░░░░ ridges, sun sitting on the ridge right ░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

- The text is **centred**, set in a **serif**, in cream on a painted sunset. Today it is left-aligned Inter Tight in ink on a flat ember tone.
- The eyebrow sits centred between two gold rules.
- Only two phrases get gold italic emphasis. The word-by-word brightening on scroll can stay.

## 5. Ba sự thật: Ember → Dawn

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ░ warm haze ░                                                                                │
│  ◯ faint     ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐             │
│  orbit       │ 1  Tử vi không    │ │ 2  Thiên thời –   │ │ 3  Hiểu mình để   │             │
│ Ba sự thật   │    quyết định số  │ │    Địa lợi –      │ │    chủ động hơn   │             │
│ về tử vi     │    phận           │ │    Nhân hòa       │ │                   │             │
│              │ Lá số phản ánh... │ │ Hoàn cảnh tạo ra..│ │ Tử vi là công cụ..│             │
│              │ Phân tích khách   │ │ Khoa học & Tâm    │ │ Góc nhìn hiện đại │             │
│              │ quan →            │ │ linh →            │ │ →                 │             │
│              └───────────────────┘ └───────────────────┘ └───────────────────┘             │
└────────────────────────────────────────────────────────────────────────────────────────────┘
   title 3/12                      three cards, 3 × 3/12, cream glass, rounded 16px
```

- The cards sit in a **horizontal row** of three. Today they are a vertical stack of large sticky cards.
- Each card has a large gold italic numeral to the left of its title. The cards are translucent cream with a soft shadow.
- The title becomes "Ba sự thật về tử vi". Today it reads "Hiểu để chủ động."
- Mobile: the cards stack vertically and are not sticky.

## 6. Kiến thức: Dawn (cream)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ Khám phá           ┌──────────┬───────────────────────┐   Tuần và Triệt trong lá số tử vi  › │
│ kiến thức tử vi    │ Nổi bật  │ Thân cư là gì? 6 vị   │   ▦ 10/08/2025                      │
│                    │  ✦ gold  │ trí Thân cư nói lên   │  ─────────────────────────────────  │
│ Những bài viết     │  star    │ điều gì?              │   Đại vận là gì? Cách xem ...     › │
│ giúp bạn hiểu...   │  chart   │ Tìm hiểu ý nghĩa ...  │   ▦ 05/08/2025                      │
│                    │  image   │                       │  ─────────────────────────────────  │
│ Xem tất cả →       │          │ ▦ 12/08/2025          │   Ý nghĩa của 12 cung ...         › │
│  ⛩ pagoda          └──────────┴───────────────────────┘   Chính tinh và phụ tinh ...      › │
└────────────────────────────────────────────────────────────────────────────────────────────┘
   col 1: 3/12            col 2: 5/12 (featured card)          col 3: 4/12 (list)
```

- The layout has **three columns**: intro, featured card, list. Today they stack.
- The featured card has a **square painted thumbnail** of a gold star chart. Today it is a drawn "06" on Deep.
- Dates get a small calendar icon, and list rows get a `›` chevron.
- The Tết hub link has no place in the mock. Keep it as the last list row.

## 7. Câu chuyện của bạn: Day (sunrise meadow)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ░ sunrise ░          ╭─ ─ ─ faint orbit ring around the form ─ ─ ─╮                          │
│ Câu chuyện           │  ┌──────────────┬──────────────┐          │   ( ◎ ) Chính xác & khoa học │
│ của bạn              │  │ Dương lịch ▓ │  Âm lịch     │ segmented│                              │
│ bắt đầu từ đây       │  └──────────────┴──────────────┘          │   ( ▮ ) Dễ hiểu & trực quan  │
│  ↑ gold italic       │  Họ & Tên                                  │                              │
│                      │  [ Nhập họ và tên của bạn            ]     │   ( ⛉ ) Bảo mật thông tin    │
│                      │  Ngày        Tháng        Năm              │                              │
│                      │  [Ngày ▾]    [Tháng ▾]    [Năm ▾]          │   ( ∞ ) Miễn phí trọn đời    │
│                      │  Giờ sinh             Giới tính            │                              │
│                      │  [Chọn giờ sinh ▾]    [Chọn giới tính ▾]   │                              │
│                      │  [        LẬP LÁ SỐ CỦA BẠN  →         ]   │                              │
│                      ╰────────────────────────────────────────────╯                          │
│ ░░░░░░░░░░░░░░░░░░░░ grass and flowers in the foreground ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────────────────────────────────────────────────────────────┘
   title 3/12                     form 5/12                                assurances 3/12
```

- The form sits on a **light glass panel**. Today it is a Night panel. This needs the BirthForm restyled for a light surface, which the plan schedules with the Lá số page.
- The calendar switch becomes a **segmented control**, "Dương lịch | Âm lịch". Today it is a yin-yang toggle.
- Labels sit above the fields. Today the fields use placeholders only.
- The submit button is a **gold pill** spanning the full form width. Today it is a brown "plaque" button.
- The assurances become a right-hand column with gold circle icons. Today they are a row under the form.

## Footer: Night

A solid night band with the logo on the left and the nav on the right, as built today.

## Mock vs current build

| Chương        | Đang chạy                           | Theo mock                                          |
| ------------- | ----------------------------------- | -------------------------------------------------- |
| Toàn trang    | Mỗi chương một màu phẳng, cạnh cứng | Một bức tranh liền từ đêm sang bình minh           |
| Rail          | Chấm, nhãn ẩn                       | Danh sách đánh số, hiện nhãn, có đường nối         |
| 1 Khởi đầu    | Vòng tròn vẽ bằng code              | Bầu trời sao, trăng tròn, núi                      |
| 2 Khoảnh khắc | Vòng tròn đồng tâm                  | Quỹ đạo hình elip                                  |
| 3 Lá số       | Bàn kẻ trắng, CTA viền              | Bàn kẻ vàng phát sáng, CTA vàng, icon cho từng mục |
| 4 Nhận thức   | Sans, căn trái, chữ ink trên ember  | Serif, căn giữa, chữ kem trên hoàng hôn            |
| 5 Ba sự thật  | 3 thẻ to xếp chồng (sticky)         | 3 thẻ kính nằm ngang                               |
| 6 Kiến thức   | Các khối xếp dọc                    | 3 cột, thumbnail vẽ tay                            |
| 7 Câu chuyện  | Form trên panel Night               | Form trên panel kính sáng, toggle dạng segmented   |

## Assets to generate

All assets come from the OpenAI image API with one fixed prompt template, kept in `docs/redesign/illustration-guide.md`. Write that guide before the first one is generated.

| #   | Asset                                            | Where            | Size (desktop / mobile) |
| --- | ------------------------------------------------ | ---------------- | ----------------------- |
| A1  | Night sky, full moon, ridge silhouettes          | Chapters 1–2     | 2400×2000 / 1080×2000   |
| A2  | Violet dusk, twisted pine on the left            | Chapter 3        | 2400×1200 / 1080×1600   |
| A3  | Orange sunset, sun on the ridge, warm haze below | Chapters 4–5     | 2400×1800 / 1080×2400   |
| A4  | Cream dawn haze, small pagoda                    | Chapter 6        | 2400×1000 / 1080×1400   |
| A5  | Golden sunrise meadow, grass in the foreground   | Chapter 7        | 2400×1400 / 1080×2000   |
| A6  | Gold star-chart thumbnail                        | Featured article | 800×800                 |

The six statement icons, four assurance icons and calendar/chevron glyphs are drawn as SVG in code, not generated.

## Performance rules for the paintings

The production gate is Performance ≥95, CLS 0 on `/`. Today `/` is at 92.5 with no paintings at all.

- The h1 text stays the LCP element. A1 must not out-paint it: it loads at low priority, as AVIF with a WebP fallback, and its first paint is a solid night colour, so the hero never waits for it.
- A2–A6 load lazily, only when their chapter is near the viewport.
- Each painting's file size stays under 120 KB at the desktop size and 60 KB at the mobile size. Every painting is measured on production before the next one is added.
- Fix the font-preload regression first, so the page is back at or above 95 before any painting lands.

## Decisions (Kim An, 2026-11-12)

1. **Chapter title font:** a bold serif (Playfair Display 700) for chapters 3–7 and the Nhận thức sentence. The hero stays Inter Tight.
2. **Rail:** a hybrid. Numbers and the connecting line always show; only the current chapter shows its name, and other names appear on hover or focus.
3. **Ba sự thật:** horizontal glass cards, as in the mock.
4. **Form:** a light glass panel, shipped in #186.
5. **Copy:** taken from the mock. Rail labels are "Khởi đầu", "Nhận thức" and "Ba sự thật"; chapter 5 is titled "Ba sự thật về tử vi".
6. **Logo:** keep the approved yin-yang logo.
7. **Order:** layout first, paintings after, one at a time, each measured on production.

Accent text is dawn gold and appears only on dark surfaces. Chapter 4 (Nhận thức) follows the mock: cream text with dawn-gold emphasis over the sunset painting, with a dusk tint behind the sentence. Measured from screenshots against the painting, the worst case is cream 3.26:1 and dawn 3.25:1, which passes the 3:1 minimum for large text. On Dawn and Day, emphasis stays ink.
