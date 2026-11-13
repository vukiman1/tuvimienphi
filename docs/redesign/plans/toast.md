# Toast in D3: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the D2-era toast with one quiet D3 notification: a small Day card with a line icon in a soft tinted circle, one or two lines of Vietnamese text and a close button. It sits where it never covers the header, the mobile nav or the sticky CTA. Kim An picked this look (variant B) from three prototypes on 2026-11-13.

**Architecture:** Keep `react-toastify` for queueing, timers, pause-on-hover and the live region. Rebuild `ToastCard` with tokens and lucide icons, and drop the painted panels and icons. Configure `ToastContainer` for position, limit and transition. `notify` keeps its call shape, so the 27 call sites change only their wording.

**Tech Stack:** React 19, react-toastify 11 (`react-toastify/unstyled`, from JS-1), lucide-react, Tailwind v4 tokens, Jest + Testing Library.

**Spec:** [design.md](../design.md), "Visual identity — D3" (palette, motion rules, asset kit: "Nothing outside the approved kit ships").

**Depends on:** JS-1 (`perf/frontend-lazy-startup-js`), which moves the toast imports to `react-toastify/unstyled`. Start from `dev` after JS-1 merges.

## What is wrong today

Seen at 390 and 1440 px on 2026-11-13:

- **Busy background.** Every toast lays a painted panel (mountains, pagoda, bamboo, clouds) behind its text and uses a glossy 3D icon.
- **Colours outside the palette.** The five variants use five colour schemes (blue, pink, green, orange, cream).
- **Redundant titles.** Every toast has a generic title ("Thành công", "Thông báo", "Có lỗi xảy ra") that repeats what the icon says.
- **It covers the controls.** It is pinned top-right, 480 px wide, so on desktop it covers the nav and the login button. On a phone, stacked toasts cover half the screen.
- **Mixed languages.** Twelve of the 27 messages are English ("Signed in.", "Password updated. Other devices were signed out.").
- **Noise.** It has a countdown bar, and a close button with backdrop-blur.
- **Dead variants.** `warning` and `laso` (`scroll`) have no callers.

## Design

| Part      | Decision                                                                                                                                                                                                                                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surface   | `bg-day text-ink`, `rounded-2xl`, a `border-ink/10` hairline and `shadow-lg`. The shadow lifts it off Day pages, and on Night chapters it stands out on its own. No images, no gradients.                                                                                                                             |
| Size      | `w-full max-w-sm` (24rem), `min-h-14`, padding `px-4 py-3`, `gap-3`.                                                                                                                                                                                                                                                  |
| Icon      | lucide, `size-[1.125rem]`, stroke 2, centred in a `size-8 rounded-full` tint circle aligned to the first text line. Success: `CircleCheck`, `text-hanh-tho` on `bg-gold/20`. Error: `CircleAlert`, `text-danger` on `bg-ember/15`. Info: `Info`, `text-deep` on `bg-deep/10`. Colour appears only in the circle.      |
| Text      | Message in `text-sm leading-snug`: `text-ink` when there is no title, `text-ink-soft` under a title. The optional `title` sits above it in `font-semibold text-ink`, and only when a caller passes one. There are no default titles.                                                                                  |
| Close     | `X` `size-4` in `text-ink-soft`, with a 44 px hit area (`size-11 -m-2`) and `hover:text-ink`. It uses `FOCUS_RING_CLASS`. No blur, no ring.                                                                                                                                                                           |
| Placement | `bottom-center`. On phones (below `md`) it sits above the mobile nav bar (`bottom: calc(5.5rem + env(safe-area-inset-bottom))`, measured in Task 2), so it never covers the nav or its centre "Lập lá số" button. From `md` it is `bottom-6` and centred, clear of the header and of the `StickyCta` at bottom-right. |
| Stack     | `limit={3}`, newest at the bottom (nearest the thumb), `gap-2`.                                                                                                                                                                                                                                                       |
| Timing    | Success and info close after 4 s, error after 8 s. Timers pause on hover and on keyboard focus. No progress bar.                                                                                                                                                                                                      |
| Motion    | Enter: 200 ms `translate-y-2` → 0 with opacity 0 → 1, ease-out. Exit: 150 ms opacity fade. Under `prefers-reduced-motion`: opacity only. Built with toastify's `cssTransition` and two keyframes in `styles.css`. Only `transform` and `opacity` animate.                                                             |
| A11y      | Errors use `role="alert"`. Success and info use `role="status"`. The close button label is "Đóng thông báo". The icon is `aria-hidden`.                                                                                                                                                                               |

**Copy rules.** Vietnamese only, addressed to "bạn", one or two short sentences, each ending with a period.

- Success says what is done: "Đã …".
- Errors say what failed and what to do next: "Chưa … được. Bạn …".
- No "Vui lòng" (it reads stiff), no exclamation marks, no English.

## Global Constraints

