# Build Pipeline — Backend

Đường build của backend còn mang hình dạng thời chạy trên Vercel serverless. Backend đã chuyển sang VPS
(`docker-compose.prod.yml`, `CMD ["node", "main.js"]`), nên phần lớn thứ còn lại là hành lý thừa.

---

## 1. 🟡 Mỗi lần `pnpm dev` build hai lần, một lần thừa và là bản production

**Vấn đề:** target `serve` khai `dependsOn: ["build"]`, mà `buildTarget` của nó lại trỏ tới
`@org/backend:build:development`. Nên Nx chạy **build mặc định trước** (`--mode=production`, kèm
`NODE_ENV=production`), rồi mới tới bản development. Thấy rõ trong log khi chạy `nx serve`:

```
> nx run @org/backend:build
> webpack-cli build --mode=production
```

**Hệ quả:** khởi động dev chậm gấp đôi không vì lý do gì, và bản production được build bằng ngữ cảnh
của máy dev.

**Cách làm:** đổi `dependsOn` sang `["build:development"]`, hoặc bỏ hẳn `dependsOn` vì
`@nx/js:node` đã tự chạy `buildTarget` rồi.

**File liên quan:** khối `nx.targets` trong [apps/backend/package.json](../../apps/backend/package.json)
— dự án **không có** `project.json`, target viết tay trong `package.json`.

---

## 2. ✅ Hành lý serverless — đã dọn ở #90

`chore(backend): remove Vercel deployment (#90)` đã xoá `apps/backend/vercel.json`,
`apps/backend/api/index.js`, `apps/backend/src/serverless.ts` và `additionalEntryPoints` trong
webpack. Build giờ chỉ sinh `main.js`.

**Nhưng #90 bỏ sót một chỗ**, và nó làm gãy trang công khai: `apps/frontend/vercel.json` vẫn rewrite
`/api/*` về `https://tuvimienphi-backend.vercel.app`, host đã chết. Vá ở #97.

**Còn lại hai thứ, không phải việc của repo:**

- **Project `tuvimienphi-backend` vẫn tồn tại trong dashboard Vercel** — xoá file trong repo không gỡ
  được một project đã kết nối, nên nó vẫn build preview mỗi PR. Phải xoá trong dashboard. Coi như mọi
  secret còn cấu hình ở đó đã lộ; riêng `SECRET_KEY` thì **không xoay được** nếu đã có ai đăng ký TOTP,
  vì nó mã hoá TOTP secret khi lưu.
- **`GENERATION_BUDGET_MS` vẫn căn theo trần 30 giây của Vercel function.** Xem
  `luan-giai.constants.ts` và `luan-giai.service.ts`. Trên VPS không còn trần đó, nên đây là ràng buộc
  tự đặt mà không ai cần — nới ra thì lượt sinh luận giải có thêm thời gian thử lại. Là quyết định sản
  phẩm, không phải dọn dẹp.

---

## 3. 🟢 Watch + restart cho dev

**Trạng thái:** đã thêm `--watch` và `continuous: true` vào configuration `development` của target
`build`.

**Đã kiểm:** `webpack --watch` build lại thật khi sửa file — compile lần đầu, sửa `app.service.ts`,
webpack compile lần hai và ghi lại `dist/main.js`.

**Chưa kiểm:** `nx serve` có khởi động lại tiến trình node khi output đổi không, và `dependsOn` với một
build chạy liên tục có bị treo không. Không thử được vì Nx từ chối chạy trùng target:

```
Waiting for @org/backend:serve:development in another nx process
```

Muốn nghiệm thu nốt thì phải tắt `pnpm dev` đang chạy rồi khởi động lại một lượt.

> Không chạy được `webpack-cli` ngoài Nx: `NxAppWebpackPlugin` đòi biến `NX_TASK_TARGET_PROJECT`,
> thiếu là ném `TypeError: Cannot read properties of undefined (reading 'data')`.
