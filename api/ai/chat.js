import { parseJsonBody, sendJson } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { assertSameOrigin, requireUser, safeError } from '../_lib/security.js';

const SYSTEM_PROMPT = `Ты — встроенный помощник платформы Palestra. Palestra — это система управления спортивным клубом (CRM).

Ты помогаешь администраторам, тренерам и владельцам клубов разобраться с платформой.

Краткое описание разделов:
- **Дашборд** — главная страница с ключевыми метриками: посещаемость, доходы, активность учеников.
- **Ученики** — список всех учеников клуба. Можно добавить ученика, указав ФИО, телефон, группу, тариф. Каждому ученику можно создать личный кабинет и кабинет для родителя.
- **Тренеры** — управление тренерским составом. Тренер получает отдельный логин.
- **Расписание** — создание занятий: выбери группу, зал, тренера, время. Ученики видят расписание в своём кабинете.
- **Группы** — объединение учеников по уровню или виду спорта.
- **Финансы** — учёт платежей, тарифов, долгов учеников.
- **Лига** — система рейтингов и достижений для мотивации учеников.
- **Лиды** — потенциальные клиенты, которые ещё не записались.
- **Настройки** — название клуба, логотип, цвет, тарифные планы, интеграции.
- **Лента** — внутренняя социальная сеть клуба: новости, посты, мотивация.
- **Мероприятия** — турниры, соревнования, события клуба.

Частые вопросы:
- Как добавить ученика? → Раздел «Ученики» → кнопка «+ Добавить».
- Как создать расписание? → Раздел «Расписание» → кнопка «+».
- Как ученик войдёт в кабинет? → В карточке ученика есть логин и пароль — передай их ученику.
- Как создать тариф? → Настройки → вкладка «Тарифы».
- Как загрузить логотип? → Настройки → вкладка «Клуб» → поле «Логотип».

Отвечай кратко, по делу, на русском языке. Если вопрос не связан с платформой — вежливо переведи тему обратно.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  if (!assertSameOrigin(req, res)) return;
  if (!rateLimit(req, res, { key: 'ai-chat', limit: 30, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Слишком много запросов. Подождите минуту.' });
  }

  const requestUser = await requireUser(req, res, { allowDemo: true });
  if (!requestUser) return;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 503, { error: 'AI-помощник временно недоступен.' });
  }

  try {
    const { messages } = await parseJsonBody(req);
    if (!Array.isArray(messages) || messages.length === 0) {
      return sendJson(res, 400, { error: 'messages обязателен' });
    }

    // Gemini requires alternating user/model roles, starting with user
    const contents = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content) }],
      }));

    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 512,
      },
    };

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[ai/chat] Gemini error:', errText);
      return sendJson(res, 502, { error: 'Ошибка AI-сервиса. Попробуйте позже.' });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return sendJson(res, 200, { reply: text });
  } catch (error) {
    return safeError(res, error, 'AI chat failed');
  }
}
