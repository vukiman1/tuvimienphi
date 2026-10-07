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
2. Dán khoá. Model gợi ý đã được chọn sẵn; đổi nếu muốn, rồi bấm **Lưu và kiểm tra**. Console gọi thử ngay sau khi lưu và nói kết quả bằng lời thường, kèm chi tiết gốc của nhà cung cấp.
3. Bấm **Dùng cho trang web**. Nếu lần kiểm tra gần nhất chưa thành công, console hỏi lại trước khi đổi.
4. **Kiểm tra** bất cứ lúc nào để biết khoá còn sống; **Kiểm tra tất cả** chạy cả ba.
5. Đổi khoá: dán khoá mới rồi Lưu. **Xoá khoá** gỡ hẳn khỏi DB.

## Model gợi ý

Ô Model không bắt người dùng nhớ mã model. Danh mục nằm ở `apps/dashboard/src/features/admin/components/ai-model-catalog.ts`, lấy từ tài liệu chính thức ngày 07/10/2026:

| Nhà cung cấp | Mặc định (theo thứ tự)                          | Mạnh nhất, chọn tay      | Nguồn                                                                                   |
| ------------ | ----------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| Gemini       | `gemini-3.5-flash-lite`, rồi `gemini-3.8-flash` | `gemini-3.1-pro-preview` | [ai.google.dev](https://ai.google.dev/gemini-api/docs/models)                           |
| ChatGPT      | `gpt-6.1-sol`                                   | `gpt-6-astra`            | [developers.openai.com](https://developers.openai.com/api/docs/models)                  |
| Claude       | `claude-opus-5-5`                               | `claude-fable-5-1`       | [platform.claude.com](https://platform.claude.com/docs/en/about-claude/models/overview) |

Mặc định là model mạnh nhất **mà vẫn kịp giới hạn 22 giây**, không phải model đắt nhất. Bậc cao nhất của mỗi bên (`gpt-6-astra`, `claude-fable-5-1` ở $10 / $50 mỗi triệu token, `gemini-3.1-pro-preview`) vẫn nằm trong danh sách với nhãn "Mạnh nhất" để chọn tay.

Riêng Gemini xếp `gemini-3.5-flash-lite` lên đầu vì đó là thứ tự `ai.models` đã đo từ trước, và vì lần kiểm tra bằng khoá thật ngày 07/10/2026 với `gemini-3.8-flash` hết 20 giây mà chưa có câu trả lời.

Danh mục là dữ liệu tĩnh nên sẽ cũ dần. Khi đã có khoá, ô Model còn liệt kê mọi model mà khoá đó dùng được, lấy trực tiếp từ nhà cung cấp, và lúc nào cũng gõ thẳng mã model được.

Model treo thì **không** chuyển sang model dự phòng: `tryModels` chỉ đi tiếp khi model trước trả lỗi, còn hết giờ thì cả lượt dừng. Vì vậy model đầu danh sách phải là model nhanh.

## Cần biết

| Việc                                           | Ghi chú                                                                                                                                                                                                                                      |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Đường thành công chưa được kiểm bằng khoá thật | Lúc viết không có khoá của cả ba nhà cung cấp. Khoá sai trả đúng lỗi xác thực của từng bên; một khoá Gemini thật đã qua bước xác thực nhưng hết giờ ở `gemini-3.8-flash`. Một câu trả lời thành công mới chỉ được kiểm bằng test giả lập SDK |
| Ngân sách 22 giây của luận giải                | Model suy luận chậm có thể hết giờ trước khi trả lời. Chọn model nhanh làm model chính và xem con số ms ở lần kiểm tra                                                                                                                       |
| Kiểm tra chưa chạy định kỳ                     | Chỉ chạy khi bấm hoặc sau khi lưu. Muốn tự động thì thêm job theo [11-worker-and-cron.md](11-worker-and-cron.md) và báo qua kênh của [12-deploy-notifications.md](12-deploy-notifications.md)                                                |
| Sentry có thể giữ body request                 | Khi một request lỗi, Sentry có thể đính kèm body, mà body của `saveAiProvider` chứa khoá. Phía mình chưa có `beforeSend` nào che trường `apiKey`; hiện chỉ trông vào bộ lọc dữ liệu nhạy cảm của Sentry, chưa kiểm chứng                     |
| Đổi `SECRET_KEY` là mất khoá đã lưu            | Khoá không giải mã được sẽ bị coi như chưa có, log ghi rõ, và phải nhập lại                                                                                                                                                                  |
| Nhiều tiến trình backend                       | Cache nằm trong từng tiến trình, nên tiến trình khác thấy thay đổi chậm tối đa 30 giây                                                                                                                                                       |
| Nhật ký thao tác                               | Lưu, xoá khoá và đổi nhà cung cấp chưa ghi vào `activity_log`                                                                                                                                                                                |
