import { parseJsonBody, sendJson, parseCookies } from '../_lib/http.js';
import { getServiceClient, hasSupabaseServiceEnv } from '../_lib/supabase.js';
import crypto from 'crypto';

// Утилита для генерации подписи Freedom Pay (PayBox)
function generateFreedomPaySignature(params, secretKey) {
  // 1. Сортируем ключи по алфавиту
  const sortedKeys = Object.keys(params).sort();
  // 2. Берем значения
  const values = sortedKeys.map(key => params[key]);
  // 3. Формируем строку: имя_скрипта;значение1;значение2;...;secret_key
  const signatureString = ['payment.php', ...values, secretKey].join(';');
  // 4. MD5 хеш
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { clubId, tariffId, amount } = await parseJsonBody(req);
    
    // В реальном приложении здесь нужна проверка авторизации (jwt/cookie)
    // чтобы убедиться, что пользователь является админом этого клуба.
    const cookies = parseCookies(req);
    // Для MVP предполагаем, что вызов легитимен, если передан clubId

    if (!hasSupabaseServiceEnv()) {
      // Mock-ответ для демо-окружения
      return sendJson(res, 200, {
        paymentUrl: `/billing/success?order_id=mock_${Date.now()}&tariff_id=${tariffId}`
      });
    }

    const supabase = getServiceClient();
    
    // 1. Создаем запись о платеже в базе (статус pending)
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        club_id: clubId,
        order_id: orderId,
        amount: amount,
        currency: 'KZT',
        status: 'pending',
        tariff_id: tariffId
      })
      .select('id, order_id')
      .single();

    if (insertError) throw insertError;

    // 2. Генерируем ссылку на оплату Freedom Pay (PayBox)
    const merchantId = process.env.FREEDOM_PAY_MERCHANT_ID || 'demo_merchant';
    const secretKey = process.env.FREEDOM_PAY_SECRET_KEY || 'demo_secret';
    const isDemo = !process.env.FREEDOM_PAY_MERCHANT_ID;

    if (isDemo) {
      // Возвращаем локальный мок для тестирования UI
      return sendJson(res, 200, {
        paymentUrl: `/billing/success?order_id=${payment.order_id}&tariff_id=${tariffId}`
      });
    }

    // Параметры для Freedom Pay
    const paymentParams = {
      pg_merchant_id: merchantId,
      pg_order_id: payment.order_id,
      pg_amount: amount.toString(),
      pg_currency: 'KZT',
      pg_description: `Оплата тарифа ${tariffId} (Palestra CRM)`,
      pg_salt: crypto.randomBytes(16).toString('hex'),
      pg_result_url: `https://${req.headers.host}/api/billing/webhook`,
      pg_success_url: `https://${req.headers.host}/billing/success`,
      pg_failure_url: `https://${req.headers.host}/billing/failure`,
      pg_testing_mode: '1' // Включаем тестовый режим шлюза
    };

    // Подписываем запрос
    paymentParams.pg_sig = generateFreedomPaySignature(paymentParams, secretKey);

    // Собираем URL
    const queryString = new URLSearchParams(paymentParams).toString();
    const paymentUrl = `https://api.paybox.money/payment.php?${queryString}`;

    return sendJson(res, 200, { paymentUrl });

  } catch (error) {
    console.error('Create checkout error:', error);
    return sendJson(res, 500, { error: 'Failed to create checkout session' });
  }
}
