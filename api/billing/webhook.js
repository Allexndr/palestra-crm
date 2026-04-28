import { parseJsonBody, sendJson } from '../_lib/http.js';
import { getServiceClient, hasSupabaseServiceEnv } from '../_lib/supabase.js';
import { rateLimit } from '../_lib/rateLimit.js';
import crypto from 'crypto';

// Утилита для проверки подписи Freedom Pay (PayBox)
function verifyFreedomPaySignature(params, secretKey, expectedSignature) {
  // Копируем параметры, чтобы удалить саму подпись для проверки
  const paramsToSign = { ...params };
  delete paramsToSign.pg_sig;

  const sortedKeys = Object.keys(paramsToSign).sort();
  const values = sortedKeys.map(key => paramsToSign[key]);
  // URL вебхука может отличаться (в настройках ФридомПэй задается имя скрипта)
  // По умолчанию берется имя из запроса, например 'webhook'
  const signatureString = ['webhook', ...values, secretKey].join(';');
  const calculatedSignature = crypto.createHash('md5').update(signatureString).digest('hex');
  
  return calculatedSignature === expectedSignature;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  if (!rateLimit(req, res, { key: 'billing-webhook', limit: 120, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Too many webhook requests' });
  }

  try {
    // Freedom Pay обычно шлет данные в x-www-form-urlencoded, но иногда в JSON.
    // Если это form-encoded, потребуется доп. парсинг, но для MVP предполагаем JSON или 
    // парсинг, который делает Vercel (req.body может быть объектом).
    const payload = req.body || await parseJsonBody(req);
    
    // 1. Проверяем подпись (если заданы секреты)
    const secretKey = process.env.FREEDOM_PAY_SECRET_KEY;
    if (secretKey && !payload.pg_sig) {
      return sendJson(res, 400, { error: 'Missing signature' });
    }
    if (secretKey && payload.pg_sig) {
      const isValid = verifyFreedomPaySignature(payload, secretKey, payload.pg_sig);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return sendJson(res, 400, { error: 'Invalid signature' });
      }
    }

    const orderId = payload.pg_order_id;
    const paymentId = payload.pg_payment_id;
    const statusResult = payload.pg_result; // 1 - успех, 0 - неуспех

    if (!orderId) {
      return sendJson(res, 400, { error: 'Missing order_id' });
    }

    if (!hasSupabaseServiceEnv()) {
      return sendJson(res, 200, { message: 'Mock success' });
    }

    const supabase = getServiceClient();

    // 2. Ищем платеж по order_id
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (fetchError || !payment) {
      console.error('Payment not found:', orderId);
      return sendJson(res, 404, { error: 'Payment not found' });
    }

    // 3. Обновляем статус платежа
    const newStatus = statusResult === 1 || statusResult === '1' ? 'success' : 'failed';
    
    await supabase
      .from('payments')
      .update({
        status: newStatus,
        payment_id: paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    // 4. Если успех, обновляем подписку
    if (newStatus === 'success') {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('club_id', payment.club_id)
        .maybeSingle();

      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1); // Подписка на месяц

      if (subscription) {
        // Продлеваем текущую
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            tariff_id: payment.tariff_id,
            current_period_end: periodEnd.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);
      } else {
        // Создаем новую
        await supabase
          .from('subscriptions')
          .insert({
            club_id: payment.club_id,
            status: 'active',
            tariff_id: payment.tariff_id,
            current_period_start: new Date().toISOString(),
            current_period_end: periodEnd.toISOString()
          });
      }
    }

    // Freedom Pay ожидает XML-ответ для подтверждения получения вебхука
    // Для совместимости возвращаем XML
    const responseXml = `
      <?xml version="1.0" encoding="utf-8"?>
      <response>
          <pg_salt>${payload.pg_salt || 'salt'}</pg_salt>
          <pg_status>ok</pg_status>
          <pg_description>Payment processed</pg_description>
          <pg_sig></pg_sig>
      </response>
    `;
    
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(responseXml.trim());

  } catch (error) {
    console.error('Webhook processing error:', error);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
}
