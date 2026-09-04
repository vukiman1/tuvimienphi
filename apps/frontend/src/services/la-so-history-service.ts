import { httpRequest } from '@/lib/http-request';
import type {
  BirthInput,
  DeleteLaSoHistoryResponse,
  LaSoHistoryListResponse,
  RecordLaSoHistoryResponse,
  SyncLaSoHistoryEntry,
} from '@org/shared-contracts';

const HISTORY_PATH = '/la-so/history';

export const laSoHistoryService = {
  list() {
    return httpRequest.get<LaSoHistoryListResponse>(HISTORY_PATH);
  },
  record(input: BirthInput) {
    return httpRequest.post<RecordLaSoHistoryResponse>(HISTORY_PATH, input);
  },
  /** Sent once per sign-in: hands the server the local entries and gets the merged list back. */
  sync(entries: SyncLaSoHistoryEntry[]) {
    return httpRequest.post<LaSoHistoryListResponse>(`${HISTORY_PATH}/sync`, { entries });
  },
  remove(birthKey: string) {
    return httpRequest.delete<DeleteLaSoHistoryResponse>(
      `${HISTORY_PATH}/${encodeURIComponent(birthKey)}`,
    );
  },
};

export default laSoHistoryService;
