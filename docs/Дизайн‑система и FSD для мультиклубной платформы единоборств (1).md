# Дизайн‑система и FSD для мультиклубной платформы единоборств

Этот документ дополняет расширенное ТЗ и фокусируется на:

- глубоко проработанной дизайн‑системе (цветовые токены, типоскейл, примерные UI‑паттерны по breakpoint‑ам);
- функциональной спецификации (FSD) ключевых флоу с JSON‑подобными описаниями экранов, полей, стейтов и событий;
- структурировании всего этого под стек Next.js/React/Tailwind + Postgres (multi‑tenant SaaS) с набором сущностей и модулей.[^1][^2]

## 1. Дизайн‑система

(Секция без изменений: цветовые токены, типографика, spacing, breakpoints, базовые компоненты.)

## 2. FSD: ключевые флоу и экраны

(Секция с уже описанными флоу регистрации клуба, доп‑локации, лиги, ученика, родителя, тарифов, ленты и профиля — без изменений.)

## 3. Дополнительные флоу: ученики, родители, тарифы, лента, профиль

(Секция с детализированными флоу для учеников/родителей, тарифов, ленты и профиля — без изменений.)

## 4. Архитектура и стек

### 4.1. Технологический стек (рекомендуемый)

С учётом требований multi‑tenant SaaS, быстрой разработки и SEO‑чувствительного лендинга подходящей комбинацией будет:[^2][^3][^1]

- Frontend: **Next.js (App Router)** + React.
- UI: **Tailwind CSS** + собственная дизайн‑система (токены, компоненты).
- Backend/API: Next.js API routes или отдельный Node.js/Express сервис в зависимости от масштаба.
- База данных: **PostgreSQL** (shared DB + `tenant_id` модель).
- ORM: Prisma/Drizzle (для типобезопасности и миграций).[^3][^4]
- Аутентификация: готовый provider (например, Auth0/Kinde/Supabase Auth) или кастомная JWT‑схема.
- Платежи: Stripe/CloudPayments/Paybox в зависимости от локального рынка.[^5][^6]
- Storage/CDN: S3‑совместимое хранилище или Cloudflare R2 (для аватаров, обложек, медиа постов).

Multi‑tenant архитектура с одним общим Postgres и tenant‑scoped данными (через `tenant_id`) — стандартный подход для SaaS с множеством организаций и локаций (GymTrack, другие gym SaaS‑кейсы), дающий баланс простоты, цены и масштабируемости.[^7][^8][^2]

### 4.2. Модель мультиклубного multi‑tenant

- "Tenant" в системе = **клуб/организация** (не отдельная локация).
- Локации (адреса) клуба — сущность `Location`, привязанная к `Club`.
- Все ключевые бизнес‑объекты (ученики, тренировки, абонементы, лига) связаны с `club_id` (tenant‑id) и, где нужно, доп. полем `location_id`.[^1][^2]

## 5. Сущности и схема данных (high‑level)

Ниже — логическая модель сущностей (ER‑уровень). На практике это мапится в таблицы Postgres с `id` (UUID/ULID), `created_at`, `updated_at` и стандартными индексами.

### 5.1. Core‑сущности

1. **User**
   - `id`
   - `email`, `phone`, `password_hash`
   - `first_name`, `last_name`
   - `locale`, `theme` (light/dark/system)
   - глобальная учётка, которая может состоять в нескольких клубах и иметь несколько ролей.

2. **Club (Tenant)**
   - `id`
   - `name`, `slug`
   - `city`, `country`
   - `primary_location_id`
   - `website`, `instagram`
   - `owner_user_id`
   - `settings` (JSONB: дисциплины, age‑группы по умолчанию, branding и т.д.).

3. **Location**
   - `id`
   - `club_id`
   - `name`
   - `address`
   - `phone`
   - `is_active`

4. **ClubRole / ClubMembership**

Таблица связей User ↔ Club с ролями:[^8][^7]

- `id`
- `user_id`
- `club_id`
- `role` ∈ {`OWNER`, `ADMIN`, `COACH`, `STAFF`}
- `location_id` (опционально, если админ/тренер привязан к конкретной локации).

5. **StudentProfile (Ученик в клубе)**

Отделяем глобального User от роли ученика в конкретном клубе:

- `id`
- `user_id` (опционально, если у ученика есть собственный логин; может быть null для детей без личного аккаунта).
- `club_id`
- `primary_location_id`
- `first_name`, `last_name`
- `birth_date`
- `discipline` (основная)
- `level` / `belt` / `rank`
- `status` ∈ {`ACTIVE`, `ON_HOLD`, `LEFT`}

6. **ParentLink**

Связь родителя и студента:

- `id`
- `parent_user_id`
- `student_profile_id`
- `relation` (мама/папа/опекун). 

7. **MembershipPlan (планы клуба)**

