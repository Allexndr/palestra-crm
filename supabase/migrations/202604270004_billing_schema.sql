-- Таблица для логирования попыток оплат через Freedom Pay
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES public.clubs(id) NOT NULL,
    order_id TEXT NOT NULL UNIQUE, -- Внешний ID заказа (внутренний для нас, уходит в платежку)
    payment_id TEXT, -- ID транзакции от самой платежки
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KZT',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'canceled')),
    tariff_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Индексы для быстрого поиска платежей по клубу
CREATE INDEX IF NOT EXISTS idx_payments_club_id ON public.payments(club_id);

-- Таблица для отслеживания текущей подписки клуба
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES public.clubs(id) NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
    tariff_id TEXT,
    current_period_start TIMESTAMPTZ DEFAULT now(),
    current_period_end TIMESTAMPTZ DEFAULT now() + interval '14 days', -- 14 дней триала по умолчанию
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Настраиваем RLS (Row Level Security)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Политики для платежей (только чтение для своих)
CREATE POLICY "Clubs can view their own payments"
    ON public.payments FOR SELECT
    USING (club_id IN (SELECT club_id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Создание платежей только сервером (Service Role), так что insert политики для анонимов не делаем.

-- Политики для подписок
CREATE POLICY "Clubs can view their own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (club_id IN (SELECT club_id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Вставка триальной подписки при создании клуба теперь может делаться через API, 
-- либо мы можем создать триггер. Для MVP будем создавать её из API (ensureClubForRegistration).
