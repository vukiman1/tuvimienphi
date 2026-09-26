# Local Admin Access

Tài khoản admin dùng để gọi API `/api/admin/*` và query trên Apollo Sandbox ở máy local.

> Chỉ tồn tại trong DB local (`tuvimienphi-db`). Không tạo tài khoản này trên VPS hay bất kỳ môi trường dùng chung nào — mật khẩu và secret dưới đây nằm trong git.

## Đăng nhập console

Console **chỉ đăng nhập bằng Google**: `http://localhost:4300/admin/login` có đúng một nút Google, không có form email/password. Router đặt `basepath: '/admin'` nên `/login` trần không khớp route nào; vào `/admin` thì tự chuyển tới trang đăng nhập khi chưa có phiên.

Đường này đi qua `POST /api/admin/auth/google/one-tap`: verify ID token của Google → `assertConsoleRole` → phát phiên `audience: 'admin'`. **Không có TOTP.** Lớp thứ hai của console là 2SV trên chính Google account, không phải TOTP của hệ thống này — khác với `/api/admin/auth/login` vẫn bắt buộc 2FA. `docs/roadmap/06-admin-console.md` viết trước quyết định này nên còn mô tả ràng buộc cũ.

Google account phải có `role` là `ADMIN` hoặc `SUPER_ADMIN`; sai role thì endpoint trả 403 và không phát cookie nào.

### Seed admin đầu tiên

DB mới tinh chưa có tài khoản nào mang console role, nên đăng nhập lần đầu bị 403. Migration `SeedBootstrapAdmin1786800000000` lo việc này: đọc `ADMIN_BOOTSTRAP_EMAILS` rồi cấp `SUPER_ADMIN` cho từng email.

```bash
# apps/backend/.env.local (gitignored), phân tách bằng dấu phẩy
ADMIN_BOOTSTRAP_EMAILS=email-google-cua-ban@gmail.com,dong-nghiep@gmail.com
```

```bash
pnpm db:migration:run
```

Trên VPS không phải làm gì thêm: service `migrate` trong `docker-compose.prod.yml` chạy mỗi lần deploy và đã nhận `ADMIN_BOOTSTRAP_EMAILS` qua `*backend-env`, nên chỉ cần set biến trong `.env.prod`.

Email được trim và hạ về chữ thường. Migration xử lý cả ba tình huống trong một câu `INSERT ... ON CONFLICT`:

| Trạng thái trong DB         | Kết quả                                                                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| chưa có                     | tạo row `SUPER_ADMIN`, `is_email_verified = true`, không mật khẩu — lần đăng nhập Google đầu tiên gắn identity vào đúng row này (`linkToExistingUser`), không tạo tài khoản trùng |
| đang là `USER`/`SELLER`     | nâng lên `SUPER_ADMIN`                                                                                                                                                            |
| đã là `ADMIN`/`SUPER_ADMIN` | không đụng tới — chỉ nâng, không bao giờ hạ role                                                                                                                                  |

> **Biến rỗng thì migration ném lỗi, không im lặng bỏ qua.** Đây là chủ ý: nếu chỉ `return` thì tên migration vẫn được ghi vào bảng `migrations`, và set biến sau đó sẽ không có tác dụng vì migration không chạy lại nữa. Ném lỗi thì transaction rollback, bảng `migrations` không ghi gì, deploy fail rõ ràng — set biến rồi chạy lại là xong.

Backend e2e tự set `ADMIN_BOOTSTRAP_EMAILS=e2e-admin@tuvi.local` trong `global-setup.ts`, nên CI không cần biến này.

Biến được khai báo trong `config/default.yml` và `config/custom-environment-variables.yml` như mọi biến khác, nên `config().admin.bootstrapEmails` có sẵn và đã qua validate nếu sau này cần đọc lúc chạy. Bản thân migration vẫn đọc thẳng `process.env`: nó chạy qua typeorm CLI ngoài Nest, nạp cả config loader vào sẽ kéo theo ràng buộc `JWT_SECRET` và `SECRET_KEY` không liên quan gì tới việc seed.

### Thêm hoặc đổi admin về sau

Migration chỉ chạy một lần, nên admin thứ hai trở đi cấp bằng SQL:

```bash
docker exec tuvimienphi-db psql -U postgres -d tuvimienphi -c \
  "insert into users (email, is_email_verified, role)
   values ('<email google>', true, 'SUPER_ADMIN')
   on conflict (email) do update set role = 'SUPER_ADMIN';"
```

