import type { HoaName } from '../../../tu-hoa.js';
import { Sac, type LuanDe } from '../../luan-de.js';

export const HOA_VAN_HAN_LUAN: Readonly<Record<HoaName, LuanDe>> = {
  'Hóa Lộc': {
    y: 'tiền và cơ hội đến thuận, việc mới dễ có kết quả',
    do: ['Hóa Lộc'],
    sac: Sac.Thuan,
    trong: 68,
    tuKhoa: ['cơ hội', 'kết quả'],
  },
  'Hóa Quyền': {
    y: 'có tiếng nói hơn, được giao thêm việc và quyền quyết',
    do: ['Hóa Quyền'],
    sac: Sac.Thuan,
    trong: 65,
    tuKhoa: ['tiếng nói', 'quyền quyết'],
  },
  'Hóa Khoa': {
    y: 'có tiếng tốt, công sức được ghi nhận',
    do: ['Hóa Khoa'],
    sac: Sac.Thuan,
    trong: 62,
    tuKhoa: ['tiếng tốt', 'ghi nhận'],
  },
  'Hóa Kỵ': {
    y: 'việc dễ vướng mắc và hiểu lầm, nên nói rõ từ đầu và kiên nhẫn',
    do: ['Hóa Kỵ'],
    sac: Sac.Nghich,
    trong: 70,
    tuKhoa: ['vướng mắc', 'hiểu lầm'],
  },
};
