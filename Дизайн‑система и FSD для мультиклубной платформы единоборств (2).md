# Дизайн‑система и FSD для мультиклубной платформы единоборств

Этот документ дополняет расширенное ТЗ и фокусируется на двух вещах:

- глубоко проработанной дизайн‑системе (цветовые токены, типографика, компоненты, паттерны по breakpoint‑ам);
- функциональной спецификации (FSD) ключевых флоу с JSON‑подобными описаниями экранов, полей, стейтов и событий.

## 1. Дизайн‑система

### 1.1. Цветовые токены

Токены задаются на уровне дизайн‑системы и реализуются как CSS‑переменные/тематические переменные. Базовая идея — спортивный, контрастный, но не "ядовитый" визуал, комфортный как для админов, так и для родителей.

#### 1.1.1. Базовые токены

- `color.bg` — основной фон.
- `color.bg-secondary` — фон для карточек и секций.
- `color.surface` — фон для всплывающих элементов (меню, модалки).
- `color.text-primary` — основной текст.
- `color.text-secondary` — вторичный текст.
- `color.text-muted` — подписи, плейсхолдеры.
- `color.primary` — основной акцент (кнопки, линки, важные элементы).
- `color.primary-soft` — фоновые состояния primary (hover/selected).
- `color.accent` — спортивный акцент (например, для статусов и ачивок).
- `color.border` — границы, разделители.
- `color.success` / `color.warning` / `color.error` — семантические состояния.

#### 1.1.2. Светлая тема (пример значений)

- `color.bg = #F5F5F9`.
- `color.bg-secondary = #FFFFFF`.
- `color.surface = #FFFFFF` с лёгкой тенью.
- `color.text-primary = #111827`.
- `color.text-secondary = #4B5563`.
- `color.text-muted = #9CA3AF`.
- `color.primary = #1D4ED8` (глубокий синий).
- `color.primary-soft = #DBEAFE`.
- `color.accent = #F97316` (тёплый оранжевый/"удар").
- `color.border = #E5E7EB`.
- `color.success = #16A34A`.
- `color.warning = #F59E0B`.
- `color.error = #DC2626`.

#### 1.1.3. Тёмная тема (пример значений)

- `color.bg = #020617`.
- `color.bg-secondary = #0F172A`.
- `color.surface = #020617` с более мягкой тенью/outline.
- `color.text-primary = #F9FAFB`.
- `color.text-secondary = #E5E7EB`.
- `color.text-muted = #9CA3AF`.
- `color.primary = #3B82F6` (слегка светлее для контраста на тёмном фоне).
- `color.primary-soft = #1D4ED8` с непрозрачностью.
- `color.accent = #FB923C`.
- `color.border = #1F2937`.
- `color.success = #22C55E`.
- `color.warning = #FACC15`.
- `color.error = #F87171`.

Переключение темы выполняется на уровне root‑токенов, при этом семантические имена (`color.primary`, `color.error` и т.п.) остаются едиными для всего приложения.

### 1.2. Типографика (типоскейл)

Типографика должна давать чёткую иерархию и хорошо читаться на мобильных устройствах.

#### 1.2.1. Базовые токены шрифта

- `font.family-base` — основной шрифт (например, Inter, SF Pro, Roboto).
- `font.family-mono` — моноширинный (для tech/ID).
- `font.size-xs = 12px`.
- `font.size-sm = 14px`.
- `font.size-md = 16px`.
- `font.size-lg = 18px`.
- `font.size-xl = 20px`.
- `font.size-2xl = 24px`.
- `font.size-3xl = 30px`.
- `font.size-4xl = 36px`.

#### 1.2.2. Текстовые стили

- `text.caption` — `size-xs`, `line-height: 16px`, `color: text-muted`.
- `text.body` — `size-md`, `line-height: 24px`.
- `text.body-small` — `size-sm`, `line-height: 20px`.
- `text.button` — `size-sm`, `line-height: 20px`, `medium`.
- `text.overline` — `size-xs`, uppercase, `letter-spacing: 0.08em`.
- `heading.h1` — `size-3xl`, `line-height: 36–40px`, `semibold`.
- `heading.h2` — `size-2xl`.
- `heading.h3` — `size-xl`.
- `heading.h4` — `size-lg`.

