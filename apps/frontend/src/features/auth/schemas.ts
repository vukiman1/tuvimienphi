import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_TOO_SHORT_MESSAGE = `Mật khẩu cần ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`;

export const PASSWORD_MISMATCH_MESSAGE = 'Hai mật khẩu chưa khớp.';
export const CONFIRM_NEW_PASSWORD_MESSAGE = 'Bạn nhập lại mật khẩu mới để xác nhận.';

export const emailAddress = z.email('Email chưa hợp lệ.');

export const strongPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, PASSWORD_TOO_SHORT_MESSAGE)
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Mật khẩu cần có cả chữ và số.');

export const loginSchema = z.object({
  email: emailAddress,
  password: z
    .string()
    .min(1, 'Bạn chưa nhập mật khẩu.')
    .min(PASSWORD_MIN_LENGTH, PASSWORD_TOO_SHORT_MESSAGE),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const registerFields = z.object({
  displayName: z.string().min(1, 'Bạn chưa nhập tên.').max(255, 'Tên này dài quá.'),
  email: emailAddress,
  password: strongPassword,
  confirmPassword: z.string().min(1, 'Bạn nhập lại mật khẩu để xác nhận.'),
});

export const registerFieldSchemas = registerFields.shape;

export const registerSchema = registerFields.refine(
  (values) => values.password === values.confirmPassword,
  { message: PASSWORD_MISMATCH_MESSAGE, path: ['confirmPassword'] },
);

export type RegisterFormValues = z.infer<typeof registerFields>;
