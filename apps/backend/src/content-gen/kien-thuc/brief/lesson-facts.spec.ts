import { LUU_TINH_NAMES } from '@org/shared-tu-vi';
import { KIEN_THUC_LESSONS, type PlannedLesson } from '@org/shared-kien-thuc';
import { checkWording } from '../validate/check-wording';
import { lessonFactLines, thanCungCandidates } from './lesson-facts';
import { LESSON_OUTLINES } from './lesson-outlines';

function lesson(slug: string): PlannedLesson {
  const found = KIEN_THUC_LESSONS.find((item) => item.slug === slug);
  if (found === undefined) throw new Error(`no lesson ${slug}`);
  return found;
}

describe('lesson facts', () => {
  it('lists the six palaces Thân can sit in', () => {
    expect(thanCungCandidates()).toEqual([
      'Mệnh',
      'Phúc Đức',
      'Quan Lộc',
      'Thiên Di',
      'Tài Bạch',
      'Phu Thê',
    ]);
  });

  it('gives every planned lesson an outline', () => {
    expect(Object.keys(LESSON_OUTLINES).sort()).toEqual(
      KIEN_THUC_LESSONS.map((item) => item.slug).sort(),
    );
    for (const outline of Object.values(LESSON_OUTLINES)) {
      expect(outline.mustCover.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('writes the sinh cycle in new-style spelling', () => {
    const body = {
      summary: 'x',
      sections: [
        { heading: 'Ngũ hành', paragraphs: lessonFactLines(lesson('am-duong-ngu-hanh-co-ban')) },
      ],
    };
    expect(checkWording(body).some((v) => v.includes('kiểu cũ'))).toBe(false);
  });

  it('gives tiểu vận and Thái Tuế engine facts', () => {
    const tieuVan = lessonFactLines(lesson('tieu-van-hang-nam'));
    expect(tieuVan.filter((line) => line.includes('tiểu hạn')).length).toBeGreaterThanOrEqual(4);

    const thaiTue = lessonFactLines(lesson('sao-thai-tue')).join(' ');
    for (const name of LUU_TINH_NAMES) {
      expect(thaiTue).toContain(name);
    }
  });

  it('describes the centre of the board the site actually draws', () => {
    const centre = lessonFactLines(lesson('la-so-tu-vi-gom-nhung-gi')).join(' ');
    for (const label of [
      'Âm dương',
      'Bản mệnh',
      'Cân lượng',
      'Chủ mệnh',
      'Chủ thân',
      'Lai nhân cung',
    ]) {
      expect(centre).toContain(label);
    }
    expect(centre).not.toContain('tuổi khởi đại vận');
    expect(centre).not.toContain('Mệnh chủ');
  });

  it('says a chart needs the lunar birth time and the gender', () => {
    const outline = LESSON_OUTLINES['tu-vi-la-gi'].mustCover.join(' ');
    expect(outline).toContain('giờ, ngày, tháng, năm sinh');
    expect(outline).toContain('giới tính');
    expect(outline).not.toContain('Lá số được lập từ ngày và giờ sinh.');
  });

  it('grounds âm dương and the hành of a cung in engine facts', () => {
    const facts = lessonFactLines(lesson('am-duong-ngu-hanh-co-ban')).join(' ');
    expect(facts).toContain('Tý Thủy');
    expect(facts).toContain('Dần Mộc');
    expect(facts).toContain('Dương Nam');
    expect(facts).toContain('Âm Nữ');
    expect(facts).toContain('thuận');
    expect(facts).toContain('nghịch');
  });

  it('keeps vô chính diệu a link in lesson 2.3', () => {
    expect(LESSON_OUTLINES['tam-hop-xung-chieu'].mustCover.join(' ')).toContain(
      'thuat-ngu/vo-chinh-dieu',
    );
  });
});