Trên VPS đổi `docker exec tuvimienphi-db` thành `docker compose exec db` và dùng `-U "$POSTGRES_USER" -d "$POSTGRES_DB"`.

### Thu hồi quyền

```bash
docker exec tuvimienphi-db psql -U postgres -d tuvimienphi \
  -c "update users set role='USER' where email='<email>';"
```

### Client ID cho dashboard

`apps/dashboard/.env.local` (gitignored) cần client ID, lấy cùng giá trị với `apps/frontend/.env`:

```bash
VITE_GOOGLE_CLIENT_ID=<cung gia tri voi apps/frontend/.env>
```

Và OAuth client đó phải có `http://localhost:4300` trong **Authorized JavaScript origins** ở Google Cloud Console. Thiếu bước này thì nút vẫn vẽ ra nhưng console log `[GSI_LOGGER]: The given origin is not allowed for the given client ID.` và không đăng nhập được.

Đăng nhập ở console là đủ cho cả Apollo Sandbox: cookie gắn theo host `localhost` (không tính port) với `path=/api/admin`, nên `localhost:3000/api/admin/graphql` nhận luôn.

## Tài khoản mật khẩu (chỉ cho REST / Sandbox)

Console không dùng hai tài khoản này nữa, nhưng `/api/admin/auth/login` vẫn còn nên chúng vẫn hữu ích để lấy cookie cho Sandbox bằng curl hoặc Swagger, không cần Google.

Cả hai đều `SUPER_ADMIN`, email đã xác thực, 2FA đã enrol sẵn ở trạng thái confirmed.

| Email              | Mật khẩu         | TOTP secret                        |
| ------------------ | ---------------- | ---------------------------------- |
| `admin@tuvi.local` | `TuviLocal@2026` | `J6BN4KX3BH6OYND2D6LGGYWQWQDN4JFT` |
| `dev@tuvi.local`   | `DevAdmin@2026`  | `U4SKLKG3DOVNZQKTJUL6ZJIYNNXFU7KB` |

Hai ràng buộc không bỏ được ở mức tài khoản, nên đều đã set sẵn khi tạo:

- **Email phải verified.** `/api/admin/auth/login` dùng chung `UserLocalStrategy` với site công khai, strategy đó chặn email chưa verify trước cả khi xét `role`.
- **2FA phải bật.** `/api/admin/auth/login` từ chối tài khoản chưa bật 2FA, nên tài khoản không có 2FA thì không đăng nhập được vào console.

Secret nằm trong DB ở dạng mã hoá AES-256-GCM với khoá `sha256(SECRET_KEY)`. Nếu đổi `SECRET_KEY` trong `apps/backend/.env` thì secret cũ giải mã không ra — phải tạo lại enrolment theo mục cuối.

## Sinh code TOTP

Cho bước `2fa/verify` khi đăng nhập bằng mật khẩu. Code sống 30 giây, cửa sổ chấp nhận ±30s.

```bash
node -e 'const c=require("crypto"),A="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",s=process.argv[1];let b="";for(const x of s)b+=A.indexOf(x).toString(2).padStart(5,"0");const k=Buffer.from((b.match(/.{8}/g)||[]).map(v=>parseInt(v,2))),m=Buffer.alloc(8);m.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const d=c.createHmac("sha1",k).update(m).digest(),o=d[19]&15;console.log(String((d.readUInt32BE(o)&0x7fffffff)%1e6).padStart(6,"0"))' J6BN4KX3BH6OYND2D6LGGYWQWQDN4JFT
```

Hoặc nạp secret vào Google Authenticator / 1Password bằng URI:

```
otpauth://totp/Tuvi:admin@tuvi.local?secret=J6BN4KX3BH6OYND2D6LGGYWQWQDN4JFT&algorithm=SHA1&digits=6&period=30
```

## Lấy cookie phiên admin cho Apollo Sandbox

Cookie `admin_access_token` là `httpOnly` và scope `path=/api/admin`, nên không set được bằng `document.cookie` và cũng không lấy được từ curl sang trình duyệt. Phải chạy luồng đăng nhập ngay trong tab trình duyệt.

1. Chạy backend: `pnpm dev:backend`.
2. Mở `http://localhost:3000/api/admin/graphql` — Apollo Sandbox tự phục vụ tại đúng endpoint ở môi trường non-production.
3. Mở devtools console **của chính tab đó** (phải cùng origin để trình duyệt nhận cookie) và dán:

```js
const api = (p, b) =>
  fetch(`/api${p}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(b ?? {}),
  }).then((r) => r.json());

