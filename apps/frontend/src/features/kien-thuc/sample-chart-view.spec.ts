import { CalendarType, Gender } from '@org/shared-contracts';
import { castSampleChart } from '@org/shared-kien-thuc';
import { sampleBirthInput, sampleChartCaption, sampleChartView } from './sample-chart-view';

describe('sample chart view', () => {
  it("casts the board from the lesson's sample birth", () => {
    expect(sampleBirthInput()).toEqual({
      day: 22,
      month: 3,
      year: 1987,
      calendar: CalendarType.Solar,
      hour: 'Thìn',
      gender: Gender.Male,
    });
  });

  it('places the same chính tinh as the chart the lesson was written from', () => {
    const view = sampleChartView();
    const natal = castSampleChart();

    expect(view.cungs).toHaveLength(natal.cungs.length);
    view.cungs.forEach((cung, index) => {
      expect(cung.chinhTinh.map((star) => star.starName)).toEqual(
        natal.cungs[index].chinhTinh.map((star) => star.name),
      );
    });
  });

  it('marks the same cung as Mệnh as the chart the lesson was written from', () => {
    const view = sampleChartView();
    const natal = castSampleChart();

    expect(view.cungs.findIndex((cung) => cung.isMenh)).toBe(
      natal.cungs.findIndex((cung) => cung.isMenh),
    );
  });

  it('shows no yearly or decade layer', () => {
    sampleChartView().cungs.forEach((cung) => {
      expect(cung.luuTinh).toEqual([]);
      expect(cung.daiVanTinh).toEqual([]);
      expect(cung.luuNien).toBe('');
      expect(cung.isTieuHan).toBe(false);
    });
  });

  it('captions the birth the board was cast from', () => {
    expect(sampleChartCaption()).toBe('Lá số mẫu: nam, sinh ngày 22/3/1987 dương lịch, giờ Thìn');
  });
});
