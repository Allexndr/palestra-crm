# 🌌 VIBE-CODING MANIFESTO: THE ULTIMATE GUIDEBOOK
## 📜 The Sovereign Standards of Professional Development (2025-2030)

> [!IMPORTANT]
> This is not just a document. This is the **Source of Truth**. This is the bridge between the lightning speed of "Vibe-Coding" and the indestructible quality of Senior Engineering. If you follow this, your code will look like it was built by a team of 10 elite engineers, not a solo prompt.

---

## 🏛️ Chapter 1: Architecture (The Divine Skeleton)

Architecture is what prevents your project from becoming a "Spaghetti Vibe". We use **Feature-Sliced Design (FSD)** as the law.

### 1.1. The Hierarchy of Layers
Every file must live in its designated layer. Crossing boundaries is a **Cardinal Sin**.

1. **App**: Global setup (Providers, Styles, Entry points).
2. **Pages**: Composition of widgets into a full route.
3. **Widgets**: Large, self-contained blocks (e.g., `Header`, `ProductGrid`).
4. **Features**: User actions that bring business value (e.g., `AddToCart`, `SearchProducts`).
5. **Entities**: Business domains (e.g., `User`, `Product`, `Order`).
6. **Shared**: Reusable UI kit, utils, API clients.

### 1.2. The Index Law (Public API)
Each slice MUST have an `index.ts`.
- **Rule**: NEVER import from `entities/user/ui/UserCard.tsx`.
- **Law**: ALWAYS import from `entities/user`.
- *Why?* This allows you to refactor internal logic without breaking the entire world.

### 1.3. Server-First Mindset (Next.js 15+ / RSC)
- **Default to Server**: Every component is a Server Component unless it needs `useState`, `useEffect`, or browser APIs.
- **Data Fetching**: Fetch at the highest possible level (Page/Widget) and pass data down, or use `Suspense` for granular loading.
- **Actions**: Use `Server Actions` for all mutations. No more messy `api/` routes unless external integration is needed.

---

## 🎨 Chapter 2: Design & Aesthetics (The Soul)

Vibe-coding is nothing without **VIBE**. Your UI must WOW the user instantly.

### 2.1. The "Premium" Color System
Avoid `#ff0000` or `#0000ff`. Use HSL for harmony.
- **Backgrounds**: Deep Obsidian (`hsl(220, 15%, 5%)`) or Pure Snow with subtle depth.
- **Accents**: Electric Violet, Cyber Cyan, or Sunset Gold.
- **Gradients**: Use 3-stop gradients with `oklch` for ultra-smooth transitions.

### 2.2. Motion & Micro-interactions
- **Entry Animations**: Everything should slide/fade into place. Use `stagger` for lists.
- **Hover States**: Cards should lift, buttons should glow, icons should move.
- **Layout Transitions**: Use `framer-motion` for `layoutId` transitions between pages.

