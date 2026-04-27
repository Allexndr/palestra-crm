import nodemailer from 'nodemailer';

const getTransporterConfig = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const isGmail = host.includes('gmail.com');

  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (isGmail) {
    return {
      service: 'gmail',
      auth: { user, pass },
    };
  }

  return {
    host,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT === '465',
    auth: { user, pass },
  };
};

export async function sendEmail({ to, subject, html }) {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    console.warn('SMTP credentials not configured. Skipping email send.');
    return { success: false, error: 'Credentials missing' };
  }

  const transporter = nodemailer.createTransport(getTransporterConfig());

  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified. Sending email to:', to);
    const info = await transporter.sendMail({
      from: `"Palestra" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export function getWelcomeEmailHtml(clubName, login, password) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #3146A6;">Добро пожаловать в Palestra!</h2>
      <p>Ваш клуб <strong>${clubName}</strong> успешно зарегистрирован в системе.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; font-size: 16px;">Данные для входа:</h3>
        <p style="margin-bottom: 5px;"><strong>Логин:</strong> ${login}</p>
        <p style="margin-top: 0;"><strong>Пароль:</strong> ${password}</p>
      </div>

      <p>Вы можете войти в панель управления по ссылке:</p>
      <a href="https://palestra-blond.vercel.app/auth/login" style="display: inline-block; background-color: #3146A6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Войти в систему</a>

      <p style="margin-top: 30px; font-size: 12px; color: #666;">Это автоматическое письмо, на него не нужно отвечать.</p>
    </div>
  `;
}
