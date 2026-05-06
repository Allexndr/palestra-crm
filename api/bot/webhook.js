import { getServiceClient } from '../_lib/supabase.js';
import { sendJson } from '../_lib/http.js';
import { notifyStudentWelcome } from '../_lib/telegram.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8766624021:AAEqQ8Te84V-4Po5AfZ2xhFctPJem3gcaSE';

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

    // 1. Handle deep-link /start CODE (Admin registration)
    if (text?.startsWith('/start ')) {
      const code = text.split(' ')[1];
      
      // Try to find as admin/club registration code
      const { data: states, error } = await supabase
        .from('app_state')
        .select('club_id, state')
        .contains('state', { tg_reg_code: code });

      if (!error && states?.length) {
        // Admin/club registration flow
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

      // Try to find as student linking code (format: STU-XXXXXX)
      if (code.startsWith('STU-') || code.length === 10) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, first_name, role, club_id, tg_chat_id')
          .eq('tg_link_code', code)
          .in('role', ['student', 'coach', 'parent'])
          .maybeSingle();

        if (!profileError && profiles) {
          const tgUser = message?.from;
          
          // Update profile with tg_chat_id
          await supabase.from('profiles').update({
            tg_chat_id: chatId,
            tg_user_info: {
              id: tgUser?.id,
              username: tgUser?.username,
              first_name: tgUser?.first_name,
              last_name: tgUser?.last_name,
            },
            tg_link_code: null, // Clear the code
            updated_at: new Date().toISOString()
          }).eq('id', profiles.id);

          // Get club name
          const { data: club } = await supabase.from('clubs').select('name').eq('id', profiles.club_id).maybeSingle();

          await notifyStudentWelcome(chatId, 
            { firstName: profiles.first_name || profiles.name, name: profiles.name },
            club?.name || 'Palestra'
          );
          return sendJson(res, 200, { ok: true });
        }
      }

      await sendMessage(chatId, "❌ *Ошибка:* Код не найден или уже был использован.");
      return sendJson(res, 200, { ok: true });
    }

    // 2. Handle Change Password Button (Admin)
    if (data?.startsWith('action_change_pwd_')) {
      const authId = data.replace('action_change_pwd_', '');
      await sendMessage(chatId, "🔐 *Смена пароля*\n\nПожалуйста, введите новый пароль (не менее 12 символов).");
      
      const { data: clubStates } = await supabase.from('app_state').select('club_id, state').contains('state', { tg_chat_id: chatId });
      if (clubStates?.length) {
        await supabase.from('app_state').update({ state: { ...clubStates[0].state, bot_awaiting_pwd: authId } }).eq('club_id', clubStates[0].club_id);
      }
      return sendJson(res, 200, { ok: true });
    }

    // 2.1 Handle Student callback buttons
    if (data?.startsWith('student_')) {
      const action = data.replace('student_', '');
      
      // Find student profile by tg_chat_id
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('id, club_id, role')
        .eq('tg_chat_id', chatId)
        .in('role', ['student', 'coach', 'parent'])
        .maybeSingle();

      if (!studentProfile) {
        await sendMessage(chatId, "❌ Профиль не найден. Пожалуйста, свяжитесь с администратором клуба.");
        return sendJson(res, 200, { ok: true });
      }

      const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://palestra.fit';

      switch (action) {
        case 'schedule':
          await sendMessage(chatId, 
            `📅 *Моё расписание*\n\n` +
            `Просмотрите расписание в личном кабинете:\n` +
            `[Открыть расписание](${host}/schedule)`,
            { inline_keyboard: [[{ text: "🚀 Открыть", url: `${host}/schedule` }]] }
          );
          break;
        case 'subscription':
          await sendMessage(chatId,
            `💳 *Мой абонемент*\n\n` +
            `Проверьте статус абонемента в профиле:\n` +
            `[Открыть профиль](${host}/profile)`,
            { inline_keyboard: [[{ text: "🚀 Открыть", url: `${host}/profile` }]] }
          );
          break;
        case 'achievements':
          await sendMessage(chatId,
            `🏆 *Мои достижения*\n\n` +
            `Посмотрите свои достижения в профиле:\n` +
            `[Открыть профиль](${host}/profile)`,
            { inline_keyboard: [[{ text: "🚀 Открыть", url: `${host}/profile` }]] }
          );
          break;
      }
      return sendJson(res, 200, { ok: true });
    }

    // 3. Handle incoming message (Password update)
    if (text && !text.startsWith('/')) {
       console.log(`BOT: Processing message from ${chatId}: "${text}"`);
       
       // More reliable lookup using arrow operator for JSONB
       const { data: clubStates, error: lookupError } = await supabase
         .from('app_state')
         .select('club_id, state')
         .filter('state->>tg_chat_id', 'eq', chatId.toString());

       if (lookupError) console.error('Lookup Error:', lookupError);
       console.log(`BOT: Found ${clubStates?.length || 0} states for this chat`);

       if (clubStates?.length && clubStates[0].state.bot_awaiting_pwd) {
         const authId = clubStates[0].state.bot_awaiting_pwd;
         const newPwd = text.trim();
         
         if (newPwd.length < 12) {
           await sendMessage(chatId, "⚠️ Пароль слишком короткий. Минимум 12 символов.");
           return sendJson(res, 200, { ok: true });
         }

         await sendMessage(chatId, "⏳ *Обновляю пароль...*");

         // Do ALL async work BEFORE returning — Vercel terminates function after res is sent
         const { error: pwdError } = await supabase.auth.admin.updateUserById(authId, { password: newPwd });
         if (pwdError) {
           await sendMessage(chatId, "❌ Ошибка: " + pwdError.message);
           return sendJson(res, 200, { ok: true });
         }

         const newState = { ...clubStates[0].state };
         delete newState.bot_awaiting_pwd;
         newState.temp_password = newPwd;
         await supabase.from('app_state').update({ state: newState }).eq('club_id', clubStates[0].club_id);

         await sendMessage(chatId, "✅ *Пароль успешно обновлён!*\n\nТеперь войдите с новым паролем.");
         return sendJson(res, 200, { ok: true });
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
