# Pre-redesign performance baseline

The public site as it was before any redesigned page shipped. Phase 3 compares each migrated page against its row here.

- **Date:** 2026-11-06
- **Tool:** Lighthouse 12.8.2, mobile preset (simulated throttling: 150 ms RTT, 1.6 Mbps, 4× CPU slowdown, Moto G Power (2022) emulation), headless Chrome on a developer laptop.
- **Target:** production, `https://www.xemtuvimienphi.top` (the bare domain redirects there with a 308).
- **Method:** three runs per route. Each column is the median of its own metric across the three runs.

## Lab results

| Route                       | Performance | Accessibility | Best Practices | SEO | LCP (s) | CLS   | TBT (ms) | Transfer (KB) |
| --------------------------- | ----------- | ------------- | -------------- | --- | ------- | ----- | -------- | ------------- |
| `/`                         | 70          | 96            | 96             | 100 | 8.1     | 0.000 | 54       | 3209          |
| `/la-so`                    | 75          | 100           | 96             | 100 | 5.1     | 0.000 | 17       | 1917          |
| `/ngay-tot`                 | 68          | 96            | 96             | 100 | 10.1    | 0.000 | 24       | 1896          |
| `/van-han`                  | 77          | 96            | 96             | 100 | 4.7     | 0.000 | 25       | 3870          |
| `/kien-thuc`                | 69          | 87            | 96             | 100 | 15.2    | 0.000 | 45       | 3971          |
| `/kien-thuc/tu-vi-la-gi`    | 71          | 95            | 96             | 100 | 6.2     | 0.000 | 15       | 1077          |
| `/la-so/detail?…` (noindex) | 72          | 100           | 96             | 69  | 5.2     | 0.000 | 50       | 3569          |

The detail sample is `?day=12&month=3&year=1995&calendar=duong&hour=Ngọ&gender=nam`. Its SEO score is low because the route is noindex, which is intended. The SEO = 100 gate applies to indexable pages only.

## Against the quality gates

- **LCP misses the 2.5 s gate on every route.** The worst are `/kien-thuc` (15.2 s), `/ngay-tot` (10.1 s) and `/` (8.1 s).
- **CLS and TBT already pass everywhere.**
- **Pages are heavy:** five of the seven routes transfer over 1.8 MB, and `/kien-thuc` and `/van-han` transfer almost 4 MB.
- **Accessibility misses AA on `/kien-thuc` (87).**

## Field data

Not recorded. The anonymous PageSpeed Insights API had used up its daily quota when this baseline was taken. Check `https://pagespeed.web.dev/` for `https://www.xemtuvimienphi.top/` by hand. If the Chrome UX Report has data for the origin, add field LCP, CLS and INP here.
