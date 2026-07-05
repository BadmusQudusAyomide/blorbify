import nodemailer from 'nodemailer';
import axios from 'axios';
import { env } from './env.js';

let cachedTransport = null;

export function isResendConfigured() {
  return Boolean(env.resendApiKey);
}

export async function sendResendEmail({ to, subject, html, text, attachments = [] }) {
  const from = env.resendFrom || env.mailFrom;

  if (!from) {
    throw new Error('Missing RESEND_FROM (must be a verified sender in Resend).');
  }

  // Resend's API wants attachment content base64-encoded, unlike nodemailer which
  // accepts raw string/Buffer content natively.
  const resendAttachments = attachments.map((attachment) => ({
    filename: attachment.filename,
    content: Buffer.isBuffer(attachment.content)
      ? attachment.content.toString('base64')
      : Buffer.from(String(attachment.content), 'utf8').toString('base64'),
  }));

  const response = await axios.post(
    'https://api.resend.com/emails',
    {
      from,
      to,
      subject,
      html: html || undefined,
      text: text || undefined,
      attachments: resendAttachments.length ? resendAttachments : undefined,
    },
    {
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    }
  );

  return response.data;
}

export function isMailerConfigured() {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
}

export function getMailerTransport() {
  if (!isMailerConfigured()) {
    return null;
  }

  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }

  return cachedTransport;
}