- No comments, no `any`, explicit return types, string enums, tokens only. `src/components/ui/**` is already under the style guard.
- `notify.success | error | info(message, title?)` keeps its signature. `warning` and `laso` are removed, because nothing calls them.
- No new font weight: `font-semibold` is the one Be Vietnam Pro 600 already in use.
- The toast container stays mounted at the app root, because the prerender counts error toasts (`tools/prerender.mjs`, `assertRenderedFromApi`).
- **Gate:** `pnpm nx run-many -t lint typecheck test -p @org/frontend`, plus screenshots at 390 and 1440 on a Day page (`/kien-thuc`) and a Night page (`/`).

## Review Focus

1. **A toast while the mobile nav is visible.** It must sit fully above the nav bar and its raised centre button at 320, 390 and 430 px, including on an iPhone with a home indicator (safe-area inset).
2. **Several toasts at once,** for example a burst of API errors from `http-request.ts`. There are never more than 3 on screen, and the oldest leaves first.
3. **A long message,** such as an API error sentence of 2–3 lines. It must wrap without overflowing at 320 px, and the close button must stay top-aligned.
4. **Keyboard and screen reader.** An error is announced once, focus is never stolen, Tab reaches the close button, and the timer pauses while it has focus.
5. **Reduced motion.** No movement, opacity only.

---

### Task 1: The new ToastCard and `notify`

**Files:**

- Modify: `apps/frontend/src/components/ui/toast-card.tsx`, `apps/frontend/src/lib/toast.tsx`
- Test: `apps/frontend/src/components/ui/toast-card.spec.tsx` (create), `apps/frontend/src/lib/toast.spec.tsx` (create or extend)

**Interfaces:**

- Produces:
  - `export enum ToastVariant { Success = 'success', Error = 'error', Info = 'info' }`
  - `ToastCard({ variant, message, title?, onClose? })`
  - `notify.success | error | info(message: string, title?: string): void`
  - `TOAST_DURATION_MS: Readonly<Record<ToastVariant, number>>` = `{ success: 4000, info: 4000, error: 8000 }`

- [ ] **Step 1: Write failing tests** in `toast-card.spec.tsx`:
  - `announces errors as alerts and everything else as status`: the error card has `role="alert"`, and the success and info cards have `role="status"`.
  - `shows only the message when no title is given`: there is no heading or bold line, and the text equals the message.
  - `shows the caller's title above the message`.
  - `draws no images`: `container.querySelector('img')` is null.
  - `closes from a labelled button`: clicking "Đóng thông báo" calls `onClose`, and the button has `FOCUS_RING_CLASS`.
- [ ] **Step 2: Write failing tests** in `toast.spec.tsx`: `keeps errors on screen twice as long as confirmations`, which spies on `toast` (the external library boundary) and asserts `autoClose` is 8000 for error and 4000 for success and info.
- [ ] **Step 3: Run** `pnpm nx test @org/frontend -- toast`. Expected: FAIL.
- [ ] **Step 4: Implement** the card from the Design table, the enum and the durations. Delete the `scroll` and `warning` variants and `TOAST_META`'s default titles.
- [ ] **Step 5: Run the tests.** Expected: PASS.

### Task 2: Container, placement and motion

**Files:** `apps/frontend/src/app/app.tsx`, `apps/frontend/src/styles.css`, `apps/frontend/src/lib/toast-transition.ts` (create)

- [ ] **Step 1: Write a failing test** in `app.spec.tsx` (or a small container spec): `places toasts at the bottom centre, three at most`. Render `App`'s container props through a test-only export of the container element, and assert `position="bottom-center"`, `limit={3}`, `newestOnTop={false}` and `hideProgressBar`.
- [ ] **Step 2: Implement.**
  - Set the container props.
  - Add `TOAST_TRANSITION = cssTransition({ enter: 'toast-enter', exit: 'toast-exit' })`, with keyframes in `styles.css` that use `transform` and `opacity` only, plus a reduced-motion override.
  - Move the container's offset into one `.Toastify__toast-container--bottom-center` rule: `bottom: calc(5.5rem + env(safe-area-inset-bottom))` below `md` and `1.5rem` from `md`.
  - Delete `.Toastify__toast.ec-toast*`, the 480 px container width, the `--toastify-*` overrides and the `toast-countdown` keyframes and animation token.
- [ ] **Step 3: Measure** the mobile nav height in the browser at 320 and 390 px, including the raised centre button, and adjust the `5.5rem` if needed.
- [ ] **Step 4: Run** `pnpm nx run-many -t lint typecheck test -p @org/frontend`. Expected: green.

### Task 3: One voice for every message

**Files:** the call sites below. Specs that assert the old English strings must be updated to the new copy. They are copy assertions, not behaviour, so the update is expected.

