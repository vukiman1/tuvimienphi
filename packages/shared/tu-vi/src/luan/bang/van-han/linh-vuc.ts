import type { CungName } from '../../../dia-ban.js';

export interface LinhVuc {
  readonly linhVuc: string;
  readonly chuongLienQuan: string | null;
  readonly chuDeNam: string;
  readonly loiKhuyen: string;
  readonly nhinLai: string;
}

export const LINH_VUC: Readonly<Record<CungName, LinhVuc>> = {
  Mệnh: {
    linhVuc: 'bản thân và hướng đi riêng',
    chuongLienQuan: '02',
    chuDeNam: 'Năm định hình lại chính mình',
    loiKhuyen: 'Dành thời gian nhìn lại mục tiêu riêng và chọn một việc để theo đến cùng.',
    nhinLai: 'Năm đó là lúc bạn nhìn lại chính mình và định hình lại hướng đi.',
  },
  'Phụ Mẫu': {
    linhVuc: 'cha mẹ, người đi trước và giấy tờ',
    chuongLienQuan: '05',
    chuDeNam: 'Năm gần gũi người đi trước',
    loiKhuyen: 'Dành thêm thời gian cho cha mẹ và rà lại những giấy tờ quan trọng.',
    nhinLai: 'Năm đó chuyện cha mẹ, người đi trước và giấy tờ chiếm nhiều tâm sức của bạn.',
  },
  'Phúc Đức': {
    linhVuc: 'đời sống tinh thần và gia tộc',
    chuongLienQuan: null,
    chuDeNam: 'Năm vun lại gốc rễ',
    loiKhuyen:
      'Giữ nhịp sống chậm lại, dành thời gian cho đại gia đình và những việc khiến bạn an lòng.',
    nhinLai: 'Năm đó bạn hướng nhiều về đời sống tinh thần và gốc rễ gia đình.',
  },
  'Điền Trạch': {
    linhVuc: 'nhà cửa và chỗ ở',
    chuongLienQuan: null,
    chuDeNam: 'Năm lo chuyện nhà cửa',
    loiKhuyen: 'Nếu tính mua bán hay sửa sang nhà cửa, hãy chuẩn bị kỹ giấy tờ và tài chính trước.',
    nhinLai: 'Năm đó chuyện nhà cửa, chỗ ở là mối bận tâm lớn của bạn.',
  },
  'Quan Lộc': {
    linhVuc: 'công việc và sự nghiệp',
    chuongLienQuan: '03',
    chuDeNam: 'Năm dồn sức cho sự nghiệp',
    loiKhuyen: 'Chọn rõ một mục tiêu công việc và theo dõi tiến độ đều đặn.',
    nhinLai: 'Năm đó công việc và vị trí của bạn được đặt lên hàng đầu.',
  },
  'Nô Bộc': {
    linhVuc: 'bạn bè, đồng nghiệp và người cùng làm',
    chuongLienQuan: null,
    chuDeNam: 'Năm của những mối quan hệ',
    loiKhuyen: 'Chọn người cùng làm cho kỹ và giữ thỏa thuận rõ ràng ngay từ đầu.',
    nhinLai: 'Năm đó bạn bè, đồng nghiệp và người cùng làm ảnh hưởng nhiều đến bạn.',
  },
  'Thiên Di': {
    linhVuc: 'đi lại và môi trường bên ngoài',
    chuongLienQuan: null,
    chuDeNam: 'Năm bước ra bên ngoài',
    loiKhuyen: 'Mở rộng giao thiệp và đón cơ hội ở xa, nhưng lên kế hoạch đi lại chu đáo.',
    nhinLai: 'Năm đó bạn đi lại nhiều và gặp gỡ nhiều người bên ngoài.',
  },
  'Tật Ách': {
    linhVuc: 'sức khỏe và nhịp sống',
    chuongLienQuan: null,
    chuDeNam: 'Năm giữ nhịp, giữ sức',
    loiKhuyen: 'Giữ giờ nghỉ ngơi đều đặn, khám sức khỏe định kỳ và đừng ôm nhiều việc cùng lúc.',
    nhinLai: 'Năm đó bạn để tâm nhiều hơn tới sức khỏe và nhịp sống của mình.',
  },
  'Tài Bạch': {
    linhVuc: 'tiền bạc và thu nhập',
    chuongLienQuan: '04',
    chuDeNam: 'Năm tính chuyện tiền bạc',
    loiKhuyen: 'Lập quỹ dự phòng và cân nhắc kỹ trước những khoản chi hay khoản đầu tư lớn.',
    nhinLai: 'Năm đó chuyện tiền bạc, thu nhập là mối quan tâm lớn của bạn.',
  },
  'Tử Tức': {
    linhVuc: 'con cái và thế hệ sau',
    chuongLienQuan: '05',
    chuDeNam: 'Năm vun trồng thế hệ sau',
    loiKhuyen: 'Dành thêm thời gian cho con cái hoặc người trẻ bạn đang dìu dắt.',
    nhinLai: 'Năm đó con cái và thế hệ sau chiếm nhiều tâm sức của bạn.',
  },
  'Phu Thê': {
    linhVuc: 'tình duyên và người đồng hành',
    chuongLienQuan: '05',
    chuDeNam: 'Năm của tình duyên',
    loiKhuyen: 'Dành thời gian lắng nghe người đồng hành và nói rõ điều mình mong muốn.',
    nhinLai: 'Năm đó chuyện tình duyên và người đồng hành là tâm điểm của bạn.',
  },
  'Huynh Đệ': {
    linhVuc: 'anh chị em và chuyện hợp tác',
    chuongLienQuan: null,
    chuDeNam: 'Năm gắn kết anh em',
    loiKhuyen: 'Giữ hòa khí với anh chị em, chuyện tiền bạc chung nên rõ ràng từ đầu.',
    nhinLai: 'Năm đó anh chị em và người thân ngang hàng có mặt nhiều trong đời bạn.',
  },
};
