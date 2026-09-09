import type { AiRequest, AiResult } from './ai.types';

/**
 * Ranh giới giữa nghiệp vụ và nhà cung cấp mô hình. Tầng luận giải chỉ biết tới interface này: đổi
 * nhà cung cấp thì chỉ đụng thư mục `ai/`, và test tầng luận giải chạy được mà không cần mạng.
 *
 * Khai báo dạng abstract class chứ không phải interface vì Nest cần một giá trị thật làm token DI.
 */
export abstract class AiClient {
  abstract generate(request: AiRequest): Promise<AiResult>;
}
