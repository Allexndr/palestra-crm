const BOT_TOKEN = '8766624021:AAEqQ8Te84V-4Po5AfZ2xhFctPJem3gcaSE';
const WEBHOOK_URL = 'https://palestra-blond.vercel.app/api/bot/webhook';

async function setWebhook() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Webhook result:', data);
}

setWebhook();
