import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BirthForm } from './birth-form';
import { CalendarType, Gender } from '@/features/la-so/birth-input';

const mockNavigate = jest.fn();

jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const TET_VIEW_YEAR = 2027;

function selectOption(label: string, value: string): void {
  fireEvent.change(screen.getByRole('combobox', { name: label }), { target: { value } });
}

function fillBirthDetails(): void {
  selectOption('Ngày sinh', '15');
  selectOption('Tháng sinh', '6');
  selectOption('Năm sinh', '1990');
  selectOption('Giờ sinh', 'Tý');
}

function genderSelect(): HTMLSelectElement {
  return screen.getByRole('combobox', { name: 'Giới tính' });
}

function yearSelect(): HTMLSelectElement {
  return screen.getByRole('combobox', { name: 'Năm sinh' });
}

describe('BirthForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockNavigate.mockResolvedValue(undefined);
  });

  it('starts on the gender it was given and leaves the year empty', () => {
    render(<BirthForm initialGender={Gender.Female} />);

    expect(genderSelect().value).toBe(Gender.Female);
    expect(yearSelect().value).toBe('');
  });

  it('starts with no gender chosen when none was given', () => {
    render(<BirthForm />);

    expect(genderSelect().value).toBe('');
  });

  it('opens the chart on the view year it was given', async () => {
    render(<BirthForm initialGender={Gender.Male} viewYear={TET_VIEW_YEAR} />);
    fillBirthDetails();

    fireEvent.click(screen.getByRole('button', { name: 'Lập lá số của tôi' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/la-so/detail',
      search: expect.objectContaining({
        viewYear: TET_VIEW_YEAR,
        gender: Gender.Male,
        year: 1990,
        calendar: CalendarType.Solar,
      }),
    });
  });

  it('shows a visible label above every field', () => {
    render(<BirthForm />);

    for (const label of [
      'Họ & Tên',
      'Ngày sinh',
      'Tháng sinh',
      'Năm sinh',
      'Giờ sinh',
      'Giới tính',
    ]) {
      expect(screen.getByText(label).className).not.toMatch(/(^|\s)sr-only(\s|$)/);
    }
  });

  it('offers solar and lunar as two choices, solar first and chosen', () => {
    render(<BirthForm />);

    expect(
      screen.getAllByRole('radio').map((choice) => choice.closest('label')?.textContent),
    ).toEqual(['Dương lịch', 'Âm lịch']);
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Dương lịch' }).checked).toBe(true);
  });

  it('opens the chart on the lunar calendar once lunar is chosen', async () => {
    render(<BirthForm initialGender={Gender.Male} />);
    fillBirthDetails();

    fireEvent.click(screen.getByRole('radio', { name: 'Âm lịch' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lập lá số của tôi' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    expect(mockNavigate.mock.calls[0][0].search).toEqual(
      expect.objectContaining({ calendar: CalendarType.Lunar }),
    );
  });

  it('opens the chart without a view year when none was given', async () => {
    render(<BirthForm initialGender={Gender.Male} />);
    fillBirthDetails();

    fireEvent.click(screen.getByRole('button', { name: 'Lập lá số của tôi' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    expect(mockNavigate.mock.calls[0][0].search).not.toHaveProperty('viewYear');
  });
});
