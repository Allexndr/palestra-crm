import { getServiceClient } from '../_lib/supabase.js';
import { sendJson } from '../_lib/http.js';
import { notifyStudentWelcome } from '../_lib/telegram.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8766624021:AAEqQ8Te84V-4Po5AfZ2xhFctPJem3gcaSE';

// Localization
const i18n = {
  ru: {
    welcome_choose_lang: '👋 Добро пожаловать в Palestra!\n\nВыберите язык / Тілді таңдаңыз:',
    welcome_admin: (name, email, password, url) => 
      `🎉 *Добро пожаловать в ${name || 'Palestra'}!*\n\n` +
      `Ваш кабинет администратора готов.\n\n` +
      `📧 Логин: \`${email}\`\n` +
      `🔑 Пароль: \`${password || 'Указанный при регистрации'}\`\n\n` +
      `🔗 Вход: [palestra.fit/auth/login](${url})`,
    welcome_student: (clubName) => 
      `🎉 *Добро пожаловать в ${clubName || 'Palestra'}!*\n\n` +
      `Ваш Telegram успешно привязан к аккаунту. Теперь вы будете получать:\n\n` +
      `📅 Напоминания о тренировках\n` +
      `⏰ Уведомления об окончании абонемента\n` +
      `🏆 Новости о достижениях и квестах\n` +
      `📊 Отчёты о посещаемости\n\n` +
      `🔗 Ваш личный кабинет: [palestra.fit](https://palestra.fit)`,
    btn_change_pwd: '✏️ Сменить пароль',
    btn_login: '🚀 Войти в систему',
    btn_schedule: '📅 Моё расписание',
    btn_subscription: '💳 Мой абонемент',
    btn_achievements: '🏆 Мои достижения',
    btn_language: '🌐 Язык / Тіл',
    btn_open: '🚀 Открыть',
    error_code_not_found: '❌ *Ошибка:* Код не найден или уже был использован.',
    error_profile_not_found: '❌ Профиль не найден. Пожалуйста, свяжитесь с администратором клуба.',
    pwd_enter_new: '🔐 *Смена пароля*\n\nПожалуйста, введите новый пароль (не менее 12 символов).',
    pwd_too_short: '⚠️ Пароль слишком короткий. Минимум 12 символов.',
    pwd_updating: '⏳ *Обновляю пароль...*',
    pwd_success: '✅ *Пароль успешно обновлён!*\n\nТеперь войдите с новым паролем.',
    lang_changed: (lang) => `✅ Язык изменён на ${lang === 'kz' ? 'қазақша' : 'русский'}`,
    lang_current: (lang) => `🌐 Текущий язык: ${lang === 'kz' ? 'қазақша 🇰🇿' : 'русский 🇷🇺'}\n\nВыберите новый язык / Жаңа тілді таңдаңыз:`,
    my_schedule: (url) => `📅 *Моё расписание*\n\nПросмотрите расписание в личном кабинете:\n[Открыть расписание](${url}/schedule)`,
    my_subscription: (url) => `💳 *Мой абонемент*\n\nПроверьте статус абонемента в профиле:\n[Открыть профиль](${url}/profile)`,
    my_achievements: (url) => `🏆 *Мои достижения*\n\nПосмотрите свои достижения в профиле:\n[Открыть профиль](${url}/profile)`,
  },
  kz: {
    welcome_choose_lang: '👋 Palestra-ға қош келдіңіз!\n\nТілді таңдаңыз / Выберите язык:',
    welcome_admin: (name, email, password, url) => 
      `🎉 *${name || 'Palestra'}-ға қош келдіңіз!*\n\n` +
      `Әкімші кабинеті дайын.\n\n` +
      `📧 Логин: \`${email}\`\n` +
      `🔑 Құпиясөз: \`${password || 'Тіркеуде көрсетілген'}\`\n\n` +
      `🔗 Кіру: [palestra.fit/auth/login](${url})`,
    welcome_student: (clubName) => 
      `🎉 *${clubName || 'Palestra'}-ға қош келдіңіз!*\n\n` +
      `Telegram-ыңыз аккаунтқа сәтті байланыстырылды. Енді сіз аласыз:\n\n` +
      `📅 Жаттығулар туралы еске салулар\n` +
      `⏰ Абонемент аяқталуы туралы хабарламалар\n` +
      `🏆 Жетістіктер мен квесттер жаңалықтары\n` +
      `📊 Қатысу туралы есептер\n\n` +
      `🔗 Жеке кабинет: [palestra.fit](https://palestra.fit)`,
    btn_change_pwd: '✏️ Құпиясөзді өзгерту',
    btn_login: '🚀 Жүйеге кіру',
    btn_schedule: '📅 Менің кестем',
    btn_subscription: '💳 Менің абонементім',
    btn_achievements: '🏆 Менің жетістіктерім',
    btn_language: '🌐 Тіл / Язык',
    btn_open: '🚀 Ашу',
    error_code_not_found: '❌ *Қате:* Код табылмады немесе қолданылған.',
    error_profile_not_found: '❌ Профиль табылмады. Клуб әкімшісімен хабарласыңыз.',
    pwd_enter_new: '🔐 *Құпиясөзді өзгерту*\n\nЖаңа құпиясөзді енгізіңіз (кемінде 12 таңба).',
    pwd_too_short: '⚠️ Құпиясөз тым қысқа. Кемінде 12 таңба.',
    pwd_updating: '⏳ *Құпиясөзді жаңартамын...*',
    pwd_success: '✅ *Құпиясөз сәтті жаңартылды!*\n\nЕнді жаңа құпиясөзбен кіріңіз.',
    lang_changed: (lang) => `✅ Тіл өзгертілді: ${lang === 'kz' ? 'қазақша' : 'русский'}`,
    lang_current: (lang) => `🌐 Ағымдағы тіл: ${lang === 'kz' ? 'қазақша 🇰🇿' : 'русский 🇷🇺'}\n\nЖаңа тілді таңдаңыз / Выберите новый язык:`,
    my_schedule: (url) => `📅 *Менің кестем*\n\nЖеке кабинеттегі кестені қараңыз:\n[Кестені ашу](${url}/schedule)`,
    my_subscription: (url) => `💳 *Менің абонементім*\n\nПрофильдегі абонемент күйін тексеріңіз:\n[Профильді ашу](${url}/profile)`,
    my_achievements: (url) => `🏆 *Менің жетістіктерім*\n\nПрофильдегі жетістіктеріңізді қараңыз:\n[Профильді ашу](${url}/profile)`,
  }
};

