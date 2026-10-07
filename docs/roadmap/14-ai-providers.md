# Khoá AI và nhà cung cấp trong console

Console giữ khoá API của Gemini, ChatGPT (OpenAI) và Claude (Anthropic), quyết định trang web sinh luận giải bằng nhà cung cấp và model nào, và kiểm tra từng khoá còn dùng được không.

---

## Bối cảnh

Trước đây chỉ có Gemini, khoá và danh sách model nằm trong biến môi trường (`GEMINI_API_KEY`, `ai.models`). Đổi khoá hay đổi model là sửa env rồi deploy lại, và không có chỗ nào cho biết khoá còn sống hay không cho tới khi người dùng gặp "hệ thống đang bận".

## Quyết định

| Quyết định                                                          | Vì sao                                                                                                                                                                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Khoá lưu ở bảng `ai_provider`, mã hoá bằng `CryptoService`          | Cùng cơ chế AES-256-GCM với khoá `sha256(SECRET_KEY)` đang giữ secret TOTP. API chỉ trả `hasApiKey` và vài ký tự ở hai đầu (`AIza…Xk7Q`); không có đường nào đọc lại khoá                                     |
| Chỉ `SUPER_ADMIN` đọc và ghi                                        | Đổi khoá là đổi nơi nhận prompt chứa ngày sinh của người dùng. Vai `ADMIN` nhận 403 ở cả query lẫn mutation                                                                                                   |
| Đúng một nhà cung cấp được dùng                                     | Index duy nhất một phần trên `is_active` chặn hai dòng cùng bật. Chỉ bật được khi đã có khoá và ít nhất một model                                                                                             |
| Mỗi nhà cung cấp có **danh sách** model theo thứ tự                 | Model đầu là model chính, các model sau là dự phòng. Giữ nguyên `tryModels` vì gói free của Gemini vẫn hay trả `UNAVAILABLE`                                                                                  |
| Biến môi trường thành dự phòng                                      | Console chưa chọn gì thì trang web vẫn dùng `GEMINI_API_KEY` như cũ, nên deploy bản này không làm gián đoạn. Chọn một nhà cung cấp trong console là env thôi được dùng                                        |
| Kiểm tra = gọi sinh JSON thật                                       | Đi đúng đường trang web đi (`generate` với schema), nên "hoạt động" nghĩa là sinh được, không chỉ là khoá hợp lệ. Liệt kê model thôi thì không bắt được model hết hạn mức                                     |
| Không gửi `temperature`, `effort`, `thinking` cho OpenAI và Claude  | Các model mới của hai bên từ chối tham số sampling, còn `effort` và `thinking` thì tuỳ model. Để mặc định thì model nào admin chọn cũng chạy. `ai.temperature` chỉ còn áp dụng cho Gemini                     |
| Model từ chối hoặc bị cắt giữa chừng thì coi là thất bại            | `stop_reason: refusal` / `max_tokens` (Claude), `refusal` / `finish_reason: length` (OpenAI) đều ném lỗi để `tryModels` thử model kế. Chưa bật fallback phía máy chủ của Claude — danh sách model làm việc đó |
| Không cho nhập base URL                                             | Ba endpoint cố định trong SDK chính thức. Một ô URL tự do là một đường SSRF                                                                                                                                   |
| Một form: chọn loại AI, khoá, model, rồi Lưu                        | Lưu nghĩa là trang web dùng AI đó. Lần sau mở trang vẫn hiện AI đang dùng với khoá đã che, cho tới khi chọn và lưu một AI khác                                                                                |
| Lưu thì gọi thử trước                                               | Cấu hình không trả lời được bị giữ lại, kèm lý do, nút đổi sang model gợi ý và nút **Vẫn lưu**. Nếu không, một lần lưu nhầm là trang web ngừng luận giải                                                      |
| Gọi thử được cả khoá và model chưa lưu                              | `testAiProvider` nhận khoá đang gõ, không ghi gì vào DB. Nhờ vậy kiểm tra trước, lưu sau                                                                                                                      |
| Thanh theo dõi chạy từ trình duyệt, mỗi phút, chỉ khi trang đang mở | Mỗi lần là một lời gọi sinh thật nên tốn token. Tab ẩn hoặc tắt công tắc thì dừng; không ai mở trang thì không tốn gì                                                                                         |
| Cấu hình đang dùng được cache 30 giây trong tiến trình              | Một chương luận giải gọi model nhiều lần song song. Lưu, xoá khoá và đổi nhà cung cấp đều xoá cache ngay                                                                                                      |

## API

Console (GraphQL, `/api/admin/graphql`), tất cả yêu cầu `SUPER_ADMIN`:

