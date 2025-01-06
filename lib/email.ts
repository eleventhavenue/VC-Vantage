// lib/email.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'support@vc-vantage.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface PasswordResetEmailProps {
  to: string;
  resetUrl: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from: `VC Vantage <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    return { 
      success: true, 
      data: {
        id: data.id,
        to: data.to,
        from: data.from
      }
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function generatePasswordResetEmail({ to, resetUrl }: PasswordResetEmailProps) {
  return {
    to,
    subject: 'Reset Your VC Vantage Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .button {
              background-color: #3b82f6;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;
              margin: 20px 0;
            }
            .footer {
              color: #666;
              font-size: 12px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h1>Reset Your Password</h1>
            <p>We received a request to reset your password for your VC Vantage account. Click the button below to set a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>This link will expire in 1 hour for security reasons. If you didn't request a password reset, you can safely ignore this email.</p>
            <div class="footer">
              <p>VC Vantage - AI-Powered Venture Capital Research</p>
              <p>This email was sent to ${to}</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}