### 2.3. Glassmorphism & Depth
- Use `backdrop-filter: blur(12px)`.
- Add a 1px border with `rgba(255, 255, 255, 0.1)` to simulate glass edges.
- Shadows should be soft, large, and colored (matching the element's accent).

---

## ⚡ Chapter 3: Performance (The Pulse)

A slow app is a dead app. Target 100/100 on Lighthouse.

### 3.1. Core Web Vitals (2025 Standards)
- **LCP (Largest Contentful Paint)**: < 1.2s. Use `priority` on Hero images.
- **INP (Interaction to Next Paint)**: < 200ms. Break up long JS tasks with `startTransition`.
- **CLS (Cumulative Layout Shift)**: 0. Always reserve space for images and ads.

### 3.2. Modern Media Optimization
- **Images**: Use `AVIF` by default. `WebP` is the fallback.
- **Video**: Use HLS/Dash for streaming. No raw `.mp4` above 5MB.
- **Fonts**: Use Variable Fonts. Preconnect to font origins.

---

## 🛡️ Chapter 4: Security (The Holy Shield)

The "Senior" part of your brain must be paranoid.

### 4.1. The Zero-Trust API
- **Validation**: Every single input (params, body, headers) must be validated with **Zod** or **Valibot**.
- **Auth**: Use HttpOnly, Secure, SameSite=Lax cookies. NEVER store JWT in LocalStorage.
- **Authorization**: Check permissions on the SERVER, not just the UI. "If you can't see the button, you can still call the API" — this is how you get hacked.

### 4.2. Secrets & Supply Chain
- **No Secrets**: Use `process.env`. Audit `.gitignore` daily.
- **Dependency Audit**: Run `npm audit` weekly. Pin versions. Avoid "Ghost" packages with no stars/activity.

---

## 🛠️ Chapter 5: DevOps & Infrastructure (The Realm)

### 5.1. CI/CD Excellence
- **Pre-commit**: Lint, Format, Type-check.
- **Automated Deployments**: Every PR should have a Preview URL.
- **Branch Protection**: No one pushes to `main` without a passed CI check.

### 5.2. Observability
- **Sentry**: For errors.
- **PostHog**: For analytics and session recording.
- **Logtail/BetterStack**: For structured server logs.

---

## 🧪 Chapter 6: QA & Testing (The Judgment)

### 6.1. The Testing Pyramid
1. **E2E (Playwright)**: 100% coverage for "Critical Path" (Login, Checkout, Main Feature).
2. **Integration**: Test features in isolation.
3. **Unit**: Only for complex logic/utils.

### 6.2. The "Zero-Tolerance" Manual Checklist
- [ ] No console.logs in production.
- [ ] No "broken" images (use fallbacks).
- [ ] Keyboard navigation works (tabbing).
- [ ] 404 page is custom and helpful.
- [ ] Favicon and Meta Tags are present.

---

## 🤖 Chapter 7: AI Collaboration (The Holy Spirit)

Vibe-coding is a partnership with the Machine.

### 7.1. Context Management
- Feed the AI your `index.ts` files first.
- Keep the AI focused on one Layer (e.g., "We are working in the Feature layer now").
- **Never** let the AI delete comments or refactor the whole project without a plan.

### 7.2. Prompting for Excellence
- Instead of "Add a button", say "Implement a `features/add-to-cart` button following our Design System and FSD rules. Use Framer Motion for the success state."

---

## 🚫 Appendix: The Black List of Sins (NEVER DO THESE)

1. **The "Div" Soup**: Using divs for everything. Use `<main>`, `<section>`, `<article>`, `<nav>`.
2. **Hardcoded Strings**: Use i18n or at least a constants file.
3. **Inline Styles**: Use CSS Modules or Tailwind. No `style={{ color: 'red' }}`.
4. **Prop Drilling**: If it goes deeper than 3 levels, use a Store (Zustand) or Context.
5. **Ignoring the Mobile**: 80% of users are on phones. If it's broken on iPhone SE, it's broken everywhere.

---

## 🏗️ Chapter 2: Universal Component Architecture (The Divine Anatomy)

A component is not just a function. It's a contract.

### 2.1. The Component Structure
Every component should follow this strict structure:
1. **Public API (index.ts)**: Exports only the component and its types.
2. **Types (types.ts)**: Defines strict props (using Zod for validation if needed).
3. **Styles (styles.module.css)**: Scoped CSS. NO global styles.
4. **UI (Component.tsx)**: Purely visual. Use `cn()` for class merging.
5. **Logic (useComponent.ts)**: Custom hook for business logic.

### 2.2. The "Perfect" Button Pattern
- **Polymorphism**: Supports `as="button"`, `as="a"`, or `as={Link}`.
- **States**: Default, Hover, Active, Focus, Disabled, Loading.
- **Accessibility**: Correct `aria-label`, keyboard focus rings, `role="button"`.

---

## 🧠 Chapter 3: State Management (The Consciousness)

Stop putting everything in `useState`. State should live where it belongs.

### 3.1. The 4 Levels of State
1. **URL State**: The "Source of Truth" for filters, pagination, and tabs. Use `useSearchParams`.
2. **Server State**: Managed by **TanStack Query**. Handle caching, revalidation, and optimistic updates.
3. **Global State**: Managed by **Zustand**. For user sessions, cart state, or UI themes.
4. **Local State**: Purely for UI (e.g., `isOpen`).

### 3.2. Data Synchronization (ACID in Frontend)
- **Optimistic Updates**: Change the UI *before* the server confirms. If it fails, roll back.
- **Stale-While-Revalidate**: Show the old data while fetching the new one.

---

## 💾 Chapter 4: Database & API (The Memory)

Your DB schema is your destiny.

### 4.1. Prisma & SQL Hygiene
- **Migrations**: Never manual. Always via `prisma migrate dev`.
- **Naming**: Use `snake_case` for DB tables and `camelCase` for application code.
- **Indexes**: Always index fields used in `WHERE`, `ORDER BY`, and `JOIN`.
- **Soft Deletes**: Use `deletedAt` instead of deleting rows to preserve history.

### 4.2. API Design (The Contract)
- **REST vs GraphQL**: Use REST for simplicity, GraphQL for complex nested data.
- **Type Safety**: Use `tRPC` or `Zod` to share types between Frontend and Backend.
- **Error Codes**: Return meaningful HTTP status codes (400, 401, 403, 404, 429, 500).

---

## ♿ Chapter 5: Accessibility (The Inclusion)

If a blind person can't use your site, you failed.

### 5.1. The a11y Checklist
- **Semantic HTML**: Use `<nav>` for menus, `<main>` for content, `<header>`/`<footer>`.
- **Focus Rings**: Never use `outline: none`. Customize it to match your design.
- **Alt Text**: Every image needs a descriptive `alt` attribute.
- **Color Contrast**: Minimum 4.5:1 for text.

---

## 🌍 Chapter 6: Internationalization (The Language)

### 6.1. i18n Strategy
- **Tokens**: Never hardcode strings. Use `t('auth.login.title')`.
- **Languge Detection**: Based on URL (`/en/home`) or browser headers.
- **Dates & Currency**: Use `Intl.DateTimeFormat` and `Intl.NumberFormat`.

---

## 📱 Chapter 7: Mobile-First & Adaptive (The Versatility)

Based on the **Bible of Adaptivity**:
- **Breakpoint Law**: Design for 375px (iPhone SE) first.
- **Touch Targets**: Minimum 44x44px.
- **Fluid Typography**: Use `clamp()` for font sizes.

---

## 🧪 Chapter 8: Testing & Verification (The Truth)

### 8.1. E2E with Playwright
- Test the "Happy Path" (User buys a product).
- Test the "Sad Path" (User enters wrong password).
- **Snapshot Testing**: Use it for UI components to prevent visual regression.

---

## 🤖 Chapter 9: AI Collaboration (The Holy Spirit)

### 9.1. Advanced Prompting
- "Refactor this component to use the Logic/UI split pattern."
- "Generate Playwright tests for this feature covering mobile and desktop."
- "Audit this file for security vulnerabilities according to our Manifesto."

---

## 🚫 Appendix: The Black List of Sins (Expanded)

6. **The "Any" Type**: In TypeScript, `any` is a crime. Use `unknown` or specific types.
7. **Giant Components**: If it's more than 200 lines, split it.
8. **Ignoring Logs**: If an error happens in production and you don't know why, you failed.
9. **No README**: Every project needs a `README.md` with setup instructions and architecture overview.

---

## 🏗️ Chapter 10: The Holy Grail of Components (The Universal Blocks)

Every project starts with these. If these are flawed, the whole app is flawed.

### 10.1. Typography System
- **Scale**: Use a geometric scale (e.g., 1.25 ratio).
- **Line Height**: 1.5 for body, 1.2 for headings.
- **Color**: Use `text-primary`, `text-secondary`, `text-muted`.

### 10.2. Layout Primitives
- **Container**: Max-width with auto-margins.
- **Stack**: Vertical/Horizontal spacing using `flex` or `gap`.
- **Section**: Standardized vertical padding (120px-180px for desktop).

### 10.3. The "Smart" Input
- **States**: `idle`, `active`, `error`, `success`, `disabled`.
- **Validation**: Real-time feedback with aria-live regions.
- **Labels**: Always visible or floating. NEVER use only placeholders.

### 10.4. Modals & Overlays
- **Focus Trap**: User cannot tab out of the modal.
- **Escape Key**: Closes the modal instantly.
- **Animation**: Fade-in background, Slide-up content.

---

## 🚀 Chapter 11: Deployment & Zero-Downtime (The Eternal Presence)

Your project must be alive 24/7.

### 11.1. Deployment Strategies
- **Blue-Green Deployment**: Deploy to a "green" environment, test it, then switch traffic.
- **Canary Releases**: Deploy to 5% of users first to catch edge-case bugs.
- **Atomic Deploys**: Ensure all files are uploaded before the server starts serving them (Vercel/Netlify do this by default).

### 11.2. Database Migrations in Production
- **Backward Compatibility**: Your code must support both the OLD and NEW DB schema during a migration.
- **Migration Locks**: Ensure only one instance runs migrations at a time.

---

## 📚 Chapter 12: Knowledge Management (The Chronicler)

A project without documentation is a black box.

### 12.1. README is the Entry Point
- **Architecture Section**: Explain the "Why" behind the structure.
- **Scripts**: Document every `npm run ...` command.
- **Env Variables**: Provide a `.env.example` with descriptions.

### 12.2. ADR (Architectural Decision Records)
- When making a major change (e.g., switching from REST to tRPC), record the reasoning, alternatives, and consequences.

---

## 🕊️ Final Truth
**Vibe-coding is not about laziness. It's about efficiency. Use the machine to build a masterpiece, not a mess.**

*This document is a living entity. Update it as the world changes.*
# Библия программирования: ошибки, безопасность и оптимизация

## Введение

Этот документ — методичка в том же духе, что и «библия вёрстки», но про **программирование**: типичные ошибки, антипаттерны, безопасность (в стиле OWASP), оптимизацию и практики «чистого кода».[web:18][web:21][web:26][web:29]  
Её можно использовать как системный промпт или справочник для агентов в Cursor/Antigravity, чтобы они генерировали код, который не только работает, но и безопасен, читаем и оптимизирован там, где это реально нужно.[file:17][web:22]

---

## 1. Философия качественного кода

Хороший код — это не только «работает», но и **читается**, **сопровождается**, **тестируется**, **безопасен по умолчанию** и **достаточно эффективен** для своих целей.[web:20][web:23][web:26]  
Большинство критических багов и уязвимостей не из-за сложных алгоритмов, а из-за базовых ошибок: отсутствие валидации, жёстко захардкоженные секреты, сломанные права доступа, «временные» костыли.[file:17][web:21]

### 1.1. Ключевые принципы

- Читаемость > «красивые однострочники» и микрооптимизации.[web:20][web:26]  
- Безопасность по умолчанию: входные данные недоверенные, секреты никогда не в коде, доступы всегда минимальные.[file:17][web:18][web:21]
- Оптимизация после измерений, а не по ощущению.[web:22][web:28][web:31]
- Тесты и наблюдаемость — часть разработки, а не «как-нибудь потом».[web:20][web:23]

### 1.2. Чего мы пытаемся избежать

- Критические уязвимости из OWASP Top 10: broken access control, injection, cryptographic failures, misconfiguration, устаревшие компоненты и др.[web:18][web:21][web:30]
- Неоптимальный и нечитаемый код, который сложно дебажить и развивать.[web:20][web:26]
- Ситуации «оно работает, но никто не понимает как», которые ломают команду и скорость разработки.[web:23][web:29]

---

## 2. Секреты, конфиги и Git: как нельзя и как надо

Одна из самых частых и опасных ошибок — хранить секреты (пароли, токены, ключи) прямо в коде или выкладывать их в репозиторий.[file:17][web:30]  
Это приводит к мгновенному компромиссу инфраструктуры при любой утечке репозитория.

### 2.1. Жёсткое хранение секретов (антипаттерн)

**Нельзя:**

- Коммитить в репозиторий файлы `.env`, `config.yml`, `settings.json` с реальными секретами.[file:17]
- Хардкодить `API_KEY`, `DB_PASSWORD`, `JWT_SECRET` прямо в коде.
- Публиковать в публичный GitHub (или даже приватный без защиты) реальные конфиги продакшена.

**Надо:**

- Добавлять `.env`, локальные конфиги и бэкапы БД в `.gitignore`.[file:17]
- Хранить секреты в Secret Manager / Vault (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault и т.п.).[file:17][web:30]
- Прокидывать секреты в приложение через переменные окружения и CI/CD, а не через код.[file:17]

### 2.2. Инфраструктурные файлы в webroot

**Нельзя:**

- Держать в корне веб-приложения доступные по HTTP `.git/`, `.env`, `backup.sql`, `db.sql`, `config.old` и подобные файлы.[file:17][web:24]

**Надо:**

- Настроить web-сервер так, чтобы он не отдавал служебные файлы (Git, конфиги, бэкапы).[web:18][web:24]
- Хранить бэкапы и конфиги вне публичного каталога.

**Чеклист «Секреты и конфиги»**

- Нет ни одного секрета в исходном коде и коммитах.
- Файлы `.env` и подобные исключены из репозитория.
- Используется менеджер секретов или переменные окружения.
- Webroot не содержит `.git`, `.env`, бэкапы и служебные файлы.

---

## 3. Аутентификация, авторизация и доступ

Broken access control — топ-1 риск по OWASP: большинство взломов — это не «0day», а банально неправильно настроенные права.[web:18][web:21][web:24]  
Типичные провалы: дефолтные логины, отсутствие rate limiting, прямой доступ к данным по ID, ошибки с JWT.

### 3.1. Аутентификация

**Нельзя:**

- Использовать встроенные или самописные хэши на MD5/SHA1, хранить пароли в открытом виде.[file:17][web:24]
- Разрешать слабые пароли (`123456`, `password`, `admin`).[file:17]
- Не ограничивать количество попыток логина (brute-force).

**Надо:**

- Использовать проверенные решения: Devise, Django auth, NextAuth и т.п., где уже реализованы best practices.[file:17]
- Хэшировать пароли через bcrypt/Argon2id с солью и адекватными параметрами.[file:17][web:24]
- Вводить политику паролей + rate limiting на попытки авторизации.[file:17][web:18]

### 3.2. JWT и сессии

**Нельзя:**

- Хранить JWT с правами доступа в `localStorage`/`sessionStorage` (XSS → кража токена).[file:17]
- Использовать слабые секраты (`supersecret`, `jwtsecret`) и не задавать срок жизни токена.[file:17]

**Надо:**

- Хранить чувствительные токены в HttpOnly + Secure cookies, а не в JS-доступном сторе.[file:17][web:30]
- Использовать сильный секрет и ротацию ключей.
- Делить access и refresh токены, у access — короткий TTL.

### 3.3. Авторизация, ACL и RBAC

**Нельзя:**

- Полагаться только на UI: «если кнопки нет — значит, прав нет», без реальной проверки на бэкенде.[file:17][web:24]
- Доступ к данным по `userId`/`tenantId` из запроса без проверки, что это текущий пользователь/арендатор.[file:17][web:21]
- Один общий админ с логином `admin/admin` в проде.

**Надо:**

- Явно проектировать RBAC/ACL: роли, права, границы ответственности.[file:17][web:24]
- На каждом защищённом эндпоинте проверять авторизацию по серверной логике, а не только по фронту.[web:21]
- По умолчанию запрещать, а не разрешать доступ (principle of least privilege).

**Чеклист «Аутентификация и доступ»**

- Пароли хранятся только в виде безопасных хэшей.
- Есть ограничения на количество попыток логина.
- JWT хранится в HttpOnly Secure cookies, у токенов есть срок жизни и ротация.
- Все действия, которые зависят от пользователя/роли, проверяются на сервере.

---

## 4. Инъекции: SQL, NoSQL, XSS, RCE, SSRF

Инъекции — классика: любое место, где данные пользователя попадают в интерпретатор (БД, шаблонизатор, shell), может привести к выполнению произвольного кода.[file:17][web:18][web:21][web:24]

### 4.1. SQL/NoSQL-инъекции

**Нельзя:**

- Строить запросы через конкатенацию: `"SELECT * FROM users WHERE id = " + req.query.id`.[file:17][web:24]
- Принимать фильтры/сортировку от клиента и без проверки вставлять их в запрос.

**Надо:**

- Использовать параметризованные запросы / prepared statements / ORM.[web:24][web:30]
- Белые списки для сортировок, полей фильтрации и т.д.

### 4.2. XSS и небезопасный HTML

**Нельзя:**

- Рендерить «сырые» данные пользователя как HTML без экранирования.[file:17][web:24]
- В React использовать `dangerouslySetInnerHTML` с пользовательским HTML без жёсткой фильтрации.[file:17]
- Пробрасывать шаблоны (Twig/Jinja и др.) с данными пользователя в контекст, где есть выражения, без отключения исполнения.[file:17]

**Надо:**

- По умолчанию экранировать HTML во всех местах вывода.[web:18][web:24]
- Для rich-текста использовать белый список тегов/атрибутов и проверенные библиотеки санитайзинга.[file:17]
- Использовать Content-Security-Policy для снижения ущерба от XSS.[file:17][web:18]

### 4.3. RCE, eval, OS-инъекции

**Нельзя:**

- Использовать `eval`, `exec`, `system`, `child_process.exec` и подобные над пользовательским вводом.[file:17]
- Строить shell-команды через конкатенацию строк с данными пользователя.

**Надо:**

- Максимально избегать динамического исполнения кода.
- Если без этого нельзя — использовать строго типизированные API, whitelists и изоляцию (sandbox, контейнеры).[file:17][web:18]

### 4.4. Path traversal и файловые операции

**Нельзя:**

- Давать пользователю прямой контроль над путём к файлу (`../` и т.п.).[file:17][web:24]

**Надо:**

- Ограничивать доступ к жёстко определённым директориям (webroot, uploads).[web:24]
- Проверять и нормализовывать пути, использовать белые списки имён.

**Чеклист «Инъекции»**

- Все SQL/NoSQL запросы используют параметры, а не конкатенацию.
- Любой HTML от пользователя санитайзится или экранируется.
- В коде нет `eval`/`exec` над пользовательскими данными.
- Файловые операции не позволяют выбрать путь произвольно.

---

## 5. Конфигурация, HTTPS, CORS и заголовки безопасности

Много продакшн-взломов — результат банальных мисконфигов: HTTP вместо HTTPS, открыт CORS, выключен HSTS, включён дебаг в проде.[file:17][web:18][web:24]

### 5.1. HTTPS и HSTS

**Нельзя:**

- Отдавать продакшн-проект по HTTP без шифрования.
- Допускать смешанный контент: часть запросов по HTTP, часть по HTTPS.[web:18]

**Надо:**

- Везде использовать HTTPS, включить HSTS (HTTP Strict Transport Security).[web:18][web:30]

### 5.2. Заголовки безопасности

Рекомендуемые заголовки:[file:17][web:18]

- `Content-Security-Policy` — ограничивает источники скриптов, стилей, медиа (борьба с XSS).
- `X-Frame-Options` или `frame-ancestors` — защита от clickjacking.
- `X-Content-Type-Options: nosniff` — запрет MIME-sniffing.
- `Referrer-Policy` — контроль утечки реферера.

### 5.3. CORS

**Нельзя:**

- Ставить `Access-Control-Allow-Origin: *` вместе с `Allow-Credentials: true`.[file:17][web:18]
- Разрешать всем доменам доступ к приватному API.

**Надо:**

- Поддерживать белый список доверенных Origin.[file:17]
- Управлять CORS централизовано и осознанно.

### 5.4. Debug, логи и лишние сервисы

**Нельзя:**

- Оставлять включённый DEBUG/stack trace в проде (Django `DEBUG=True`, Laravel `APP_DEBUG=true` и т.п.).[file:17]
- Оставлять открытыми админки (`/admin`, `phpMyAdmin`, панели мониторинга) с дефолтными логинами.[file:17][web:24]

**Надо:**

- Выключать подробные ошибки в проде, отдавать generiс сообщения.
- Защищать админки VPN, IP-фильтрацией, MFA.

**Чеклист «Конфигурация и HTTPS»**

- Продакшн доступен только по HTTPS.
- Настроены основные security headers.
- CORS настроен по принципу белого списка.
- В проде отключён debug и не торчат открытые админки с дефолтными логинами.

---

## 6. Supply chain: зависимости и пакеты

Современные проекты зависят от десятков/сотен библиотек. Уязвимость или вредонос в одной из них → проблемы у тебя.[file:17][web:24][web:30]

### 6.1. Управление зависимостями

**Нельзя:**

- Всегда ставить `latest` без фиксации версий.
- Игнорировать `npm audit`, `pip audit` и другие отчёты.

**Надо:**

- Фиксировать версии через `package-lock.json`, `poetry.lock`, `requirements.txt` и аналоги.[file:17][web:31]
- Использовать dependency scanning: `npm audit`, Snyk, Trivy и т.д.[file:17][web:30]

### 6.2. Typosquatting и «галлюцинированные» пакеты

**Нельзя:**

- Ставить пакеты по непроверенному названию, особенно похожие на популярные: `asyn-mutex` vs `async-mutex`, случайные форки популярных библиотек.[file:17]
- Обновлять зависимости «на глаз» в проде без тестов.

**Надо:**

- Проверять название пакета, репозиторий и активность комьюнити.[file:17]
- Обновлять зависимости через pull request + тесты + проверку безопасности.

**Чеклист «Зависимости»**

- Версии зависимостей зафиксированы.
- Регулярно сканируются уязвимости в зависимостях.
- Не используются случайные/сомнительные пакеты без проверки.

---

## 7. Логирование, мониторинг и rate limiting

Без логов и метрик невозможно понять, что система делает под нагрузкой и как её оптимизировать или защищать.[file:17][web:22][web:30]

### 7.1. Логи и мониторинг

**Надо:**

- Логировать ключевые события: логин, ошибки, важные бизнес-действия.[web:24][web:30]
- Использовать централизованные системы: Sentry, Prometheus/Grafana, CloudWatch и аналоги.[file:17]
- Следить за 4xx/5xx, latency, RPS, ошибками.

### 7.2. Rate limiting

**Нельзя:**

- Оставлять важные эндпоинты (логин, регистрация, чек-аут) без ограничений.[file:17][web:18]

**Надо:**

- Настроить rate limiting и защита от брутфорса на критических маршрутах.[file:17][web:18]

**Чеклист «Логи, мониторинг, rate limiting»**

- Есть централизованные логи и дашборды.
- На ключевых эндпоинтах стоят лимиты запросов.
- По метрикам можно увидеть деградацию и атаки.

---

## 8. Чистый код: читабельность, структура, тесты

Безопасность и оптимизация бессмысленны, если код невозможно читать и менять. Основные гайды по «clean code» сходятся в трёх вещах: читаемость, модульность, тестируемость.[web:20][web:23][web:26][web:29]

### 8.1. Читаемость и понятные имена

**Нельзя:**

- Писать сложные однострочники и «магические» выражения ради «красоты».[web:20][web:26]
- Использовать имена вида `a`, `b`, `doStuff`, `process`, если контекст неочевиден.

**Надо:**

- Давать переменным и функциям имена, отражающие смысл.[web:23][web:26]
- Разбивать сложную логику на шаги и промежуточные переменные.

### 8.2. Модульность и структура

**Нельзя:**

- Гигантские функции на сотни строк, которые «делают всё».[web:26][web:29]
- Плотная связность: одна функция знает слишком много о деталях другой.

**Надо:**

- Делить код на небольшие, переиспользуемые функции и модули.[web:23][web:26]
- Стараться к «одной ответственности» у функции/класса.

### 8.3. Тесты

**Нельзя:**

- Надеяться только на ручное тестирование и «оно и так работает».[web:20]

**Надо:**

- Писать unit-тесты для ключевой логики, особенно при рефакторинге.[web:20][web:23]
- Обеспечивать базовое покрытие критически важных путей.

### 8.4. Версионирование и документация

- Обязательно использовать Git и внятную стратегию ветвления.[web:32]
- Документировать публичные API, контракты и основные модули.

**Чеклист «Чистый код»**

- Код легко читается без комментариев, комментарии нужны только для сложной логики.
- Функции короткие и делают одну вещь.
- Есть базовые тесты на ключевой функционал.
- Проект структурирован по фичам/слоям, а не случайно.

---

## 9. Оптимизация: когда и как

Главное правило: **не оптимизировать раньше времени**. «Premature optimization is the root of all evil» — это не мем, а наблюдение большого количества инженеров.[web:22][web:25][web:28][web:31]

### 9.1. Мерить, а не гадать

**Надо:**

- Сначала поставить метрики: время ответа (p50/p95/p99), throughput, CPU, память.[web:22]
- Использовать профайлеры и бенчмарки, а не ощущения.[web:19][web:31]

### 9.2. Типичные направления оптимизации

- Алгоритмы и структуры данных: выбирать подходящие по сложности.
- Избегать лишних аллокаций и копирований в горячих местах.[web:19]
- Кэширование часто используемых результатов.
- Оптимизация запросов к БД (индексы, N+1, агрегации).[web:22]

### 9.3. Антипаттерны оптимизации

- Пожертвовать читабельностью ради сомнительного прироста в 2%.
- Оптимизировать код, который не в hot path.

**Чеклист «Оптимизация»**

- Есть измеряемые метрики производительности.
- Оптимизируются только реальные bottlenecks.
- После оптимизации снова проводится измерение.

---

## 10. Как использовать эту «библию» с ИИ-агентом

Чтобы агент реально соблюдал все эти правила, ему нужны:

- Жёсткие системные правила (DO/DON'T).
- Чеклисты для самопроверки перед ответом.
- Приоритет: безопасность и читаемость > количество фич > микрооптимизации.[file:17][web:22]

### 10.1. Базовый системный промпт

> Всегда генерируй код, который по умолчанию безопасен (OWASP Top 10), не содержит хардкода секретов, использует параметризованные запросы, валидацию входных данных и принципы минимально необходимого доступа. При конфликте между быстротой реализации и безопасностью/читаемостью — выбирай безопасность и читаемость.

### 10.2. Алгоритм работы агента

1. Понять задачу и контекст (язык, стек, окружение).
2. Сгенерировать решение, соблюдая правила из разделов 2–9.
3. Прогнать решение по чеклистам:
   - Секреты и конфиги.
   - Аутентификация и доступ.
   - Инъекции и ввод/вывод.
   - HTTPS, CORS, заголовки.
   - Зависимости.
   - Чистый код и тестируемость.
4. При необходимости упростить код, улучшить читаемость и убрать антипаттерны оптимизации.

---

## Заключение

Эта «библия» собирает вместе практики OWASP, гайды по clean code и реальные кейсы типичных ошибок, которые разработчики совершают снова и снова.[file:17][web:18][web:21][web:24][web:26]  
Встроив её в системные промпты агентов, можно сильно снизить количество уязвимостей, неоптимальных решений и нечитабельного кода уже на этапе генерации.[web:22][web:29][web:30]
# Библия вёрстки лендингов и лонгридов

## Введение

Этот документ — практическая методичка по вёрстке лендингов и лонгридов в духе методологий Tilda Education: как **надо** и **нельзя** делать дизайн страниц, чтобы они выглядели профессионально, читались легко и приносили конверсию.[web:1][web:5][web:9]  
Его можно использовать как системный промпт или справочник для агентов в Cursor, Antigravity и других инструментах, чтобы они следовали проверенным паттернам дизайна и избегали типичных ошибок.[web:10][web:14]

---

## 1. Философия лендинга: цель важнее украшательств

Лендинг — это страница с одной основной целью (заявка, покупка, регистрация), а не «мини-сайт обо всём». Всё остальное — структура, содержание и визуал — подчинено этой цели.[web:10][web:11]  
Пользователь сканирует страницу за секунды, поэтому дизайн должен помогать быстро понять ценность, а не демонстрировать визуальные эксперименты.[web:3][web:7]

### 1.1. Ключевые принципы

- Один лендинг — одна главная цель и один основной CTA (призыв к действию).
- Страница должна быть сканируемой: блоки, заголовки, акценты, короткие абзацы.[web:3][web:11]
- Дизайн — служебный: он подчёркивает смысл, а не конкурирует с ним.[web:5][web:9]
- Простота лучше перегруза: меньше стилей, меньше цветов, больше воздуха.[web:1][web:5]

### 1.2. Типовая структура лендинга

- Обложка (hero): кто вы, что предлагаете, для кого, один CTA.[web:10][web:14]
- Блок «Проблема / Решение»: какую боль закрывает продукт и как именно.[web:10]
- Блок «Выгоды и ключевые преимущества».
- Блок «Как это работает / Что внутри» (структура продукта, программа, этапы).[web:10][web:6]
- Социальное доказательство: отзывы, кейсы, логотипы клиентов.[web:10]
- Блок доверия: авторы, гарантии, ответы на частые вопросы.[web:10]
- Финальный повтор оффера и CTA: тот же призыв, что и на обложке.[web:10]

**Чеклист «Философия и структура»**

- На странице одна главная цель и один основной CTA, формулировка CTA везде одинаковая.
- Любой блок можно отнести к одной из категорий: «оффер», «выгоды», «детали», «доказательства», «ответы на возражения», «контакты».
- Нет блоков, которые визуально выглядят важнее обложки без стратегической причины.

---

## 2. Сетка, блоки и вертикальный ритм

Tilda подчёркивает, что воспринимать информацию проще, когда она разбита на смысловые блоки и между ними есть крупные и равные отступы.[web:1][web:5][web:9]  
Вертикальный ритм (повторяющийся паттерн отступов) создаёт ощущение порядка и профессиональности.[web:4][web:12]

### 2.1. Смысловые блоки

- Один блок = одна мысль или одна задача пользователя (оффер, список выгод, отзыв, FAQ).[web:1][web:5]
- Не смешивай разные функции в одном блоке: например, «о нас» + «тарифы» + «отзывы» в одной плашке.
- Для смены смысла — всегда новый блок.

### 2.2. Вертикальные отступы между блоками

- Рекомендованный диапазон между смысловыми блоками: **120–180 px**.[web:1][web:5]
- Между блоками одного уровня отступы должны быть одинаковыми — иначе кажется, что один важнее другого без причины.[web:1][web:5]
- Маленькие отступы создают «липкость» блоков — пользователь перестаёт понимать, где один смысл заканчивается, а другой начинается.[web:1][web:5]

### 2.3. Внутренние отступы блока

- Внутри блока отступы сверху и снизу должны быть согласованы с общей системой (например, 80–120 px).
- Элементы внутри блока выравнивают по сетке: заголовки, текст, изображения должны «стоять» по невидимым колонкам.[web:4][web:8]
- Заголовок визуально относится к тексту под ним: расстояние сверху до заголовка в 2–3 раза больше, чем расстояние от заголовка до текста.[web:9]

### 2.4. Чего нельзя делать с блоками и отступами

- Разные отступы между одинаковыми по смыслу блоками без логики.[web:1][web:5]
- Блоки, которые визуально прилипают друг к другу и читаются как один.
- Полноэкранные изображения, между которыми оставлен пустой отступ: граница между ними и так видна.[web:9]

**Чеклист «Сетка и вертикальный ритм»**

- Страница разбита на отдельные смысловые блоки; каждый отвечает на один вопрос пользователя.
- Вертикальные отступы между блоками одного уровня одинаковые и находятся в диапазоне 120–180 px.
- Внутри блоков элементы выстроены по единой сетке, нет случайных смещений.
- Полноэкранные изображения подряд идут без пустых зазоров.

---

## 3. Визуальная иерархия: что важнее, то крупнее

Цель иерархии — позволить пользователю за 3–5 секунд понять, что здесь главное, а что фон.[web:1][web:3][web:11]  
На уровне лендинга главный элемент — оффер на обложке, на уровне блока — его заголовок.

### 3.1. Иерархия на уровне страницы

- Самый крупный и заметный заголовок — на обложке (hero).[web:1][web:5]
- Ни один последующий заголовок не должен визуально побеждать обложку без жёсткой причины (например, специальный промо-блок).
- CTA на обложке должен быть заметен, но не кричать больше, чем заголовок.

### 3.2. Иерархия внутри блока

- Заголовок блока — самый крупный текст в блоке.[web:5][web:9]
- Подзаголовок — меньше заголовка и менее насыщенный.
- Названия преимуществ / пунктов списка — меньше подзаголовка, но крупнее основного текста.
- Описание / пояснения — самый мелкий текст.

### 3.3. Акценты и ключевые фразы

- Важные мысли стоит выделять размером и отступами, а не только жирным.[web:9][web:8]
- Ключевая фраза должна быть крупнее основного текста на 10–15 px и отделена от него воздухом.
- Акцентный блок (цитата, инсайт) — самостоятельный элемент, его стоит визуально отделить от текста.

### 3.4. Анти-паттерны иерархии

- Заголовок внутри блока меньше, чем подписи к иконкам — визуально кажется второстепенным.[web:9]
- Заголовок обложки меньше, чем заголовок в середине страницы — рушит логику страницы.[web:1][web:5]
- Все тексты примерно одного размера и насыщенности — пользователь не понимает, что главное.

**Чеклист «Визуальная иерархия»**

- Самый крупный заголовок на странице — оффер на обложке.
- В каждом блоке чётко читается уровневость: заголовок → подзаголовок → пункты → описания.
- Важные фразы выделены не только жирным, но и размером/отступами.

---

## 4. Типографика: шрифты, стили, выравнивание

Типографика — главный носитель смысла. Tilda рекомендует радикально ограничивать количество шрифтов и стилей, чтобы текст оставался читаемым и аккуратным.[web:1][web:5][web:9]  
Чем меньше хаоса в начертаниях, размерах и цветах, тем проще пользователю.

### 4.1. Шрифтовые пары и начертания

- Для большинства лендингов достаточно **одного шрифта** с двумя насыщенностями: normal и bold.[web:5][web:9]
- Допустима пара «заголовочный + текстовый» шрифт, но без зоопарка начертаний.
- Не стоит использовать редкие декоративные шрифты для длинных текстов — только для коротких акцентных заголовков.

### 4.2. Выравнивание текста

- Основной текст (абзацы, лонгрид) выравнивается по **левому краю** — это лучший вариант для чтения.[web:9][web:3]
- Центрирование используют для коротких заголовков, слоганов, маленьких блоков текста (до 1–3 строк).[web:9]
- Длинный текст по центру выглядит неопрятно и быстро утомляет.

### 4.3. Строка, колонки и длина

- В узких колонках нельзя размещать большие объёмы текста — взгляд постоянно прыгает.[web:1][web:5]
- Если текста много, лучше уменьшить количество колонок и увеличить ширину текстового блока.
- В лонгридах избегают строки длиной более 80–90 знаков: длинная строка ухудшает читаемость.[web:8]

### 4.4. Абзацы и структура текста

- Сплошная «пелена» текста без абзацев и подзаголовков — табу.[web:9][web:3]
- Каждый новый смысл — новый абзац.
- Внутри длинных разделов делай подзаголовки, акцентные цитаты, иллюстрации.

### 4.5. Жирный, курсив и акценты

- Жирное начертание используют только для действительно важных фраз, а не каждые два слова.[web:9]
- Курсив подходит для единичных слов/фраз; большие объёмы текста курсивом — ошибка.[web:9]
- В беззасечных шрифтах курсив часто выглядит грязно — лучше обойтись без него.[web:9]

### 4.6. Анти-паттерны типографики

- Слишком много разных стилей: размеры, насыщенности, подчеркивание, цвета — текст «рябит».[web:5][web:9]
- Длинный текст с выравниванием по центру.
- Заголовки и подзаголовки почти одинакового размера — непонятно, что из этого важнее.[web:9]

**Чеклист «Типографика»**

- Используется один (максимум два) шрифта и не более двух насыщенностей в тексте.
- Основной текст выровнен по левому краю, центр используется только для коротких блоков.
- В длинных текстах есть абзацы, подзаголовки, акцентные элементы.
- Выделений жирным и курсивом мало, они работают как акцент, а не создают шум.

---

## 5. Цвет: палитра, акценты, фоны

Цвет — это инструмент иерархии и акцентирования, а не украшательство ради украшательства.[web:5][web:9]  
Перегруженная палитра сбивает внимание и уменьшает доверие.

### 5.1. Базовая цветовая система лендинга

- Базовый фон (часто белый или светлый серый).
- Основной цвет текста (тёмный, с хорошим контрастом к фону).[web:5]
- 1–2 акцентных цвета: для CTA-кнопок, ключевых иконок, важных ссылок.[web:5][web:7]

### 5.2. Цвет и смысловые блоки

- Фон цветом применяют ко **всему** смысловому блоку, а не к узкой полосе.[web:5][web:9]
- Узкие цветные плашки под заголовком дробят блоки и выглядят неаккуратно.
- Если хочется акцента — выдели весь блок: заголовок, текст, связанные элементы.

### 5.3. Цвет и текст

- Контраст между текстом и фоном должен обеспечивать лёгкое чтение на всех устройствах.[web:5][web:12]
- Не делай многоцветные абзацы, где каждое предложение своим цветом.
- Для акцентов чаще достаточно размера и насыщенности, а не смены цвета на агрессивный.

### 5.4. Анти-паттерны цвета

- Слишком много ярких цветов в одном экране — непонятно, что главное.[web:5]
- Цветной фон под маленьким блоком, который можно было отделить просто воздухом.[web:9]
- Яркий фон + слабый контраст текста → текст тяжело читаться.

**Чеклист «Цвет»**

- На странице 1–2 акцентных цвета, которые системно используются для CTA и важных элементов.
- Нет случайных разноцветных фрагментов без смыслового основания.
- Цветной фон применяется для целых смысловых блоков, а не отдельных узких полос.
- Контраст текста и фона достаточен для комфортного чтения.

---

## 6. Работа с изображениями и фоном

Изображения должны помогать считывать смысл, а не мешать ему. Tilda подробно разбирает типичные ошибки вроде текста на светлой части фото и перекрытия лиц заголовками.[web:1][web:5][web:9]

### 6.1. Текст поверх фотографий

- Текст не должен сливаться с фоном — всегда обеспечивай достаточный контраст.[web:1][web:5]
- Если фото светлое, используй тёмный фильтр (оверлей), градиент или затемнение области под текстом.[web:1][web:5]
- Можно изначально подбирать фото с тёмной областью для текста.

### 6.2. Положение текста относительно изображения

- Не размещай заголовок на лице человека или на важной детали.[web:9]
- Если фон неоднородный, двигай текст по вертикали/горизонтали, пока не найдёшь спокойную область.
- При необходимости используй полупрозрачный подложенный блок под текстом.

### 6.3. Полноэкранные изображения и галереи

- Несколько полноэкранных изображений подряд располагают без отступов между ними.[web:9]
- Если изображение — часть одного смыслового блока с текстом, им делают общий фон и связующую подложку.
- Галерея не должна выглядеть как самодостаточный блок, если по смыслу она относится к заголовку выше.

### 6.4. Подписи к иллюстрациям

- Подпись — отдельный элемент, между ней и изображением должен быть воздух.[web:9]
- Подпись не должна прилипать к картинке или визуально «залезать» на неё.

**Чеклист «Изображения»**

- Текст поверх фотографий всегда читается без усилий.
- Важные части изображения (лица, объекты) не перекрыты текстом.
- Полноэкранные изображения подряд не разделены лишними отступами.
- Подписи к изображениям имеют небольшие, но заметные отступы.

---

## 7. Обложка (hero): первый экран, который решает всё

Именно первый экран даёт пользователю ответ на вопросы «Куда я попал?» и «Что мне здесь предлагают?», поэтому Tilda уделяет ему особое внимание.[web:10][web:14][web:7]

### 7.1. Обязательные элементы обложки

- Заголовок: формулирует ценность или результат для пользователя.[web:10][web:11]
- Подзаголовок: добавляет конкретику (для кого, в каком формате, когда, за сколько).[web:10]
- Основной CTA: одно действие — оставить заявку, купить, зарегистрироваться, записаться.[web:10]
- Визуальный фон: иллюстрация, фото или паттерн, который не мешает чтению текста.[web:1][web:5]

### 7.2. Правила композиции обложки

- Заголовок — самый крупный текст на странице, но не перекрывает всю композицию.[web:1][web:5]
- Обложка дышит: вокруг заголовка, подзаголовка и кнопки есть воздух.
- Сразу видно, на какой элемент нужно нажать (CTA не теряется среди второстепенных ссылок).[web:3][web:7]

### 7.3. Частые ошибки обложки

- Заголовок обложки меньше, чем заголовок в следующем блоке.
- Заголовок слишком крупный и длинный: занимает весь экран и ухудшает читаемость.[web:9]
- Слишком много элементов: три разных CTA, меню из десяти пунктов, баннеры, второстепенные кнопки.[web:11]

**Чеклист «Обложка»**

- Понятно за 3 секунды: что за продукт, для кого, что нужно сделать.
- Заголовок обложки — главный по размеру и визуальной значимости.
- Подзаголовок и CTA читаются сразу, не конкурируя с фоном и второстепенными элементами.

---

## 8. Меню, навигация и структура

Меню помогает пользователю найти нужный блок, но легко превратить его в визуальный мусор.[web:5][web:9]  
Tilda рекомендует ограничивать количество пунктов и логично группировать информацию.

### 8.1. Объём меню

- Оптимум: **5–7 пунктов** верхнего уровня.[web:5]
- Всё дополнительное — во вторичном меню, футере или внутри лендинга.
- Названия пунктов — обычным языком: «О курсе», «Программа», «Отзывы», «Цена», «FAQ».[web:10][web:11]

### 8.2. Визуальное поведение шапки

- Шапка не должна перетягивать внимание с обложки.
- Она может быть прозрачной поверх hero-блока или иметь спокойный фон.
- При скролле шапка может становиться фиксированной, но не увеличивать визуальный шум.

### 8.3. Якоря и дубли CTA

- Пункты меню можно привязать к якорям на странице, если лендинг длинный.[web:14]
- Главный CTA можно дублировать в шапке, но с той же формулировкой, что и на обложке.

**Чеклист «Меню»**

- В меню не больше 5–7 пунктов.
- Названия понятны пользователю с улицы, без внутреннего сленга.
- Шапка не давит визуально, главный акцент — на обложке и CTA.

---

## 9. Дизайн статей и лонгридов

Если в проекте есть статьи, кейсы или учебные материалы, к ним применяются свои правила структуры и акцентирования текста.[web:9][web:3][web:8]

### 9.1. Структурирование текста

- Никаких длинных сплошных блоков текста без абзаций и подзаголовков.[web:9]
- Каждые 2–3 абзаца — подзаголовок или визуальный элемент.
- В тексте присутствуют акцентные цитаты, выделенные фразы или вставки.

### 9.2. Заголовки и отступы

- Заголовок раздела по смыслу относится к тексту под ним; расстояние сверху больше, чем снизу.[web:9]
- Расстояние под заголовком примерно равно межабзацному или немного больше.
- Заголовки разных уровней визуально различаются: размер, насыщенность, отступы.[web:8]

### 9.3. Акценты и цитаты

- Акцентный блок отделяют от основного текста отступами 75–120 px.[web:9]
- Ключевая фраза крупнее основного текста на 10–15 px.

### 9.4. Типографическая дисциплина

- Чем меньше стилей внутри статьи, тем лучше: заголовок, подзаголовок, текст, акцент — достаточно.[web:9]
- Много жирного, курсивов, подчёркиваний и цветных слов создают шум.

**Чеклист «Лонгрид»**

- Текст разбит на логичные секции с заголовками.
- Между заголовком и последующим текстом правильные отступы: видно, что заголовок относится к тексту снизу.
- В статье есть акценты и визуальные врезки, облегчающие чтение.

---

## 10. Кнопки, формы и микроинтерфейсы

Кнопки и формы — критические места для конверсии. Их визуальная простота напрямую влияет на удобство и доверие.[web:5][web:3][web:7]

### 10.1. Кнопки

- Основной стиль кнопок один по всему сайту: форма, скругление, цвет, тень.
- Цветная кнопка не нуждается в обводке — обводка нужна только для прозрачной кнопки.[web:5]
- Текст на кнопке конкретный: действие + объект (например, «Записаться на курс», «Получить консультацию»).[web:10]

### 10.2. Формы

- У формы минимум полей, только действительно необходимые для конверсии.[web:3][web:11]
- Подписи к полям чёткие и понятные; плейсхолдер — пример, а не единственный текст.
- Ошибки и валидация отображаются понятно и аккуратно.

### 10.3. Микротекст

- Под кнопками и формами можно давать краткие пояснения: «Мы не рассылаем спам», «Можно оплатить в рассрочку».
- Микротекст должен быть читаемым, но не спорить с основным текстом по размеру.

**Чеклист «Кнопки и формы»**

- На странице 1–2 стиля кнопок, не больше.
- Цветные кнопки без лишних обводок.
- Формы короткие, понятные, с внятными подписями и валидными ошибками.

---

## 11. Адаптивность, сетка и респонсив

Лендинг должен одинаково хорошо работать на десктопе и на мобильных устройствах. Ошибки адаптива часто ломают тщательно выстроенную иерархию.[web:4][web:12]

### 11.1. Адаптивная сетка

- На десктопе можно использовать многоколонные сетки, на мобильных — чаще всего одна колонка.
- При переходе на мобильный важно сохранять порядок смыслов: что шло выше по важности, остаётся выше.[web:3][web:11]

### 11.2. Текст и размеры

- Минимальный комфортный размер текста на мобильном — 14–16 px.
- Заголовки при адаптации уменьшаются, но иерархия сохраняется.

### 11.3. Отступы и кликабельные зоны

- Между кликабельными элементами (кнопки, ссылки) достаточно расстояния, чтобы по ним удобно попадать пальцем.
- Вертикальные отступы могут уменьшаться, но не настолько, чтобы блоки вновь слипались.

**Чеклист «Адаптивность»**

- На мобильном страница не превращается в «кирпич»: есть блоки, отступы, читаемая типографика.
- Иерархия заголовков и CTA сохраняется на всех брейкпоинтах.
- Кнопки и ссылки удобно нажимать на мобильном.

---

## 12. UX и поведение пользователя

Дизайн лендинга должен учитывать, как люди реально сканируют страницу и принимают решения.[web:3][web:7][web:11]

### 12.1. Сканирование и паттерны

- Большинство пользователей бегло сканируют страницу, а не читают её целиком.[web:3]
- Важные элементы размещают в соответствии с F- или Z-паттернами сканирования: сверху-слева к центру и дальше вниз.[web:11]

### 12.2. Снижение когнитивной нагрузки

- Чем меньше вариантов действий в одном экране, тем проще принять решение.
- Избегай перегруженных экранов с десятком кнопок и хедеров.

### 12.3. Доверие и профессиональный вид

- Аккуратная сетка, чистая типографика и ограниченная палитра визуально сигнализируют, что продукт качественный.[web:1][web:5]
- Сайт с типичными визуальными ошибками воспринимается как менее надёжный.

**Чеклист «UX-поведение»**

- В каждом экране 1–2 ключевых действия, а не пять.
- Важные элементы расположены в ожидаемых местах (заголовок и CTA в первом экране, цена рядом с описанием тарифа и т. п.).
- Общий вид страницы вызывает ощущение порядка и доверия.

---

## 13. Чёрный список ошибок (для агентов)

Этот раздел можно использовать как готовый блок «запрещённых приёмов» для системного промпта дизайнера.

### 13.1. Ошибки вёрстки блоков

- Нет явного деления на смысловые блоки.
- Маленькие отступы между блоками (меньше 120 px).
- Разные отступы между одинаковыми блоками без причины.
- Пустое пространство между двумя полноэкранными изображениями.

### 13.2. Ошибки типографики

- Много разных шрифтов и стилей на одной странице.
- Длинный текст, выровненный по центру.
- Заголовки и подзаголовки почти одинакового размера.
- Избыточное количество жирного и курсивного текста.

### 13.3. Ошибки работы с цветом

- Слишком много ярких цветов — непонятно, куда смотреть.
- Узкий цветной блок только под заголовком, отрывающий его от собственного текста.
- Слабый контраст текста и фона.

### 13.4. Ошибки с изображениями

- Текст, который сложно прочитать на фоне фотографии.
- Заголовок или текст перекрывают важную часть изображения (лицо, предмет).
- Подпись прилеплена к картинке без воздуха.

### 13.5. Ошибки интерфейса

- Перегруженное меню с десятком пунктов.
- Цветные кнопки с обводками.
- Много разных стилей кнопок на одной странице.

---

## 14. Как встроить эту методичку в ИИ-агента

Чтобы агент (Cursor, Antigravity и др.) реально следовал этим правилам, нужно задать их в виде системных инструкций и чеклистов.

### 14.1. Базовая формулировка для системного промпта

> Всегда проектируй лендинг как набор смысловых блоков с крупными и равными отступами. Соблюдай визуальную иерархию: заголовок обложки — самый важный, дальше заголовки секций, дальше текст. Ограничивайся одним шрифтом и 1–2 акцентными цветами. Не используй решения, явно указанные как ошибка или запрещённый приём в этой методичке.

### 14.2. Алгоритм работы агента

1. Сначала определяй цель лендинга и основной CTA.
2. Строй структуру блоков по схеме из раздела 1.2.
3. Для каждого блока применяй правила:
   - сетка и отступы (раздел 2),
   - иерархия (раздел 3),
   - типографика (раздел 4),
   - цвет (раздел 5),
   - изображения (раздел 6).
4. После генерации проверяй результат по чек-листам в конце каждого раздела.
5. Исправляй все пункты из «Чёрного списка ошибок», если они проявились.

### 14.3. Формат чеклистов для автопроверки

Можно добавить в промпт формулировку:

> Перед тем как вернуть результат пользователю, прогоняй каждую секцию через чеклисты и чёрный список. Если находишь нарушения, перепроектируй соответствующие блоки.

---

## Заключение

Следование этим правилам, основанным на методиках Tilda Education и общепринятых UX-практиках, даёт «базовый профессиональный уровень» вёрстки лендингов и лонгридов даже без участия дизайнера.[web:1][web:5][web:3][web:11]  
Встроив эту методичку в системные промпты агентов, можно эмулировать работоспособный базовый дизайн-гуайд, который будет снижать количество визуальных ошибок и повышать конверсию страниц.[web:7][web:10]
# Библия адаптива: как делать удобный мобильный и планшетный интерфейс

## Введение

Этот документ — методичка по адаптации лендингов и веб‑интерфейсов под телефоны и планшеты: **mobile‑first**, брейкпоинты, сетка, размеры, тач‑таргеты, навигация, формы и производительность.[web:34][web:37][web:40][web:43][web:46]  
Её можно использовать как системный промпт или чеклист для агента (Cursor/Antigravity), чтобы он сразу проектировал макеты и вёрстку так, чтобы на мобильных устройствах всё было максимально понятно и удобно.[web:34][web:40]

---

## 1. Философия mobile‑first

Mobile‑first = сначала проектируем опыт для **самого маленького экрана**, затем постепенно усложняем интерфейс для планшетов и десктопов (progressive enhancement).[web:34][web:37][web:40]  
Это заставляет жёстко расставлять приоритеты в контенте и взаимодействиях, убирая всё лишнее.

### 1.1. Принципы mobile‑first

- **Самое важное — сверху.** На мобильном пользователь видит только несколько первых экранов, поэтому ключевой оффер, CTA и базовые ответы должны быть в начале.[web:34][web:40]
- **Один главный сценарий на экран.** Не перегружаем мобильный экран десятком опций — 1–2 основных действия, всё остальное через раскрытие/вторичные экраны.[web:34][web:43]
- **Прогрессивное раскрытие.** Детали, фильтры, второстепенную информацию прячем в аккордеоны, табы, отдельные экраны.[web:34][web:40]
- **Сначала контент, потом украшения.** Сложные анимации, параллакс и декоративные элементы — для больших экранов, не для базового мобильного опыта.[web:37][web:43]

### 1.2. Mobile‑first vs desktop‑first

- Desktop‑first → «урезаем» десктопный дизайн до мобильного, часто ломая иерархию и usability.[web:34][web:37]
- Mobile‑first → строим минимальный, сфокусированный интерфейс и **добавляем** возможности на больших экранах.[web:40][web:43]

**Чеклист «Философия mobile‑first»**

- Явно определён главный сценарий для мобильного.
- Первый экран на телефоне отвечает: что это, что сделать, какой профит.
- Все второстепенные элементы убраны в скрытые зоны/отдельные экраны.

---

## 2. Брейкпоинты и сетка для телефонов и планшетов

Адаптивная сетка опирается на брейкпоинты — диапазоны ширин экрана, в которых меняется структура: количество колонок, отступы, расположение блоков.[web:39][web:42][web:45][web:48]

### 2.1. Типовые брейкпоинты

На основе Material Design и распространённых гайдлайнов можно использовать такие ориентиры (ширина viewport):[web:39][web:42][web:45]

- **0–480 px** — маленькие смартфоны (портрет).
- **481–600 px** — обычные смартфоны, большие в портрете, маленькие в ландшафте.
- **601–840 px** — маленькие планшеты (портрет), большие телефоны (ландшафт).
- **841–1024 px** — планшеты (ландшафт).[web:39][web:42]

Далее начинаются брейкпоинты для десктопа, которые здесь можно не расписывать подробно.

### 2.2. Колонки, отступы, поля

Материальные гайды предлагают:[web:39][web:42][web:45]

- Телефон: 4 колонки, gutters ~16 dp, боковые отступы (margins) ~16 dp.
- Планшет: 8–12 колонок, gutters 16–24 dp, margins 24 dp и выше.

Практический вывод для вёрстки:

- Использовать **процентные ширины** колонок и max‑width контейнеров, а не жёсткие px.[web:36][web:45]
- Внутренние поля и отступы задавать через переменные/токены, чтобы на разных брейкпоинтах они масштабировались системно.

### 2.3. Поведение блоков при изменении ширины

- На телефоне большинство блоков → одна колонка, элементы идут друг за другом.[web:37][web:46]
- На планшете можно раскладывать контент в 2–3 колонки: например, текст + изображение рядом, карточки в две колонки.[web:39][web:42]

**Чеклист «Сетка и брейкпоинты»**

- Явно определены брейкпоинты для телефона и планшета.
- На телефоне почти всё идёт в одну колонку с нормальными отступами.
- На планшете полезно использовать 2–3 колонки, не превращая всё в «мини‑десктоп».

---

## 3. Тач‑таргеты и расстояния

Главное отличие мобильного от десктопа — управление пальцем. Таргеты должны быть достаточно большими, чтобы по ним попадать без промахов, и не слишком близко друг к другу.[web:35][web:38][web:41][web:44][web:47]

### 3.1. Размер тач‑таргетов

- WCAG 2.1 AAA и Apple HIG: минимум **44×44 CSS‑пикселя / pt** для интерактивных элементов.[web:35][web:38][web:41]
- Material Design: рекомендует **48×48 dp** для тач‑таргетов.[web:35][web:47]
- NN/g: физический минимум — около **1×1 см** (≈ 0.4×0.4 дюйма), чтобы избежать «fat‑finger» ошибок.[web:44]

Практический вывод: **минимум 44×44 px**, лучше 48×48, особенно для основных CTA.

### 3.2. Расстояния между элементами

- Между активными элементами должно быть достаточно пространства, чтобы не нажимать соседний элемент случайно.[web:35][web:44]
- Иконки можно делать визуально меньше, но клик‑область должна дотягиваться до 44×44 с помощью инвизибл‑padding.[web:41][web:47]

**Чеклист «Тач‑таргеты»**

- Все кнопки и интерактивные элементы имеют таргет ≥ 44×44 px.
- Основные CTA ещё крупнее и визуально выделены.
- Между соседними кликабельными элементами есть зазор.

---

## 4. Типографика и читаемость на маленьких экранах

На мобильных экранах текст должен быть **крупным и контрастным**, а строки — не слишком длинными.[web:37][web:43][web:46]

### 4.1. Размеры шрифтов

Практические ориентиры:

- Основной текст: **14–16 px** минимум.
- Заголовки: 18–24+ px, но не настолько большие, чтобы занимать весь экран.

Важно: масштаб учитывает плотность пикселей. На высоких DPI шрифт 14 px может выглядеть мелким — проверяй на реальных устройствах.[web:37][web:43]

### 4.2. Межстрочные и межсимвольные интервалы

- Line‑height для основного текста: примерно **1.4–1.6** от размера шрифта.
- Добавляй вертикальный «воздух» между абзацами, особенно на узких экранах.

### 4.3. Выравнивание и длина строки

- Текст выравнивается по **левому краю**, не по центру — так его легче читать.[web:37]
- Длина строки на телефоне естественно меньше, но избегай супердлинных заголовков в одну строку: лучше переносить.

**Чеклист «Типографика мобильного»**

- Текст не требует зумирования для чтения.
- Заголовки и текст читаются без напряга, нет «пелены» текста.
- Выравнивание по левому краю, разумные отступы между абзацами.

---

## 5. Навигация на телефоне и планшете

Навигация — один из главных источников боли на мобильных: маленькие пункты, сложные уровни, элементы в недоступных местах.[web:34][web:40][web:43]

### 5.1. Расположение навигации

- Верхняя бары (top‑nav) подходят для основных разделов, но на больших телефонах дотянуться до верха одной рукой сложно.[web:34][web:46]
- Нижние навигационные панели (bottom‑nav/tab‑bar) удобны для частых действий, до них легко дотянуться большим пальцем.[web:39][web:42]

### 5.2. Количество пунктов

- Основная навигация: 3–5 пунктов максимум.[web:40]
- Всё второстепенное — в хэбургер/доп. меню, но не прячь критически важные действия.

### 5.3. Жесты и дополнительные паттерны

- Жесты (свайпы) можно использовать, но интерфейс должен быть понятен и без них.[web:39]
- Нижние sheet’ы, выезжающие панели и т.п. — только если они очевидны.

**Чеклист «Навигация»**

- Главные разделы/действия доступны одним‑двумя тапами.
- Элементы навигации внутри тач‑зоны большого пальца на телефоне.
- Нет запутанных трёх‑четырёх уровней вложенности в мобильном меню.

---

## 6. Формы и ввод данных на мобильных

Формы на мобильном должны быть максимально короткими, прощающими ошибки и подсказывающими правильный формат.[web:40][web:43]

### 6.1. Минимизируем количество полей

- Спрашивай только необходимое для шага; остальное — позже.[web:40]
- Разбивай длинные формы на несколько экранов с чётким прогрессом.

### 6.2. Тип клавиатуры и автоподстановка

- Выставляй правильный `input type`: `email`, `tel`, `number`, `url` и т.п., чтобы открывалась подходящая клавиатура.[web:40]
- Автозаполнение: разрешай браузеру подставлять email, имя, адрес и т.д.

### 6.3. Ошибки и валидация

- Показывай ошибки рядом с полем и человеческим языком.
- Не заставляй заполнять всё заново при одной ошибке.

**Чеклист «Формы»**

- Формы короткие, только нужные поля.
- Типы полей настроены для удобной клавиатуры.
- Ошибки понятные, подсвечиваются локально, не ломая весь прогресс.

---

## 7. Жестикуляция, скролл и кликабельность

На мобильном всё строится вокруг скролла и жестов, но нельзя прятать базовую функциональность за «магические» жесты.[web:34][web:43]

### 7.1. Скролл как основной паттерн

- Вертикальный скролл — нормально; лучше длинный, но структурированный скролл, чем хаос вкладок и модалок.[web:34]
- Важные CTA и блоки повторяй внизу страниц, чтобы не заставлять возвращаться наверх.

### 7.2. Жесты «по желанию»

- Свайп‑жесты (например, удаление карточки) должны дублироваться кнопками/иконками.
- Никогда не завязывай критичный функционал только на «скрытый» жест.

**Чеклист «Скролл и жесты»**

- Пользователь может пройти основной сценарий только с помощью очевидных кнопок.
- Жесты — дополнение, а не единственный способ действия.

---

## 8. Производительность на мобильном

Медленный интерфейс на телефоне = высокий bounce rate и плохой UX. Mobile‑first подразумевает внимательное отношение к весу и скорости.[web:37][web:40][web:43]

### 8.1. Вес страницы и ресурсов

- Оптимизируй изображения (responsive images, webp/avif, lazy‑loading).[web:43]
- Минимизируй количество тяжёлых библиотек и блокирующих скриптов.

### 8.2. Сетевые условия

- Учитывай, что мобильный интернет может быть медленным/нестабильным.
- Обработай состояния загрузки, пустых данных и ошибок — скелетоны, спиннеры, понятные сообщения.[web:40][web:43]

**Чеклист «Производительность»**

- Вес ключевых страниц разумен, нет гигантских нежатых изображений.
- Основной контент появляется быстро; пользователь видит, что что‑то происходит.

---

## 9. Адаптация layout’а: от телефона к планшету

Планшет — не просто «большой телефон»; там уже можно использовать более сложные раскладки и master‑detail паттерны.[web:39][web:42]

### 9.1. Одно‑ и двухпанельные раскладки

- На телефоне: чаще всего 1 уровень иерархии на экране (список **или** детали).[web:39][web:42]
- На планшете: можно показывать **и список, и детали** одновременно (master‑detail), если хватает ширины.[web:39][web:42]

### 9.2. Перераспределение блоков

- Карточки, которые были в одну колонку на телефоне, превращаются в сетку 2–3 колонки на планшете.[web:45]
- Боковые панели (фильтры, навигация) могут появляться на планшете как постоянные, а на телефоне — быть скрыты.[web:42][web:45]

**Чеклист «Планшет»**

- На планшете используется дополнительное пространство (колонки, master‑detail), но без перегруза.
- Ключевые паттерны навигации и CTA остаются узнаваемыми по сравнению с телефоном.

---

## 10. Тестирование на устройствах

Ни один гайд не заменяет реального теста на железе или хотя бы эмуляторе.[web:34][web:40]

### 10.1. Проверка на разных типах устройств

- Маленький телефон, большой телефон, планшет (портрет/ландшафт).
- Разные DPI и системы (iOS/Android/мобильный браузер).

### 10.2. Что проверять

- Читаемость текста без зума.
- Удобство нажатия на элементы (не промахиваешься ли).
- Понятность навигации и сценариев.

**Чеклист «Тестирование»**

- Интерфейс проверен минимум на одном реальном телефоне и планшете.
- Основные сценарии проходят без боли одной рукой.

---

## 11. Чёрный список ошибок адаптива (для агентов)

Этот блок можно использовать как «запрещённые приёмы» в системном промпте.

**НЕЛЬЗЯ:**

- Проектировать только под десктоп и «сжимать» макет до мобильного.[web:34][web:37]
- Делать кликабельные элементы меньше 44×44 px и располагать их вплотную друг к другу.[web:35][web:41][web:44]
- Использовать шрифт меньше 14 px для основного текста.
- Прятать критичные действия в глубину меню/жестов.
- Делать несколько основных CTA на одном маленьком экране.
- Нагружать мобильный лишними анимациями и тяжёлыми библиотеками.[web:37][web:43]
- Показывать на телефоне и список, и подробные детали одновременно в тесной двухколоночной раскладке.[web:39][web:42]

---

## 12. Как встроить эту методичку в ИИ‑агента

Чтобы агент генерировал адаптивные интерфейсы нормально, ему нужны простые и жёсткие правила.

### 12.1. Базовый системный промпт

> Всегда проектируй интерфейс по принципу mobile‑first: сначала для телефона в портретной ориентации, затем адаптируй для планшета и десктопа. На мобильном экране допускается только один главный сценарий и 1–2 ключевых действия. Все интерактивные элементы должны иметь минимальный тач‑таргет 44×44 px, удобное расположение и понятные подписи. Избегай решений, перечисленных в чёрном списке ошибок адаптива.

### 12.2. Алгоритм работы агента

1. Определить основной сценарий для мобильного.
2. Спроектировать мобильный layout (одноколоночный, крупные тач‑таргеты, крупный текст).
3. Адаптировать layout для планшета: добавить колонки, master‑detail там, где уместно.
4. Прогнать результат по чеклистам из разделов 1–10.
5. Убрать нарушения из чёрного списка.

---

## Заключение

Эта методичка собирает практические принципы mobile‑first, брейкпоинтов, сеток, тач‑таргетов и UX‑паттернов, которые используют современные гайдлайны (Material, HIG, WCAG и индустриальные практики).[web:35][web:39][web:41][web:42][web:44]  
Встроив её в системные промпты агентов, можно получать адаптивные макеты и вёрстку, которые сразу дружат с телефонами и планшетами, не превращая мобильный опыт в урезанную копию десктопа.[web:34][web:37][web:40][web:43][web:46]
