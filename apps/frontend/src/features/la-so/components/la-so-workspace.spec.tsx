import { useState, type ReactElement } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CungName } from '@org/shared-tu-vi';
import { CalendarType, Gender, type BirthInput } from '@/features/la-so/birth-input';
import { ringNeighbour } from '@/features/la-so/board-navigation';
import { cungNameOf } from '@/features/la-so/cung-slug';
import { toChartView } from '@/features/la-so/to-chart-view';
import { DESKTOP_WORKSPACE_QUERY } from './la-so-workspace.constants';
import { LaSoWorkspace } from './la-so-workspace';

const BIRTH: BirthInput = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
};
const VIEW_YEAR = 2026;
const CHART = toChartView({ ...BIRTH, viewYear: VIEW_YEAR });
const ORIGINAL_MATCH_MEDIA = window.matchMedia;
const QUAN_LOC_CHAPTER = '03';

interface MediaQueryStub {
  readonly setMatches: (matches: boolean) => void;
}

interface WorkspaceSpies {
  readonly onSelect: jest.Mock<void, [number]>;
  readonly onReadChapter: jest.Mock<void, [string]>;
}

class StubMediaQueryList extends EventTarget implements MediaQueryList {
  readonly onchange = null;

  constructor(
    readonly media: string,
    public matches: boolean,
  ) {
    super();
  }

  addListener(): void {
    return undefined;
  }

  removeListener(): void {
    return undefined;
  }
}

function stubDesktop(initialMatches: boolean): MediaQueryStub {
  const watched = new StubMediaQueryList(DESKTOP_WORKSPACE_QUERY, initialMatches);
  window.matchMedia = (query: string): MediaQueryList =>
    query === DESKTOP_WORKSPACE_QUERY ? watched : new StubMediaQueryList(query, false);
  return {
    setMatches: (matches) => {
      watched.matches = matches;
      watched.dispatchEvent(new Event('change'));
    },
  };
}

function indexOfCung(name: CungName): number {
  return CHART.cungs.findIndex((cung) => cungNameOf(cung) === name);
}

function WorkspaceHarness({ onSelect, onReadChapter }: WorkspaceSpies): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(indexOfCung('Mệnh'));
  return (
    <LaSoWorkspace
      birth={BIRTH}
      chart={CHART}
      onReadChapter={onReadChapter}
      onSelect={(index) => {
        onSelect(index);
        setSelectedIndex(index);
      }}
      selectedIndex={selectedIndex}
      viewYear={VIEW_YEAR}
    />
  );
}

function renderWorkspace(): WorkspaceSpies {
  const spies: WorkspaceSpies = { onSelect: jest.fn(), onReadChapter: jest.fn() };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <WorkspaceHarness {...spies} />
    </QueryClientProvider>,
  );
  return spies;
}

function cungButton(name: CungName): HTMLElement {
  return screen.getByRole('button', { name: new RegExp(`^Cung ${name}$`, 'i') });
}

afterEach(() => {
  window.matchMedia = ORIGINAL_MATCH_MEDIA;
});

describe('LaSoWorkspace', () => {
  it('shows the panel beside the board on desktop', () => {
    stubDesktop(true);
    renderWorkspace();

    expect(screen.getByRole('heading', { level: 2, name: /^Cung Mệnh/ })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens the sheet only after a tap below desktop', () => {
    stubDesktop(false);
    renderWorkspace();

    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(cungButton('Quan Lộc'));

    expect(screen.getByRole('dialog', { name: 'Cung Quan Lộc' })).toBeTruthy();
  });

  it('steps to the next cung in the sheet', () => {
    stubDesktop(false);
    const { onSelect } = renderWorkspace();
    const quanLoc = indexOfCung('Quan Lộc');
    const next = ringNeighbour(quanLoc, 1);
    fireEvent.click(cungButton('Quan Lộc'));

    fireEvent.click(screen.getByRole('button', { name: 'Cung sau' }));

    expect(onSelect).toHaveBeenLastCalledWith(next);
    expect(
      screen.getByRole('dialog', { name: `Cung ${cungNameOf(CHART.cungs[next])}` }),
    ).toBeTruthy();
  });

  it('steps to the previous cung in the sheet', () => {
    stubDesktop(false);
    const { onSelect } = renderWorkspace();
    const previous = ringNeighbour(indexOfCung('Quan Lộc'), -1);
    fireEvent.click(cungButton('Quan Lộc'));

    fireEvent.click(screen.getByRole('button', { name: 'Cung trước' }));

    expect(onSelect).toHaveBeenLastCalledWith(previous);
    expect(
      screen.getByRole('dialog', { name: `Cung ${cungNameOf(CHART.cungs[previous])}` }),
    ).toBeTruthy();
  });

  it('returns focus to the cung after closing', async () => {
    stubDesktop(false);
    renderWorkspace();
    fireEvent.click(cungButton('Quan Lộc'));

    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));

    await waitFor(() => expect(document.activeElement).toBe(cungButton('Quan Lộc')));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes the sheet when the screen grows to desktop', () => {
    const media = stubDesktop(false);
    renderWorkspace();
    fireEvent.click(cungButton('Quan Lộc'));

    act(() => media.setMatches(true));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: /^Cung Quan Lộc/ })).toBeTruthy();
  });

  it('keeps the sheet closed when the screen shrinks back', () => {
    const media = stubDesktop(false);
    renderWorkspace();
    fireEvent.click(cungButton('Quan Lộc'));
    act(() => media.setMatches(true));

    act(() => media.setMatches(false));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes the sheet before handing over the chapter to read', async () => {
    stubDesktop(false);
    const { onReadChapter } = renderWorkspace();
    fireEvent.click(cungButton('Quan Lộc'));

    fireEvent.click(
      screen.getByRole('button', { name: 'Đọc luận giải chương Công danh Sự nghiệp' }),
    );

    await waitFor(() => expect(onReadChapter).toHaveBeenCalledWith(QUAN_LOC_CHAPTER));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).not.toBe(cungButton('Quan Lộc'));
  });
});
