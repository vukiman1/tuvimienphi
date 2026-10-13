export const ACTIVITY_LABEL: Record<string, string> = {
  'auth.login.succeeded': 'đã đăng nhập',
  'auth.login.failed': 'đăng nhập thất bại',
  'auth.logout': 'đã đăng xuất',
  'auth.logout_all': 'đã đăng xuất mọi thiết bị',
  'auth.token.refreshed': 'làm mới phiên',
  'auth.registered': 'đã đăng ký',
  'auth.email.verified': 'đã xác thực email',
  'auth.password.reset_requested': 'yêu cầu đặt lại mật khẩu',
  'auth.password.reset': 'đã đặt lại mật khẩu',
  'auth.password.changed': 'đã đổi mật khẩu',
  'auth.login.two_factor_required': 'cần xác thực hai lớp',
  'auth.login.two_factor_failed': 'xác thực hai lớp thất bại',
  'auth.two_factor.enabled': 'đã bật xác thực hai lớp',
  'auth.two_factor.disabled': 'đã tắt xác thực hai lớp',
  'auth.two_factor.recovery_requested': 'yêu cầu mã khôi phục',
  'auth.two_factor.recovered': 'đã khôi phục bằng mã dự phòng',
  'la-so.viewed': 'xem lá số',
};

export function activityLabel(event: string): string {
  return ACTIVITY_LABEL[event] ?? event;
}
