import { z } from 'zod';
import {
  CONFIRM_NEW_PASSWORD_MESSAGE,
  PASSWORD_MISMATCH_MESSAGE,
  strongPassword,
} from '@/features/auth/schemas';

const changePasswordFields = z.object({
  currentPassword: z.string().min(1, 'Bạn chưa nhập mật khẩu hiện tại.'),
  newPassword: strongPassword,
  confirmPassword: z.string().min(1, CONFIRM_NEW_PASSWORD_MESSAGE),
});

/** Field-level rules, for validating one input at a time on blur. */
export const changePasswordFieldSchemas = changePasswordFields.shape;

export const changePasswordSchema = changePasswordFields.refine(
  (values) => values.newPassword === values.confirmPassword,
  { message: PASSWORD_MISMATCH_MESSAGE, path: ['confirmPassword'] },
);

export type ChangePasswordFormValues = z.infer<typeof changePasswordFields>;
