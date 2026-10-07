# Khoá AI và nhà cung cấp trong console

Console giữ khoá API của Gemini, ChatGPT (OpenAI) và Claude (Anthropic), quyết định trang web sinh luận giải bằng nhà cung cấp và model nào, và kiểm tra từng khoá còn dùng được không.

---

## Bối cảnh

Trước đây chỉ có Gemini, khoá và danh sách model nằm trong biến môi trường (`GEMINI_API_KEY`, `ai.models`). Đổi khoá hay đổi model là sửa env rồi deploy lại, và không có chỗ nào cho biết khoá còn sống hay không cho tới khi người dùng gặp "hệ thống đang bận".

## Quyết định

| Quyết định                                                         | Vì sao                                                                                                                                                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Khoá lưu ở bảng `ai_provider`, mã hoá bằng `CryptoService`         | Cùng cơ chế AES-256-GCM với khoá `sha256(SECRET_KEY)` đang giữ secret TOTP. API chỉ trả `hasApiKey` và 4 ký tự cuối; không có đường nào đọc lại khoá                                                          |
| Chỉ `SUPER_ADMIN` đọc và ghi                                       | Đổi khoá là đổi nơi nhận prompt chứa ngày sinh của người dùng. Vai `ADMIN` nhận 403 ở cả query lẫn mutation                                                                                                   |
| Đúng một nhà cung cấp được dùng                                    | Index duy nhất một phần trên `is_active` chặn hai dòng cùng bật. Chỉ bật được khi đã có khoá và ít nhất một model                                                                                             |
| Mỗi nhà cung cấp có **danh sách** model theo thứ tự                | Model đầu là model chính, các model sau là dự phòng. Giữ nguyên `tryModels` vì gói free của Gemini vẫn hay trả `UNAVAILABLE`                                                                                  |
| Biến môi trường thành dự phòng                                     | Console chưa chọn gì thì trang web vẫn dùng `GEMINI_API_KEY` như cũ, nên deploy bản này không làm gián đoạn. Chọn một nhà cung cấp trong console là env thôi được dùng                                        |
| Kiểm tra = gọi sinh JSON thật                                      | Đi đúng đường trang web đi (`generate` với schema), nên "hoạt động" nghĩa là sinh được, không chỉ là khoá hợp lệ. Liệt kê model thôi thì không bắt được model hết hạn mức                                     |
| Không gửi `temperature`, `effort`, `thinking` cho OpenAI và Claude | Các model mới của hai bên từ chối tham số sampling, còn `effort` và `thinking` thì tuỳ model. Để mặc định thì model nào admin chọn cũng chạy. `ai.temperature` chỉ còn áp dụng cho Gemini                     |
| Model từ chối hoặc bị cắt giữa chừng thì coi là thất bại           | `stop_reason: refusal` / `max_tokens` (Claude), `refusal` / `finish_reason: length` (OpenAI) đều ném lỗi để `tryModels` thử model kế. Chưa bật fallback phía máy chủ của Claude — danh sách model làm việc đó |
| Không cho nhập base URL                                            | Ba endpoint cố định trong SDK chính thức. Một ô URL tự do là một đường SSRF                                                                                                                                   |
| Cấu hình đang dùng được cache 30 giây trong tiến trình             | Một chương luận giải gọi model nhiều lần song song. Lưu, xoá khoá và đổi nhà cung cấp đều xoá cache ngay                                                                                                      |

## API

Console (GraphQL, `/api/admin/graphql`), tất cả yêu cầu `SUPER_ADMIN`:

| Field                           | Việc                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `aiSettings`                    | Ba nhà cung cấp và nguồn trang web đang dùng: `CONSOLE`, `ENVIRONMENT` hoặc `NONE` |
| `aiProviderModels(provider)`    | Danh sách model lấy trực tiếp từ nhà cung cấp bằng khoá đang lưu                   |
| `saveAiProvider(input)`         | Lưu model, và khoá nếu có gửi kèm. Bỏ trống khoá là giữ khoá cũ                    |
| `clearAiProviderKey(provider)`  | Xoá khoá; nếu đang dùng thì ngừng dùng luôn                                        |
| `setActiveAiProvider(provider)` | Chọn nhà cung cấp cho trang web; `null` là không chọn, quay về env                 |
| `checkAiProvider(provider)`     | Gọi thử, ghi lại kết quả, model đã trả lời và thời gian                            |

`aiProviderModels` và `checkAiProvider` giới hạn 12 lần mỗi phút, vì mỗi lần là một lời gọi ra ngoài.

## Dùng thế nào

1. Console → **AI**. Dải thông báo trên cùng cho biết trang web đang lấy khoá từ đâu.
2. Dán khoá, chọn model (danh sách hiện ra sau khi có khoá, hoặc gõ thẳng mã model), bấm **Lưu**. Console tự kiểm tra ngay sau khi lưu.
3. Bấm **Dùng cho trang web**. Nếu lần kiểm tra gần nhất chưa thành công, console hỏi lại trước khi đổi.
4. **Kiểm tra** bất cứ lúc nào để biết khoá còn sống; **Kiểm tra tất cả** chạy cả ba.
5. Đổi khoá: dán khoá mới rồi Lưu. **Xoá khoá** gỡ hẳn khỏi DB.

## Cần biết

| Việc                                | Ghi chú                                                                                                                                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chưa gọi thử bằng khoá thật         | Lúc viết không có khoá của cả ba nhà cung cấp. Đã thử với API thật ở đường lỗi (khoá sai trả 400/401 đúng như mong đợi); đường thành công chỉ được kiểm bằng test giả lập SDK. Lần bấm Kiểm tra đầu tiên với khoá thật là phép thử thật |
| Ngân sách 22 giây của luận giải     | Model suy luận chậm có thể hết giờ trước khi trả lời. Chọn model nhanh làm model chính và xem con số ms ở lần kiểm tra                                                                                                                  |
| Kiểm tra chưa chạy định kỳ          | Chỉ chạy khi bấm hoặc sau khi lưu. Muốn tự động thì thêm job theo [11-worker-and-cron.md](11-worker-and-cron.md) và báo qua kênh của [12-deploy-notifications.md](12-deploy-notifications.md)                                           |
| Sentry có thể giữ body request      | Khi một request lỗi, Sentry có thể đính kèm body, mà body của `saveAiProvider` chứa khoá. Phía mình chưa có `beforeSend` nào che trường `apiKey`; hiện chỉ trông vào bộ lọc dữ liệu nhạy cảm của Sentry, chưa kiểm chứng                |
| Đổi `SECRET_KEY` là mất khoá đã lưu | Khoá không giải mã được sẽ bị coi như chưa có, log ghi rõ, và phải nhập lại                                                                                                                                                             |
| Nhiều tiến trình backend            | Cache nằm trong từng tiến trình, nên tiến trình khác thấy thay đổi chậm tối đa 30 giây                                                                                                                                                  |
| Nhật ký thao tác                    | Lưu, xoá khoá và đổi nhà cung cấp chưa ghi vào `activity_log`                                                                                                                                                                           |