async function totp(secret) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const ch of secret) bits += A.indexOf(ch).toString(2).padStart(5, '0');
  const bytes = Uint8Array.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const key = await crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-1' }, false, [
    'sign',
  ]);
  const msg = new DataView(new ArrayBuffer(8));
  msg.setBigUint64(0, BigInt(Math.floor(Date.now() / 30000)));
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, msg.buffer));
  const o = mac[19] & 15;
  const n = ((mac[o] & 127) << 24) | (mac[o + 1] << 16) | (mac[o + 2] << 8) | mac[o + 3];
  return String(n % 1e6).padStart(6, '0');
}

const r = await api('/admin/auth/login', {
  email: 'admin@tuvi.local',
  password: 'TuviLocal@2026',
});
await api('/admin/auth/2fa/verify', {
  challengeToken: r.data.challengeToken,
  code: await totp('J6BN4KX3BH6OYND2D6LGGYWQWQDN4JFT'),
});
```

4. Reload Sandbox rồi query. Sandbox lấy endpoint từ `window.location.href` và gửi kèm cookie (`includeCookies: true`), nên không cần cấu hình gì thêm.

```graphql
query {
  users(page: 1, limit: 10) {
    total
    users {
      id
      email
      displayName
      role
      balance
      genCount
    }
  }
}
```

## Vì sao phải đăng nhập lại

Thứ quyết định Sandbox còn dùng được hay không là cookie `admin_access_token`, không phải phiên refresh. Cookie đó sống đúng bằng `JWT_ACCESS_TOKEN_EXPIRES_IN`, và key `AC_TOKEN` trong Redis cũng hết hạn cùng lúc — mặc định **15 phút**. Phiên refresh 4 giờ / 12 giờ chỉ có tác dụng nếu có client gọi `/api/admin/auth/refresh-token`, mà Sandbox thì không tự gọi.

`apps/backend/.env` (không nằm trong git) đã nới cho môi trường local:

```bash
JWT_ACCESS_TOKEN_EXPIRES_IN=12h
SESSION_REFRESH_TTL_ADMIN=30d
SESSION_MAX_LIFETIME_ADMIN=30d
```

Đăng nhập một lần dùng được cả ngày. `JWT_ACCESS_TOKEN_EXPIRES_IN` áp dụng cho cả audience `user` nên site công khai ở local cũng giữ phiên lâu tương tự — chỉ đổi ở local, production vẫn lấy giá trị từ biến môi trường của deployment.

## Tạo lại tài khoản

Khi DB local bị reset, hoặc `SECRET_KEY` đổi.

```bash
docker exec tuvimienphi-db psql -U postgres -d tuvimienphi \
  -c "delete from users where email = 'admin@tuvi.local';"
```

Sinh lại hash mật khẩu, secret TOTP và bản mã hoá của nó. Chạy từ thư mục gốc repo (cần `node_modules/argon2`) và truyền đúng `SECRET_KEY` đang dùng trong `apps/backend/.env`:

```bash
SECRET_KEY='yoursecretkeymustbe32characters!!' node -e '
const c = require("crypto");
const argon2 = require("argon2");
const SECRET_KEY = process.env.SECRET_KEY;
const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
let bits = "";
for (const b of c.randomBytes(20)) bits += b.toString(2).padStart(8, "0");
let secret = "";
for (let i = 0; i + 5 <= bits.length; i += 5) secret += A[parseInt(bits.slice(i, i + 5), 2)];
const key = c.createHash("sha256").update(SECRET_KEY).digest();
const iv = c.randomBytes(12);
const ci = c.createCipheriv("aes-256-gcm", key, iv);
const enc = Buffer.concat([ci.update(secret, "utf8"), ci.final()]);
argon2.hash("TuviLocal@2026").then((hash) =>
  console.log(JSON.stringify({ secret, encrypted: Buffer.concat([iv, ci.getAuthTag(), enc]).toString("base64"), hash }, null, 2)),
);
'
```

Rồi chèn hai dòng, thay `<hash>` và `<encrypted>` bằng kết quả trên:

```sql
insert into users (email, display_name, password, is_email_verified, role)
values ('admin@tuvi.local', 'Quản trị viên', '<hash>', true, 'SUPER_ADMIN');

insert into user_totp (user_id, secret, confirmed_at)
select id, '<encrypted>', now() from users where email = 'admin@tuvi.local';
```

Cập nhật lại secret ở đầu tài liệu này.
