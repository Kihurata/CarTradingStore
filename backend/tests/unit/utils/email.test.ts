// tests/unit/utils/email.test.ts
import { sendResetEmail } from '../../../src/utils/email';
import nodemailer from 'nodemailer';

const mockSendMailFn = jest.fn().mockResolvedValue({ messageId: 'test-123' });
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: (...args: any[]) => mockSendMailFn(...args), 
    }),
  };
});

describe('Email Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMailFn.mockResolvedValue({ messageId: 'test-123' });
  });

  /*
  [Description]: Kiểm tra xem hàm sendResetEmail có gọi thư viện nodemailer và gửi email chứa token cùng liên kết đặt lại mật khẩu chính xác hay không.
  [Pre-condition]: Nodemailer được mock thành công (createTransport trả về mock object).
  [Data Test]: email='test@example.com', token='abc123xyz'
  [Steps]: 
    1. Mock hàm sendMail trả về thành công.
    2. Gọi hàm sendResetEmail với email và token test.
  [Expected Result]: 
    - Hàm createTransport được khởi tạo.
    - Hàm sendMail được gọi với đúng địa chỉ nhận (to), tiêu đề (subject) và nội dung html chứa token.
  */
  it('should send reset email with correct token and link', async () => {
    const email = 'test@example.com';
    const token = 'abc123xyz';
    await sendResetEmail(email, token);
    expect(mockSendMailFn).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: 'Yêu cầu đặt lại mật khẩu',
        html: expect.stringContaining(`token=${token}`),
      })
    );
  });
});