| Field                                                      | Việc                                                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `aiSettings`                                               | Ba nhà cung cấp và nguồn trang web đang dùng: `CONSOLE`, `ENVIRONMENT` hoặc `NONE`           |
| `aiProviderModels(provider, apiKey?)`                      | Danh sách model lấy trực tiếp từ nhà cung cấp, bằng khoá gửi kèm hoặc khoá đang lưu          |
| `testAiProvider(input)`                                    | Gọi thử khoá và model chưa lưu (bỏ trống khoá là dùng khoá đang lưu); không ghi gì           |
| `saveAiProvider(input)`                                    | Lưu model, và khoá nếu có gửi kèm. Bỏ trống khoá là giữ khoá cũ                              |
| `clearAiProviderKey(provider)`                             | Xoá khoá; nếu đang dùng thì ngừng dùng luôn                                                  |
| `setActiveAiProvider(provider)`                            | Chọn nhà cung cấp cho trang web; `null` là không chọn, quay về env                           |
| `checkAiProvider(provider)`                                | Gọi thử, ghi lại kết quả, model đã trả lời và thời gian                                      |
| `aiUsage(from, to)`                                        | Mức dùng theo ngày, AI, model và việc, kèm chi phí ước tính. Tối đa 366 ngày                 |
| `aiCalls(from, to, provider, model, purpose, page, limit)` | Từng lượt gọi đằng sau một dòng của bảng mức dùng, mới nhất trước, mỗi trang tối đa 100 lượt |
| `setAiProviderBudget(provider, monthlyBudgetUsd)`          | Đặt hạn mức tháng (USD) cho một AI; `null` là bỏ hạn mức                                     |

`aiProviderModels`, `testAiProvider` và `checkAiProvider` giới hạn 12 lần mỗi phút mỗi field, vì mỗi lần là một lời gọi ra ngoài.

## Dùng thế nào

1. Console → **AI**. Dải thông báo trên cùng cho biết trang web đang lấy khoá từ đâu. Bên dưới là hai cột: **Cấu hình** bên trái, **Kiểm tra** bên phải (màn hẹp thì xếp chồng).
2. Chọn **Loại AI**. Trang mở sẵn ở AI đang dùng; danh sách ghi rõ AI nào đang dùng, AI nào chưa có khoá.
3. Dán **khoá API**. Rời ô là khoá thu lại còn vài ký tự hai đầu (`AIza••••••••Xk7Q`). Nút **Kiểm tra** cạnh ô hỏi nhà cung cấp xem khoá có được nhận không và nạp thêm các model khoá đó dùng được.
4. Chọn **Model** từ danh sách. Model gợi ý đã được chọn sẵn.
5. **Kiểm tra model** gọi thử đúng khoá và model đang hiện trên form, kể cả khi chưa lưu.
6. **Lưu**. Console gọi thử trước; trả lời được thì lưu và trang web chuyển sang AI này. Không trả lời được thì giữ lại và nói lý do bằng lời thường.
7. Thanh theo dõi ở cột Kiểm tra tự gọi thử cấu hình đã lưu mỗi phút khi trang đang mở, mỗi ô là một lần gọi.
8. **Ngừng dùng** đưa trang web về khoá trong env. **Xoá khoá** gỡ hẳn khỏi DB.
9. Thẻ **Mức dùng** ở dưới: chọn Hôm nay, 7 ngày, 30 ngày hoặc Tháng này để xem lượt gọi, token và chi phí theo model. Gõ số tiền vào ô hạn mức của một AI rồi bấm **Lưu hạn mức**; để trống rồi lưu là bỏ hạn mức.
10. Bấm vào một dòng của bảng để mở danh sách từng lượt gọi: lúc nào, thành công hay lỗi, token vào và ra, trả lời sau bao lâu, tốn bao nhiêu, người dùng nào yêu cầu và cho chương nào.

## Mức dùng và hạn mức

Thẻ **Mức dùng** dưới hai cột cho biết AI đã được gọi bao nhiêu lượt, tốn bao nhiêu token và ước chừng bao nhiêu tiền, theo từng model, tách riêng việc viết luận giải với việc kiểm tra khoá.

