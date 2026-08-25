import { MEDIA, laSoIconUrl } from '@/config/media';

/**
 * Nội dung luận giải. Hiện là dữ liệu mẫu để dựng giao diện — sau này backend trả về đúng hình dạng
 * này. Vì vậy mọi trường đều là kiểu nguyên thuỷ, kể cả icon chỉ lưu khoá chứ không lưu component.
 */

/** Mục con của một chuyên đề, gập lại thành từng thẻ mở riêng. */
export interface LuanGiaiSection {
  /** Khoá bền của mục con, dùng để nối với dữ liệu backend trả về sau này. */
  readonly slug: string;
  readonly title: string;
  /** Cung trên lá số mà mục con này đọc từ đó. */
  readonly sourceCung: string;
  readonly paragraphs: readonly string[];
}

export interface LuanGiaiArticle {
  readonly eyebrow: string;
  readonly title: string;
  readonly quote: string;
  readonly subheading: string;
  /** Dùng `**đậm**` cho từ khoá / tên sao và `==tô nền==` cho ý chính — xem `RichText`. */
  readonly paragraphs: readonly string[];
  /** Chuyên đề nhiều mục con thì tách ra đây; mục ngắn để trống là được. */
  readonly sections?: readonly LuanGiaiSection[];
  /** Đoạn kết luận, đóng khung nhấn mạnh. */
  readonly summary: string;
  readonly closingLabel: string;
  readonly closing: string;
  /** Tranh minh hoạ trong bài; chưa có thì giao diện tự đổ khối chờ. */
  readonly illustrationUrl?: string;
  /** Ấn triện đóng ở cuối bài. */
  readonly sealUrl?: string;
}

/** Một mốc cụ thể trong một lát cắt: một vận mười năm, một năm, một tháng, một ngày. */
export interface VanHanPeriod {
  readonly slug: string;
  /** Khoảng thời gian mốc này phủ, ví dụ `3 – 12 tuổi`. */
  readonly range: string;
  /** Khoảng năm dương tương ứng, để đối chiếu cho nhanh. */
  readonly years: string;
  /** Cung nhập hạn của mốc. */
  readonly cung: string;
  readonly paragraphs: readonly string[];
}

/**
 * Một lát cắt thời gian. Các lát loại trừ nhau nên chỉ hiện một lát mỗi lúc, nhưng trong mỗi lát
 * thì có nhiều mốc — đại vận chẳng hạn trải hết mười hai cung.
 */
export interface VanHanScale {
  readonly slug: string;
  readonly label: string;
  /** Mốc đang có hiệu lực với năm xem; mở sẵn khi vừa vào. */
  readonly currentSlug: string;
  readonly periods: readonly VanHanPeriod[];
}

export enum LuanGiaiContentKind {
  /** Để đọc: chảy liền một mạch, mục con là tiểu mục trong bài. */
  Article = 'article',
  /** Để tra: chọn một lát thời gian, chỉ lát đó hiện ra. */
  Periods = 'periods',
}

export type LuanGiaiContent =
  | { readonly kind: LuanGiaiContentKind.Article; readonly article: LuanGiaiArticle }
  | { readonly kind: LuanGiaiContentKind.Periods; readonly scales: readonly VanHanScale[] };

export interface LuanGiaiChapter {
  readonly order: string;
  readonly title: string;
  /** Ảnh biểu tượng trên dải mục lục; chưa có thì giao diện tự đổ khối chờ. */
  readonly iconUrl?: string;
  /** Chưa biên soạn thì bỏ trống — giao diện hiện thẻ chờ thay cho nội dung. */
  readonly content?: LuanGiaiContent;
}

export interface LuanGiai {
  readonly chapters: readonly LuanGiaiChapter[];
  readonly motto: readonly string[];
}

