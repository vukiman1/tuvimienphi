export interface AiMessage {
  readonly role: 'user' | 'model';
  readonly text: string;
}

/** Tập con JSON Schema đủ cho các câu trả lời có hình dạng cố định mà tầng luận giải cần. */
export interface AiSchema {
  readonly type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  readonly properties?: Readonly<Record<string, AiSchema>>;
  readonly items?: AiSchema;
  readonly required?: readonly string[];
  readonly description?: string;
}

export interface AiRequest {
  readonly system: string;
  /** Lượt đầu là brief; các lượt sau là bản sinh trước cộng danh sách lỗi bộ kiểm trả về. */
  readonly messages: readonly AiMessage[];
  readonly schema: AiSchema;
  /** Cắt lời gọi khi hết ngân sách thời gian. Bên gọi sinh đồng bộ trong request nên phải có trần. */
  readonly signal?: AbortSignal;
}

export interface AiResult {
  readonly text: string;
  /** Model nào thực sự trả lời — danh sách có fallback nên không đoán trước được. */
  readonly model: string;
  readonly outputTokens: number;
}
