/**
 * Telegram notifications module for Palestra
 * Handles sending messages to users via Telegram Bot
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8766624021:AAEqQ8Te84V-4Po5AfZ2xhFctPJem3gcaSE';

/**
 * Send a message to a specific Telegram chat
 * @param {string|number} chatId - Telegram chat ID
 * @param {string} text - Message text (Markdown supported)
 * @param {object|null} replyMarkup - Optional inline keyboard
 * @returns {Promise<boolean>}
 */
export async function sendTelegramMessage(chatId, text, replyMarkup = null) {
  if (!chatId) {
    console.warn('[Telegram] No chatId provided');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const body = {
      chat_id: chatId,
      text: text.substring(0, 4096), // Telegram limit
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    };
    
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    
    if (!result.ok) {
      console.error('[Telegram] Send failed:', result.description);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Telegram] Error sending message:', error);
    return false;
  }
}

/**
 * Send account deletion notification
 * @param {string|number} chatId - Telegram chat ID
 * @param {object} user - User data (name, email, role)
 * @param {string} deletedAt - ISO date string
 */
export async function notifyAccountDeleted(chatId, user, deletedAt) {
  const text = `🔴 *Аккаунт удалён*\n\n` +
    `Ваш аккаунт в Palestra был полностью удалён.\n\n` +
    `👤 *${user.name || user.email}*\n` +
    `📧 ${user.email}\n` +
    `🎭 Роль: ${user.role}\n` +
    `🕐 ${new Date(deletedAt).toLocaleString('ru-RU')}\n\n` +
    `Если это было сделано ошибочно, пожалуйста, свяжитесь с администрацией клуба.`;

  return sendTelegramMessage(chatId, text);
}

/**
 * Send subscription expiry warning
 * @param {string|number} chatId - Telegram chat ID
 * @param {object} user - User data
 * @param {number} daysLeft - Days until expiry
 * @param {string} planName - Subscription plan name
 */
export async function notifySubscriptionExpiring(chatId, user, daysLeft, planName) {
  const emoji = daysLeft <= 1 ? '🔴' : daysLeft <= 3 ? '🟠' : '🟡';
  const text = `${emoji} *Абонемент истекает*\n\n` +
    `Привет, ${user.firstName || user.name}!\n\n` +
    `Ваш абонемент "*${planName}*" истекает через *${daysLeft} ${getDaysWord(daysLeft)}*.\n\n` +
    `💳 Не забудьте продлить подписку, чтобы сохранить доступ к тренировкам и не потерять накопленный прогресс!\n\n` +
    `🔗 Войти в личный кабинет: [palestra.fit/auth/login](https://palestra.fit/auth/login)`;

  return sendTelegramMessage(chatId, text);
}

/**
 * Send subscription expired notification
 * @param {string|number} chatId - Telegram chat ID
 * @param {object} user - User data
 * @param {string} planName - Subscription plan name
 */
export async function notifySubscriptionExpired(chatId, user, planName) {
  const text = `🔴 *Абонемент истёк*\n\n` +
    `Привет, ${user.firstName || user.name}!\n\n` +
    `Ваш абонемент "*${planName}*" истёк сегодня.\n\n` +
    `⚠️ Доступ к платформе ограничен. Чтобы продолжить тренировки, пожалуйста, продлите подписку.\n\n` +
    `🔗 [Продлить абонемент](https://palestra.fit/auth/login)`;

  return sendTelegramMessage(chatId, text);
}

/**
 * Send welcome message for students linking their Telegram
 * @param {string|number} chatId - Telegram chat ID
 * @param {object} user - User data
 * @param {string} clubName - Club name
 */
export async function notifyStudentWelcome(chatId, user, clubName) {
  const text = `🎉 *Добро пожаловать в ${clubName}!*\n\n` +
    `Привет, ${user.firstName || user.name}!\n\n` +
    `Ваш Telegram успешно привязан к аккаунту. Теперь вы будете получать:\n\n` +
    `📅 Напоминания о тренировках\n` +
    `⏰ Уведомления об окончании абонемента\n` +
    `🏆 Новости о достижениях и квестах\n` +
    `📊 Отчёты о посещаемости\n\n` +
    `🔗 Ваш личный кабинет: [palestra.fit](https://palestra.fit)`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "📅 Моё расписание", callback_data: "student_schedule" }],
      [{ text: "💳 Мой абонемент", callback_data: "student_subscription" }],
      [{ text: "🏆 Мои достижения", callback_data: "student_achievements" }]
    ]
  };

  return sendTelegramMessage(chatId, text, keyboard);
}

/**
 * Send daily schedule notification to student
 * @param {string|number} chatId - Telegram chat ID
 * @param {object} user - User data
 * @param {Array} schedule - Today's sessions
 */
export async function notifyDailySchedule(chatId, user, schedule) {
  if (!schedule || schedule.length === 0) return false;

  const sessions = schedule.map(s => 
    `• *${s.time}* — ${s.groupName || s.name} (${s.location || 'Основной зал'})`
  ).join('\n');

  const text = `📅 *Тренировки на сегодня*\n\n` +
    `Привет, ${user.firstName || user.name}!\n\n` +
    `Ваши занятия:\n${sessions}\n\n` +
    `Увидимся на тренировке! 💪`;

  return sendTelegramMessage(chatId, text);
}

/**
 * Get correct word form for "days" in Russian
 */
function getDaysWord(days) {
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'дней';
  if (lastDigit === 1) return 'день';
  if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
  return 'дней';
}

/**
 * Log notification to database for audit trail
 * @param {object} supabase - Supabase client
 * @param {object} notification - Notification data
 */
export async function logNotification(supabase, notification) {
  try {
    await supabase.from('notifications_log').insert({
      user_id: notification.userId,
      type: notification.type,
      channel: 'telegram',
      status: notification.status,
      content: notification.content,
      sent_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Telegram] Failed to log notification:', error);
  }
}