const THAN_CU: LuanGiaiArticle = {
  eyebrow: 'Thân cư',
  title: 'Thân cư Phu Thê',
  quote: 'Cuộc đời càng trưởng thành, chữ “đồng hành” càng trở nên quan trọng.',
  subheading: 'Nam tuổi Tý – Thân cư Phu Thê',
  paragraphs: [
    'Người có **Thân cư Phu Thê** thường đặt khá nhiều tâm sức vào **chuyện tình cảm, hôn nhân và gia đình**. Khi bước vào giai đoạn trưởng thành, người bạn đời có thể trở thành một trong những nhân tố ảnh hưởng mạnh đến lựa chọn, công việc và hướng phát triển của bản thân.',
    'Tại cung Phu Thê có **Tham Lang (H)** đi cùng **Liêm Trinh (H)**, cho thấy duyên phối ngẫu có những điểm thuận lợi: người bạn đời có cá tính ==mạnh mẽ, thông minh, biết lo toan và có chí tiến thủ==. Người ấy có thể là người giúp bạn mở mang tầm nhìn, hỗ trợ nhiều trong cuộc sống.',
    'Tuy nhiên, sự xuất hiện của **Địa Không, Địa Kiếp, Đại Hao, Đẩu Quân** báo hiệu hai người đôi lúc dễ bất đồng, lời qua tiếng lại hoặc có những giai đoạn tình cảm chịu áp lực. Điều đáng chú ý là **Hồng Loan, Long Đức, Lộc Tồn** cùng hội chiếu giúp giảm bớt tính bất lợi, vì vậy ==mâu thuẫn thường nằm ở cách ứng xử và giao tiếp== hơn là dấu hiệu mặc định của một cuộc hôn nhân xấu.',
  ],
  summary:
    'Thân cư Phu Thê **không có nghĩa là cuộc đời phụ thuộc vào người phối ngẫu**. Nó cho thấy bài học lớn của cuộc đời thường đến qua hai chữ “đồng hành”: ==chọn đúng người, biết nhường đúng lúc và cùng nhau vun đắp== thì gia đạo lại có thể trở thành hậu phương giúp bản thân đi xa hơn.',
  closingLabel: 'Một lời dành cho bạn',
  closing:
    'Duyên tốt không chỉ nằm ở việc gặp đúng người, mà còn ở khả năng cùng một người đi đúng đường.',
  illustrationUrl: MEDIA.laSo.illustrationCrane,
  sealUrl: MEDIA.laSo.seal,
};

const TINH_DUYEN: LuanGiaiArticle = {
  eyebrow: 'Chuyên đề',
  title: 'Tình duyên Gia đạo',
  quote: 'Gia đạo không đo bằng lúc thuận, mà đo bằng cách vượt lúc nghịch.',
  subheading: 'Bốn cung dựng nên một mái nhà',
  paragraphs: [
    'Gia đạo không đọc từ một cung. Bức tranh đầy đủ cần **bốn cung ghép lại**: Phu Thê nói chuyện vợ chồng, Tử Tức nói chuyện con cái, Phụ Mẫu nói chuyện đấng sinh thành, Huynh Đệ nói chuyện anh em và những người thân cận ngang vai.',
    'Trên lá số này, ==ba trong bốn cung đều có chính tinh toạ thủ==, riêng cách đặt sao ở mỗi cung lại kể một câu chuyện khác nhau. Mở từng cung dưới đây để xem riêng, hoặc mở hết rồi ghép lại để thấy mạch chung của gia đạo.',
  ],
  sections: [
    {
      slug: 'hon-nhan',
      title: 'Hôn nhân',
      sourceCung: 'Phu Thê · Tị',
      paragraphs: [
        'Cung Phu Thê có **Tham Lang** đi cùng **Liêm Trinh** — hai sao đều thuộc nhóm đào hoa và quyền biến. Người bạn đời vì thế thường ==có sức hút, giỏi giao tiếp và không cam chịu an phận==. Đây là kiểu người đồng hành đẩy bạn tiến lên, chứ không phải kiểu ở yên một chỗ.',
        '**Hồng Loan** và **Long Đức** cùng đóng tại đây làm dịu tính bốc đồng của hai chính tinh, thêm **Thiên Thọ** chủ sự bền. Nói cách khác, duyên đến có thể muộn hoặc qua vài lần dang dở, nhưng ==khi đã định thì lại có sức giữ==.',
      ],
    },
    {
      slug: 'con-cai',
      title: 'Con cái',
      sourceCung: 'Tử Tức · Thìn',
      paragraphs: [
        'Cung Tử Tức có **Thái Âm** toạ thủ cùng **Văn Xương**, **Ân Quang**, **Tam Thai** và **Hóa Khoa**. Đây là tổ hợp thiên về ==học hành, chữ nghĩa và danh tiếng==: con cái có phần hướng nội, ưa suy nghĩ, dễ có thành tựu qua con đường học vấn hơn là qua va chạm thương trường.',
        'Thái Âm chủ sự mềm, nên quan hệ cha con thường **thân nhưng ít nói thẳng**. Điều đáng lưu ý không phải là thiếu tình cảm, mà là ==dễ hiểu lầm vì cả hai bên đều ngại mở lời trước==.',
      ],
    },
    {
      slug: 'phu-mau',
      title: 'Phụ mẫu',
      sourceCung: 'Phụ Mẫu · Thân',
      paragraphs: [
        'Cung Phụ Mẫu có **Thiên Đồng** đi cùng **Thiên Lương**, thêm **Lộc Tồn** và **Thiên Mã**. Thiên Lương là sao ấm che, Lộc Tồn chủ của cải giữ được — cho thấy ==bạn có phần được nhờ ở đấng sinh thành==, dù là nhờ tài sản, chỗ đứng hay đơn giản là nếp nhà.',
        'Thiên Mã đóng cùng chủ sự di động, nên **có thể xa cha mẹ về mặt địa lý**. Khoảng cách ở đây là khoảng cách đường sá chứ không phải khoảng cách tình cảm.',
      ],
    },
    {
      slug: 'huynh-de',
      title: 'Anh em',
      sourceCung: 'Huynh Đệ · Ngọ',
      paragraphs: [
        'Cung Huynh Đệ có **Cự Môn** toạ thủ. Cự Môn là sao của lời nói và tranh biện, nên quan hệ anh em ==dễ có va chạm bằng miệng==, hiếm khi thành mâu thuẫn thật sự nhưng cũng ít khi êm xuôi hoàn toàn.',
        '**Thiên Khôi** và **Thiên Phúc** đóng cùng là điểm đỡ đáng kể: lúc thật sự cần, **vẫn có người trong nhà đứng ra**. Sự xuất hiện của **Bạch Hổ** và **Phục Binh** nhắc rằng chuyện tiền bạc giữa anh em nên rõ ràng ngay từ đầu.',
      ],
    },
  ],
  summary:
    'Bốn cung trên lá số này vẽ ra một gia đạo **không êm ả nhưng có nền**: bạn đời mạnh mẽ, con cái hướng học, cha mẹ có phần che chở, anh em lời qua tiếng lại mà không bỏ nhau. ==Điểm cần giữ là lời nói== — cả ba chỗ dễ sinh chuyện đều bắt đầu từ cách nói, không phải từ tình cảm.',
  closingLabel: 'Một lời dành cho bạn',
  closing: 'Nhà không giữ bằng lý lẽ thắng thua, mà giữ bằng chỗ chịu nói và chỗ chịu nghe.',
  sealUrl: MEDIA.laSo.seal,
};