| Quyết định                                                                    | Vì sao                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ghi theo ngày, mỗi dòng là một (ngày, AI, model, việc) trong `ai_usage_daily` | Câu hỏi cần trả lời là "hôm nay / tháng này hết bao nhiêu", không phải từng lượt gọi. Bảng không phình theo số lượt gọi                                                                                                  |
| Ngày tính theo giờ Việt Nam (`Asia/Ho_Chi_Minh`)                              | "Hôm nay" trên trang khớp với ngày của người xem, không lệch 7 tiếng theo UTC                                                                                                                                            |
| Ghi ở chỗ gọi nhà cung cấp, cho cả luận giải lẫn kiểm tra                     | Thanh theo dõi gọi mỗi phút cũng tốn token, nên phải thấy được nó tốn bao nhiêu                                                                                                                                          |
| Model lỗi rồi mới tới model dự phòng cũng được đếm                            | Một lượt `429` ở model chính được model sau cứu vẫn là dấu hiệu sắp hết hạn mức. Cột **Hết hạn mức** đếm các lỗi `429`, quota, rate limit                                                                                |
| Tiền tính lúc đọc, từ `apps/backend/src/ai/ai-pricing.ts`                     | Chỉ lưu token. Sửa một giá sai hay thêm giá cho model mới thì số liệu cũ đúng theo luôn. Giá có ngày hiệu lực, vì Gemini Flash đổi giá từ 01/01/2027                                                                     |
| Hạn mức tháng do mình tự đặt, theo từng AI, chỉ cảnh báo                      | Khoá API thường không đọc được số dư hay hạn mức còn lại của tài khoản. Hạn mức ở đây là con số so sánh: từ 80% thì cảnh báo, quá 100% thì báo đỏ. Trang web **không** tự ngừng gọi AI khi vượt                          |
| Lượt gọi của người dùng trang web được tính chung, nhãn "Luận giải"           | Mọi lời gọi AI của trang web đi qua `RoutingAiClient`, nên bài luận giải sinh cho người dùng nào cũng được đếm. "Kiểm tra" chỉ là các lượt gọi thử từ console                                                            |
| Mỗi lượt gọi còn được ghi một dòng trong `ai_call`                            | Bảng theo ngày trả lời "hết bao nhiêu", còn muốn biết lượt nào chậm, lượt nào lỗi, ai gọi thì cần từng lượt. Một chương luận giải là nhiều lượt gọi, nên mỗi lượt ghi kèm người yêu cầu và chương                        |
| Người yêu cầu và chương đi theo `AsyncLocalStorage`                           | `LuanGiaiService.request` đặt ngữ cảnh quanh lúc sinh bài; chỗ ghi số liệu đọc lại. Không phải sửa chữ ký của các generator hay của `AiClient`                                                                           |
| Chi tiết từng lượt giữ 90 ngày                                                | Thanh theo dõi có thể tạo hơn một nghìn dòng mỗi ngày. Dòng cũ hơn 90 ngày bị xoá khi ghi, nhiều nhất 6 tiếng một lần. Tổng theo ngày thì giữ lâu dài, nên bảng ngoài có thể đếm nhiều lượt hơn số dòng chi tiết còn lại |
| Ghi số liệu hỏng thì bỏ qua, không làm hỏng lượt gọi                          | Một lỗi DB lúc ghi chỉ để lại một dòng cảnh báo trong log; người dùng vẫn nhận được luận giải                                                                                                                            |

Giá mỗi triệu token (vào / ra), lấy từ trang giá chính thức ngày 07/10/2026:

