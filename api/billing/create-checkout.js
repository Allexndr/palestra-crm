import { parseJsonBody, sendJson } from '../_lib/http.js';
import { getServiceClient, hasSupabaseServiceEnv } from '../_lib/supabase.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { assertSameOrigin, requireUser, safeError } from '../_lib/security.js';
import crypto from 'crypto';

const TARIFF_PRICE = {
  base: 9000,
  pro: 15000,
};

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
  if (!assertSameOrigin(req, res)) return;
  if (!rateLimit(req, res, { key: 'billing-checkout', limit: 20, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Too many checkout attempts' });
  }

  try {
    const requestUser = await requireUser(req, res, { allowDemo: false });
    if (!requestUser) return;
    if (requestUser.profile.role !== 'admin') {
      return sendJson(res, 403, { error: 'Only club admin can create checkout' });
    }

    const payload = await parseJsonBody(req);
    const tariffId = String(payload?.tariffId || '').trim().toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(TARIFF_PRICE, tariffId)) {
      return sendJson(res, 400, { error: 'Unsupported tariff' });
    }
    const amount = TARIFF_PRICE[tariffId];
    const clubId = requestUser.profile.club_id;

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
        amount,
        currency: 'KZT',
        status: 'pending',
        tariff_id: tariffId,
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
      pg_amount: String(amount),
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
    return safeError(res, error, 'Failed to create checkout session');
  }
}