/**
 * Đại vận trải hết mười hai cung, mỗi cung mười năm, khởi từ số cục (Mộc tam cục → 3 tuổi) tại cung
 * Mệnh rồi đi thuận vì đây là Dương Nam. Tuổi ở đây là tuổi mụ nên tuổi n rơi vào năm 1910 + n − 1.
 */
const DAI_VAN: readonly VanHanPeriod[] = [
  {
    slug: 'dv-3',
    range: '3 – 12 tuổi',
    years: '1912 – 1921',
    cung: 'Mệnh · Mùi',
    paragraphs: [
      'Vận đầu đời nhập ngay cung Mệnh, có **Thiên Tướng** toạ thủ. Nền tính cách hình thành sớm và khá rõ nét, nhưng **Hỏa Tinh** cùng **Đà La** đóng đây báo hiệu tuổi nhỏ nhiều va vấp vặt.',
    ],
  },
  {
    slug: 'dv-13',
    range: '13 – 22 tuổi',
    years: '1922 – 1931',
    cung: 'Phụ Mẫu · Thân',
    paragraphs: [
      'Mười năm dựa vào gia đình. **Thiên Đồng** đi cùng **Thiên Lương** và **Lộc Tồn** cho thấy ==được che chở và có chỗ nương==, học hành thuận hơn là tự lập.',
    ],
  },
  {
    slug: 'dv-23',
    range: '23 – 32 tuổi',
    years: '1932 – 1941',
    cung: 'Phúc Đức · Dậu',
    paragraphs: [
      'Vận vào Phúc Đức có **Thất Sát** và **Vũ Khúc** — hai sao đều cứng. Giai đoạn quyết liệt, dám bỏ chỗ cũ đi tìm chỗ mới, nhưng **Kình Dương** đóng cùng nhắc đừng ép quá tay.',
    ],
  },
  {
    slug: 'dv-33',
    range: '33 – 42 tuổi',
    years: '1942 – 1951',
    cung: 'Điền Trạch · Tuất',
    paragraphs: [
      '**Thái Dương** sáng tại Điền Trạch cùng **Hóa Lộc**: đây là ==quãng gây dựng cơ ngơi==, nhà cửa đất đai có chuyển biến rõ.',
    ],
  },
  {
    slug: 'dv-43',
    range: '43 – 52 tuổi',
    years: '1952 – 1961',
    cung: 'Quan Lộc · Hợi',
    paragraphs: [
      'Cung Quan Lộc vô chính diệu nhưng có **Hữu Bật**, **Thiên Quan** và **Thiên Hỉ**. Công danh đi lên nhờ người đỡ chứ không nhờ tự mình xông pha.',
    ],
  },
  {
    slug: 'dv-53',
    range: '53 – 62 tuổi',
    years: '1962 – 1971',
    cung: 'Nô Bộc · Tý',
    paragraphs: [
      '**Thiên Cơ** chủ biến động, thêm **Giải Thần** chủ tháo gỡ. Mười năm thay đổi nhiều mối quan hệ, cũ đi mới đến, phần lớn là đổi chứ không phải mất.',
    ],
  },
  {
    slug: 'dv-63',
    range: '63 – 72 tuổi',
    years: '1972 – 1981',
    cung: 'Thiên Di · Sửu',
    paragraphs: [
      '**Tử Vi** và **Phá Quân** cùng đóng Thiên Di — cách đi xa và làm lại. Vận hợp với chuyển chỗ ở hoặc đổi hẳn môi trường sống.',
    ],
  },
  {
    slug: 'dv-73',
    range: '73 – 82 tuổi',
    years: '1982 – 1991',
    cung: 'Tật Ách · Dần',
    paragraphs: [
      'Vận vào Tật Ách, lại gặp **Tuần** án ngữ nên phần xấu được chắn bớt. Vẫn nên ==giữ nếp sinh hoạt đều== hơn là trông vào thuốc thang.',
    ],
  },
  {
    slug: 'dv-83',
    range: '83 – 92 tuổi',
    years: '1992 – 2001',
    cung: 'Tài Bạch · Mão',
    paragraphs: [
      '**Thiên Phủ** là kho tài, đi cùng **Tả Phù**: tiền bạc trong quãng này ==giữ được hơn là kiếm thêm==.',
    ],
  },
  {
    slug: 'dv-93',
    range: '93 – 102 tuổi',
    years: '2002 – 2011',
    cung: 'Tử Tức · Thìn',
    paragraphs: [
      '**Thái Âm** cùng **Văn Xương** và **Hóa Khoa**. Vận yên, phần lớn niềm vui đến từ con cháu và chuyện chữ nghĩa.',
    ],
  },
  {
    slug: 'dv-103',
    range: '103 – 112 tuổi',
    years: '2012 – 2021',
    cung: 'Phu Thê · Tị',
    paragraphs: [
      'Vận nhập cung Phu Thê, cũng chính là cung an Thân. **Tham Lang** và **Liêm Trinh** ở đây khiến mười năm này xoay quanh người bạn đời nhiều hơn bất kỳ quãng nào khác.',
    ],
  },
  {
    slug: 'dv-113',
    range: '113 – 122 tuổi',
    years: '2022 – 2031',
    cung: 'Huynh Đệ · Ngọ',
    paragraphs: [
      'Đại vận đang đi, nhập cung Huynh Đệ nơi **Cự Môn** toạ thủ. Cả giai đoạn xoay quanh ==lời nói, giấy tờ và các mối quan hệ ngang vai==: cộng sự, bạn nghề, anh em trong nhà.',
      '**Thiên Khôi** và **Thiên Phúc** đóng cùng là quý nhân của vận, nên việc khó thường được gỡ nhờ người quen giới thiệu. Ngược lại **Bạch Hổ** nhắc chuyện giấy trắng mực đen: **thoả thuận miệng trong mười năm này dễ thành rắc rối về sau**.',
    ],
  },
];

