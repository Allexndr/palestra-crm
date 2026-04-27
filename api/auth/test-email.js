import { sendEmail } from '../_lib/mail.js';
import { sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  const testEmail = 'sanmemik2000@gmail.com';
  
  try {
    const result = await sendEmail({
      to: testEmail,
      subject: 'Тестовое письмо от Palestra CRM',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #3146A6;">Проверка связи!</h2>
          <p>Если вы видите это письмо, значит SMTP настроен верно.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">Время отправки: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    return sendJson(res, 200, { 
      message: 'Test email process finished', 
      result 
    });
  } catch (error) {
    return sendJson(res, 500, { 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
