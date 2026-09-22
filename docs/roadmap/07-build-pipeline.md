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

## 2. 🟡 Hành lý serverless

**Vấn đề:** webpack vẫn sinh ra một bundle serverless mà **không ai deploy**:

```js
// apps/backend/webpack.config.js
additionalEntryPoints: [{ entryName: 'serverless', entryPath: './src/serverless.ts' }],
```

Kèm theo: `apps/backend/api/index.js` (entry cho Vercel function), `apps/backend/src/serverless.ts`,
`apps/backend/vercel.json`, và đoạn `config-bootstrap.ts` nội suy config "để bundle serverless tự mang
cấu hình của nó".

**Đã kiểm — không còn gì nối vào:**

- `.github/workflows/` không tham chiếu `vercel` hay `serverless`.
- `apps/backend/Dockerfile` chạy `CMD ["node", "main.js"]`, không đụng `serverless.js`.

**Hệ quả:** mỗi lần build tốn thêm thời gian cho một entry point chết, và người đọc mới sẽ tưởng dự án
vẫn deploy lên Vercel.

**Cách làm:** bỏ `additionalEntryPoints`, xoá `api/index.js`, `src/serverless.ts`, `vercel.json`, rồi
xem lại phần nội suy config trong `config-bootstrap.ts` xem còn lý do tồn tại không.

> ⚠️ Xoá `vercel.json` là quyết định "không quay lại Vercel nữa". Xác nhận trước khi làm.

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