| Model                                                      | Giá (USD)                                 | Nguồn                                                                           |
| ---------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| `gemini-3.5-flash-lite`                                    | 0,30 / 2,50                               | [ai.google.dev](https://ai.google.dev/gemini-api/docs/pricing)                  |
| `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.6-flash` | 0,75 / 3,75; từ 01/01/2027 là 1,50 / 7,50 | như trên                                                                        |
| `gemini-3.5-flash`                                         | 1,50 / 9,00                               | như trên                                                                        |
| `gemini-3.1-flash-lite`                                    | 0,25 / 1,50                               | như trên                                                                        |
| `gemini-3.1-pro-preview`                                   | 2,00 / 12,00 (prompt tới 200k token)      | như trên                                                                        |
| `gpt-6.1-sol`                                              | 2 / 10                                    | [developers.openai.com](https://developers.openai.com/api/docs/pricing)         |
| `gpt-6-astra`                                              | 10 / 50                                   | như trên                                                                        |
| `gpt-6-luna`                                               | 0,10 / 0,50                               | như trên                                                                        |
| `claude-opus-5-5`                                          | 4 / 20                                    | [platform.claude.com](https://platform.claude.com/docs/en/about-claude/pricing) |
| `claude-fable-5-1`                                         | 10 / 50                                   | như trên                                                                        |
| `claude-sonnet-5-5`                                        | 2 / 10                                    | như trên                                                                        |
| `claude-haiku-4-5`                                         | 1 / 5                                     | như trên                                                                        |

Con số tiền là **ước tính**, không phải hoá đơn:

- Khoá Gemini gói miễn phí không mất tiền, nhưng trang vẫn tính theo giá gói trả tiền.
- Lượt gọi bị cắt vì hết giờ không trả về số token, nên được đếm là một lượt lỗi với 0 token dù nhà cung cấp có thể vẫn tính tiền.
- Token suy luận của Gemini được cộng vào token ra, đúng như cách Google tính tiền. Với OpenAI, trang giá không nói rõ token suy luận tính thế nào; ở đây lấy nguyên `completion_tokens` mà API báo về.
- Model không có trong bảng giá hiện "Chưa có giá" và không được cộng vào tổng.
- Giá theo bậc prompt dài (trên 200k token của Gemini Pro) và giá cache không được tính.

## Model gợi ý

Ô Model không bắt người dùng nhớ mã model. Danh mục nằm ở `apps/dashboard/src/features/admin/components/ai-model-catalog.ts`, lấy từ tài liệu chính thức ngày 07/10/2026:

| Nhà cung cấp | Mặc định (theo thứ tự)                          | Mạnh nhất, chọn tay      | Nguồn                                                                                   |
| ------------ | ----------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| Gemini       | `gemini-3.5-flash-lite`, rồi `gemini-3.8-flash` | `gemini-3.1-pro-preview` | [ai.google.dev](https://ai.google.dev/gemini-api/docs/models)                           |
| ChatGPT      | `gpt-6.1-sol`                                   | `gpt-6-astra`            | [developers.openai.com](https://developers.openai.com/api/docs/models)                  |
| Claude       | `claude-opus-5-5`                               | `claude-fable-5-1`       | [platform.claude.com](https://platform.claude.com/docs/en/about-claude/models/overview) |

Mặc định là model mạnh nhất **mà vẫn kịp giới hạn 22 giây**, không phải model đắt nhất. Bậc cao nhất của mỗi bên (`gpt-6-astra`, `claude-fable-5-1` ở $10 / $50 mỗi triệu token, `gemini-3.1-pro-preview`) vẫn nằm trong danh sách với nhãn "Mạnh nhất" để chọn tay.

Riêng Gemini xếp `gemini-3.5-flash-lite` lên đầu vì đó là thứ tự `ai.models` đã đo từ trước, và vì lần kiểm tra bằng khoá thật ngày 07/10/2026 với `gemini-3.8-flash` hết 20 giây mà chưa có câu trả lời.

Danh mục là dữ liệu tĩnh nên sẽ cũ dần. Khi đã có khoá, ô Model còn liệt kê mọi model mà khoá đó dùng được, lấy trực tiếp từ nhà cung cấp. Ô Model chỉ nhận model trong hai danh sách này, không gõ mã tự do.

Model treo thì **không** chuyển sang model dự phòng: `tryModels` chỉ đi tiếp khi model trước trả lỗi, còn hết giờ thì cả lượt dừng. Vì vậy model đầu danh sách phải là model nhanh.

## Cần biết

| Việc                                    | Ghi chú                                                                                                                                                                                                                                                                                             |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Đường thành công mới kiểm với OpenAI    | Ngày 07/10/2026 một khoá OpenAI thật lưu từ trang này đã qua lần gọi thử với `gpt-6.1-sol`, trả lời sau khoảng 2,3 giây. Gemini: khoá thật qua bước xác thực nhưng `gemini-3.8-flash` đang quá tải. Claude: mới kiểm lỗi xác thực với API thật, còn câu trả lời thành công chỉ qua test giả lập SDK |
| Ngân sách 22 giây của luận giải         | Model suy luận chậm có thể hết giờ trước khi trả lời. Chọn model nhanh làm model chính và xem con số ms ở lần kiểm tra                                                                                                                                                                              |
| Không ai mở trang thì không ai kiểm tra | Thanh theo dõi chạy trong trình duyệt. Muốn canh cả khi đóng trang thì thêm job theo [11-worker-and-cron.md](11-worker-and-cron.md) và báo qua kênh của [12-deploy-notifications.md](12-deploy-notifications.md)                                                                                    |
| Mở trang là tốn token                   | Mỗi phút một lời gọi nhỏ (`ping`, trả `{"ok": true}`) tới model đầu danh sách. Tắt công tắc cạnh thanh theo dõi nếu không cần                                                                                                                                                                       |
| Sentry có thể giữ body request          | Khi một request lỗi, Sentry có thể đính kèm body, mà body của `saveAiProvider`, `testAiProvider` và `aiProviderModels` có thể chứa khoá. Phía mình chưa có `beforeSend` nào che trường `apiKey`; hiện chỉ trông vào bộ lọc dữ liệu nhạy cảm của Sentry, chưa kiểm chứng                             |
| Đổi `SECRET_KEY` là mất khoá đã lưu     | Khoá không giải mã được sẽ bị coi như chưa có, log ghi rõ, và phải nhập lại                                                                                                                                                                                                                         |
| Nhiều tiến trình backend                | Cache nằm trong từng tiến trình, nên tiến trình khác thấy thay đổi chậm tối đa 30 giây                                                                                                                                                                                                              |
| Nhật ký thao tác                        | Lưu, xoá khoá và đổi nhà cung cấp chưa ghi vào `activity_log`                                                                                                                                                                                                                                       |