- `id`
- `club_id`
- `name`
- `description`
- `price`
- `billing_period` ∈ {`MONTH`, `WEEK`, `YEAR`}
- `visit_limit` (nullable, если безлимит)
- `is_family_plan`

8. **MembershipSubscription**

- `id`
- `student_profile_id`
- `membership_plan_id`
- `status` ∈ {`ACTIVE`, `CANCELLED`, `EXPIRED`}
- `start_date`, `end_date`
- `auto_renew` (bool)

9. **ClubBillingSubscription (подписка клуба на платформу)**

- `id`
- `club_id`
- `plan` (например, базовый)
- `base_price`
- `extra_locations_count`
- `extra_members_tier`
- `addons` (JSONB: advanced_analytics, tournaments, white_label)
- `billing_provider_customer_id`

10. **TrainingGroup / ClassTemplate**

- `id`
- `club_id`
- `location_id`
- `name`
- `discipline`
- `level`
- `age_group`
- `coach_id` (User/ClubRole)

11. **ClassSchedule (занятия)**

- `id`
- `group_id`
- `start_datetime`
- `end_datetime`
- `capacity`
- `is_recurring`
- `recurrence_rule` (RRULE, JSONB)

12. **Attendance**

- `id`
- `class_schedule_id`
- `student_profile_id`
- `status` ∈ {`PRESENT`, `ABSENT`, `LATE`}
- `checked_in_by` (coach/admin).

13. **RankProgression / BeltHistory**

- `id`
- `student_profile_id`
- `discipline`
- `from_rank`
- `to_rank`
- `graded_by` (coach)
- `graded_at`
- `notes`

### 5.2. Соцсеть и геймификация

14. **Post**

- `id`
- `club_id` (для клубной/локальной привязки)
- `author_user_id`
- `visibility` ∈ {`CLUB`, `CITY`, `PUBLIC`}
- `text`
- `media_urls` (ARRAY или JSONB)
- `created_at`

15. **PostReaction**

- `id`
- `post_id`
- `user_id`
- `type` ∈ {`LIKE`, `EMOJI_*`}

16. **Comment**

- `id`
- `post_id`
- `author_user_id`
- `parent_comment_id` (для тредов)
- `text`
- `created_at`

17. **Achievement (справочник ачивок)**

- `id`
- `code` (например, `STREAK_10`)
- `name`
- `description`
- `icon`

18. **UserAchievement**

- `id`
- `user_id` или `student_profile_id`
- `achievement_id`
- `awarded_at`
- `meta` (JSONB: за что выдано).

19. **LeagueSeason**

- `id`
- `club_id` (для локальной лиги) или `city_id`/`global` (для межклубной)
- `discipline`
- `age_group`
- `name`
- `start_date`, `end_date`
- `rules` (JSONB)

20. **LeagueStanding**

- `id`
- `season_id`
- `student_profile_id` (или `club_id` для межклубной)
- `points`
- `wins`, `losses`, `draws`

21. **LeagueMatch/Result**

- `id`
- `season_id`
- `participant_a_id`, `participant_b_id`
- `score_a`, `score_b`
- `result` (A_WIN/B_WIN/DRAW)
- `recorded_by`

## 6. Модули и структура проекта (Next.js/React/Tailwind)

### 6.1. Структура Next.js App Router (пример)

```text
/app
  /(public)
    page.tsx                 # лендинг
    pricing/page.tsx
    clubs/page.tsx           # каталог клубов
    club/[slug]/page.tsx     # карточка клуба
  /(auth)
    auth/login/page.tsx
    auth/signup-club/page.tsx
    invite/student/[token]/page.tsx
  /(club-admin)
    dashboard/page.tsx
    members/page.tsx
    members/[id]/page.tsx
    schedule/page.tsx
    league/page.tsx
    settings/locations/page.tsx
    settings/branding/page.tsx
  /(member)
    feed/page.tsx
    schedule/my/page.tsx
    progress/page.tsx
    league/my/page.tsx
    me/page.tsx
    me/settings/appearance/page.tsx
    me/settings/notifications/page.tsx
```

Shard‑логика multi‑tenancy реализуется либо через middleware, либо через layout, который резолвит текущий `club` по домену/поддомену или по выбранному клубу в контексте пользователя.[^9][^2][^1]

### 6.2. Разбиение на модули (domains)

Внутри `src/` имеет смысл разложить домены:

```text
/src
  /ui           # дизайн-система: Button, Input, Card, Modal, Tabs, Avatar и т.д.
  /modules
    /auth
    /clubs
    /locations
    /members
    /billing
    /league
    /social
    /profile
  /lib
    /db        # ORM модели, коннект к Postgres
    /auth      # middleware и хелперы
    /tenancy   # функции определения текущего tenant (club)
```

Каждый модуль содержит:

