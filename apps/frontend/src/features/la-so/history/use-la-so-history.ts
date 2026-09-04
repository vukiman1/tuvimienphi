import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BirthInput, LaSoHistoryEntry } from '@org/shared-contracts';
import { laSoHistoryService } from '@/services/la-so-history-service';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import { removeEntry, upsertEntry } from './entry-list';
import {
  readLocalHistory,
  recordLocalHistory,
  removeLocalHistory,
  replaceLocalHistory,
} from './local-history-store';

/**
 * The one door every screen uses to reach the chart history, whoever is looking. Signed in, the
 * server owns the list and the browser copy trails it; signed out, the browser copy is the list.
 * Callers see neither case.
 *
 * Reading and recording are separate hooks on purpose: the chart page only records, and pulling the
 * whole list on every chart view would be a request nobody reads.
 */

export function laSoHistoryQueryKey(isAuthenticated: boolean) {
  return ['la-so-history', isAuthenticated] as const;
}

/**
 * A history that will not load is not worth interrupting anyone over — the page it decorates works
 * regardless. The last mirrored copy is served instead, and the failure goes to the console.
 */
async function fetchHistory(isAuthenticated: boolean): Promise<LaSoHistoryEntry[]> {
  if (!isAuthenticated) {
    return readLocalHistory();
  }
  try {
    const { entries } = await laSoHistoryService.list();
    replaceLocalHistory(entries);
    return entries;
  } catch (error) {
    console.error('Không tải được lịch sử lá số từ máy chủ, dùng bản lưu trên máy', error);
    return readLocalHistory();
  }
}

export interface LaSoHistory {
  entries: LaSoHistoryEntry[];
  isLoading: boolean;
  remove: (birthKey: string) => void;
}

export function useLaSoHistory(): LaSoHistory {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const queryClient = useQueryClient();
  const queryKey = laSoHistoryQueryKey(isAuthenticated);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchHistory(isAuthenticated),
    staleTime: Infinity,
  });

  const removeMutation = useMutation({
    mutationFn: async (birthKey: string) => {
      if (isAuthenticated) {
        await laSoHistoryService.remove(birthKey);
      }
      return removeLocalHistory(birthKey);
    },
    // Only ever trims a list that is already there. Signing out clears the whole cache — and an
    // anonymous page load does that too, since /auth/me and the refresh behind it both answer 401 —
    // so treating a cold cache as "no history" would blank the list instead of dropping one entry.
    onMutate: (birthKey) => {
      queryClient.setQueryData<LaSoHistoryEntry[]>(queryKey, (entries) =>
        entries ? removeEntry(entries, birthKey) : entries,
      );
    },
    onSuccess: (entries) => {
      queryClient.setQueryData(queryKey, entries);
    },
    onError: (error) => {
      console.error('Không xoá được lá số khỏi lịch sử', error);
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    entries: query.data ?? [],
    isLoading: query.isPending,
    remove: removeMutation.mutate,
  };
}

export function useRecordLaSoHistory(): (input: BirthInput) => void {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const queryClient = useQueryClient();
  const queryKey = laSoHistoryQueryKey(isAuthenticated);

  const mutation = useMutation({
    mutationFn: async (input: BirthInput) => {
      if (!isAuthenticated) {
        return recordLocalHistory(input);
      }
      const { entry } = await laSoHistoryService.record(input);
      // The live list first: the mirror only catches up when a fetch succeeds, so it can be behind.
      const known = queryClient.getQueryData<LaSoHistoryEntry[]>(queryKey) ?? readLocalHistory();
      return upsertEntry(known, entry);
    },
    onSuccess: (entries) => {
      queryClient.setQueryData(queryKey, entries);
      replaceLocalHistory(entries);
    },
    onError: (error) => {
      console.error('Không lưu được lá số vào lịch sử', error);
    },
  });

  return mutation.mutate;
}
