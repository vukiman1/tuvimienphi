import {
  type ReactElement,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import type { ChapterTone } from './chapter-tone';
import { chapterIndexAt } from './motion/active-chapter';

export interface ChapterSummary {
  readonly id: string;
  readonly label: string;
  readonly tone: ChapterTone;
}

export interface RegisteredChapter extends ChapterSummary {
  readonly element: HTMLElement;
}

export type ChapterAnchor = (viewportHeight: number) => number;

export const VIEWPORT_CENTRE: ChapterAnchor = (viewportHeight) => viewportHeight / 2;

interface StoryContextValue {
  readonly chapters: readonly RegisteredChapter[];
  readonly register: (chapter: RegisteredChapter) => () => void;
}

const NO_CHAPTERS: readonly RegisteredChapter[] = [];

const StoryContext = createContext<StoryContextValue | null>(null);

function byDocumentOrder(first: RegisteredChapter, second: RegisteredChapter): number {
  return first.element.compareDocumentPosition(second.element) & Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

function summarise({ id, label, tone }: RegisteredChapter): ChapterSummary {
  return { id, label, tone };
}

export function StoryProvider({ children }: { readonly children: ReactNode }): ReactElement {
  const [chapters, setChapters] = useState<readonly RegisteredChapter[]>(NO_CHAPTERS);

  const register = useCallback((chapter: RegisteredChapter): (() => void) => {
    setChapters((current) => [...current, chapter].sort(byDocumentOrder));
    return () => setChapters((current) => current.filter((entry) => entry !== chapter));
  }, []);

  const value = useMemo<StoryContextValue>(() => ({ chapters, register }), [chapters, register]);

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
}

export function useStoryRegistration(): StoryContextValue['register'] | null {
  return useContext(StoryContext)?.register ?? null;
}

export function useStoryChapters(): readonly ChapterSummary[] {
  const chapters = useContext(StoryContext)?.chapters ?? NO_CHAPTERS;
  return useMemo(() => chapters.map(summarise), [chapters]);
}

export function useChapterAt(anchor: ChapterAnchor): ChapterSummary | null {
  const chapters = useContext(StoryContext)?.chapters ?? NO_CHAPTERS;
  const [activeId, setActiveId] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (chapters.length === 0) {
      return;
    }
    let frame = 0;
    const measure = (): void => {
      frame = 0;
      const bounds = chapters.map(({ element }) => element.getBoundingClientRect());
      const index = chapterIndexAt(bounds, anchor(window.innerHeight));
      setActiveId(index === null ? null : chapters[index].id);
    };
    const schedule = (): void => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [chapters, anchor]);

  const active = chapters.find((chapter) => chapter.id === activeId);
  return active === undefined ? null : summarise(active);
}