const TIEU_VAN: readonly VanHanPeriod[] = [
  {
    slug: 'tv-2024',
    range: 'Giáp Thìn',
    years: '2024 · 115 tuổi',
    cung: 'Tử Tức · Thìn',
    paragraphs: [
      'Năm tiểu hạn về Tử Tức, có **Hóa Khoa** lưu tới. Năm của giấy tờ, bằng cấp và những việc cần tên tuổi đứng ra.',
    ],
  },
  {
    slug: 'tv-2025',
    range: 'Ất Tỵ',
    years: '2025 · 116 tuổi',
    cung: 'Phu Thê · Tị',
    paragraphs: [
      'Tiểu hạn nhập cung Phu Thê. **Hồng Loan** và **Long Đức** đóng đây nên năm êm về mặt gia đạo, nhưng **Đại Hao** nhắc chuyện chi tiêu.',
    ],
  },
  {
    slug: 'tv-2026',
    range: 'Bính Ngọ',
    years: '2026 · 117 tuổi',
    cung: 'Huynh Đệ · Ngọ',
    paragraphs: [
      '**Thái Tuế** lưu đến cung Huynh Đệ, trùng ngay cung đại vận đang đóng. Hai tầng chồng nhau khiến ==mọi chuyện liên quan tới người ngang vai đều được khuếch đại==, cả chuyện hay lẫn chuyện phiền.',
      'Có **Lưu Văn Khúc** hội chiếu nên năm hợp với việc viết lách, thi cử, ký kết. Nhưng **Phục Binh** đóng cùng: nên đọc kỹ trước khi đặt bút, đừng để người khác điền hộ phần của mình.',
    ],
  },
  {
    slug: 'tv-2027',
    range: 'Đinh Mùi',
    years: '2027 · 118 tuổi',
    cung: 'Mệnh · Mùi',
    paragraphs: [
      'Tiểu hạn về chính cung Mệnh. Năm của chuyện riêng mình: sức khoẻ, nếp sống, những quyết định không nhờ ai quyết hộ được.',
    ],
  },
  {
    slug: 'tv-2028',
    range: 'Mậu Thân',
    years: '2028 · 119 tuổi',
    cung: 'Phụ Mẫu · Thân',
    paragraphs: [
      'Tiểu hạn vào Phụ Mẫu, có **Lộc Tồn** và **Thiên Mã**. Năm nhiều đi lại, và nhiều việc liên quan tới bậc trên.',
    ],
  },
];

