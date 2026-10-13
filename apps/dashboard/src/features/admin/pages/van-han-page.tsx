import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { Alert, App, Flex, Select, Skeleton, Table, Typography } from 'antd';
import { rejectionReason } from '@/lib/graphql-request';
import { VanHanPublicationBar } from '../components/van-han-publication-bar';
import { buildVanHanColumns } from '../components/van-han-table-columns';
import { defaultYear, yearChoiceLabel, yearChoices } from '../components/van-han-year-model';
import {
  VAN_HAN_QUERY_KEY,
  publishVanHanYear,
  unpublishVanHanYear,
  vanHanYearQuery,
  vanHanYearsQuery,
  type VanHanSlotRow,
} from '../data/admin-van-han.query';

const LOAD_FAILED = 'Không tải được nội dung vận hạn.';
const PUBLISH_FAILED = 'Không xuất bản được.';
const UNPUBLISH_FAILED = 'Không gỡ xuất bản được.';
const YEAR_SELECT_WIDTH = 240;

type PublicationChange = 'PUBLISH' | 'UNPUBLISH';

const route = getRouteApi('/van-han');

export function VanHanPage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const currentYear = new Date().getFullYear();

  const years = useQuery(vanHanYearsQuery());
  const summaries = years.data?.vanHanYears ?? [];
  const year = search.year ?? defaultYear(summaries, currentYear);
  const isYearKnown = search.year !== undefined || !years.isPending;
  const selected = useQuery({ ...vanHanYearQuery(year), enabled: isYearKnown });
  const view = selected.data?.vanHanYear;

  const publication = useMutation({
    mutationFn: async (change: PublicationChange): Promise<void> => {
      await (change === 'PUBLISH' ? publishVanHanYear(year) : unpublishVanHanYear(year));
    },
    onSuccess: (_result, change) => {
      void message.success(
        change === 'PUBLISH' ? `Đã xuất bản năm ${year}.` : `Đã gỡ xuất bản năm ${year}.`,
      );
      return queryClient.invalidateQueries({ queryKey: VAN_HAN_QUERY_KEY });
    },
    onError: (error, change) => {
      const fallback = change === 'PUBLISH' ? PUBLISH_FAILED : UNPUBLISH_FAILED;
      void message.error(rejectionReason(error) ?? fallback);
    },
  });

  return (
    <Flex vertical gap={16}>
      <Flex align="center" justify="space-between" gap={16} wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Vận hạn
        </Typography.Title>
        <Select
          aria-label="Chọn năm"
          style={{ width: YEAR_SELECT_WIDTH }}
          value={year}
          loading={years.isPending}
          options={yearChoices(summaries, year, currentYear).map((choice) => ({
            value: choice,
            label: yearChoiceLabel(choice, summaries),
          }))}
          onChange={(next) => void navigate({ search: { year: next } })}
        />
      </Flex>

      {years.isError || selected.isError ? (
        <Alert type="error" showIcon title={LOAD_FAILED} />
      ) : null}

      {view ? (
        <VanHanPublicationBar
          view={view}
          isChanging={publication.isPending}
          onPublish={() => publication.mutate('PUBLISH')}
          onUnpublish={() => publication.mutate('UNPUBLISH')}
        />
      ) : null}

      {selected.isPending && !selected.isError ? (
        <Skeleton active />
      ) : (
        <Table<VanHanSlotRow>
          rowKey="zodiacOrder"
          columns={buildVanHanColumns(year)}
          dataSource={view?.slots}
          loading={selected.isFetching}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      )}
    </Flex>
  );
}
