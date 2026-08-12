export interface VanHanAspect {
  readonly label: string;
  readonly rating: number;
  readonly points: readonly string[];
}

export interface VanHanBirthYearFortune {
  readonly birthYear: number;
  readonly canChi: string;
  readonly menh: string;
  readonly male: string;
  readonly female: string;
}

export interface VanHanFortune {
  readonly birthYears: readonly number[];
  readonly overview: readonly string[];
  readonly aspects: readonly VanHanAspect[];
  readonly byBirthYear: readonly VanHanBirthYearFortune[];
}

// Illustrative content for tuổi Ngọ năm Bính Ngọ — the real per-chi data will replace this.
export const VAN_HAN_FORTUNE_PLACEHOLDER: VanHanFortune = {
  birthYears: [1966, 1978, 1990, 2002, 2014],
  overview: [
    'Người tuổi Ngọ bước vào năm 2026 Bính Ngọ, vận trình mang tính tự hình và tỷ kiếp đồng vượng, vừa có quý nhân trợ lực, vừa có thử thách và cạnh tranh gay gắt.',
    'Thiên can Bính Hỏa là Tinh Kiếp Tài, đại diện cho sự thay đổi trong nhân, tài chính và cá tính. Năm nay, người tuổi Ngọ dễ gặp biến động về công việc, tiền bạc, cảm xúc và sức khỏe, cần giữ bình tĩnh, lý trí và thận trọng trong hành xử.',
    'Dù có cát tinh chiếu mệnh, song các sao hung như Ngũ Hoàng và Thái Tuế mang năng lượng tiêu hao, khiến vận thế dễ dao động, đòi hỏi bản mệnh phải nỗ lực nhiều hơn, lập kế hoạch dài hạn, duy trì thái độ ôn hòa và kiên định để vượt qua thử thách.',
  ],
  aspects: [
    {
      label: 'Tài Vận',
      rating: 2,
      points: [
        'Thiên can Bính Hỏa là Tinh Kiếp Tài, báo hiệu năm tài chính biến động.',
        'Người tuổi Ngọ có thể tăng chi tiêu, dễ hao hụt vì đầu tư sai lầm hoặc tin người quá mức.',
        'Tuế Quân mang lại cơ hội hợp tác kinh doanh, nhưng cũng kéo theo cạnh tranh và rủi ro tài chính.',
        'Cát tinh Kim Quỹ giúp ổn định phần nào, song vẫn cần kiểm soát chi tiêu, tránh mạo hiểm trong đầu tư.',
        'Năm nay nên tập trung bảo toàn vốn, giữ ổn định dòng tiền, tránh dính dáng đến đầu cơ hoặc tín dụng rủi ro cao.',
      ],
    },
    {
      label: 'Sự Nghiệp',
      rating: 4,
      points: [
        'Tuế Quân và Thiên Can đồng hành Hỏa vượng, biểu thị môi trường cạnh tranh quyết liệt. Người tuổi Ngọ năm nay sẽ có nhiều cơ hội hợp tác và thử thách mới, vừa là thời điểm phát triển năng lực, vừa là áp lực lớn về công việc.',
        'Cát tinh Tướng Tinh và Kim Quỹ giúp nâng đỡ, mở rộng năng lực quản lý, có khả năng được trọng dụng, giao phó nhiệm vụ lớn.',
        'Tuy nhiên, do tự hình và Thái Tuế tác động, công việc dễ gặp điều chỉnh, thay đổi vị trí hoặc dự án, cùng với hiểu lầm, cạnh tranh, tiểu nhân cản trở.',
        'Cần tránh cố chấp, giữ tâm thế cầu tiến nhưng khiêm nhường, biết điều tiết cảm xúc và giao tiếp. Bình tĩnh, linh hoạt, chịu khó học hỏi sẽ giúp hóa giải khó khăn, duy trì thành tựu.',
      ],
    },
    {
      label: 'Sức Khoẻ',
      rating: 2,
      points: [
        'Tam Hỏa tụ vượng, năng lượng dồi dào nhưng dễ quá mức gây mất cân bằng sinh lý.',
        'Cần chú ý mắt, tim, huyết áp và giấc ngủ, tránh thức khuya, lao lực hoặc xúc động mạnh.',
        'Ảnh hưởng từ Ngũ Hoàng, Thái Tuế và Phục Thi làm miễn dịch giảm, dễ mắc bệnh vặt hoặc tai nạn nhỏ.',
        'Khuyên nên rèn luyện điều độ, ăn uống thanh đạm, tránh xa nơi nguy hiểm, kiểm soát tâm lý, và chú trọng sức khỏe tinh thần.',
        'Đặc biệt, phụ nữ mang thai nên thận trọng, chuẩn bị kỹ lưỡng trong giai đoạn sinh nở.',
      ],
    },
    {
      label: 'Tình Duyên',
      rating: 3,
      points: [
        'Năm nay Tỷ Kiếp đồng vượng, nhân duyên mở rộng, người tuổi Ngọ có nhiều cơ hội gặp gỡ người mới.',
        'Người độc thân dễ phát sinh tình cảm mơ hồ, song cũng dễ bị cạnh tranh hoặc hiểu lầm, khiến mối quan hệ không bền.',
        'Người đã kết hôn dễ va chạm, mâu thuẫn, hiểu sai lời nói, nếu không kiềm chế sẽ khiến người thứ ba có cơ hội chen vào.',
        'Lời khuyên: lấy đối thoại và cảm thông làm trọng, tránh nóng giận, cùng nhau vượt qua thử thách, ắt tình cảm càng bền lâu.',
      ],
    },
  ],
  byBirthYear: [
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
};
