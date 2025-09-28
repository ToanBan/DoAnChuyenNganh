import {z} from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3, 'Tên phải ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
  cfnpassword: z.string().min(6, 'Xác nhận mật khẩu không hợp lệ')
}).refine((data) => data.password === data.cfnpassword, {
  path: ['cfnpassword'],
  message: 'Mật khẩu không trùng khớp',
})