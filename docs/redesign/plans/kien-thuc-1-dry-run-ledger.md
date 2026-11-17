# Kiến thức 1 — dry run ledger (Task 14)

Seven pages drafted by fresh writing subagents from the page brief alone, then
run through `check --only` until clean (max 5 rounds). No `approve` — the
preview goes to Kim An (Task 16). Calibration changes are test-first.

| Ref                         | Rounds | Final check | Notes                                                                           |
| --------------------------- | ------ | ----------- | ------------------------------------------------------------------------------- |
| bai/tam-hop-xung-chieu      | 1      | CLEAN       | Mệnh + Phúc Đức relations verified; vô chính diệu kept as a link                |
| sao/thien-co                | 2      | CLEAN       | r1: summary read "vượng" as binding to Dần/Hợi (hãm) — correct reject, reworded |
| sao/dia-kiep                | 1      | CLEAN       | đắc địa only at Dần; no inference from the pair; calmer hung phrasing           |
| sao/hoa-ky                  | 1      | CLEAN       | full can→star table verbatim; no bậc claimed; hành Thủy, hung                   |
| cung/phuc-duc               | 1      | CLEAN       | đối cung Tài Bạch, tam hợp Thiên Di + Phu Thê verified                          |
| thuat-ngu/tam-hop-luc-xung  | 1      | CLEAN       | chi groups/pairs copied exactly, split across sentences                         |
| bai/doc-la-so-cua-chinh-ban | 2      | CLEAN       | r1: 588 < 600 âm tiết — expanded prose; sample placements all from brief        |

**Summary:** 7/7 clean, max 2 rounds, none stopped at 5, no correct prose
rejected → validator needs no calibration (no golden sentences added). The
only rounds spent were on a genuinely wrong rating-bind (thien-co) and a
length miss (doc-la-so). Gotcha found: the `kien-thuc` nx target was cached,
which can mask a `check` exit code — fixed with `cache: false`.
