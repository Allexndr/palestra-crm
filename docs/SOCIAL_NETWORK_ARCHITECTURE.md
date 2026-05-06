# 🧵 Palestra Social Network (Threads-like)

## Архитектура межклубной социальной сети

---

## 📋 Содержание

1. [Общая концепция](#общая-концепция)
2. [Структура БД](#структура-бд)
3. [Функциональные модули](#функциональные-модули)
4. [UI/UX экраны](#uiux-экраны)
5. [Алгоритмы](#алгоритмы)
6. [API endpoints](#api-endpoints)
7. [План реализации](#план-реализации)

---

## 🎯 Общая концепция

### Видение
Создать полноценную социальную сеть внутри Palestra, объединяющую все клубы в единое сообщество. Каждый клуб — это микро-сообщество, а общая лента — пространство для межклубного взаимодействия.

### Ключевые принципы (как Threads)

| Принцип | Реализация |
|---------|------------|
| **Простота** | Минималистичный интерфейс, фокус на контент |
| **Ветки (Threads)** | Посты объединяются в тематические ветки |
| **Вложенность** | Комментарии с бесконечной вложенностью |
| **Открытость** | Публичные посты видны всем, приватные — только клубу |
| **Вовлеченность** | Лайки, репосты, цитирование, подписки |
| **Алгоритмичность** | Smart feed с ранжированием по интересам |

### Типы контента

1. **Посты клубов** — официальные объявления, мероприятия
2. **Посты участников** — личные достижения, тренировки
3. **Ветки (Topics)** — тематические дискуссии
4. **Соревнования** — автоматические посты о результатах
5. **Медиа** — фото/видео тренировок, техники

---

## 🗄️ Структура БД

### Таблицы

#### 1. `posts` — Основные посты
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) NOT NULL,
  club_id UUID REFERENCES clubs(id), -- NULL = межклубный пост
  
  -- Контент
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text', -- text, media, mixed, poll
  media_urls JSONB DEFAULT '[]', -- [{url, type, thumbnail, duration}]
  
  -- Ветки (Threads-like)
  thread_id UUID REFERENCES posts(id), -- NULL = корень ветки
  parent_id UUID REFERENCES posts(id), -- NULL = корневой пост
  reply_to_id UUID REFERENCES posts(id), -- Ответ конкретному пользователю
  
  -- Метаданные
  is_thread_root BOOLEAN DEFAULT false,
  thread_depth INTEGER DEFAULT 0, -- 0 = корень, 1+ = глубина вложенности
  
  -- Видимость
  visibility VARCHAR(20) DEFAULT 'public', -- public, club_only, followers, private
  
  -- Статистика
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Алгоритмы
  score FLOAT DEFAULT 0, -- Расчетный score для ленты
  trending_score FLOAT DEFAULT 0,
  
  -- Модерация
  status VARCHAR(20) DEFAULT 'active', -- active, deleted, archived, reported
  reported_count INTEGER DEFAULT 0,
  
  -- SEO/Discovery
  slug VARCHAR(255),
  excerpt TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Индексы
CREATE INDEX idx_posts_author ON posts(author_id, created_at DESC);
CREATE INDEX idx_posts_club ON posts(club_id, created_at DESC);
CREATE INDEX idx_posts_thread ON posts(thread_id, thread_depth, created_at);
CREATE INDEX idx_posts_parent ON posts(parent_id, created_at);
CREATE INDEX idx_posts_visibility ON posts(visibility, created_at DESC);
CREATE INDEX idx_posts_score ON posts(score DESC, created_at DESC);
```

#### 2. `topics` — Тематические ветки
```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Инфо
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Визуал
  icon VARCHAR(50),
  color VARCHAR(7) DEFAULT '#3146A6',
  cover_image_url TEXT,
  
  -- Тип
  type VARCHAR(20) DEFAULT 'general', -- general, club, event, competition, challenge
  club_id UUID REFERENCES clubs(id), -- NULL = общая тема
  
  -- Статистика
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  
  -- Модерация
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Связь постов с темами
CREATE TABLE post_topics (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Основная тема поста
  PRIMARY KEY (post_id, topic_id)
);
```

#### 3. `post_interactions` — Лайки, репосты, сохранения
```sql
CREATE TABLE post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  type VARCHAR(20) NOT NULL, -- like, repost, quote, save, report
  
  -- Для репоста с цитированием
  quote_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(post_id, user_id, type)
);

CREATE INDEX idx_interactions_post ON post_interactions(post_id, type);
CREATE INDEX idx_interactions_user ON post_interactions(user_id, created_at DESC);
```

#### 4. `followers` — Подписки
```sql
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Тип подписки
  type VARCHAR(20) DEFAULT 'all', -- all, posts_only, stories_only
  
  -- Уведомления
  notify_new_posts BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_followers_follower ON followers(follower_id, created_at DESC);
CREATE INDEX idx_followers_following ON followers(following_id, created_at DESC);
```

#### 5. `hashtags` — Хештеги
```sql
CREATE TABLE hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag VARCHAR(100) UNIQUE NOT NULL,
  posts_count INTEGER DEFAULT 0,
  trending_score FLOAT DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE post_hashtags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
  position INTEGER, -- Позиция в тексте
  PRIMARY KEY (post_id, hashtag_id)
);
```

#### 6. `notifications` — Уведомления
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Тип и источник
  type VARCHAR(30) NOT NULL, -- like, comment, follow, mention, repost, thread_reply
  actor_id UUID REFERENCES profiles(id),
  post_id UUID REFERENCES posts(id),
  comment_id UUID REFERENCES posts(id),
  
  -- Содержимое
  message TEXT,
  preview TEXT, -- Превью поста/комментария
  
  -- Статус
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);
```

#### 7. `user_feed_preferences` — Настройки ленты
```sql
CREATE TABLE user_feed_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Алгоритм
  algorithm VARCHAR(20) DEFAULT 'hybrid', -- chronological, algorithmic, hybrid
  
  -- Фильтры
  show_club_only BOOLEAN DEFAULT true,
  show_following_only BOOLEAN DEFAULT false,
  show_trending BOOLEAN DEFAULT true,
  hide_reposts BOOLEAN DEFAULT false,
  
  -- Интересы (для рекомендаций)
  interested_topics UUID[] DEFAULT '{}',
  blocked_topics UUID[] DEFAULT '{}',
  blocked_users UUID[] DEFAULT '{}',
  
  -- Временные рамки
  default_time_range VARCHAR(20) DEFAULT '7d', -- 24h, 7d, 30d, all
  
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 8. `post_views` — История просмотров (для алгоритма)
```sql
CREATE TABLE post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  duration_seconds INTEGER, -- Время просмотра
  
  UNIQUE(post_id, user_id, viewed_at)
);
```

---

## 🧩 Функциональные модули

### 1. Создание поста

**Компоненты:**
- `CreatePostModal` — Модал создания поста
- `PostComposer` — Текстовый редактор
- `MediaUploader` — Загрузка медиа
- `TopicSelector` — Выбор тем/веток
- `VisibilityToggle` — Настройка видимости

**Фичи:**
- Текст до 500 символов (как Threads)
- До 10 изображений/видео
- Выбор темы/ветки
- Хештеги с автокомплитом
- Упоминания (@username)
- Предпросмотр ссылки
- Черновики автосохранение
- Visibility: public / club_only / followers

### 2. Лента (Feed)

**Типы лент:**
1. **For You** — Алгоритмическая (смешанная)
2. **Following** — Только подписки (хронологическая)
3. **Club** — Только посты клуба
4. **Trending** — Трендовые ветки
5. **Topics** — По темам/хештегам

**Компоненты:**
- `FeedContainer` — Контейнер ленты
- `FeedTabs` — Переключатель типов
- `PostCard` — Карточка поста
- `ThreadCard` — Карточка ветки
- `InfiniteScroll` — Бесконечная прокрутка
- `PullToRefresh` — Обновление свайпом

### 3. Ветка (Thread Detail)

**Компоненты:**
- `ThreadView` — Просмотр ветки
- `PostTree` — Древовидная структура
- `ReplyComposer` — Ответ на пост
- `BreadcrumbThread` — Навигация по ветке

**Фичи:**
- Линейное отображение с отступами
- Свертка/развертка веток
- Jump to parent
- Показать все ответы / Только популярные

### 4. Взаимодействия

**Действия:**
- ❤️ Like (двойной тап)
- 💬 Comment (reply)
- 🔄 Repost (с/без цитаты)
- 🔖 Save
- ↗️ Share
- 🏷️ Add to thread
- 🔔 Follow thread

### 5. Поиск и Discovery

**Компоненты:**
- `SearchBar` — Поиск с автокомплитом
- `TrendingTopics` — Трендовые темы
- `SuggestedUsers` — Рекомендуемые пользователи
- `HashtagCloud` — Облако хештегов

**Поиск по:**
- Постам
- Пользователям
- Клубам
- Темам/веткам
- Хештегам

### 6. Профиль соцсети

**Вкладки:**
- **Posts** — Все посты
- **Threads** — Ветки, где участвовал
- **Media** — Только фото/видео
- **Likes** — Лайкнутые посты (приватно)
- **Saves** — Сохраненное

**Статистика:**
- Количество постов
- Подписчики / Подписки
- Средний reach
- Топовые посты

### 7. Уведомления

**Типы:**
- Новый лайк
- Новый комментарий/ответ
- Новый подписчик
- Репост вашего поста
- Упоминание (@)
- Ответ в ветке
- Пост от подписки
- Трендовый пост в теме

---

## 🎨 UI/UX экраны

### Экраны (на основе Threads)

```
/social
├── /feed              → Главная лента (For You / Following)
├── /thread/:id        → Просмотр ветки
├── /post/:id          → Просмотр поста (с комментариями)
├── /create            → Создание поста (модал или отдельная страница)
├── /search            → Поиск и Discovery
├── /notifications     → Уведомления
├── /profile/:id       → Профиль пользователя
├── /topics            → Все темы/ветки
├── /topic/:slug       → Посты по теме
├── /hashtag/:tag      → Посты по хештегу
└── /saved             → Сохраненные посты
```

### Компоненты интерфейса

#### 1. PostCard
```
┌─────────────────────────────────┐
│ [Avatar] Name @handle • 2h      │
│ [Club badge]                    │
├─────────────────────────────────┤
│ Text content of the post...     │
│ #hashtag @mention               │
├─────────────────────────────────┤
│ [Image Grid or Video]           │
├─────────────────────────────────┤
│ ❤️ 42  💬 12  🔄 5  🔖  ↗️      │
│ [View 3 more replies]           │
└─────────────────────────────────┘
```

#### 2. ThreadCard
```
┌─────────────────────────────────┐
│ 🧵 Thread: "Summer Training"    │
│ Started by @user • 45 posts     │
├─────────────────────────────────┤
│ Preview of root post...         │
│ [Last 3 avatars of participants]│
├─────────────────────────────────┤
│ [View thread] →                 │
└─────────────────────────────────┘
```

#### 3. Create Post Modal
```
┌─────────────────────────────────┐
│ Отмена        Новая ветка       │
├─────────────────────────────────┤
│ [Avatar] Что нового?            │
│                                 │
│                                 │
│ [Media previews row]            │
├─────────────────────────────────┤
│ 🖼️ 📹 😊 📎 🏷️ ⏱️               │
├─────────────────────────────────┤
│ Видимость: [Public ▼] [Post]    │
└─────────────────────────────────┘
```

#### 4. Thread View (Tree)
```
┌─────────────────────────────────┐
│ ← Back                          │
├─────────────────────────────────┤
│ Root Post                       │
│ └─ Reply 1                      │
│    └─ Reply 1.1                 │
│    └─ Reply 1.2                 │
│ └─ Reply 2                      │
│    └─ Reply 2.1                 │
│       └─ Reply 2.1.1            │
├─────────────────────────────────┤
│ [Reply input]                   │
└─────────────────────────────────┘
```

---

## 🧮 Алгоритмы

### 1. Ранжирование ленты (Feed Score)

```javascript
function calculatePostScore(post, user) {
  const timeDecay = Math.exp(-0.5 * hoursSince(post.created_at));
  
  const engagement = (
    post.likes_count * 1 +
    post.comments_count * 2 +
    post.reposts_count * 3 +
    post.views_count * 0.1
  );
  
  const authorScore = isFollowing(user, post.author) ? 10 : 1;
  const clubScore = isSameClub(user, post.club_id) ? 5 : 1;
  const topicMatch = hasInterestedTopic(user, post.topics) ? 3 : 1;
  
  const trendingBonus = post.is_trending ? 2 : 1;
  
  return (engagement * timeDecay * authorScore * clubScore * topicMatch * trendingBonus);
}
```

### 2. Trending Topics

```javascript
function calculateTopicTrending(topic) {
  const recentPosts = countPostsInLast(topic, '24h');
  const engagementRate = calculateEngagementRate(topic.posts);
  const uniqueAuthors = countUniqueAuthors(topic.posts, '24h');
  
  return (recentPosts * 2 + engagementRate * 10 + uniqueAuthors * 5);
}
```

### 3. Рекомендации "Who to Follow"

- Общие подписчики
- Тот же клуб
- Похожие интересы (топики)
- Взаимодействия (лайки, комменты)

---

## 🔌 API Endpoints

### Posts
```
GET    /api/posts              → Лента (с фильтрами)
GET    /api/posts/:id          → Пост детально
POST   /api/posts              → Создать пост
PUT    /api/posts/:id          → Редактировать
DELETE /api/posts/:id          → Удалить

GET    /api/posts/:id/thread   → Получить ветку
GET    /api/posts/:id/replies  → Получить ответы
POST   /api/posts/:id/reply    → Ответить на пост
```

### Interactions
```
POST   /api/posts/:id/like     → Лайк
DELETE /api/posts/:id/like     → Убрать лайк
POST   /api/posts/:id/repost   → Репост
POST   /api/posts/:id/save     → Сохранить
DELETE /api/posts/:id/save     → Убрать из сохраненных
```

### Topics
```
GET    /api/topics             → Все темы
GET    /api/topics/trending    → Трендовые
GET    /api/topics/:slug       → Посты темы
POST   /api/topics/:id/follow  → Подписаться на тему
```

### Users
```
GET    /api/users/:id/posts    → Посты пользователя
GET    /api/users/:id/threads  → Ветки пользователя
GET    /api/users/:id/media    → Медиа пользователя
POST   /api/users/:id/follow   → Подписаться
DELETE /api/users/:id/follow   → Отписаться
GET    /api/users/suggested    → Рекомендуемые
```

### Feed
```
GET    /api/feed/for-you       → Алгоритмическая лента
GET    /api/feed/following     → Подписки
GET    /api/feed/club/:id      → Лента клуба
GET    /api/feed/trending      → Тренды
```

### Search
```
GET    /api/search?q=...&type=posts|users|topics
GET    /api/hashtags/:tag      → Посты по хештегу
GET    /api/hashtags/trending  → Трендовые хештеги
```

### Notifications
```
GET    /api/notifications      → Уведомления
PUT    /api/notifications/read → Отметить прочитанными
GET    /api/notifications/count → Счетчик непрочитанных
```

---

## 📅 План реализации

### Этап 1: Core (1-2 недели)
- [ ] Структура БД (таблицы posts, topics)
- [ ] Создание поста (текст + медиа)
- [ ] Базовая лента (хронологическая)
- [ ] PostCard компонент
- [ ] Thread view (простой)

### Этап 2: Interactions (1 неделя)
- [ ] Лайки / Анлайки
- [ ] Комментарии (1 уровень)
- [ ] Repost
- [ ] Сохранение
- [ ] Подписки на пользователей

### Этап 3: Advanced (1 неделя)
- [ ] Вложенные комментарии (дерево)
- [ ] Хештеги
- [ ] Темы/ветки (Topics)
- [ ] Алгоритмическая лента
- [ ] Тренды

### Этап 4: Discovery (1 неделя)
- [ ] Поиск
- [ ] Рекомендации
- [ ] Профиль соцсети
- [ ] Уведомления

### Этап 5: Polish (1 неделя)
- [ ] Оптимизация производительности
- [ ] Кэширование
- [ ] Инфинити скролл
- [ ] Pull-to-refresh
- [ ] Анимации

---

## 🎨 Дизайн-система

### Цвета (Dark/Light mode как Threads)
```css
/* Light */
--bg-primary: #ffffff;
--bg-secondary: #f5f5f5;
--text-primary: #000000;
--text-secondary: #717374;
--border: #e5e5e5;
--accent: #3146A6;

/* Dark */
--bg-primary: #101010;
--bg-secondary: #1a1a1a;
--text-primary: #ffffff;
--text-secondary: #a1a1a1;
--border: #2a2a2a;
--accent: #4f5dd1;
```

### Типографика
- **Заголовки**: SF Pro Display / Inter, 600
- **Текст**: SF Pro Text / Inter, 400
- **Размеры**: 12px (small), 14px (body), 16px (post), 20px (heading)

### Отступы
- Компактный дизайн как Threads
- 12px, 16px базовые отступы
- 8px между элементами карточки

---

## 🔐 Права доступа

| Роль | Публичные | Клубные | Создание |
|------|-----------|---------|----------|
| **Гость** | Просмотр | ❌ | ❌ |
| **Участник** | Все | Свой клуб | ✅ |
| **Тренер** | Все | Свой клуб | ✅ (от имени клуба) |
| **Админ** | Все | Все клубы | ✅ (от имени любого клуба) |

---

## 📱 Mobile-First

- Bottom navigation (5 tabs)
- Swipe gestures
- Pull-to-refresh
- Image lightbox
- Video player

---

## 🚀 Готово к реализации!

Следующий шаг: создание структуры БД и API endpoints.