### 1.3. Отступы, радиусы, тени

#### 1.3.1. Spacing (8‑pt grid)

- `space-1 = 4px`.
- `space-2 = 8px`.
- `space-3 = 12px`.
- `space-4 = 16px`.
- `space-5 = 20px`.
- `space-6 = 24px`.
- `space-8 = 32px`.
- `space-10 = 40px`.

#### 1.3.2. Радиусы

- `radius-sm = 6px`.
- `radius-md = 10px`.
- `radius-lg = 16px`.
- `radius-full = 999px` (аватарки, чипсы).

#### 1.3.3. Тени

- `shadow-sm` — лёгкая тень для карточек.
- `shadow-md` — для всплывающих поверхностей.
- `shadow-lg` — для модалок.

### 1.4. Breakpoints и layout‑паттерны

#### 1.4.1. Breakpoints

- `xs`: < 480px — узкие мобильные.
- `sm`: 480–768px — основные мобильные.
- `md`: 768–1024px — планшеты.
- `lg`: 1024–1440px — десктопы.
- `xl`: >1440px — большие экраны админов.

#### 1.4.2. Паттерны по breakpoint‑ам

- Мобильный (`xs`, `sm`):
  - Bottom‑nav для ученика/родителя (иконки + подписи: Feed, Schedule, League, Profile).
  - Верхний app‑bar с названием текущего экрана и основным action (например, +). 
- Планшет (`md`):
  - Комбинация левого компактного sidebar (иконки) и контента.
- Десктоп (`lg`, `xl`):
  - Полноценный левый sidebar (иконка + текст), верхний bar с быстрыми фильтрами и глобальным поиском.

Существующие решения для gym CRM активно используют подобные mobile‑first паттерны с bottom‑nav для членов клуба и полноценным sidebar для админов.[^1][^2][^3]

### 1.5. Базовые компоненты (UI‑кит)

#### 1.5.1. Button

Свойства:

- `variant` ∈ {`primary`, `secondary`, `ghost`, `danger`}.
- `size` ∈ {`sm`, `md`, `lg`}.
- `state` ∈ {`default`, `hover`, `pressed`, `disabled`, `loading`}.
- `icon` (leading/trailing, optional).

Поведение:

- `primary`: заполненный фон `color.primary`, текст `#FFFFFF`.
- `secondary`: заливка `bg-secondary`, обводка `border`, текст `text-primary`.
- `ghost`: прозрачный фон, только текст и небольшая подсветка при hover.
- `danger`: `color.error`.

#### 1.5.2. Input

Свойства:

- `type` ∈ {`text`, `email`, `phone`, `password`, `number`, `date`, `select`, `textarea`}.
- `label`, `placeholder`, `helperText`.
- `state` ∈ {`default`, `focus`, `error`, `disabled`}.

Поведение:

- Ошибка: красная рамка + пояснение простым языком.
- Маски для телефона (`+7 (XXX) XXX-XX-XX`) и даты.

#### 1.5.3. Card

- Используется для списков клубов, занятий, учеников, постов.
- Содержит header, body, optional footer.

#### 1.5.4. Navigation

- `Sidebar` — для админов/тренеров.
- `BottomNav` — для учеников/родителей.
- `Tabs` — для дочерних разделов (например, вкладки в профиле).

#### 1.5.5. Feedback компоненты

- `Toast` для коротких уведомлений.
- `Modal` для критичных действий.
- `EmptyState` для пустых списков (с текстом и CTA).

## 2. FSD: ключевые флоу и экраны

Далее — функциональная спецификация для трёх ключевых флоу: регистрация клуба, покупка дополнительной локации, запуск сезона лиги. Формат — JSON‑подобное описание экранов, полей и событий. Это не строгое API, а логический контракт между продуктом, дизайном и разработкой.

### 2.1. Флоу регистрации клуба

#### 2.1.1. Экран 1 — Landing