function t(key, lang = 'ru', ...args) {
  const text = i18n[lang]?.[key] || i18n.ru[key] || key;
  return typeof text === 'function' ? text(...args) : text;
}

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

    // Helper: get user language
    const getUserLang = async () => {
      // Try profiles first
      const { data: profile } = await supabase
        .from('profiles')
        .select('tg_lang')
        .eq('tg_chat_id', chatId)
        .maybeSingle();
      if (profile?.tg_lang) return profile.tg_lang;
      
      // Try app_state for admin
      const { data: state } = await supabase
        .from('app_state')
        .select('state')
        .filter('state->>tg_chat_id', 'eq', chatId.toString())
        .maybeSingle();
      return state?.state?.tg_lang || 'ru';
    };

    // 0. Plain /start - show language selection
    if (text === '/start') {
      const langKeyboard = {
        inline_keyboard: [
          [{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }, { text: '🇰🇿 Қазақша', callback_data: 'lang_kz' }]
        ]
      };
      await sendMessage(chatId, i18n.ru.welcome_choose_lang, langKeyboard);
      return sendJson(res, 200, { ok: true });
    }

    // 0.1 Language selection callback
    if (data?.startsWith('lang_')) {
      const selectedLang = data.replace('lang_', '');
      
      // Save language preference temporarily in pending state
      await supabase.from('tg_pending_users').upsert({
        chat_id: chatId,
        lang: selectedLang,
        updated_at: new Date().toISOString()
      }, { onConflict: 'chat_id' });
      
      // Show code input prompt in selected language
      const langConfirmKeyboard = {
        inline_keyboard: [
          [{ text: t('btn_language', selectedLang), callback_data: 'action_change_lang' }]
        ]
      };
      
      const promptText = selectedLang === 'kz' 
        ? `✅ Тіл таңдалды: *қазақша*\n\nКелесі қадам:\n/start STU-XXXXXX командасын жіберіңіз немесе хабарлама алған кодты енгізіңіз.`
        : `✅ Язык выбран: *русский*\n\nСледующий шаг:\nОтправьте команду /start STU-XXXXXX или введите код из сообщения.`;
      
      await sendMessage(chatId, promptText, langConfirmKeyboard);
      return sendJson(res, 200, { ok: true });
    }

    // 0.2 Change language command or button
    if (text === '/lang' || text === '/language' || data === 'action_change_lang') {
      const currentLang = await getUserLang();
      const langKeyboard = {
        inline_keyboard: [
          [{ text: '🇷🇺 Русский', callback_data: 'lang_set_ru' }, { text: '🇰🇿 Қазақша', callback_data: 'lang_set_kz' }]
        ]
      };
      await sendMessage(chatId, t('lang_current', currentLang), langKeyboard);
      return sendJson(res, 200, { ok: true });
    }

    // 0.3 Set language for existing user
    if (data?.startsWith('lang_set_')) {
      const newLang = data.replace('lang_set_', '');
      
      // Try to update profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('tg_chat_id', chatId)
        .maybeSingle();
      
      if (profile) {
        await supabase.from('profiles').update({ tg_lang: newLang }).eq('id', profile.id);
      }
      
      // Also try to update app_state for admin
      const { data: clubStates } = await supabase
        .from('app_state')
        .select('club_id, state')
        .filter('state->>tg_chat_id', 'eq', chatId.toString());
      
      if (clubStates?.length) {
        const newState = { ...clubStates[0].state, tg_lang: newLang };
        await supabase.from('app_state').update({ state: newState }).eq('club_id', clubStates[0].club_id);
      }
      
      await sendMessage(chatId, t('lang_changed', newLang, newLang));
      return sendJson(res, 200, { ok: true });
    }

    // 1. Handle deep-link /start CODE (Admin registration)
    if (text?.startsWith('/start ')) {
      const code = text.split(' ')[1];
      
      // Get language from pending or default to ru
      const { data: pending } = await supabase
        .from('tg_pending_users')
        .select('lang')
        .eq('chat_id', chatId)
        .maybeSingle();
      const lang = pending?.lang || 'ru';
      
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
          tg_lang: lang,
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

        const msg = t('welcome_admin', lang, clubInfo?.name, admin_email, temp_password, loginUrl);

        const keyboard = {
          inline_keyboard: [
            [{ text: t('btn_change_pwd', lang), callback_data: `action_change_pwd_${admin_auth_id}` }],
            [{ text: t('btn_login', lang), url: loginUrl }],
            [{ text: t('btn_language', lang), callback_data: 'action_change_lang' }]
          ]
        };

        await sendMessage(chatId, msg, keyboard);
        
        // Clean up pending
        await supabase.from('tg_pending_users').delete().eq('chat_id', chatId);
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
          
          // Update profile with tg_chat_id and language
          await supabase.from('profiles').update({
            tg_chat_id: chatId,
            tg_lang: lang,
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

          const welcomeMsg = t('welcome_student', lang, club?.name || 'Palestra');
          const studentKeyboard = {
            inline_keyboard: [
              [{ text: t('btn_schedule', lang), callback_data: 'student_schedule' }],
              [{ text: t('btn_subscription', lang), callback_data: 'student_subscription' }],
              [{ text: t('btn_achievements', lang), callback_data: 'student_achievements' }],
              [{ text: t('btn_language', lang), callback_data: 'action_change_lang' }]
            ]
          };

          await sendMessage(chatId, welcomeMsg, studentKeyboard);
          
          // Clean up pending
          await supabase.from('tg_pending_users').delete().eq('chat_id', chatId);
          return sendJson(res, 200, { ok: true });
        }
      }

      await sendMessage(chatId, t('error_code_not_found', lang));
      return sendJson(res, 200, { ok: true });
    }

    // 2. Handle Change Password Button (Admin)
    if (data?.startsWith('action_change_pwd_')) {
      const authId = data.replace('action_change_pwd_', '');
      const lang = await getUserLang();
      
      await sendMessage(chatId, t('pwd_enter_new', lang));
      
      const { data: clubStates } = await supabase.from('app_state').select('club_id, state').contains('state', { tg_chat_id: chatId });
      if (clubStates?.length) {
        await supabase.from('app_state').update({ state: { ...clubStates[0].state, bot_awaiting_pwd: authId } }).eq('club_id', clubStates[0].club_id);
      }
      return sendJson(res, 200, { ok: true });
    }

    // 2.1 Handle Student callback buttons
    if (data?.startsWith('student_')) {
      const action = data.replace('student_', '');
      const lang = await getUserLang();
      
      // Find student profile by tg_chat_id
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('id, club_id, role')
        .eq('tg_chat_id', chatId)
        .in('role', ['student', 'coach', 'parent'])
        .maybeSingle();

      if (!studentProfile) {
        await sendMessage(chatId, t('error_profile_not_found', lang));
        return sendJson(res, 200, { ok: true });
      }

      const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://palestra.fit';

      switch (action) {
        case 'schedule':
          await sendMessage(chatId, 
            t('my_schedule', lang, host),
            { inline_keyboard: [[{ text: t('btn_open', lang), url: `${host}/schedule` }]] }
          );
          break;
        case 'subscription':
          await sendMessage(chatId,
            t('my_subscription', lang, host),
            { inline_keyboard: [[{ text: t('btn_open', lang), url: `${host}/profile` }]] }
          );
          break;
        case 'achievements':
          await sendMessage(chatId,
            t('my_achievements', lang, host),
            { inline_keyboard: [[{ text: t('btn_open', lang), url: `${host}/profile` }]] }
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
         const lang = clubStates[0].state.tg_lang || 'ru';
         
         if (newPwd.length < 12) {
           await sendMessage(chatId, t('pwd_too_short', lang));
           return sendJson(res, 200, { ok: true });
         }

         await sendMessage(chatId, t('pwd_updating', lang));

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

         await sendMessage(chatId, t('pwd_success', lang));
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
