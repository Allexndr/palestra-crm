-- =============================================================================
-- SOCIAL NETWORK MIGRATION (Threads-like)
-- =============================================================================
-- Создает полную структуру БД для межклубной социальной сети в Palestra
-- =============================================================================

-- =============================================================================
-- 1. TOPICS (Тематические ветки)
-- =============================================================================

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Визуальное оформление
  icon VARCHAR(50) DEFAULT 'Hash',
  color VARCHAR(7) DEFAULT '#3146A6',
  cover_image_url TEXT,
  
  -- Тип темы
  type VARCHAR(20) DEFAULT 'general', -- general, club, event, competition, challenge
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL, -- NULL = общая тема
  
  -- Статистика
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  
  -- Модерация и видимость
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active', -- active, archived, hidden
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Индексы для topics
CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
CREATE INDEX IF NOT EXISTS idx_topics_type ON topics(type, status);
CREATE INDEX IF NOT EXISTS idx_topics_featured ON topics(is_featured, posts_count DESC);
CREATE INDEX IF NOT EXISTS idx_topics_trending ON topics(is_trending DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_club ON topics(club_id, status) WHERE club_id IS NOT NULL;

-- Триггер для updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS topics_updated_at ON topics;
CREATE TRIGGER topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. POSTS (Посты и комментарии)
-- =============================================================================

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  
  -- Контент
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text', -- text, media, mixed, poll, event
  media_urls JSONB DEFAULT '[]'::jsonb, -- [{url, type, thumbnail, duration, width, height}]
  
  -- Иерархия веток (Thread-like structure)
  thread_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- Корень ветки
  parent_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- Прямой родитель
  reply_to_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- Ответ конкретному пользователю
  
  -- Глубина и структура
  is_thread_root BOOLEAN DEFAULT false,
  thread_depth INTEGER DEFAULT 0, -- 0 = корень, 1+ = глубина вложенности
  
  -- Видимость
  visibility VARCHAR(20) DEFAULT 'public', -- public, club_only, followers, private
  
  -- Статистика (дублируется для быстродействия)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  
  -- Алгоритмические метрики
  score FLOAT DEFAULT 0,
  trending_score FLOAT DEFAULT 0,
  hot_score FLOAT DEFAULT 0, -- Reddit-like hot score
  
  -- Модерация
  status VARCHAR(20) DEFAULT 'active', -- active, deleted, archived, reported, hidden
  reported_count INTEGER DEFAULT 0,
  moderated_by UUID REFERENCES profiles(id),
  moderated_at TIMESTAMPTZ,
  moderation_reason TEXT,
  
  -- SEO и Discovery
  slug VARCHAR(255) GENERATED ALWAYS AS (
    'post_' || SUBSTRING(id::text, 1, 8) || '_' || 
    REGEXP_REPLACE(LOWER(SUBSTRING(content, 1, 30)), '[^a-z0-9]+', '-', 'g')
  ) STORED,
  excerpt TEXT GENERATED ALWAYS AS (LEFT(content, 160)) STORED,
  
  -- Метаданные
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Индексы для posts
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id, created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_posts_club ON posts(club_id, created_at DESC) WHERE status = 'active' AND club_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_thread ON posts(thread_id, thread_depth, created_at) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_id, created_at) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility, created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_posts_score ON posts(score DESC, created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_posts_trending ON posts(trending_score DESC, created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_posts_hot ON posts(hot_score DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_posts_thread_root ON posts(is_thread_root, created_at DESC) WHERE is_thread_root = true AND status = 'active';

-- Частичный индекс для удаленных
CREATE INDEX IF NOT EXISTS idx_posts_deleted ON posts(deleted_at) WHERE deleted_at IS NOT NULL;

-- Триггер для updated_at
DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. POST_TOPICS (Связь постов с темами - many-to-many)
-- =============================================================================

CREATE TABLE IF NOT EXISTS post_topics (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Основная тема поста
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (post_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_post_topics_topic ON post_topics(topic_id, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_topics_primary ON post_topics(post_id, is_primary) WHERE is_primary = true;

-- =============================================================================
-- 4. HASHTAGS (Хештеги)
-- =============================================================================

CREATE TABLE IF NOT EXISTS hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag VARCHAR(100) UNIQUE NOT NULL,
  normalized_tag VARCHAR(100) GENERATED ALWAYS AS (LOWER(tag)) STORED,
  posts_count INTEGER DEFAULT 0,
  trending_score FLOAT DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hashtags_normalized ON hashtags(normalized_tag);
CREATE INDEX IF NOT EXISTS idx_hashtags_trending ON hashtags(trending_score DESC, posts_count DESC);

-- Связь постов с хештегами
CREATE TABLE IF NOT EXISTS post_hashtags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
  position INTEGER, -- Позиция в тексте для подсветки
  PRIMARY KEY (post_id, hashtag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_hashtags_tag ON post_hashtags(hashtag_id, post_id);

-- =============================================================================
-- 5. POST_INTERACTIONS (Лайки, репосты, сохранения)
-- =============================================================================

CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  type VARCHAR(20) NOT NULL, -- like, repost, quote, save, report
  
  -- Для репоста с цитированием
  quote_text TEXT,
  quote_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  
  -- Для жалоб
  report_reason VARCHAR(50),
  report_details TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(post_id, user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_interactions_post ON post_interactions(post_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON post_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON post_interactions(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_repost ON post_interactions(quote_post_id) WHERE quote_post_id IS NOT NULL;

-- Триггер для updated_at
DROP TRIGGER IF EXISTS interactions_updated_at ON post_interactions;
CREATE TRIGGER interactions_updated_at
  BEFORE UPDATE ON post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. FOLLOWERS (Подписки на пользователей)
-- =============================================================================

CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Тип подписки
  type VARCHAR(20) DEFAULT 'all', -- all, posts_only, stories_only
  
  -- Уведомления
  notify_new_posts BOOLEAN DEFAULT true,
  notify_stories BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id, created_at DESC);

-- =============================================================================
-- 7. TOPIC_FOLLOWERS (Подписки на темы)
-- =============================================================================

CREATE TABLE IF NOT EXISTS topic_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  notify_new_posts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_followers_user ON topic_followers(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topic_followers_topic ON topic_followers(topic_id, created_at DESC);

-- =============================================================================
-- 8. NOTIFICATIONS (Уведомления)
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- Получатель
  
  -- Тип уведомления
  type VARCHAR(30) NOT NULL, -- like, comment, follow, mention, repost, thread_reply, topic_post, club_mention
  
  -- Источник (кто вызвал)
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Связанные объекты
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  
  -- Содержимое
  message TEXT,
  preview TEXT, -- Превью поста/комментария
  
  -- Статус
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Для группировки (опционально)
  group_key VARCHAR(100), -- Для группировки "и 5 других"
  group_count INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_actor ON notifications(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at DESC);

-- =============================================================================
-- 9. USER_FEED_PREFERENCES (Настройки ленты)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_feed_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Алгоритм ленты
  algorithm VARCHAR(20) DEFAULT 'hybrid', -- chronological, algorithmic, hybrid
  
  -- Фильтры
  show_club_only BOOLEAN DEFAULT true,
  show_following_only BOOLEAN DEFAULT false,
  show_trending BOOLEAN DEFAULT true,
  hide_reposts BOOLEAN DEFAULT false,
  hide_replies BOOLEAN DEFAULT false, -- Скрывать ответы в ленте
  
  -- Интересы (для рекомендаций)
  interested_topics UUID[] DEFAULT '{}',
  interested_hashtags TEXT[] DEFAULT '{}',
  
  -- Блокировки
  blocked_topics UUID[] DEFAULT '{}',
  blocked_hashtags TEXT[] DEFAULT '{}',
  blocked_users UUID[] DEFAULT '{}',
  blocked_clubs UUID[] DEFAULT '{}',
  
  -- Временные рамки
  default_time_range VARCHAR(20) DEFAULT '7d', -- 24h, 7d, 30d, all
  
  -- Язык контента
  preferred_language VARCHAR(10) DEFAULT 'ru',
  show_multilingual BOOLEAN DEFAULT true,
  
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 10. POST_VIEWS (История просмотров для алгоритмов)
-- =============================================================================

CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  duration_seconds INTEGER DEFAULT 0, -- Время просмотра
  source VARCHAR(50) DEFAULT 'feed', -- feed, profile, topic, direct, notification
  
  UNIQUE(post_id, user_id, viewed_at)
);

CREATE INDEX IF NOT EXISTS idx_post_views_post ON post_views(post_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_views_user ON post_views(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_views_recent ON post_views(viewed_at DESC) WHERE viewed_at > now() - INTERVAL '30 days';

-- =============================================================================
-- 11. THREAD_SUBSCRIPTIONS (Подписки на ветки)
-- =============================================================================

CREATE TABLE IF NOT EXISTS thread_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  thread_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL, -- thread_id это post_id корня
  notify_new_replies BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, thread_id)
);

CREATE INDEX IF NOT EXISTS idx_thread_subs_user ON thread_subscriptions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_subs_thread ON thread_subscriptions(thread_id, created_at DESC);

-- =============================================================================
-- 12. POST_DRAFTS (Черновики)
-- =============================================================================

CREATE TABLE IF NOT EXISTS post_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Контент черновика
  content TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb,
  
  -- Связи
  reply_to_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  thread_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  
  -- Настройки
  visibility VARCHAR(20) DEFAULT 'public',
  selected_topics UUID[] DEFAULT '{}',
  
  -- Автосохранение
  autosaved_at TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drafts_user ON post_drafts(user_id, updated_at DESC);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Функция обновления счетчиков поста
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'like' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.type = 'repost' OR NEW.type = 'quote' THEN
      UPDATE posts SET reposts_count = reposts_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.type = 'save' THEN
      UPDATE posts SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'like' THEN
      UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    ELSIF OLD.type = 'repost' OR OLD.type = 'quote' THEN
      UPDATE posts SET reposts_count = GREATEST(0, reposts_count - 1) WHERE id = OLD.post_id;
    ELSIF OLD.type = 'save' THEN
      UPDATE posts SET bookmarks_count = GREATEST(0, bookmarks_count - 1) WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_interactions_counter ON post_interactions;
CREATE TRIGGER post_interactions_counter
  AFTER INSERT OR DELETE ON post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_counters();

-- Функция обновления comments_count при создании ответа
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_comments_count ON posts;
CREATE TRIGGER posts_comments_count
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_count();

-- Функция обновления posts_count в topics
CREATE OR REPLACE FUNCTION update_topic_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topics SET posts_count = posts_count + 1 WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topics SET posts_count = GREATEST(0, posts_count - 1) WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS topic_posts_count ON post_topics;
CREATE TRIGGER topic_posts_count
  AFTER INSERT OR DELETE ON post_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_posts_count();

-- Функция обновления followers_count
CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = GREATEST(0, COALESCE(followers_count, 0) - 1) WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS followers_count_trigger ON followers;
CREATE TRIGGER followers_count_trigger
  AFTER INSERT OR DELETE ON followers
  FOR EACH ROW
  EXECUTE FUNCTION update_followers_count();

-- =============================================================================
-- RLS POLICIES (Row Level Security)
-- =============================================================================

-- Включаем RLS для всех таблиц
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_drafts ENABLE ROW LEVEL SECURITY;

-- Posts: видят все активные публичные, авторы видят свои, клубы видят свои
CREATE POLICY posts_select_public ON posts
  FOR SELECT USING (
    status = 'active' AND 
    (visibility = 'public' OR 
     visibility = 'club_only' AND club_id IN (
       SELECT club_id FROM profiles WHERE id = auth.uid()
     ) OR
     author_id = auth.uid())
  );

CREATE POLICY posts_insert_own ON posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY posts_update_own ON posts
  FOR UPDATE USING (author_id = auth.uuid());

CREATE POLICY posts_delete_own ON posts
  FOR DELETE USING (author_id = auth.uid());

-- Topics: видят все активные
CREATE POLICY topics_select_active ON topics
  FOR SELECT USING (status = 'active');

-- Post interactions: пользователи видят свои
CREATE POLICY interactions_select_own ON post_interactions
  FOR SELECT USING (user_id = auth.uid() OR post_id IN (
    SELECT id FROM posts WHERE author_id = auth.uid()
  ));

CREATE POLICY interactions_insert_own ON post_interactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY interactions_delete_own ON post_interactions
  FOR DELETE USING (user_id = auth.uid());

-- Followers: видят свои подписки
CREATE POLICY followers_select_own ON followers
  FOR SELECT USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY followers_insert_own ON followers
  FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY followers_delete_own ON followers
  FOR DELETE USING (follower_id = auth.uid());

-- Notifications: только свои
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Drafts: только свои
CREATE POLICY drafts_select_own ON post_drafts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY drafts_insert_own ON post_drafts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY drafts_update_own ON post_drafts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY drafts_delete_own ON post_drafts
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Добавляем начальные темы (topics)
INSERT INTO topics (name, slug, description, icon, color, type, is_featured) VALUES
  ('Общее', 'general', 'Общие обсуждения о тренировках и спорте', 'MessageCircle', '#3146A6', 'general', true),
  ('Новичкам', 'beginners', 'Советы и поддержка для новичков', 'Sparkles', '#22c55e', 'general', true),
  ('Техника', 'technique', 'Обсуждение техники выполнения упражнений', 'Target', '#f59e0b', 'general', true),
  ('Питание', 'nutrition', 'Вопросы питания и диет', 'Apple', '#ef4444', 'general', true),
  ('Соревнования', 'competitions', 'Обсуждение соревнований и результатов', 'Trophy', '#8b5cf6', 'general', true),
  ('Снаряжение', 'equipment', 'Экипировка, перчатки, шингарты', 'ShoppingBag', '#06b6d4', 'general', false),
  ('Восстановление', 'recovery', 'Восстановление, травмы, реабилитация', 'Heart', '#ec4899', 'general', false),
  ('Мотивация', 'motivation', 'Истории успеха и мотивация', 'Flame', '#f97316', 'general', true)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