```json
{
  "route": "/",
  "role": "public",
  "sections": [
    {
      "id": "hero",
      "type": "marketing",
      "content": {
        "title": "Операционная система для клубов единоборств",
        "subtitle": "CRM, расписание, лига и соцсеть в одной платформе",
        "primaryCta": {
          "label": "Зарегистрировать клуб",
          "action": "navigate:/auth/signup-club"
        },
        "secondaryCta": {
          "label": "Войти",
          "action": "navigate:/auth/login"
        }
      }
    }
  ],
  "events": [
    {
      "id": "click-signup-club",
      "trigger": "onClick(hero.primaryCta)",
      "action": "navigate:/auth/signup-club"
    }
  ]
}
```

#### 2.1.2. Экран 2 — Шаг 1. Аккаунт владельца

```json
{
  "route": "/auth/signup-club?step=1",
  "role": "public",
  "layout": "centered-wizard",
  "fields": [
    { "name": "firstName", "label": "Имя", "type": "text", "required": true },
    { "name": "lastName", "label": "Фамилия", "type": "text", "required": true },
    { "name": "email", "label": "E-mail", "type": "email", "required": true },
    { "name": "phone", "label": "Телефон", "type": "phone", "required": true },
    { "name": "password", "label": "Пароль", "type": "password", "required": true,
      "validation": { "minLength": 8 }
    }
  ],
  "buttons": {
    "primary": { "label": "Далее", "action": "submit" },
    "secondary": { "label": "Отмена", "action": "navigate:/" }
  },
  "validationRules": {
    "email": "mustBeValidEmail",
    "phone": "mustMatchMask:+7 (XXX) XXX-XX-XX",
    "password": "minLength:8"
  },
  "events": [
    {
      "id": "submit-step-1",
      "trigger": "onSubmit",
      "success": "navigate:/auth/signup-club?step=2",
      "error": "showInlineErrors"
    }
  ]
}
```

#### 2.1.3. Экран 3 — Шаг 2. Базовая информация о клубе

```json
{
  "route": "/auth/signup-club?step=2",
  "role": "public",
  "fields": [
    { "name": "clubName", "label": "Название клуба", "type": "text", "required": true },
    { "name": "city", "label": "Город", "type": "select", "optionsSource": "cities", "required": true },
    { "name": "address", "label": "Адрес", "type": "text", "required": true },
    { "name": "website", "label": "Сайт", "type": "url", "required": false },
    { "name": "instagram", "label": "Instagram", "type": "text", "required": false }
  ],
  "buttons": {
    "primary": { "label": "Далее", "action": "submit" },
    "secondary": { "label": "Назад", "action": "navigate:/auth/signup-club?step=1" }
  }
}
```

#### 2.1.4. Экран 4 — Шаг 3. Виды единоборств и форматы

```json
{
  "route": "/auth/signup-club?step=3",
  "role": "public",
  "fields": [
    {
      "name": "disciplines",
      "label": "Виды единоборств",
      "type": "multiselect",
      "optionsSource": "disciplines-list-almaty",
      "required": true
    },
    {
      "name": "ageGroups",
      "label": "Возрастные группы",
      "type": "checkbox-group",
      "options": ["4-6", "7-12", "13-17", "18+"],
      "required": true
    },
    {
      "name": "trainingFormats",
      "label": "Форматы тренировок",
      "type": "checkbox-group",
      "options": ["Групповые", "Индивидуальные", "Онлайн", "Сборы"],
      "required": true
    }
  ],
  "helperText": "Вы можете настроить отдельные группы и расписание после регистрации",
  "buttons": {
    "primary": { "label": "Далее", "action": "submit" },
    "secondary": { "label": "Назад", "action": "navigate:/auth/signup-club?step=2" }
  }
}
```

#### 2.1.5. Экран 5 — Шаг 4. Масштаб клуба

