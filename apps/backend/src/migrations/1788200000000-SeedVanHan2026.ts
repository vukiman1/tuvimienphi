import { MigrationInterface, QueryRunner } from 'typeorm';

const YEAR = 2026;

interface SeedAspect {
  readonly aspect: string;
  readonly rating: number;
  readonly body: string;
}

interface SeedAgeReading {
  readonly birthYear: number;
  readonly canChi: string;
  readonly menh: string;
  readonly male: string;
  readonly female: string;
}

interface SeedEntry {
  readonly zodiac: string;
  readonly zodiacOrder: number;
  readonly title: string;
  readonly bornYears: readonly number[];
  readonly luuNien: string;
  readonly luanGiai: readonly SeedAspect[];
  readonly tungTuoi: readonly SeedAgeReading[];
}

const ENTRIES: readonly SeedEntry[] = [
  {
    zodiac: 'Tý',
    zodiacOrder: 1,
    title: 'Vận hạn tuổi Tý năm Bính Ngọ 2026',
    bornYears: [1972, 1984, 1996, 2008, 2020],
    luuNien:
      'Người tuổi Tý bước vào năm 2026 Bính Ngọ với vận trình nhiều chuyển biến, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.\nNăm nay, tuổi Tý nên chú trọng sức khỏe và tài chính; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.\nBiết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi Tý hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 2,
        body: 'Dòng tiền của tuổi Tý năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ. Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch. Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 4,
        body: 'Tuổi Tý cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức. Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ. Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 4,
        body: 'Công việc của tuổi Tý có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực. Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động. Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 2,
        body: 'Đường tình duyên của tuổi Tý rộng mở, người độc thân dễ gặp đối tượng phù hợp. Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận. Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1972,
        canChi: 'Nhâm Tý',
        menh: 'Tang Chá Mộc',
        male: 'Nam 54 tuổi có sao La Hầu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 54 tuổi có sao Kế Đô chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1984,
        canChi: 'Giáp Tý',
        menh: 'Hải Trung Kim',
        male: 'Nam 42 tuổi có sao Kế Đô chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 42 tuổi có sao Thái Dương chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1996,
        canChi: 'Bính Tý',
        menh: 'Giản Hạ Thủy',
        male: 'Nam 30 tuổi có sao Thái Bạch chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 30 tuổi có sao Thái Âm chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2008,
        canChi: 'Mậu Tý',
        menh: 'Tích Lịch Hỏa',
        male: 'Nam 18 tuổi có sao La Hầu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 18 tuổi có sao Kế Đô chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2020,
        canChi: 'Canh Tý',
        menh: 'Bích Thượng Thổ',
        male: 'Nam 6 tuổi có sao Kế Đô chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 6 tuổi có sao Thái Dương chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
    ],
  },
  {
    zodiac: 'Sửu',
    zodiacOrder: 2,
    title: 'Vận hạn tuổi Sửu năm Bính Ngọ 2026',
    bornYears: [1973, 1985, 1997, 2009, 2021],
    luuNien:
      'Người tuổi Sửu bước vào năm 2026 Bính Ngọ với vận trình khá vững vàng, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.\nNăm nay, tuổi Sửu nên chú trọng các mối quan hệ và công việc; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.\nBiết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi Sửu hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 3,
        body: 'Dòng tiền của tuổi Sửu năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ. Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch. Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 2,
        body: 'Tuổi Sửu cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức. Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ. Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 5,
        body: 'Công việc của tuổi Sửu có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực. Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động. Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 3,
        body: 'Đường tình duyên của tuổi Sửu rộng mở, người độc thân dễ gặp đối tượng phù hợp. Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận. Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1973,
        canChi: 'Quý Sửu',
        menh: 'Tang Chá Mộc',
        male: 'Nam 53 tuổi có sao Mộc Đức chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 53 tuổi có sao Thủy Diệu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1985,
        canChi: 'Ất Sửu',
        menh: 'Hải Trung Kim',
        male: 'Nam 41 tuổi có sao Vân Hớn chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 41 tuổi có sao La Hầu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1997,
        canChi: 'Đinh Sửu',
        menh: 'Giản Hạ Thủy',
        male: 'Nam 29 tuổi có sao Thủy Diệu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 29 tuổi có sao Mộc Đức chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2009,
        canChi: 'Kỷ Sửu',
        menh: 'Tích Lịch Hỏa',
        male: 'Nam 17 tuổi có sao Mộc Đức chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 17 tuổi có sao Thủy Diệu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2021,
        canChi: 'Tân Sửu',
        menh: 'Bích Thượng Thổ',
        male: 'Nam 5 tuổi có sao Vân Hớn chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 5 tuổi có sao La Hầu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
    ],
  },
  {
    zodiac: 'Dần',
    zodiacOrder: 3,
    title: 'Vận hạn tuổi Dần năm Bính Ngọ 2026',
    bornYears: [1974, 1986, 1998, 2010, 2022],
    luuNien:
      'Người tuổi Dần bước vào năm 2026 Bính Ngọ với vận trình lên xuống đan xen, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.\nNăm nay, tuổi Dần nên chú trọng kế hoạch dài hạn; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.\nBiết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi Dần hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 4,
        body: 'Dòng tiền của tuổi Dần năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ. Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch. Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 3,
        body: 'Tuổi Dần cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức. Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ. Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 3,
        body: 'Công việc của tuổi Dần có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực. Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động. Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 4,
        body: 'Đường tình duyên của tuổi Dần rộng mở, người độc thân dễ gặp đối tượng phù hợp. Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận. Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1974,
        canChi: 'Giáp Dần',
        menh: 'Đại Khê Thủy',
        male: 'Nam 52 tuổi có sao Thái Âm chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 52 tuổi có sao Thái Bạch chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1986,
        canChi: 'Bính Dần',
        menh: 'Lô Trung Hỏa',
        male: 'Nam 40 tuổi có sao Thái Dương chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 40 tuổi có sao Thổ Tú chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1998,
        canChi: 'Mậu Dần',
        menh: 'Thành Đầu Thổ',
        male: 'Nam 28 tuổi có sao Thổ Tú chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 28 tuổi có sao Vân Hớn chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2010,
        canChi: 'Canh Dần',
        menh: 'Tùng Bách Mộc',
        male: 'Nam 16 tuổi có sao Thái Âm chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 16 tuổi có sao Thái Bạch chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2022,
        canChi: 'Nhâm Dần',
        menh: 'Kim Bạc Kim',
        male: 'Nam 4 tuổi có sao Thái Dương chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 4 tuổi có sao Thổ Tú chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
    ],
  },
  {
    zodiac: 'Mão',
    zodiacOrder: 4,
    title: 'Vận hạn tuổi Mão năm Bính Ngọ 2026',
    bornYears: [1975, 1987, 1999, 2011, 2023],
    luuNien:
      'Người tuổi Mão bước vào năm 2026 Bính Ngọ với vận trình giàu cơ hội, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.\nNăm nay, tuổi Mão nên chú trọng việc tích lũy và đầu tư an toàn; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.\nBiết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi Mão hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 2,
        body: 'Dòng tiền của tuổi Mão năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ. Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch. Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 4,
        body: 'Tuổi Mão cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức. Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ. Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 4,
        body: 'Công việc của tuổi Mão có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực. Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động. Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 2,
        body: 'Đường tình duyên của tuổi Mão rộng mở, người độc thân dễ gặp đối tượng phù hợp. Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận. Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1975,
        canChi: 'Ất Mão',
        menh: 'Đại Khê Thủy',
        male: 'Nam 51 tuổi có sao Kế Đô chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 51 tuổi có sao Thái Dương chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1987,
        canChi: 'Đinh Mão',
        menh: 'Lô Trung Hỏa',
        male: 'Nam 39 tuổi có sao Thái Bạch chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 39 tuổi có sao Thái Âm chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1999,
        canChi: 'Kỷ Mão',
        menh: 'Thành Đầu Thổ',
        male: 'Nam 27 tuổi có sao La Hầu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 27 tuổi có sao Kế Đô chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2011,
        canChi: 'Tân Mão',
        menh: 'Tùng Bách Mộc',
        male: 'Nam 15 tuổi có sao Kế Đô chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 15 tuổi có sao Thái Dương chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2023,
        canChi: 'Quý Mão',
        menh: 'Kim Bạc Kim',
        male: 'Nam 3 tuổi có sao Thái Bạch chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 3 tuổi có sao Thái Âm chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
    ],
  },
  {
    zodiac: 'Thìn',
    zodiacOrder: 5,
    title: 'Vận hạn tuổi Thìn năm Bính Ngọ 2026',
    bornYears: [1976, 1988, 2000, 2012, 2024],
    luuNien:
      'Người tuổi Thìn bước vào năm 2026 Bính Ngọ với vận trình cần sự kiên định, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.\nNăm nay, tuổi Thìn nên chú trọng sự nghiệp và học hỏi; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.\nBiết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi Thìn hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 3,
        body: 'Dòng tiền của tuổi Thìn năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ. Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch. Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 2,
        body: 'Tuổi Thìn cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức. Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ. Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 5,
        body: 'Công việc của tuổi Thìn có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực. Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động. Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 3,
        body: 'Đường tình duyên của tuổi Thìn rộng mở, người độc thân dễ gặp đối tượng phù hợp. Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận. Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1976,
        canChi: 'Bính Thìn',
        menh: 'Sa Trung Thổ',
        male: 'Nam 50 tuổi có sao Vân Hớn chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 50 tuổi có sao La Hầu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1988,
        canChi: 'Mậu Thìn',
        menh: 'Đại Lâm Mộc',
        male: 'Nam 38 tuổi có sao Thủy Diệu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 38 tuổi có sao Mộc Đức chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2000,
        canChi: 'Canh Thìn',
        menh: 'Bạch Lạp Kim',
        male: 'Nam 26 tuổi có sao Mộc Đức chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 26 tuổi có sao Thủy Diệu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2012,
        canChi: 'Nhâm Thìn',
        menh: 'Trường Lưu Thủy',
        male: 'Nam 14 tuổi có sao Vân Hớn chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 14 tuổi có sao La Hầu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2024,
        canChi: 'Giáp Thìn',
        menh: 'Phú Đăng Hỏa',
        male: 'Nam 2 tuổi có sao Thủy Diệu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 2 tuổi có sao Mộc Đức chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
    ],
  },
  {
    zodiac: 'Tị',
    zodiacOrder: 6,
    title: 'Vận hạn tuổi Tị năm Bính Ngọ 2026',
    bornYears: [1977, 1989, 2001, 2013, 2025],
    luuNien:
      'Người tuổi Tị bước vào năm 2026 Bính Ngọ với vận trình hanh thông có điều kiện, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.\nNăm nay, tuổi Tị nên chú trọng cân bằng gia đình và công việc; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.\nBiết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi Tị hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 4,
        body: 'Dòng tiền của tuổi Tị năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ. Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch. Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 3,
        body: 'Tuổi Tị cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức. Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ. Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 3,
        body: 'Công việc của tuổi Tị có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực. Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động. Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 4,
        body: 'Đường tình duyên của tuổi Tị rộng mở, người độc thân dễ gặp đối tượng phù hợp. Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận. Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1977,
        canChi: 'Đinh Tị',
        menh: 'Sa Trung Thổ',
        male: 'Nam 49 tuổi có sao Thái Dương chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 49 tuổi có sao Thổ Tú chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1989,
        canChi: 'Kỷ Tị',
        menh: 'Đại Lâm Mộc',
        male: 'Nam 37 tuổi có sao Thổ Tú chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 37 tuổi có sao Vân Hớn chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2001,
        canChi: 'Tân Tị',
        menh: 'Bạch Lạp Kim',
        male: 'Nam 25 tuổi có sao Thái Âm chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 25 tuổi có sao Thái Bạch chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2013,
        canChi: 'Quý Tị',
        menh: 'Trường Lưu Thủy',
        male: 'Nam 13 tuổi có sao Thái Dương chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 13 tuổi có sao Thổ Tú chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2025,
        canChi: 'Ất Tị',
        menh: 'Phú Đăng Hỏa',
        male: 'Nam 1 tuổi có sao Thổ Tú chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 1 tuổi có sao Vân Hớn chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
    ],
  },
  {
    zodiac: 'Ngọ',
    zodiacOrder: 7,
    title: 'Vận hạn tuổi Ngọ năm Bính Ngọ 2026',
    bornYears: [1966, 1978, 1990, 2002, 2014],
    luuNien:
      'Người tuổi Ngọ bước vào năm 2026 Bính Ngọ, vận trình mang tính tự hình và tỷ kiếp đồng vượng, vừa có quý nhân trợ lực, vừa có thử thách và cạnh tranh gay gắt.\nThiên can Bính Hỏa là Tinh Kiếp Tài, đại diện cho sự thay đổi trong nhân, tài chính và cá tính. Năm nay, người tuổi Ngọ dễ gặp biến động về công việc, tiền bạc, cảm xúc và sức khỏe, cần giữ bình tĩnh, lý trí và thận trọng trong hành xử.\nDù có cát tinh chiếu mệnh, song các sao hung như Ngũ Hoàng và Thái Tuế mang năng lượng tiêu hao, khiến vận thế dễ dao động, đòi hỏi bản mệnh phải nỗ lực nhiều hơn, lập kế hoạch dài hạn, duy trì thái độ ôn hòa và kiên định để vượt qua thử thách.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 2,
        body: 'Thiên can Bính Hỏa là Tinh Kiếp Tài, báo hiệu năm tài chính biến động. Người tuổi Ngọ có thể tăng chi tiêu, dễ hao hụt vì đầu tư sai lầm hoặc tin người quá mức. Tuế Quân mang lại cơ hội hợp tác kinh doanh, nhưng cũng kéo theo cạnh tranh và rủi ro tài chính. Cát tinh Kim Quỹ giúp ổn định phần nào, song vẫn cần kiểm soát chi tiêu, tránh mạo hiểm trong đầu tư. Năm nay nên tập trung bảo toàn vốn, giữ ổn định dòng tiền, tránh dính dáng đến đầu cơ hoặc tín dụng rủi ro cao.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 2,
        body: 'Tam Hỏa tụ vượng, năng lượng dồi dào nhưng dễ quá mức gây mất cân bằng sinh lý. Cần chú ý mắt, tim, huyết áp và giấc ngủ, tránh thức khuya, lao lực hoặc xúc động mạnh. Ảnh hưởng từ Ngũ Hoàng, Thái Tuế và Phục Thi làm miễn dịch giảm, dễ mắc bệnh vặt hoặc tai nạn nhỏ. Khuyên nên rèn luyện điều độ, ăn uống thanh đạm, tránh xa nơi nguy hiểm, kiểm soát tâm lý, và chú trọng sức khỏe tinh thần. Đặc biệt, phụ nữ mang thai nên thận trọng, chuẩn bị kỹ lưỡng trong giai đoạn sinh nở.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 4,
        body: 'Tuế Quân và Thiên Can đồng hành Hỏa vượng, biểu thị môi trường cạnh tranh quyết liệt. Người tuổi Ngọ năm nay sẽ có nhiều cơ hội hợp tác và thử thách mới, vừa là thời điểm phát triển năng lực, vừa là áp lực lớn về công việc. Cát tinh Tướng Tinh và Kim Quỹ giúp nâng đỡ, mở rộng năng lực quản lý, có khả năng được trọng dụng, giao phó nhiệm vụ lớn. Tuy nhiên, do tự hình và Thái Tuế tác động, công việc dễ gặp điều chỉnh, thay đổi vị trí hoặc dự án, cùng với hiểu lầm, cạnh tranh, tiểu nhân cản trở. Cần tránh cố chấp, giữ tâm thế cầu tiến nhưng khiêm nhường, biết điều tiết cảm xúc và giao tiếp. Bình tĩnh, linh hoạt, chịu khó học hỏi sẽ giúp hóa giải khó khăn, duy trì thành tựu.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 3,
        body: 'Năm nay Tỷ Kiếp đồng vượng, nhân duyên mở rộng, người tuổi Ngọ có nhiều cơ hội gặp gỡ người mới. Người độc thân dễ phát sinh tình cảm mơ hồ, song cũng dễ bị cạnh tranh hoặc hiểu lầm, khiến mối quan hệ không bền. Người đã kết hôn dễ va chạm, mâu thuẫn, hiểu sai lời nói, nếu không kiềm chế sẽ khiến người thứ ba có cơ hội chen vào. Lời khuyên: lấy đối thoại và cảm thông làm trọng, tránh nóng giận, cùng nhau vượt qua thử thách, ắt tình cảm càng bền lâu.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1966,
        canChi: 'Bính Ngọ',
        menh: 'Thiên Hà Thủy',
        male: 'Nam 61 tuổi gặp Kế Đô, dễ bất an, vật nuôi gặp họa.',
        female:
          'Nữ 61 tuổi gặp Thái Dương, đề phòng bệnh cấp tính và sự cố bất ngờ, nên giữ tâm bình khí hòa, hành thiện tích phúc.',
      },
      {
        birthYear: 1978,
        canChi: 'Mậu Ngọ',
        menh: 'Thiên Thượng Hỏa',
        male: 'Nam 49 tuổi gặp Kim Diệu, nhiều thị phi, nhưng có tin vui con cháu.',
        female: 'Nữ 49 tuổi gặp Thái Âm, lưu ý phụ khoa, đi xa cát lợi.',
      },
      {
        birthYear: 1990,
        canChi: 'Canh Ngọ',
        menh: 'Lộ Bàng Thổ',
        male: 'Nam 37 tuổi gặp La Hầu, đề phòng kiện tụng, rối loạn gan - mắt.',
        female: 'Nữ 37 tuổi gặp Kế Đô, coi chừng xung đột gia đình, thị phi tại nơi làm việc.',
      },
      {
        birthYear: 2002,
        canChi: 'Nhâm Ngọ',
        menh: 'Dương Liễu Mộc',
        male: 'Nam 25 tuổi gặp Kế Đô, đề phòng tai nạn và thị phi.',
        female:
          'Nữ 25 tuổi gặp Thái Dương, nên đi xa thư giãn, đồng thời phòng nguy cơ thai sản hoặc căng thẳng tinh thần.',
      },
      {
        birthYear: 2014,
        canChi: 'Giáp Ngọ',
        menh: 'Sa Trung Kim',
        male: 'Nam 13 tuổi gặp Kim Diệu, học hành trắc trở, cần nỗ lực thêm.',
        female: 'Nữ 13 tuổi chú ý rối loạn nội tiết.',
      },
    ],
  },
  {
    zodiac: 'Mùi',
    zodiacOrder: 8,
    title: 'Vận hạn tuổi Mùi năm Bính Ngọ 2026',
    bornYears: [1967, 1979, 1991, 2003, 2015],
    luuNien:
      'Người tuổi Mùi bước vào năm 2026 Bính Ngọ với vận trình khá vững vàng, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.\nNăm nay, tuổi Mùi nên chú trọng các mối quan hệ và công việc; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.\nBiết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi Mùi hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 3,
        body: 'Dòng tiền của tuổi Mùi năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ. Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch. Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 2,
        body: 'Tuổi Mùi cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức. Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ. Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 5,
        body: 'Công việc của tuổi Mùi có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực. Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động. Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 3,
        body: 'Đường tình duyên của tuổi Mùi rộng mở, người độc thân dễ gặp đối tượng phù hợp. Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận. Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1967,
        canChi: 'Đinh Mùi',
        menh: 'Thiên Hà Thủy',
        male: 'Nam 59 tuổi có sao Vân Hớn chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 59 tuổi có sao La Hầu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1979,
        canChi: 'Kỷ Mùi',
        menh: 'Thiên Thượng Hỏa',
        male: 'Nam 47 tuổi có sao Thủy Diệu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 47 tuổi có sao Mộc Đức chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1991,
        canChi: 'Tân Mùi',
        menh: 'Lộ Bàng Thổ',
        male: 'Nam 35 tuổi có sao Mộc Đức chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 35 tuổi có sao Thủy Diệu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2003,
        canChi: 'Quý Mùi',
        menh: 'Dương Liễu Mộc',
        male: 'Nam 23 tuổi có sao Vân Hớn chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 23 tuổi có sao La Hầu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2015,
        canChi: 'Ất Mùi',
        menh: 'Sa Trung Kim',
        male: 'Nam 11 tuổi có sao Thủy Diệu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 11 tuổi có sao Mộc Đức chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
    ],
  },
  {
    zodiac: 'Thân',
    zodiacOrder: 9,
    title: 'Vận hạn tuổi Thân năm Bính Ngọ 2026',
    bornYears: [1968, 1980, 1992, 2004, 2016],
    luuNien:
      'Người tuổi Thân bước vào năm 2026 Bính Ngọ với vận trình lên xuống đan xen, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.\nNăm nay, tuổi Thân nên chú trọng kế hoạch dài hạn; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.\nBiết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi Thân hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 4,
        body: 'Dòng tiền của tuổi Thân năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ. Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch. Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 3,
        body: 'Tuổi Thân cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức. Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ. Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 3,
        body: 'Công việc của tuổi Thân có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực. Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động. Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 4,
        body: 'Đường tình duyên của tuổi Thân rộng mở, người độc thân dễ gặp đối tượng phù hợp. Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận. Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1968,
        canChi: 'Mậu Thân',
        menh: 'Đại Dịch Thổ',
        male: 'Nam 58 tuổi có sao Thái Dương chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 58 tuổi có sao Thổ Tú chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1980,
        canChi: 'Canh Thân',
        menh: 'Thạch Lựu Mộc',
        male: 'Nam 46 tuổi có sao Thổ Tú chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 46 tuổi có sao Vân Hớn chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1992,
        canChi: 'Nhâm Thân',
        menh: 'Kiếm Phong Kim',
        male: 'Nam 34 tuổi có sao Thái Âm chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 34 tuổi có sao Thái Bạch chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2004,
        canChi: 'Giáp Thân',
        menh: 'Tuyền Trung Thủy',
        male: 'Nam 22 tuổi có sao Thái Dương chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 22 tuổi có sao Thổ Tú chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2016,
        canChi: 'Bính Thân',
        menh: 'Sơn Hạ Hỏa',
        male: 'Nam 10 tuổi có sao Thổ Tú chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 10 tuổi có sao Vân Hớn chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
    ],
  },
  {
    zodiac: 'Dậu',
    zodiacOrder: 10,
    title: 'Vận hạn tuổi Dậu năm Bính Ngọ 2026',
    bornYears: [1969, 1981, 1993, 2005, 2017],
    luuNien:
      'Người tuổi Dậu bước vào năm 2026 Bính Ngọ với vận trình giàu cơ hội, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.\nNăm nay, tuổi Dậu nên chú trọng việc tích lũy và đầu tư an toàn; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.\nBiết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi Dậu hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 2,
        body: 'Dòng tiền của tuổi Dậu năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ. Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch. Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 4,
        body: 'Tuổi Dậu cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức. Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ. Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 4,
        body: 'Công việc của tuổi Dậu có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực. Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động. Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 2,
        body: 'Đường tình duyên của tuổi Dậu rộng mở, người độc thân dễ gặp đối tượng phù hợp. Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận. Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1969,
        canChi: 'Kỷ Dậu',
        menh: 'Đại Dịch Thổ',
        male: 'Nam 57 tuổi có sao Thái Bạch chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 57 tuổi có sao Thái Âm chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1981,
        canChi: 'Tân Dậu',
        menh: 'Thạch Lựu Mộc',
        male: 'Nam 45 tuổi có sao La Hầu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 45 tuổi có sao Kế Đô chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1993,
        canChi: 'Quý Dậu',
        menh: 'Kiếm Phong Kim',
        male: 'Nam 33 tuổi có sao Kế Đô chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 33 tuổi có sao Thái Dương chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2005,
        canChi: 'Ất Dậu',
        menh: 'Tuyền Trung Thủy',
        male: 'Nam 21 tuổi có sao Thái Bạch chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 21 tuổi có sao Thái Âm chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2017,
        canChi: 'Đinh Dậu',
        menh: 'Sơn Hạ Hỏa',
        male: 'Nam 9 tuổi có sao La Hầu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 9 tuổi có sao Kế Đô chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
    ],
  },
  {
    zodiac: 'Tuất',
    zodiacOrder: 11,
    title: 'Vận hạn tuổi Tuất năm Bính Ngọ 2026',
    bornYears: [1970, 1982, 1994, 2006, 2018],
    luuNien:
      'Người tuổi Tuất bước vào năm 2026 Bính Ngọ với vận trình cần sự kiên định, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.\nNăm nay, tuổi Tuất nên chú trọng sự nghiệp và học hỏi; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.\nBiết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi Tuất hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 3,
        body: 'Dòng tiền của tuổi Tuất năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ. Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch. Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 2,
        body: 'Tuổi Tuất cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức. Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ. Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 5,
        body: 'Công việc của tuổi Tuất có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực. Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động. Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 3,
        body: 'Đường tình duyên của tuổi Tuất rộng mở, người độc thân dễ gặp đối tượng phù hợp. Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận. Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1970,
        canChi: 'Canh Tuất',
        menh: 'Thoa Xuyến Kim',
        male: 'Nam 56 tuổi có sao Thủy Diệu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 56 tuổi có sao Mộc Đức chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1982,
        canChi: 'Nhâm Tuất',
        menh: 'Đại Hải Thủy',
        male: 'Nam 44 tuổi có sao Mộc Đức chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 44 tuổi có sao Thủy Diệu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1994,
        canChi: 'Giáp Tuất',
        menh: 'Sơn Đầu Hỏa',
        male: 'Nam 32 tuổi có sao Vân Hớn chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 32 tuổi có sao La Hầu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2006,
        canChi: 'Bính Tuất',
        menh: 'Ốc Thượng Thổ',
        male: 'Nam 20 tuổi có sao Thủy Diệu chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 20 tuổi có sao Mộc Đức chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2018,
        canChi: 'Mậu Tuất',
        menh: 'Bình Địa Mộc',
        male: 'Nam 8 tuổi có sao Mộc Đức chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 8 tuổi có sao Thủy Diệu chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
    ],
  },
  {
    zodiac: 'Hợi',
    zodiacOrder: 12,
    title: 'Vận hạn tuổi Hợi năm Bính Ngọ 2026',
    bornYears: [1971, 1983, 1995, 2007, 2019],
    luuNien:
      'Người tuổi Hợi bước vào năm 2026 Bính Ngọ với vận trình hanh thông có điều kiện, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.\nNăm nay, tuổi Hợi nên chú trọng cân bằng gia đình và công việc; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.\nBiết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi Hợi hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.',
    luanGiai: [
      {
        aspect: 'Tài Vận',
        rating: 4,
        body: 'Dòng tiền của tuổi Hợi năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ. Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch. Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
      },
      {
        aspect: 'Sức Khoẻ',
        rating: 3,
        body: 'Tuổi Hợi cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức. Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ. Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
      },
      {
        aspect: 'Sự Nghiệp',
        rating: 3,
        body: 'Công việc của tuổi Hợi có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực. Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động. Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
      },
      {
        aspect: 'Tình Duyên',
        rating: 4,
        body: 'Đường tình duyên của tuổi Hợi rộng mở, người độc thân dễ gặp đối tượng phù hợp. Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận. Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
      },
    ],
    tungTuoi: [
      {
        birthYear: 1971,
        canChi: 'Tân Hợi',
        menh: 'Thoa Xuyến Kim',
        male: 'Nam 55 tuổi có sao Thổ Tú chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 55 tuổi có sao Vân Hớn chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1983,
        canChi: 'Quý Hợi',
        menh: 'Đại Hải Thủy',
        male: 'Nam 43 tuổi có sao Thái Âm chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 43 tuổi có sao Thái Bạch chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 1995,
        canChi: 'Ất Hợi',
        menh: 'Sơn Đầu Hỏa',
        male: 'Nam 31 tuổi có sao Thái Dương chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 31 tuổi có sao Thổ Tú chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2007,
        canChi: 'Đinh Hợi',
        menh: 'Ốc Thượng Thổ',
        male: 'Nam 19 tuổi có sao Thổ Tú chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 19 tuổi có sao Vân Hớn chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
      {
        birthYear: 2019,
        canChi: 'Kỷ Hợi',
        menh: 'Bình Địa Mộc',
        male: 'Nam 7 tuổi có sao Thái Âm chiếu mệnh, nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
        female:
          'Nữ 7 tuổi có sao Thái Bạch chiếu mệnh, nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
      },
    ],
  },
];

export class SeedVanHan20261788200000000 implements MigrationInterface {
  name = 'SeedVanHan20261788200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ count }] = await queryRunner.query(
      `SELECT count(*)::int AS "count" FROM "van_han" WHERE "year" = $1`,
      [YEAR],
    );
    if (count > 0) {
      return;
    }

    for (const entry of ENTRIES) {
      await queryRunner.query(
        `
        INSERT INTO "van_han"
          ("zodiac", "zodiac_order", "year", "title", "born_years", "luu_nien", "luan_giai", "tung_tuoi", "source_url")
        VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, $8::jsonb, '')
        `,
        [
          entry.zodiac,
          entry.zodiacOrder,
          YEAR,
          entry.title,
          JSON.stringify(entry.bornYears),
          entry.luuNien,
          JSON.stringify(entry.luanGiai),
          JSON.stringify(entry.tungTuoi),
        ],
      );
    }

    await queryRunner.query(
      `INSERT INTO "van_han_published_year" ("year") VALUES ($1) ON CONFLICT ("year") DO NOTHING`,
      [YEAR],
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
