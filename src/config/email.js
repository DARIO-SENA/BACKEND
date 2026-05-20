import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) return null;
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port || '587'),
      secure: port === '465',
      auth: { user, pass },
    });
  }
  return transporter;
};

export const enviarEmail = async ({ to, subject, html }) => {
  const transport = getTransporter();
  if (!transport) {
    console.warn('SMTP no configurado. Configura SMTP_HOST, SMTP_USER y SMTP_PASS en .env');
    return null;
  }
  const from = process.env.SMTP_FROM || 'noreply@dario.app';
  const info = await transport.sendMail({ from, to, subject, html });
  return info;
};

export const emailConfigurado = () => {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};
