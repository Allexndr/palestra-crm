import { getServiceClient } from '../_lib/supabase.js';
import { sendJson } from '../_lib/http.js';

const BOT_TOKEN = '8766624021:AAEqQ8Te84V-4Po5AfZ2xhFctPJem3gcaSE';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 200, { ok: true, message: 'Bot is running' });
  }

  const { message, callback_query } = req.body;
  console.log('BOT RECEIVED UPDATE:', JSON.stringify(req.body, null, 2));
  const chatId = message?.chat?.id || callback_query?.message?.chat?.id;
  const text = message?.text;
  const data = callback_query?.data;

  if (!chatId) return sendJson(res, 200, { ok: true });

  try {
    const supabase = getServiceClient();

    // 1. Handle deep-link /start CODE
    if (text?.startsWith('/start ')) {
      const code = text.split(' ')[1];
      const { data: states, error } = await supabase
        .from('app_state')
        .select('club_id, state')
        .contains('state', { tg_reg_code: code });

      if (error || !states?.length) {
        await sendMessage(chatId, "❌ *Ошибка:* Код не найден или уже был использован.");
        return sendJson(res, 200, { ok: true });
      }

      const clubState = states[0];
      const { admin_email, temp_password, admin_auth_id, clubInfo } = clubState.state;
      const tgUser = message?.from || callback_query?.from;

      const newState = { 
        ...clubState.state, 
        tg_chat_id: chatId, 
        tg_user_info: {
          id: tgUser?.id,
          username: tgUser?.username,
          first_name: tgUser?.first_name,
          last_name: tgUser?.last_name,
        },
        tg_reg_code: null,
        bot_status: 'ready'
      };
      
      await supabase.from('app_state').update({ state: newState }).eq('club_id', clubState.club_id);

      const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://palestra.fit';
      const loginUrl = `${host}/auth/login`;

      const msg = `🎉 *Добро пожаловать в ${clubInfo?.name || 'Palestra'}!*\n\n` +
        `Ваш кабинет администратора готов. Вот ваши данные для входа:\n\n` +
        `📧 Логин: \`${admin_email}\`\n` +
        `🔑 Пароль: \`${temp_password || 'Указанный при регистрации'}\`\n\n` +
        `🔗 Вход: [palestra.fit/auth/login](${loginUrl})`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "✏️ Сменить пароль", callback_data: `action_change_pwd_${admin_auth_id}` }],
          [{ text: "🚀 Войти в систему", url: loginUrl }]
        ]
      };

      await sendMessage(chatId, msg, keyboard);
      return sendJson(res, 200, { ok: true });
    }

    // 2. Handle Change Password Button
    if (data?.startsWith('action_change_pwd_')) {
      const authId = data.replace('action_change_pwd_', '');
      await sendMessage(chatId, "🔐 *Смена пароля*\n\nПожалуйста, введите новый пароль (не менее 12 символов).");
      
      const { data: clubStates } = await supabase.from('app_state').select('club_id, state').contains('state', { tg_chat_id: chatId });
      if (clubStates?.length) {
        await supabase.from('app_state').update({ state: { ...clubStates[0].state, bot_awaiting_pwd: authId } }).eq('club_id', clubStates[0].club_id);
      }
      return sendJson(res, 200, { ok: true });
    }

    // 3. Handle incoming message (Password update)
    if (text && !text.startsWith('/')) {
       const { data: clubStates } = await supabase.from('app_state').select('club_id, state').contains('state', { tg_chat_id: chatId });

       if (clubStates?.length && clubStates[0].state.bot_awaiting_pwd) {
         const authId = clubStates[0].state.bot_awaiting_pwd;
         const newPwd = text.trim();
         
         if (newPwd.length < 10) {
           await sendMessage(chatId, "⚠️ Пароль слишком короткий. Минимум 12 символов.");
           return sendJson(res, 200, { ok: true });
         }

         await sendMessage(chatId, "⏳ *Обновляю пароль...*");
         res.status(200).json({ ok: true }); // Мгновенный ответ Телеграму

         try {
           const { error } = await supabase.auth.admin.updateUserById(authId, { password: newPwd });
           if (error) {
             await sendMessage(chatId, "❌ Ошибка: " + error.message);
             return;
           }

           const newState = { ...clubStates[0].state };
           delete newState.bot_awaiting_pwd;
           newState.temp_password = newPwd; 

           await supabase.from('app_state').update({ state: newState }).eq('club_id', clubStates[0].club_id);
           await sendMessage(chatId, "✅ *Пароль успешно обновлен!*");
         } catch (e) {
           console.error('BG ERROR:', e);
         }
         return;
       }
    }

    return sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error('Bot Handler Error:', err);
    return sendJson(res, 200, { ok: true });
  }
}

async function sendMessage(chatId, text, replyMarkup = null) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = { chat_id: chatId, text, parse_mode: 'Markdown', disable_web_page_preview: true };
  if (replyMarkup) body.reply_markup = replyMarkup;

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}