const NGUYET_VAN: readonly VanHanPeriod[] = [
  {
    slug: 'nv-1',
    range: 'Tháng Giêng',
    years: 'Canh Dần',
    cung: 'Tật Ách · Dần',
    paragraphs: ['Tháng có **Tuần** án ngữ, chuyện xấu bị chắn bớt nhưng việc lớn cũng khó chạy.'],
  },
  {
    slug: 'nv-2',
    range: 'Tháng Hai',
    years: 'Tân Mão',
    cung: 'Tài Bạch · Mão',
    paragraphs: ['**Thiên Phủ** và **Đào Hoa**: tháng thuận cho thu xếp tiền bạc và các cuộc gặp.'],
  },
  {
    slug: 'nv-3',
    range: 'Tháng Ba',
    years: 'Nhâm Thìn',
    cung: 'Tử Tức · Thìn',
    paragraphs: ['**Thái Âm** cùng **Văn Xương**, tháng hợp việc học và việc giấy tờ.'],
  },
  {
    slug: 'nv-4',
    range: 'Tháng Tư',
    years: 'Quý Tị',
    cung: 'Phu Thê · Tị',
    paragraphs: ['Tháng nhập cung an Thân, chuyện gia đạo nổi lên rõ hơn thường lệ.'],
  },
  {
    slug: 'nv-5',
    range: 'Tháng Năm',
    years: 'Giáp Ngọ',
    cung: 'Huynh Đệ · Ngọ',
    paragraphs: ['**Cự Môn** gặp **Triệt**, dễ có lời qua tiếng lại rồi tự lắng.'],
  },
  {
    slug: 'nv-6',
    range: 'Tháng Sáu',
    years: 'Ất Mùi',
    cung: 'Nô Bộc · Tý',
    paragraphs: [
      'Cung tháng có **Thiên Cơ** toạ thủ cùng **Thiên Y** và **Giải Thần** — tháng của ==thay đổi nhỏ và tháo gỡ==: việc tưởng bế tắc từ mấy tháng trước thường tự có lối ra.',
      '**Thiên Diêu** đóng cùng nên tháng cũng nhiều lời mời, nhiều cuộc gặp. Chọn lọc là được, không cần né.',
    ],
  },
  {
    slug: 'nv-7',
    range: 'Tháng Bảy',
    years: 'Bính Thân',
    cung: 'Phụ Mẫu · Thân',
    paragraphs: ['**Lộc Tồn** đóng đây, tháng có phần được nhờ từ bậc trên.'],
  },
  {
    slug: 'nv-8',
    range: 'Tháng Tám',
    years: 'Đinh Dậu',
    cung: 'Phúc Đức · Dậu',
    paragraphs: ['**Thất Sát** và **Kình Dương**: tháng dễ nóng, việc gấp nên hoãn lại vài hôm.'],
  },
  {
    slug: 'nv-9',
    range: 'Tháng Chín',
    years: 'Mậu Tuất',
    cung: 'Điền Trạch · Tuất',
    paragraphs: ['**Thái Dương** sáng, tháng hợp sửa sang nhà cửa và bày biện lại chỗ ở.'],
  },
  {
    slug: 'nv-10',
    range: 'Tháng Mười',
    years: 'Kỷ Hợi',
    cung: 'Quan Lộc · Hợi',
    paragraphs: ['Cung vô chính diệu, tháng bình, việc gì cũng cần người đỡ mới trôi.'],
  },
  {
    slug: 'nv-11',
    range: 'Tháng Mười Một',
    years: 'Canh Tý',
    cung: 'Nô Bộc · Tý',
    paragraphs: ['Quan hệ bạn bè có xáo trộn nhẹ, phần nhiều là đổi chỗ chứ không phải mất.'],
  },
  {
    slug: 'nv-12',
    range: 'Tháng Chạp',
    years: 'Tân Sửu',
    cung: 'Thiên Di · Sửu',
    paragraphs: ['**Tử Vi** và **Phá Quân**, tháng của đi xa và của những việc làm lại từ đầu.'],
  },
];

