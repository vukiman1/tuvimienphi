import { useState, type ReactElement } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CungName } from '@org/shared-tu-vi';
import { ringNeighbour } from '@/features/la-so/board-navigation';
import {
  SAMPLE_BIRTH,
  SAMPLE_CHART,
  SAMPLE_VIEW_YEAR,
  indexOfCung,
} from '@/test-utils/sample-chart';
import { restoreMatchMedia, stubMatchMedia } from '@/test-utils/stub-match-media';
import { DESKTOP_WORKSPACE_QUERY } from './la-so-workspace.constants';
import { LaSoWorkspace } from './la-so-workspace';

const QUAN_LOC_CHAPTER = '03';
const SCROLLED_OFFSET = 200;

interface WorkspaceSpies {
  readonly onSelect: jest.Mock<void, [number]>;
  readonly onReadChapter: jest.Mock<void, [string]>;
}

function WorkspaceHarness({ onSelect, onReadChapter }: WorkspaceSpies): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(indexOfCung('Mệnh'));
  return (
    <LaSoWorkspace
      birth={SAMPLE_BIRTH}
      chart={SAMPLE_CHART}
      onReadChapter={onReadChapter}
      onSelect={(index) => {
        onSelect(index);
        setSelectedIndex(index);
      }}
      selectedIndex={selectedIndex}
      viewYear={SAMPLE_VIEW_YEAR}
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
  restoreMatchMedia();
});

describe('LaSoWorkspace', () => {
  it('shows the panel beside the board on desktop', () => {
    stubMatchMedia([DESKTOP_WORKSPACE_QUERY]);
    renderWorkspace();

    expect(screen.getByRole('heading', { level: 2, name: /^Cung Mệnh/ })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens the newly picked cung at the top of the side panel', () => {
    stubMatchMedia([DESKTOP_WORKSPACE_QUERY]);
    renderWorkspace();
    const panel = screen
      .getByRole('heading', { level: 2, name: /^Cung Mệnh/ })
      .closest<HTMLElement>('.overflow-y-auto');
    if (panel === null) throw new Error('the side panel does not scroll');
    Object.defineProperty(panel, 'scrollTop', { value: SCROLLED_OFFSET, writable: true });

    fireEvent.click(cungButton('Tài Bạch'));

    expect(panel.scrollTop).toBe(0);
  });

  it('opens the sheet only after a tap below desktop', () => {
    stubMatchMedia([]);
    renderWorkspace();

    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(cungButton('Quan Lộc'));

    expect(screen.getByRole('dialog', { name: 'Cung Quan Lộc' })).toBeTruthy();
  });

  it('steps to the next cung in the sheet', () => {
    stubMatchMedia([]);
    const { onSelect } = renderWorkspace();
    const quanLoc = indexOfCung('Quan Lộc');
    const next = ringNeighbour(quanLoc, 1);
    fireEvent.click(cungButton('Quan Lộc'));

    fireEvent.click(screen.getByRole('button', { name: 'Cung sau' }));

    expect(onSelect).toHaveBeenLastCalledWith(next);
    expect(
      screen.getByRole('dialog', { name: `Cung ${SAMPLE_CHART.cungs[next].cungName}` }),
    ).toBeTruthy();
  });

  it('steps to the previous cung in the sheet', () => {
    stubMatchMedia([]);
    const { onSelect } = renderWorkspace();
    const previous = ringNeighbour(indexOfCung('Quan Lộc'), -1);
    fireEvent.click(cungButton('Quan Lộc'));

    fireEvent.click(screen.getByRole('button', { name: 'Cung trước' }));

    expect(onSelect).toHaveBeenLastCalledWith(previous);
    expect(
      screen.getByRole('dialog', { name: `Cung ${SAMPLE_CHART.cungs[previous].cungName}` }),
    ).toBeTruthy();
  });

  it('returns focus to the cung after closing', async () => {
    stubMatchMedia([]);
    renderWorkspace();
    fireEvent.click(cungButton('Quan Lộc'));

    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));

    await waitFor(() => expect(document.activeElement).toBe(cungButton('Quan Lộc')));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes the sheet when the screen grows to desktop', () => {
    const media = stubMatchMedia([]);
    renderWorkspace();
    fireEvent.click(cungButton('Quan Lộc'));

    act(() => media.setMatches(DESKTOP_WORKSPACE_QUERY, true));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: /^Cung Quan Lộc/ })).toBeTruthy();
  });

  it('keeps the sheet closed when the screen shrinks back', () => {
    const media = stubMatchMedia([]);
    renderWorkspace();
    fireEvent.click(cungButton('Quan Lộc'));
    act(() => media.setMatches(DESKTOP_WORKSPACE_QUERY, true));

    act(() => media.setMatches(DESKTOP_WORKSPACE_QUERY, false));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('paints the night sky behind the workspace from tablet width up, lazily', () => {
    stubMatchMedia([DESKTOP_WORKSPACE_QUERY]);
    renderWorkspace();
    const painting = document.querySelector('img[src*="/la-so/board-night-"]');

    expect(painting?.parentElement?.classList.contains('bg-night')).toBe(true);
    expect(painting?.getAttribute('alt')).toBe('');
    expect(painting?.getAttribute('loading')).toBe('lazy');
    expect(painting?.getAttribute('fetchpriority')).toBe('low');
    expect(painting?.classList.contains('hidden')).toBe(true);
    expect(painting?.classList.contains('md:block')).toBe(true);
  });

  it('closes the sheet before handing over the chapter to read', async () => {
    stubMatchMedia([]);
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