```json
{
  "route": "/auth/signup-club?step=4",
  "role": "public",
  "fields": [
    {
      "name": "membersRange",
      "label": "Количество активных учеников",
      "type": "select",
      "options": ["до 50", "51-100", "101-200", "200+"],
      "required": true
    },
    {
      "name": "coachesCount",
      "label": "Количество тренеров",
      "type": "number",
      "required": true
    }
  ],
  "buttons": {
    "primary": { "label": "Далее", "action": "submit" },
    "secondary": { "label": "Назад", "action": "navigate:/auth/signup-club?step=3" }
  }
}
```

#### 2.1.6. Экран 6 — Шаг 5. Тариф и пробный период

```json
{
  "route": "/auth/signup-club?step=5",
  "role": "public",
  "sections": [
    {
      "id": "plan-summary",
      "type": "summary",
      "content": {
        "planName": "Базовый",
        "price": "~20 USD/мес",
        "included": [
          "Все модули CRM и расписания",
          "Соцсеть клуба и геймификация",
          "Базовая лига",
          "1 локация",
          "до 50-75 учеников"
        ],
        "trial": {
          "lengthDays": 14,
          "note": "Списание начнётся после окончания пробного периода"
        }
      }
    }
  ],
  "buttons": {
    "primary": { "label": "Создать клуб", "action": "submit" },
    "secondary": { "label": "Назад", "action": "navigate:/auth/signup-club?step=4" }
  },
  "events": [
    {
      "id": "create-club",
      "trigger": "onSubmit",
      "success": "navigate:/onboarding/club",
      "error": "showToast:error"
    }
  ]
}
```

### 2.2. Флоу покупки дополнительной локации

#### 2.2.1. Экран — Список локаций

```json
{
  "route": "/settings/locations",
  "role": "admin",
  "sections": [
    {
      "id": "locations-list",
      "type": "table",
      "columns": [
        "Название",
        "Адрес",
        "Статус",
        "Ученики",
        "Действия"
      ],
      "actions": [
        {
          "id": "add-location",
          "label": "Добавить локацию",
          "icon": "plus",
          "action": "openModal:add-location"
        }
      ]
    }
  ]
}
```

#### 2.2.2. Модалка — Добавить локацию

```json
{
  "id": "add-location-modal",
  "type": "modal",
  "title": "Новая локация",
  "fields": [
    { "name": "locationName", "label": "Название локации", "type": "text", "required": true },
    { "name": "address", "label": "Адрес", "type": "text", "required": true },
    { "name": "phone", "label": "Телефон", "type": "phone", "required": false }
  ],
  "footer": {
    "primary": { "label": "Продолжить", "action": "submit" },
    "secondary": { "label": "Отмена", "action": "close" }
  },
  "events": [
    {
      "id": "submit-location-details",
      "trigger": "onSubmit",
      "success": "openModal:confirm-location-pricing",
      "error": "showInlineErrors"
    }
  ]
}
```

#### 2.2.3. Модалка — Подтверждение цены локации

```json
{
  "id": "confirm-location-pricing",
  "type": "modal",
  "title": "Подключить новую локацию",
  "body": "Добавление новой локации увеличит стоимость подписки на 5-10 USD/мес. Оплата начнётся со следующего биллингового периода.",
  "footer": {
    "primary": { "label": "Подтвердить", "action": "api:addLocationAndCharge" },
    "secondary": { "label": "Назад", "action": "closeThisOpen:add-location-modal" }
  },
  "events": [
    {
      "id": "confirm-add-location",
      "trigger": "onClick(primary)",
      "success": "closeAllAndRefresh:locations-list",
      "error": "showToast:billingError"
    }
  ]
}
```

### 2.3. Флоу запуска сезона лиги

#### 2.3.1. Экран — Лига (список сезонов)

```json
{
  "route": "/league",
  "role": "admin",
  "sections": [
    {
      "id": "seasons-list",
      "type": "table",
      "columns": ["Сезон", "Вид спорта", "Статус", "Даты", "Действия"],
      "actions": [
        {
          "id": "create-season",
          "label": "Создать сезон",
          "icon": "plus",
          "action": "navigate:/league/create"
        }
      ]
    }
  ]
}
```

#### 2.3.2. Экран — Создание сезона