| File:line                                | Now                                              | New                                                     |
| ---------------------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `settings/use-avatar-upload.ts:34`       | Không thể tải ảnh lên. Vui lòng thử lại.         | Chưa tải ảnh lên được. Bạn thử lại nhé.                 |
| `settings/use-avatar-upload.ts:39`       | Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.               | Ảnh cần ở dạng JPG, PNG hoặc WebP.                      |
| `settings/use-avatar-upload.ts:43`       | Ảnh phải nhỏ hơn …MB.                            | Ảnh cần nhỏ hơn …MB.                                    |
| `settings/change-password-dialog.tsx:51` | Password updated. Other devices were signed out. | Đã đổi mật khẩu. Các thiết bị khác đã được đăng xuất.   |
| `settings/set-password-dialog.tsx:28`    | Password set. Other devices were signed out.     | Đã đặt mật khẩu. Các thiết bị khác đã được đăng xuất.   |
| `settings/security-card.tsx:24`          | Không thể gửi email. Vui lòng thử lại.           | Chưa gửi được email. Bạn thử lại nhé.                   |
| `settings/recovery-codes-dialog.tsx:18`  | Recovery codes copied.                           | Đã sao chép mã phục hồi.                                |
| `settings/recovery-codes-dialog.tsx:20`  | Could not copy. Please write them down instead.  | Chưa sao chép được. Bạn hãy chép tay các mã này nhé.    |
| `settings/sessions-card.tsx:27`          | Không thể đăng xuất thiết bị này.                | Chưa đăng xuất được thiết bị này. Bạn thử lại nhé.      |
| `settings/sessions-card.tsx:35`          | Không thể đăng xuất các thiết bị khác.           | Chưa đăng xuất được các thiết bị khác. Bạn thử lại nhé. |
| `settings/two-factor-card.tsx:48`        | Không thể tạo mã phục hồi mới.                   | Chưa tạo được mã phục hồi mới. Bạn thử lại nhé.         |
| `auth/register-form.tsx:43`              | Email confirmed. You can sign in now.            | Đã xác nhận email. Bạn có thể đăng nhập ngay.           |
| `auth/forgot-password-form.tsx:38`       | Password updated. Every device was signed out.   | Đã đổi mật khẩu. Mọi thiết bị đã được đăng xuất.        |
| `auth/choose-new-password.tsx:59`        | Another code is on its way.                      | Đã gửi lại mã. Bạn kiểm tra email nhé.                  |
| `auth/choose-new-password.tsx:61`        | Could not send another code.                     | Chưa gửi lại được mã. Bạn thử lại sau ít phút.          |
| `auth/use-google-one-tap.ts:39`          | Signed in.                                       | Đăng nhập thành công.                                   |
| `auth/two-factor-step.tsx:39`            | Signed in.                                       | Đăng nhập thành công.                                   |
| `auth/login-form.tsx:35`                 | Signed in.                                       | Đăng nhập thành công.                                   |
| `layout/user-menu.tsx:52`                | Signed out.                                      | Bạn đã đăng xuất.                                       |

These stay unchanged: they are already fine, or they come from the API (`verification-code-form.tsx:55`, `two-factor-step.tsx:62`, `http-request.ts:95`).

- `use-avatar-upload.ts:32`: Đã cập nhật ảnh đại diện.
- `security-card.tsx:21`: Đã gửi mã tới ….
- `sessions-card.tsx:24`: Đã đăng xuất thiết bị.
- `sessions-card.tsx:32`: Đã đăng xuất khỏi tất cả thiết bị khác.
- `two-factor-card.tsx:36`: Đã tắt xác thực 2 bước.

- [ ] **Step 1:** Update each message and its spec assertion. Run `pnpm nx test @org/frontend`. Expected: green.

### Task 4: Remove the D2 toast assets

**Files:**

- Delete: `apps/frontend/public/toast/` (10 files)
- Delete: `toastIconUrl` and `toastPanelUrl` in `apps/frontend/src/config/media.ts`

- [ ] **Step 1:** Run `grep -rn "toast/" apps/frontend/src apps/frontend/index.html`. Expected: no hits.
- [ ] **Step 2:** Delete the files and functions, then run the gate.

### Task 5: Verification

- [ ] **Step 1: Take Playwright screenshots** of one toast of each variant, and of three stacked toasts. Capture them at 320, 390 and 1440, on `/kien-thuc` (Day) and `/` (Night), and save them to the scratchpad for Kim An.
  - Expected: no toast overlaps the header, the mobile nav or the StickyCta.
- [ ] **Step 2: Emulate reduced motion** and check that a toast fades in without moving.
- [ ] **Step 3: Pin the contrast pairs** in `tokens.spec.ts` for the icon on its tint over `day` (≥ 3:1, non-text): `hanh-tho` on `gold/20`, `danger` on `ember/15` and `deep` on `deep/10`. Composite each tint over `day` before measuring.
- [ ] **Step 4: Run a fresh reviewer** on the branch against the Review Focus above.

## Out of scope, noted for later

- The settings screens still have English UI text outside toasts ("Recovery codes", "recovery code"). Translate them with the settings page migration.
- API error messages shown through `http-request.ts:95` come from the backend in whatever language it uses. Check them separately.
