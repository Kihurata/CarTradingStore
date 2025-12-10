// tests/unit/utils/email.test.ts
import { sendResetEmail } from '../../../src/utils/email';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

const mockSendMail = jest.fn();


(nodemailer.createTransport as jest.Mock).mockImplementation(() => ({
  sendMail: mockSendMail,
}));

describe('Email Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail.mockResolvedValue({ messageId: 'test-123' });
  });

  it('should send reset email with correct token and link', async () => {
    const email = 'test@example.com';
    const token = 'abc123xyz';

    await sendResetEmail(email, token);

    expect(nodemailer.createTransport).toHaveBeenCalled();

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: 'Reset Password - Autorizz',
        html: expect.stringContaining(`token=${token}`),
      })
    );
  });
});