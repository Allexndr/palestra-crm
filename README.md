# Palestra — CRM для клубов единоборств

Полноценная SaaS-платформа для управления спортивным клубом: ученики, тренеры, расписание, финансы, лига, лента, автоматизации.

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Стили | Custom CSS (CSS Variables + Tailwind utility classes) |
| Backend | Vercel Serverless Functions (`/api/**`) |
| БД | Supabase (PostgreSQL + JSONB `app_state`) |
| Хранилище файлов | Vercel Blob |
| Auth | Supabase Auth + HttpOnly cookies |
| AI-помощник | Gemini Flash (fallback → Grok) |
| Deploy | Vercel |

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Установить Vercel CLI (один раз)
npm i -g vercel

# 3. Слинковать проект и скачать env переменные
vercel link
# Файл .env.local создастся автоматически

# 4. Запустить API (терминал 1)
vercel dev --listen 3001

# 5. Запустить фронт (терминал 2)
npm run dev
# → http://localhost:5173
```

## Переменные окружения

Все переменные описаны в `.env.example`. Основные:

| Переменная | Назначение |
|-----------|-----------|
| `SUPABASE_URL` | URL Supabase проекта |
| `SUPABASE_ANON_KEY` | Публичный ключ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Сервисный ключ (только сервер) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob токен |
| `GEMINI_API_KEY` | Gemini Flash API key |
| `GROK_API_KEY` | Grok fallback API key |
| `ALLOW_DEMO_AUTH` | `true` для локальной разработки без Supabase |

## Структура проекта

```
/
├── api/                    # Vercel Serverless Functions
│   ├── _lib/               # Утилиты: auth, db, http, security
│   ├── auth/               # login, logout, me, register
│   ├── app/                # state (CRUD), backups (restore)
│   ├── blob/               # upload, delete файлов
│   └── ai/                 # chat (Gemini/Grok proxy)
│
├── src/
│   ├── components/
│   │   ├── layout/         # AdminLayout, Sidebar, HelpChat
│   │   └── ui/             # Button, Card, Input, Modal, FilePicker...
│   ├── context/
│   │   ├── AdminContext.jsx # Главный стейт-менеджер (hydrate, persist)
│   │   └── LanguageContext.jsx
│   ├── pages/
│   │   ├── admin/          # Dashboard, Members, Schedule, Settings...
│   │   ├── auth/           # Login, Register
│   │   └── superadmin/     # Управление клубами
│   └── lib/                # tariff, blobClient, utils
│
├── supabase/migrations/    # SQL миграции
└── public/                 # Статика
```

## Архитектурные решения

**Стейт-менеджмент**: Весь стейт клуба хранится в одном JSONB поле `app_state.state` в Supabase. `AdminContext` гидрирует его при старте и дебаунс-сохраняет через `PUT /api/app/state` (800ms). Прямые мутации (addMember, updateMember) вызывают `persistState()` явно с актуальными данными.

**Auth**: HttpOnly + Secure cookies. Нет JWT в localStorage. `requireUser` проверяет каждый API endpoint на сервере.

**Бэкапы**: Автоматически раз в час при `saveAppState` → таблица `app_state_backups`. Восстановление через Настройки → Бэкапы.

**AI-помощник**: Серверный прокси `/api/ai/chat` → Gemini Flash (основной) → Grok (fallback). Требует авторизации.

## Скрипты

```bash
npm run dev          # Vite dev server (фронт только)
npm run build        # Production build (console.* стрипается)
npm run preview      # Превью production билда
npm run test         # Vitest unit tests
npm run lint         # ESLint
vercel dev           # Полный стек локально (фронт + API + реальный Supabase)
```

## Роли пользователей

| Роль | Доступ |
|------|--------|
| `superadmin` | Все клубы, импersonation |
| `admin` | Полный доступ к своему клубу |
| `coach` | Только свои группы и расписание |
| `student` | Личный кабинет |
| `parent` | Кабинеты детей |