```json
{
  "route": "/league/create",
  "role": "admin",
  "layout": "two-columns",
  "fields": [
    {
      "name": "seasonName",
      "label": "Название сезона",
      "type": "text",
      "required": true
    },
    {
      "name": "discipline",
      "label": "Вид спорта",
      "type": "select",
      "optionsSource": "disciplines",
      "required": true
    },
    {
      "name": "ageGroup",
      "label": "Возраст",
      "type": "select",
      "options": ["Все", "4-6", "7-12", "13-17", "18+"],
      "required": true
    },
    {
      "name": "startDate",
      "label": "Дата начала",
      "type": "date",
      "required": true
    },
    {
      "name": "endDate",
      "label": "Дата окончания",
      "type": "date",
      "required": true
    },
    {
      "name": "scoringRules",
      "label": "Правила начисления очков",
      "type": "textarea",
      "required": true,
      "helperText": "Например: победа = 3 очка, ничья = 1, поражение = 0"
    },
    {
      "name": "includeAttendance",
      "label": "Учитывать посещаемость",
      "type": "switch",
      "required": false
    }
  ],
  "preview": {
    "type": "live-preview",
    "source": ["seasonName", "discipline", "ageGroup", "startDate", "endDate"]
  },
  "buttons": {
    "primary": { "label": "Создать сезон", "action": "submit" },
    "secondary": { "label": "Отмена", "action": "navigate:/league" }
  },
  "events": [
    {
      "id": "create-season",
      "trigger": "onSubmit",
      "success": "navigate:/league/{seasonId}",
      "error": "showInlineErrors"
    }
  ]
}
```

#### 2.3.3. Экран — Просмотр сезона

```json
{
  "route": "/league/{seasonId}",
  "role": "admin|coach|student|parent",
  "sections": [
    {
      "id": "season-header",
      "type": "summary",
      "contentSource": "season"
    },
    {
      "id": "ranking-table",
      "type": "table",
      "columns": ["Ученик", "Клуб", "Группа", "Очки"],
      "sorting": ["Очки:desc"]
    }
  ],
  "actions": [
    {
      "id": "add-result",
      "visibleFor": "coach|admin",
      "label": "Добавить результат",
      "action": "openModal:add-result"
    }
  ]
}
```

***

Эта дизайн‑система и FSD дают чёткий каркас для реализации: разработчик понимает, какие токены и компоненты использовать, дизайнер — какие паттерны закладывать в макеты, аналитик — как выглядят флоу и бизнес‑правила. Модель ценообразования с дешёвой базой и add‑on‑допами для локаций и расширений согласуется с актуальными трендами gym/martial arts‑софта на рынке.[^4][^5][^6]

---

## References

1. [Best Martial Arts Management Software 2026 | 8 Platforms Compared](https://1club.ai/blog/best-martial-arts-management-software-2026) - For multi-service or multi-location schools: WellnessLiving's broader platform architecture handles ...

2. [Best Gym CRM Software in 2026: The Top 6 Compared - PushPress](https://www.pushpress.com/blog/best-gym-crm-software) - Zen Planner has a loyal following in the martial arts and CrossFit worlds. It handles the basics (me...

3. [Best Gym Software For Martial Arts Schools: The Ultimate Guide](https://nestmanagement.co.uk/best-gym-software-for-martial-arts-schools-the-ultimate-guide/) - The martial arts industry has seen a significant transformation in recent years. Traditional dojos a...

4. [Gym Management Software Pricing Guide for 2025 Buyers](https://www.clubautomation.com/resources/how-much-does-gym-management-software-pricing-look-like-in-2025) - For single-site clubs, this can range from $150 to $500 per month. For more robust packages serving ...

5. [How Much Does Gym Management Software Cost? 2026 Pricing ...](https://gymsense.io/blog/how-much-does-gym-management-software-cost-2026-pricing-guide) - Gym management software pricing varies from under $100 to over $500 per month. This guide breaks dow...

6. [All-in-One Martial Arts & School Management EPOS Software](https://xepos.co.uk/glossa-all-in-one-martial-arts-school-management-epos-software/) - Capture leads, run events and courses, and expand with optional add-ons like multi-location support,...

