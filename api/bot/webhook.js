import { getServiceClient } from '../_lib/supabase.js';
import { sendJson } from '../_lib/http.js';

const BOT_TOKEN = '8766624021:AAEqQ8Te84V-4Po5AfZ2xhFctPJem3gcaSE';

export default async function handler(req, res) {
  // Always acknowledge TG updates
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
      
      // Query app_state that contains this registration code
      const { data: states, error } = await supabase
        .from('app_state')
        .select('club_id, state')
        .contains('state', { tg_reg_code: code });

      if (error || !states?.length) {
        return await sendMessage(chatId, "❌ *Ошибка:* Код не найден или уже был использован. Пожалуйста, обратитесь в поддержку или проверьте ссылку на сайте.");
      }

      const clubState = states[0];
      const { admin_email, temp_password, admin_auth_id, clubInfo } = clubState.state;
      const tgUser = message?.from || callback_query?.from;

      // Update state: clear reg code and save chat_id + user info
      const newState = { 
        ...clubState.state, 
        tg_chat_id: chatId, 
        tg_user_info: {
          id: tgUser?.id,
          username: tgUser?.username,
          first_name: tgUser?.first_name,
          last_name: tgUser?.last_name,
        },
        tg_reg_code: null, // One-time use
        bot_status: 'ready'
      };
      
      await supabase
        .from('app_state')
        .update({ state: newState })
        .eq('club_id', clubState.club_id);

      const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://palestra.vercel.app';
      const loginUrl = `${host}/auth/login`;

      const msg = `🎉 *Добро пожаловать в ${clubInfo?.name || 'Palestra'}!*\n\n` +
        `Ваш кабинет администратора готов. Вот ваши данные для входа:\n\n` +
        `📧 Логин: \`${admin_email}\`\n` +
        `🔑 Пароль: \`${temp_password || 'Указанный при регистрации'}\`\n\n` +
        `👆 _Нажмите на логин или пароль, чтобы скопировать их._\n\n` +
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
      
      // Store bot state to wait for password
      // We can use a simple state machine in the app_state or a separate table.
      // For now, let's just ask them to type it.
      await sendMessage(chatId, "🔐 *Смена пароля*\n\nПожалуйста, введите новый пароль (не менее 12 символов).\n\n_Важно: после отправки пароля он будет немедленно обновлен для вашего аккаунта._");
      
      // Find the club for this chat
      const { data: clubStates } = await supabase
        .from('app_state')
        .select('club_id, state')
        .contains('state', { tg_chat_id: chatId });

      if (clubStates?.length) {
        await supabase
          .from('app_state')
          .update({ state: { ...clubStates[0].state, bot_awaiting_pwd: authId } })
          .eq('club_id', clubStates[0].club_id);
      }
      
      return sendJson(res, 200, { ok: true });
    }

    // 3. Handle incoming message (Password update)
    if (text && !text.startsWith('/')) {
       // Check if we are waiting for a password
       const { data: clubStates } = await supabase
         .from('app_state')
         .select('club_id, state')
         .contains('state', { tg_chat_id: chatId });

       if (clubStates?.length && clubStates[0].state.bot_awaiting_pwd) {
         const authId = clubStates[0].state.bot_awaiting_pwd;
         
         if (text.length < 12) {
           return await sendMessage(chatId, "⚠️ Пароль слишком короткий. Минимум 12 символов.");
         }

         // Update Auth Password
         const { error } = await supabase.auth.admin.updateUserById(authId, { password: text });

         if (error) {
           return await sendMessage(chatId, "❌ Ошибка при обновлении пароля: " + error.message);
         }

         // Clear state
         const newState = { ...clubStates[0].state };
         delete newState.bot_awaiting_pwd;
         newState.temp_password = text; // Update stored temp password

         await supabase
           .from('app_state')
           .update({ state: newState })
           .eq('club_id', clubStates[0].club_id);

         await sendMessage(chatId, "✅ *Пароль успешно обновлен!*\n\nТеперь вы можете войти в систему с новым паролем.");
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
  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}