const NHAT_VAN: readonly VanHanPeriod[] = [
  {
    slug: 'nh-1',
    range: 'Hôm nay',
    years: 'Tân Mùi',
    cung: 'Mệnh · Mùi',
    paragraphs: [
      'Ngày về chính cung Mệnh, có **Thiên Tướng** cùng **Thiên Giải** và **Thiên Đức**. Ngày hợp với ==việc đứng ra thu xếp cho người khác== hơn là việc riêng của mình.',
      'Có **Hỏa Tinh** và **Đà La** đóng cùng nên dễ nóng và dễ chậm trễ. Việc gấp nên làm buổi sáng.',
    ],
  },
  {
    slug: 'nh-2',
    range: 'Ngày mai',
    years: 'Nhâm Thân',
    cung: 'Phụ Mẫu · Thân',
    paragraphs: ['**Lộc Tồn** và **Thiên Mã**: ngày thuận cho đi lại và cho việc nhờ vả bậc trên.'],
  },
  {
    slug: 'nh-3',
    range: 'Ngày kia',
    years: 'Quý Dậu',
    cung: 'Phúc Đức · Dậu',
    paragraphs: ['**Kình Dương** đóng đây, ngày nên tránh tranh cãi và tránh ký vội.'],
  },
];

const VAN_HAN_SCALES: readonly VanHanScale[] = [
  { slug: 'dai-van', label: 'Đại vận', currentSlug: 'dv-113', periods: DAI_VAN },
  { slug: 'tieu-van', label: 'Tiểu vận', currentSlug: 'tv-2026', periods: TIEU_VAN },
  { slug: 'nguyet-van', label: 'Nguyệt vận', currentSlug: 'nv-6', periods: NGUYET_VAN },
  { slug: 'nhat-van', label: 'Nhật vận', currentSlug: 'nh-1', periods: NHAT_VAN },
];

export const MOCK_LUAN_GIAI: LuanGiai = {
  chapters: [
    {
      order: '01',
      title: 'Thân cư',
      iconUrl: laSoIconUrl('compass'),
      content: { kind: LuanGiaiContentKind.Article, article: THAN_CU },
    },
    { order: '02', title: 'Mệnh & Tính cách', iconUrl: laSoIconUrl('bagua') },
    { order: '03', title: 'Công danh Sự nghiệp', iconUrl: laSoIconUrl('sailboat') },
    { order: '04', title: 'Tài bạch Tiền tài', iconUrl: laSoIconUrl('coin') },
    {
      order: '05',
      title: 'Tình duyên Gia đạo',
      iconUrl: laSoIconUrl('lotus'),
      content: { kind: LuanGiaiContentKind.Article, article: TINH_DUYEN },
    },
    {
      order: '06',
      title: 'Vận hạn',
      iconUrl: laSoIconUrl('hourglass'),
      content: { kind: LuanGiaiContentKind.Periods, scales: VAN_HAN_SCALES },
    },
  ],
  motto: ['Thiên thời · Địa lợi · Nhân hòa', 'Biết mình · Đổi vận · An tâm'],
};