- компоненты (React) для UI;
- hooks для работы с данными (например, `useMembers`, `useLeagueSeason`);
- server actions / API handlers для CRUD.[^4][^3]

### 6.3. UI‑компоненты (слой дизайн‑системы)

Примеры базовых компонентов в `/ui`:

- `Button`, `IconButton`.
- `Input`, `Select`, `Textarea`, `Checkbox`, `Switch`.
- `Card`, `Badge`, `Tag`, `Avatar`, `AvatarGroup`.
- `Tabs`, `Sidebar`, `BottomNav`, `AppBar`.
- `Modal`, `Drawer`, `Toast`, `EmptyState`.

Дальше — надстройки:

- `ClubCard`, `MemberCard`, `PlanCard`, `PostCard`, `LeagueTable`.

### 6.4. Data‑access слой и tenant‑id

Согласно рекомендациям гайдов по multi‑tenant SaaS для Next.js, все запросы к БД должны идти через слой, который автоматически подставляет `club_id`/`tenant_id` и проверяет права роли.[^10][^2][^1]

- Функции вида `getMembersForClub(clubId, filters)`.
- Использование middleware/handler‑обёрток, чтобы ни один прямой запрос не делался без tenant‑фильтра.

## 7. Как этим пользоваться в разработке

- Продакт/аналитик — опирается на FSD для согласования логики с бизнесом и клубами.
- Дизайнер — отталкивается от дизайн‑системы и FSD‑описаний экранов, собирая макеты в Figma.
- Разработчик — мапит FSD на структуры страниц `/app`, модули `/modules`, компоненты `/ui` и ORM‑модели.

Подход с shared‑DB multi‑tenancy, модульной архитектурой и UI‑китом хорошо масштабируется для gym/martial arts SaaS и уже применяется в аналогичных кейсах (GymTrack, case‑studies gym SaaS, multi‑location martial arts‑платформы).[^11][^7][^8]

---

## References

1. [How to Implement Multi-Tenancy in Next.js: A Step-by-Step Guide](https://www.achromatic.dev/blog/multi-tenancy-implementation-guide) - A practical guide to implementing multi-tenant architecture in Next.js. Learn database strategies, m...

2. [Next.js Multi-Tenant SaaS Guide (2026) |](https://nextjslaunchpad.com/article/nextjs-multi-tenant-saas-subdomain-routing-custom-domains-app-router) - Set up multi-tenant SaaS in Next.js with subdomain routing, custom domains, and tenant-scoped data. ...

3. [Create a Scalable Multi Tenant Saas with Next.js & Supabase](https://www.ideadope.com/roadmaps/how-to-build-multi-tenant-saas-2025-pro) - Complete 2025 roadmap and architecture guide for building a Multi Tenant Saas. Covers tech stack, da...

4. [The Ultimate Roadmap to Multi Tenant Saas with Next.js & Supabase](https://www.ideadope.com/roadmaps/how-to-build-multi-tenant-saas-2025-advanced) - Complete 2025 roadmap and architecture guide for building a Multi Tenant Saas. Covers tech stack, da...

5. [Gym & Fitness Management SaaS Platform | Laravel Case Study](https://needlaravelsite.com/case-study-detail/gym-fitness-management-saas-platform-built-from-scratch) - The architecture was designed to be multi-tenant, allowing each gym to operate independently with is...

6. [Case Study: Gym SaaS Scaling | Laravel Multi-Tenant Architecture](https://www.noumanyasin.com/case-studies/gym-saas-scaling) - How I rebuilt a fragile gym MVP into a production-ready multi-tenant SaaS platform handling 10,000 m...

7. [GymTrack 2.0 | Management System for Multiple Gyms (SAAS)](https://codecanyon.net/item/gymtrack-management-system-for-multiple-gyms-saas/46479592) - GymTrack is a Multi-Tenant architecture web application focused on SAAS, which allows users to manag...

8. [Gym Management Software | Case Study - Divtechnosoft](https://www.divtechnosoft.com/our-work/multi-tenant-gym-management-saas) - Multi-Tenant Architecture. Built secure multi-tenant system with row-level security (RLS) ensuring c...

9. [Scalable Multi-Tenant SaaS Architecture (with Nextjs)](https://www.youtube.com/watch?v=xGxx4yIaPi0) - Multi-tenant SaaS architecture is a widely discussed concept, yet many developers don’t fully unders...

10. [I'm building a gym management SaaS and could really use ... - Reddit](https://www.reddit.com/r/SaaS/comments/1rge4us/im_building_a_gym_management_saas_and_could/) - Multi-tenant architecture for B2B SaaS is actually simpler than people think if you get the fundamen...

11. [Martial Arts Management Software - WellnessLiving](https://www.wellnessliving.com/martial-art/software/) - For multi-location martial arts studios, the Enterprise Cloud simplifies data tracking and operation...

