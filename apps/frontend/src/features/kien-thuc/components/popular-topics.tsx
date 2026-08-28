import { memo } from 'react';
import { Eye, Flame } from 'lucide-react';
import { HOT_TOPICS } from '@/features/kien-thuc/kien-thuc-data';
import { Panel, PanelHeading } from '@/features/kien-thuc/components/panel';

/** Sidebar list of the most-read topics, each with a flame marker and its view count. */
export const PopularTopics = memo(function PopularTopics() {
  return (
    <Panel>
      <PanelHeading>Chủ đề được quan tâm</PanelHeading>
      <ul className="flex flex-col">
        {HOT_TOPICS.map((topic) => (
          <li key={topic.title}>
            <button
              type="button"
              className="flex w-full items-center gap-3 border-b border-[#efe6d4] py-2.5 text-left last:border-0"
            >
              <Flame className="size-4 shrink-0 text-[#9e2b1e]" />
              <span className="flex-1 text-[14px] text-[#4c4030] transition-colors hover:text-[#9e2b1e]">
                {topic.title}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-[#a08a6a]">
                <Eye className="size-3" />
                {topic.views}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
});
