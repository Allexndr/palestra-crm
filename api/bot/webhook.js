import { getServiceClient } from '../_lib/supabase.js';
import { sendJson } from '../_lib/http.js';
import { notifyStudentWelcome } from '../_lib/telegram.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8766624021:AAEqQ8Te84V-4Po5AfZ2xhFctPJem3gcaSE';

// Localization
const i18n = {
  ru: {
    welcome_choose_lang: '👋 Добро пожаловать в Palestra!\n\nВыберите язык:',
    welcome_enter_code: '✅ Язык выбран: *русский*\n\n📎 Введите код из приложения — просто отправьте его сюда.\n\n_Нет кода? Нажмите «Восстановить доступ» ниже._',
    welcome_admin: (name, email, password, url) => 
      `🎉 *Добро пожаловать в ${name || 'Palestra'}!*\n\n` +
      `Ваш кабинет администратора готов.\n\n` +
      `📧 Логин: \`${email}\`\n` +
      `🔑 Пароль: \`${password || 'Указанный при регистрации'}\`\n\n` +
      `🔗 Вход: [palestra.fit/auth/login](${url})`,
    welcome_student: (clubName, login, password) => 
      `🎉 *Добро пожаловать в ${clubName || 'Palestra'}!*\n\n` +
      `Telegram успешно привязан.\n\n` +
      `� Ваши данные для входа:\nЛогин: \`${login}\`\nПароль: \`${password}\`\n\n` +
      `🔗 Войти: [palestra-beta.vercel.app/auth/login](https://palestra-beta.vercel.app/auth/login)`,
    btn_change_pwd: '✏️ Сменить пароль',
    btn_login: '🚀 Войти в систему',
    btn_recover: '🆘 Восстановить доступ',
    btn_schedule: '📅 Моё расписание',
    btn_subscription: '💳 Мой абонемент',
    btn_achievements: '🏆 Мои достижения',
    btn_language: '🌐 Язык / Тіл',
    btn_open: '🚀 Открыть',
    error_code_not_found: '❌ Код не найден. Проверьте правильность или запросите новый код у администратора.',
    error_profile_not_found: '❌ Профиль не найден. Обратитесь к администратору клуба.',
    pwd_enter_new: '🔐 *Смена пароля*\n\nВведите новый пароль (не менее 12 символов):',
    pwd_too_short: '⚠️ Пароль слишком короткий. Минимум 12 символов.',
    pwd_updating: '⏳ Обновляю пароль...',
    pwd_success: (url) => `✅ *Пароль обновлён!*\n\nТеперь войдите с новым паролем:\n[Войти](${url})`,
    lang_changed: (lang) => `✅ Язык изменён на ${lang === 'kz' ? 'қазақша' : 'русский'}`,
    lang_current: (lang) => `🌐 Текущий язык: ${lang === 'kz' ? 'қазақша 🇰🇿' : 'русский 🇷🇺'}\n\nВыберите новый язык:`,
    my_schedule: (url) => `📅 *Моё расписание*\n\n[Открыть расписание](${url}/schedule)`,
    my_subscription: (url) => `💳 *Мой абонемент*\n\n[Открыть профиль](${url}/profile)`,
    my_achievements: (url) => `🏆 *Мои достижения*\n\n[Открыть профиль](${url}/profile)`,
    recover_ask_phone: '📱 *Восстановление доступа*\n\nВведите ваш номер телефона, который вы указали при регистрации в клубе:',
    recover_not_found: '❌ Номер не найден. Уточните у администратора клуба, под каким номером вы зарегистрированы.',
    recover_found: (login, password) => `✅ *Ваши данные для входа:*\n\nЛогин: \`${login}\`\nПароль: \`${password}\`\n\n🔗 [Войти в систему](https://palestra-beta.vercel.app/auth/login)`,
  },
  kz: {
    welcome_choose_lang: '👋 Palestra-ға қош келдіңіз!\n\nТілді таңдаңыз:',
    welcome_enter_code: '✅ Тіл таңдалды: *қазақша*\n\n📎 Қолданбадан алған кодты осында жіберіңіз.\n\n_Коды жоқ па? Төмендегі «Қатынасты қалпына келтіру» батырмасын басыңыз._',
    welcome_admin: (name, email, password, url) => 
      `🎉 *${name || 'Palestra'}-ға қош келдіңіз!*\n\n` +
      `Әкімші кабинеті дайын.\n\n` +
      `📧 Логин: \`${email}\`\n` +
      `🔑 Құпиясөз: \`${password || 'Тіркеуде көрсетілген'}\`\n\n` +
      `🔗 Кіру: [palestra-beta.vercel.app/auth/login](https://palestra-beta.vercel.app/auth/login)`,
    welcome_student: (clubName, login, password) => 
      `🎉 *${clubName || 'Palestra'}-ға қош келдіңіз!*\n\n` +
      `Telegram сәтті байланыстырылды.\n\n` +
      `� Кіру деректері:\nЛогин: \`${login}\`\nҚұпиясөз: \`${password}\`\n\n` +
      `🔗 Кіру: [palestra-beta.vercel.app/auth/login](https://palestra-beta.vercel.app/auth/login)`,
    btn_change_pwd: '✏️ Құпиясөзді өзгерту',
    btn_login: '🚀 Жүйеге кіру',
    btn_recover: '🆘 Қатынасты қалпына келтіру',
    btn_schedule: '📅 Менің кестем',
    btn_subscription: '💳 Менің абонементім',
    btn_achievements: '🏆 Менің жетістіктерім',
    btn_language: '🌐 Тіл / Язык',
    btn_open: '🚀 Ашу',
    error_code_not_found: '❌ Код табылмады. Дұрыстығын тексеріңіз немесе клуб әкімшісінен жаңа код сұраңыз.',
    error_profile_not_found: '❌ Профиль табылмады. Клуб әкімшісімен хабарласыңыз.',
    pwd_enter_new: '🔐 *Құпиясөзді өзгерту*\n\nЖаңа құпиясөзді енгізіңіз (кемінде 12 таңба):',
    pwd_too_short: '⚠️ Құпиясөз тым қысқа. Кемінде 12 таңба.',
    pwd_updating: '⏳ Құпиясөзді жаңартамын...',
    pwd_success: (url) => `✅ *Құпиясөз жаңартылды!*\n\nЖаңа құпиясөзбен кіріңіз:\n[Кіру](${url})`,
    lang_changed: (lang) => `✅ Тіл өзгертілді: ${lang === 'kz' ? 'қазақша' : 'русский'}`,
    lang_current: (lang) => `🌐 Ағымдағы тіл: ${lang === 'kz' ? 'қазақша 🇰🇿' : 'русский 🇷🇺'}\n\nЖаңа тілді таңдаңыз:`,
    my_schedule: (url) => `📅 *Менің кестем*\n\n[Кестені ашу](${url}/schedule)`,
    my_subscription: (url) => `💳 *Менің абонементім*\n\n[Профильді ашу](${url}/profile)`,
    my_achievements: (url) => `🏆 *Менің жетістіктерім*\n\n[Профильді ашу](${url}/profile)`,
    recover_ask_phone: '📱 *Қатынасты қалпына келтіру*\n\nКлубта тіркелген телефон нөміріңізді енгізіңіз:',
    recover_not_found: '❌ Нөмір табылмады. Клуб әкімшісінен қай нөмірмен тіркелгеніңізді сұраңыз.',
    recover_found: (login, password) => `✅ *Кіру деректері:*\n\nЛогин: \`${login}\`\nҚұпиясөз: \`${password}\`\n\n🔗 [Жүйеге кіру](https://palestra-beta.vercel.app/auth/login)`,
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

    const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://palestra-beta.vercel.app';
    const loginUrl = `${host}/auth/login`;

    // Helper: get pending lang
    const getPendingLang = async () => {
      const { data: pending } = await supabase.from('tg_pending_users').select('lang').eq('chat_id', chatId).maybeSingle();
      return pending?.lang || 'ru';
    };

    // Helper: attempt to activate a code (admin reg code or student link code)
    const tryActivateCode = async (rawCode, lang) => {
      const code = rawCode.trim().replace(/^STU-/i, ''); // strip STU- prefix if present
      const tgUser = message?.from || callback_query?.from;

      // 1. Try admin/club reg code
      const { data: states } = await supabase.from('app_state').select('club_id, state').contains('state', { tg_reg_code: rawCode.trim() });
      if (states?.length) {
        const clubState = states[0];
        const { admin_email, temp_password, admin_auth_id, clubInfo } = clubState.state;
        await supabase.from('app_state').update({
          state: { ...clubState.state, tg_chat_id: chatId, tg_lang: lang,
            tg_user_info: { id: tgUser?.id, username: tgUser?.username, first_name: tgUser?.first_name, last_name: tgUser?.last_name },
            tg_reg_code: null, bot_status: 'ready' }
        }).eq('club_id', clubState.club_id);
        const msg = t('welcome_admin', lang, clubInfo?.name, admin_email, temp_password, loginUrl);
        const keyboard = { inline_keyboard: [
          [{ text: t('btn_change_pwd', lang), callback_data: `action_change_pwd_${admin_auth_id}` }],
          [{ text: t('btn_login', lang), url: loginUrl }],
          [{ text: t('btn_language', lang), callback_data: 'action_change_lang' }]
        ]};
        await sendMessage(chatId, msg, keyboard);
        await supabase.from('tg_pending_users').delete().eq('chat_id', chatId);
        return true;
      }

      // 2. Try student/coach link code (with or without STU- prefix)
      const codesToTry = [rawCode.trim(), code, `STU-${code}`].filter((v, i, a) => a.indexOf(v) === i);
      for (const tryCode of codesToTry) {
        const { data: profile } = await supabase.from('profiles').select('id, name, first_name, role, club_id, tg_chat_id, login, password').eq('tg_link_code', tryCode).in('role', ['student', 'coach', 'parent']).maybeSingle();
        if (profile) {
          await supabase.from('profiles').update({
            tg_chat_id: chatId, tg_lang: lang,
            tg_user_info: { id: tgUser?.id, username: tgUser?.username, first_name: tgUser?.first_name, last_name: tgUser?.last_name },
            tg_link_code: null, updated_at: new Date().toISOString()
          }).eq('id', profile.id);

          // Also try to find login/password from app_state.members
          let memberLogin = profile.login;
          let memberPassword = profile.password;
          if (!memberLogin || !memberPassword) {
            const { data: clubStatesForMember } = await supabase.from('app_state').select('state').eq('club_id', profile.club_id).maybeSingle();
            if (clubStatesForMember?.state) {
              const allPeople = [...(clubStatesForMember.state.members || []), ...(clubStatesForMember.state.coaches || [])];
              const found = allPeople.find(m => m.tg_link_code === tryCode || m.id === profile.id);
              if (found) { memberLogin = found.login || memberLogin; memberPassword = found.password || memberPassword; }
            }
          }

          const { data: club } = await supabase.from('clubs').select('name').eq('id', profile.club_id).maybeSingle();
          const welcomeMsg = t('welcome_student', lang, club?.name || 'Palestra', memberLogin || profile.name || 'ваш логин', memberPassword || '—');
          const studentKeyboard = { inline_keyboard: [
            [{ text: t('btn_schedule', lang), callback_data: 'student_schedule' }, { text: t('btn_subscription', lang), callback_data: 'student_subscription' }],
            [{ text: t('btn_recover', lang), callback_data: 'action_recover' }, { text: t('btn_language', lang), callback_data: 'action_change_lang' }]
          ]};
          await sendMessage(chatId, welcomeMsg, studentKeyboard);
          await supabase.from('tg_pending_users').delete().eq('chat_id', chatId);
          return true;
        }
      }

      // 3. Try app_state members by tg_link_code
      const { data: allStates } = await supabase.from('app_state').select('club_id, state');
      if (allStates) {
        for (const row of allStates) {
          const state = row.state || {};
          const allPeople = [...(Array.isArray(state.members) ? state.members : []), ...(Array.isArray(state.coaches) ? state.coaches : [])];
          for (const tryCode of codesToTry) {
            const found = allPeople.find(m => m.tg_link_code === tryCode);
            if (found) {
              // Clear the code
              const updatedPeople = allPeople.map(m => m.tg_link_code === tryCode ? { ...m, tg_link_code: null, tg_chat_id: chatId } : m);
              const updatedState = { ...state };
              if (Array.isArray(state.members)) updatedState.members = state.members.map(m => m.tg_link_code === tryCode ? { ...m, tg_link_code: null, tg_chat_id: chatId } : m);
              if (Array.isArray(state.coaches)) updatedState.coaches = state.coaches.map(m => m.tg_link_code === tryCode ? { ...m, tg_link_code: null, tg_chat_id: chatId } : m);
              await supabase.from('app_state').update({ state: updatedState }).eq('club_id', row.club_id);
              const { data: club } = await supabase.from('clubs').select('name').eq('id', row.club_id).maybeSingle();
              const welcomeMsg = t('welcome_student', lang, club?.name || 'Palestra', found.login || found.name || 'ваш логин', found.password || '—');
              const studentKeyboard = { inline_keyboard: [
                [{ text: t('btn_recover', lang), callback_data: 'action_recover' }, { text: t('btn_language', lang), callback_data: 'action_change_lang' }]
              ]};
              await sendMessage(chatId, welcomeMsg, studentKeyboard);
              await supabase.from('tg_pending_users').delete().eq('chat_id', chatId);
              return true;
            }
          }
        }
      }

      return false;
    };

    // 0. Plain /start (or /start CODE deep link)
    if (text?.startsWith('/start')) {
      const parts = text.split(' ');
      const deepCode = parts[1];

      if (deepCode) {
        // Deep link with code — try to activate immediately (language will be guessed)
        const lang = await getPendingLang();
        const activated = await tryActivateCode(deepCode, lang);
        if (!activated) await sendMessage(chatId, t('error_code_not_found', lang));
        return sendJson(res, 200, { ok: true });
      }

      // No code — show language selection
      await sendMessage(chatId, i18n.ru.welcome_choose_lang, {
        inline_keyboard: [[{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }, { text: '🇰🇿 Қазақша', callback_data: 'lang_kz' }]]
      });
      return sendJson(res, 200, { ok: true });
    }

    // 0.1 Language selection callback → show "enter code" prompt
    if (data?.startsWith('lang_ru') || data?.startsWith('lang_kz')) {
      const selectedLang = data === 'lang_kz' ? 'kz' : 'ru';
      await supabase.from('tg_pending_users').upsert({ chat_id: chatId, lang: selectedLang, updated_at: new Date().toISOString() }, { onConflict: 'chat_id' });
      await sendMessage(chatId, t('welcome_enter_code', selectedLang), {
        inline_keyboard: [
          [{ text: t('btn_recover', selectedLang), callback_data: 'action_recover' }],
          [{ text: t('btn_language', selectedLang), callback_data: 'action_change_lang' }]
        ]
      });
      return sendJson(res, 200, { ok: true });
    }

    // 0.2 Change language
    if (text === '/lang' || text === '/language' || data === 'action_change_lang') {
      const currentLang = await getUserLang();
      await sendMessage(chatId, t('lang_current', currentLang), {
        inline_keyboard: [[{ text: '🇷🇺 Русский', callback_data: 'lang_set_ru' }, { text: '🇰🇿 Қазақша', callback_data: 'lang_set_kz' }]]
      });
      return sendJson(res, 200, { ok: true });
    }

    // 0.3 Set language for existing user
    if (data?.startsWith('lang_set_')) {
      const newLang = data.replace('lang_set_', '');
      const { data: profile } = await supabase.from('profiles').select('id').eq('tg_chat_id', chatId).maybeSingle();
      if (profile) await supabase.from('profiles').update({ tg_lang: newLang }).eq('id', profile.id);
      const { data: clubStates } = await supabase.from('app_state').select('club_id, state').filter('state->>tg_chat_id', 'eq', chatId.toString());
      if (clubStates?.length) await supabase.from('app_state').update({ state: { ...clubStates[0].state, tg_lang: newLang } }).eq('club_id', clubStates[0].club_id);
      await sendMessage(chatId, t('lang_changed', newLang, newLang));
      return sendJson(res, 200, { ok: true });
    }

    // 1. Recovery flow — ask phone
    if (data === 'action_recover') {
      const lang = await getUserLang();
      // Store awaiting state; use both columns in case schema differs
      await supabase.from('tg_pending_users').upsert(
        { chat_id: chatId, lang, bot_awaiting: 'recover_phone', updated_at: new Date().toISOString() },
        { onConflict: 'chat_id', ignoreDuplicates: false }
      ).then(() => {}).catch(() => {
        // Fallback: update only lang if bot_awaiting column doesn't exist
        return supabase.from('tg_pending_users').upsert({ chat_id: chatId, lang, updated_at: new Date().toISOString() }, { onConflict: 'chat_id' });
      });
      await sendMessage(chatId, t('recover_ask_phone', lang));
      return sendJson(res, 200, { ok: true });
    }

    // 2. Handle Change Password Button (Admin)
    if (data?.startsWith('action_change_pwd_')) {
      const authId = data.replace('action_change_pwd_', '');
      const lang = await getUserLang();
      await sendMessage(chatId, t('pwd_enter_new', lang));
      const { data: clubStates } = await supabase.from('app_state').select('club_id, state').filter('state->>tg_chat_id', 'eq', chatId.toString());
      if (clubStates?.length) {
        await supabase.from('app_state').update({ state: { ...clubStates[0].state, bot_awaiting_pwd: authId } }).eq('club_id', clubStates[0].club_id);
      }
      return sendJson(res, 200, { ok: true });
    }

    // 2.1 Student callback buttons
    if (data?.startsWith('student_')) {
      const action = data.replace('student_', '');
      const lang = await getUserLang();
      const { data: studentProfile } = await supabase.from('profiles').select('id, club_id, role').eq('tg_chat_id', chatId).in('role', ['student', 'coach', 'parent']).maybeSingle();
      if (!studentProfile) { await sendMessage(chatId, t('error_profile_not_found', lang)); return sendJson(res, 200, { ok: true }); }
      const kb = { inline_keyboard: [[{ text: t('btn_open', lang), url: `${host}/${action === 'schedule' ? 'schedule' : 'profile'}` }]] };
      if (action === 'schedule') await sendMessage(chatId, t('my_schedule', lang, host), kb);
      else if (action === 'subscription') await sendMessage(chatId, t('my_subscription', lang, host), kb);
      else if (action === 'achievements') await sendMessage(chatId, t('my_achievements', lang, host), kb);
      return sendJson(res, 200, { ok: true });
    }

    // 3. Handle any plain text: could be a code OR password update OR phone for recovery
    if (text && !text.startsWith('/')) {
      const lang = await getUserLang();
      const { data: pending } = await supabase.from('tg_pending_users').select('lang, bot_awaiting').eq('chat_id', chatId).maybeSingle();
      const pendingLang = pending?.lang || lang;

      // 3a. Recovery by phone number
      if (pending?.bot_awaiting === 'recover_phone') {
        const phone = text.trim().replace(/\s+/g, '');
        const normalizePhone = (p) => p.replace(/[^\d]/g, '').replace(/^8/, '7');
        const normalizedInput = normalizePhone(phone);

        const { data: allStates } = await supabase.from('app_state').select('club_id, state');
        let foundCredentials = null;
        if (allStates) {
          for (const row of allStates) {
            const state = row.state || {};
            const allPeople = [...(Array.isArray(state.members) ? state.members : []), ...(Array.isArray(state.coaches) ? state.coaches : [])];
            const match = allPeople.find(m => {
              const p = normalizePhone((m.phone || '').replace(/\s+/g, ''));
              return p === normalizedInput || p.endsWith(normalizedInput) || normalizedInput.endsWith(p);
            });
            if (match && match.login) { foundCredentials = match; break; }
          }
        }
        // Also check profiles table
        if (!foundCredentials) {
          const { data: profileByPhone } = await supabase.from('profiles').select('*').ilike('phone', `%${normalizedInput.slice(-9)}%`).maybeSingle();
          if (profileByPhone?.email) {
            await sendMessage(chatId, t('recover_found', pendingLang, profileByPhone.email, '(ваш пароль)'));
            await supabase.from('tg_pending_users').upsert({ chat_id: chatId, lang: pendingLang, bot_awaiting: null, updated_at: new Date().toISOString() }, { onConflict: 'chat_id' });
            return sendJson(res, 200, { ok: true });
          }
        }
        if (foundCredentials) {
          await sendMessage(chatId, t('recover_found', pendingLang, foundCredentials.login, foundCredentials.password || '—'));
        } else {
          await sendMessage(chatId, t('recover_not_found', pendingLang));
        }
        await supabase.from('tg_pending_users').upsert({ chat_id: chatId, lang: pendingLang, bot_awaiting: null, updated_at: new Date().toISOString() }, { onConflict: 'chat_id' });
        return sendJson(res, 200, { ok: true });
      }

      // 3b. Admin password change
      const { data: clubStates } = await supabase.from('app_state').select('club_id, state').filter('state->>tg_chat_id', 'eq', chatId.toString());
      if (clubStates?.length && clubStates[0].state.bot_awaiting_pwd) {
        const authId = clubStates[0].state.bot_awaiting_pwd;
        const newPwd = text.trim();
        const stateLang = clubStates[0].state.tg_lang || pendingLang;
        if (newPwd.length < 12) { await sendMessage(chatId, t('pwd_too_short', stateLang)); return sendJson(res, 200, { ok: true }); }
        await sendMessage(chatId, t('pwd_updating', stateLang));
        const { error: pwdError } = await supabase.auth.admin.updateUserById(authId, { password: newPwd });
        if (pwdError) { await sendMessage(chatId, '❌ Ошибка: ' + pwdError.message); return sendJson(res, 200, { ok: true }); }
        const newState = { ...clubStates[0].state };
        delete newState.bot_awaiting_pwd;
        newState.temp_password = newPwd;
        await supabase.from('app_state').update({ state: newState }).eq('club_id', clubStates[0].club_id);
        await sendMessage(chatId, t('pwd_success', stateLang, loginUrl));
        return sendJson(res, 200, { ok: true });
      }

      // 3c. Treat message as a code (main simplified flow)
      const activated = await tryActivateCode(text, pendingLang);
      if (!activated) {
        await sendMessage(chatId, t('error_code_not_found', pendingLang), {
          inline_keyboard: [[{ text: t('btn_recover', pendingLang), callback_data: 'action_recover' }]]
        });
      }
      return sendJson(res, 200, { ok: true });
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
