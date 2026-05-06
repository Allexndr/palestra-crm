# 🎨 UI/UX Design - Palestra Social Network

## Дизайн-система социальной сети (Threads-like)

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HEADER (mobile hidden)                      │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│  SIDEBAR │                                                          │
│  (fixed) │                       MAIN CONTENT                        │
│  280px   │                    (feed / thread / profile)             │
│          │                                                          │
│          │                                                          │
│          │                                                          │
│          │                                                          │
├──────────┴──────────────────────────────────────────────────────────┤
│                    BOTTOM NAV (mobile only)                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Desktop**: 1280px+ (Sidebar + Main + RightPanel)
- **Tablet**: 768px-1279px (Sidebar collapsible)
- **Mobile**: <768px (Bottom nav only)

---

## 🎨 Design Tokens

### Colors
```css
/* Light Theme */
--bg-primary: #ffffff;
--bg-secondary: #f5f5f5;
--bg-tertiary: #fafafa;
--bg-hover: rgba(0, 0, 0, 0.03);
--bg-pressed: rgba(0, 0, 0, 0.06);

--text-primary: #000000;
--text-secondary: #717374;
--text-tertiary: #999999;
--text-link: #3146A6;
--text-inverse: #ffffff;

--border-primary: #e5e5e5;
--border-secondary: #f0f0f0;

--accent-primary: #3146A6;
--accent-hover: #4f5dd1;
--accent-light: rgba(49, 70, 166, 0.1);

--error: #ef4444;
--success: #22c55e;
--warning: #f59e0b;

/* Dark Theme */
--bg-primary: #101010;
--bg-secondary: #1a1a1a;
--bg-tertiary: #262626;
--bg-hover: rgba(255, 255, 255, 0.03);
--bg-pressed: rgba(255, 255, 255, 0.06);

--text-primary: #ffffff;
--text-secondary: #a1a1a1;
--text-tertiary: #666666;
--text-link: #4f5dd1;

--border-primary: #2a2a2a;
--border-secondary: #333333;

--accent-primary: #4f5dd1;
--accent-hover: #6b7de5;
--accent-light: rgba(79, 93, 209, 0.15);
```

### Typography
```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Sizes */
--text-xs: 12px;    /* Captions, timestamps */
--text-sm: 14px;    /* Secondary text */
--text-base: 15px;  /* Body text */
--text-lg: 16px;    /* Post content */
--text-xl: 20px;    /* Headings */
--text-2xl: 24px;   /* Page titles */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

### Shadows & Effects
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;

--transition-fast: 150ms ease;
--transition-normal: 250ms ease;
--transition-slow: 350ms ease;
```

---

## 📱 Screen Designs

### 1. Feed Screen (Main)

```
┌─────────────────────────────────────────┐
│  🏠 Для вас    👥 Подписки   🔥 Тренды │ ← Tabs
├─────────────────────────────────────────┤
│ [Avatar] Что нового?              [📷] │ ← Create prompt
├─────────────────────────────────────────┤
│ [Avatar] @username • 2ч [🏷️ Общее]     │
│ Текст поста здесь... #hashtag          │
│ @mention                               │
├─────────────────────────────────────────┤
│ [📷][📷][📷] Grid 3 images             │
├─────────────────────────────────────────┤
│ ❤️ 42  💬 12  🔄 5  🔖  ↗️           │ ← Actions
│ 3 ответа →                             │
├─────────────────────────────────────────┤
│ ...                                    │
│ ... следующие посты ...               │
│ ...                                    │
├─────────────────────────────────────────┤
│ ⬆️ Нажмите для обновления             │ ← Pull to refresh (mobile)
└─────────────────────────────────────────┘
```

**Components:**
- `FeedTabs` - Переключатель типов ленты
- `CreatePostPrompt` - Быстрое создание
- `PostCard` - Карточка поста
- `InfiniteScroll` - Бесконечная прокрутка
- `PullToRefresh` - Обновление свайпом

---

### 2. Post Card Component

```
┌─────────────────────────────────────────┐
│ ┌────┐ Name Lastname @handle • 2ч   [⋯] │ ← Header
│ │ 👤 │ 🏷️ Club Name / 🏷️ Topic          │
└─┴────┴──────────────────────────────────┘
│                                         │
│ Text content of the post with           │
│ #hashtags and @mentions highlighted     │
│                                         │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│ │         │ │         │ │         │     │ ← Media grid
│ │  IMAGE  │ │  IMAGE  │ │  IMAGE │     │
│ │         │ │         │ │         │     │
│ └─────────┘ └─────────┘ └─────────┘     │
├─────────────────────────────────────────┤
│ ❤️ 42    💬 12    🔄 5    🔖    ↗️     │ ← Actions
├─────────────────────────────────────────┤
│ ┌────┬────────────────────────────────  │
│ │ 👤 │ Reply text preview...            │ ← Top reply preview
│ └────┴────────────────────────────────  │
│ Смотреть все 12 комментариев →         │
└─────────────────────────────────────────┘
```

**States:**
- **Default** - Нормальное состояние
- **Liked** - Сердце заполнено красным
- **Reposted** - Иконка repost подсвечена
- **Saved** - Закладка заполнена
- **Expanded** - Развернутые комментарии
- **Thread** - Отображение ветки с линией

---

### 3. Create Post Modal

```
┌─────────────────────────────────────────┐
│ Отмена                    Новая ветка   │
├─────────────────────────────────────────┤
│ ┌────┐                                  │
│ │ 👤 │  Что нового?                    │
│ └────┘                                  │
│                                         │
│                                         │
│                                         │
│ ┌────┐ ┌────┐ ┌────┐                   │ ← Media previews
│ │ 📷 │ │ 📷 │ │ 📷 │                   │
│ └────┘ └────┘ └────┘                   │
│                                         │
├─────────────────────────────────────────┤
│ 🖼️  📹  😊  📎  🏷️  ⏱️              │ ← Toolbar
│                                         │
├─────────────────────────────────────────┤
│ Всем  [▼]              Опубликовать [→] │
└─────────────────────────────────────────┘
```

**Features:**
- Character counter (0/500)
- Media preview with remove button
- Drag to reorder media
- Topic selector dropdown
- Visibility selector (Public/Club/Followers)
- Autosave drafts

---

### 4. Thread Detail View

```
┌─────────────────────────────────────────┐
│ ←  Ветка "Topic Name"                   │
├─────────────────────────────────────────┤
│ ┌────┐ Root Post Author @handle • 5ч    │
│ │ 👤 │                                  │
│ └────┘                                  │
│ Root post content...                    │
│                                         │
│ ❤️ 128 💬 45 🔄 12                      │
├─────────────────────────────────────────┤
│                                         │
│   ┌────┐ Reply 1                        │
│   │ 👤 │ │                              │
│   └────┘ └─ Reply 1.1                   │
│               │                         │
│               └─ Reply 1.1.1            │
│                                         │
│   ┌────┐ Reply 2                        │
│   │ 👤 │                                │
│   └────┘                                │
│                                         │
├─────────────────────────────────────────┤
│ [Avatar] Ответить в ветку...            │
└─────────────────────────────────────────┘
```

**Features:**
- Thread line visualization
- Collapsible branches
- Jump to parent button
- Sort by (Popular / Newest)
- Highlight new replies

---

### 5. User Profile (Social Tab)

```
┌─────────────────────────────────────────┐
│ ┌────────────────────────────────────┐  │
│ │         Cover Image               │  │
│ │    ┌────┐                         │  │
│ │    │ 👤 │  Name Lastname         │  │
│ │    └────┘  @handle                │  │
│ │                                    │  │
│ │    Боец MMA | Тренер | 💪🏻       │  │
│ │    📍 Almaty, Kazakhstan          │  │
│ │                                    │  │
│ │    245 подписчиков • 128 подписок  │  │
│ │                                    │  │
│ │    [Редактировать профиль]         │  │
│ └────────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ Посты │ Ветки │ Медиа │ Отметки       │ ← Tabs
├─────────────────────────────────────────┤
│ [PostCard]                             │
│ [PostCard]                             │
│ [PostCard]                             │
└─────────────────────────────────────────┘
```

---

### 6. Notifications Screen

```
┌─────────────────────────────────────────┐
│ Уведомления                    [⋯]    │
├─────────────────────────────────────────┤
│ Сегодня                                 │
├─────────────────────────────────────────┤
│ ┌────┐ 👤 User liked your post         │
│ │ 👤 │    2 минуты назад • 🏷️ Общее   │
│ └────┘                                │
├─────────────────────────────────────────┤
│ ┌────┐ 💬 User replied in thread       │
│ │ 👤 │    "Great technique!..."        │
│ └────┘                                │
├─────────────────────────────────────────┤
│ ┌────┐ 🔄 User reposted your post      │
│ │ 👤 │    с цитатой: "Важный пост!"   │
│ └────┘                                │
├─────────────────────────────────────────┤
│ На этой неделе                          │
├─────────────────────────────────────────┤
│ ...                                   │
│ ...                                   │
└─────────────────────────────────────────┘
```

---

### 7. Search & Discovery

```
┌─────────────────────────────────────────┐
│ 🔍 Поиск...                     [⚙️]   │
├─────────────────────────────────────────┤
│ Тренды сейчас                           │
├─────────────────────────────────────────┤
│ 1. 🏷️ #SummerTraining        🔥 1.2K │
│ 2. 🏷️ #NewFighters           📈 856   │
│ 3. 🏷️ #TechniqueTuesday        642   │
│ ...                                    │
├─────────────────────────────────────────┤
│ Рекомендуемые темы                      │
├─────────────────────────────────────────┤
│ [🏷️ Техника] [🏷️ Соревнования]       │
│ [🏷️ Новичкам] [🏷️ Питание]           │
├─────────────────────────────────────────┤
│ Кого подписать                          │
├─────────────────────────────────────────┤
│ ┌────┐ Name @handle  [Подписаться]     │
│ │ 👤 │ • 245 followers • MMA fighter  │
│ └────┘                                │
│ ...                                   │
└─────────────────────────────────────────┘
```

---

### 8. Bottom Navigation (Mobile)

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              CONTENT AREA               │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ 🏠  🔍  ➕  🔔  👤                     │
│                                   🔴   │ ← Badge on notifications
└─────────────────────────────────────────┘

Icons:
- 🏠 Home (Feed)
- 🔍 Search
- ➕ Create (center, larger, accent color)
- 🔔 Notifications (with badge)
- 👤 Profile
```

---

### 9. Topic Detail Page

```
┌─────────────────────────────────────────┐
│ ←  🏷️ Техника                          │
├─────────────────────────────────────────┐
│ ┌────────────────────────────────────┐  │
│ │         🥊                         │  │
│ │       ТЕХНИКА                      │  │
│ │                                    │  │
│ │ Обсуждение техники выполнения     │  │
│ │ упражнений и приемов               │  │
│ │                                    │  │
│ │ 1,245 постов • 3.2K подписчиков   │  │
│ │                                    │  │
│ │ [✓ Подписаны]  [Поделиться]       │  │
│ └────────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ Популярное │ Новое                      │
├─────────────────────────────────────────┤
│ [PostCard]                             │
│ [PostCard]                             │
│ [PostCard]                             │
└─────────────────────────────────────────┘
```

---

## 🧩 Component Library

### PostCard
```typescript
interface PostCardProps {
  post: Post;
  variant?: 'default' | 'compact' | 'thread' | 'reply';
  showActions?: boolean;
  showReplies?: boolean;
  maxReplies?: number;
  onLike?: () => void;
  onReply?: () => void;
  onRepost?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}
```

### CreatePostModal
```typescript
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: Post; // For reply mode
  threadId?: string; // For adding to thread
  initialDraft?: Draft;
}
```

### ThreadView
```typescript
interface ThreadViewProps {
  rootPost: Post;
  sortBy?: 'popular' | 'newest';
  maxDepth?: number;
  onReply?: (post: Post) => void;
  onLoadMore?: () => void;
}
```

---

## 🎬 Animations & Interactions

### Micro-interactions
- **Like**: Heart pulse + scale (0.8 → 1.2 → 1.0)
- **Double-tap**: Heart overlay fade in/out
- **Pull-to-refresh**: Elastic bounce + spinner
- **Infinite scroll**: Skeleton shimmer → content fade
- **Image open**: Scale from thumbnail to fullscreen

### Transitions
```css
/* Page transition */
.page-enter { opacity: 0; transform: translateX(20px); }
.page-enter-active { opacity: 1; transform: translateX(0); transition: 250ms ease; }
.page-exit { opacity: 1; transform: translateX(0); }
.page-exit-active { opacity: 0; transform: translateX(-20px); transition: 250ms ease; }

/* Modal */
.modal-enter { opacity: 0; transform: scale(0.95); }
.modal-enter-active { opacity: 1; transform: scale(1); transition: 200ms ease; }

/* Thread line draw */
.thread-line { 
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 300ms ease forwards;
}
```

---

## 📐 Grid System

### Media Grid in Post
```
1 image:  [       FULL       ]

2 images: [   HALF   ][ HALF  ]

3 images: [  MAIN  ][ SMALL ]
          [        ][ SMALL ]

4 images: [ QUAD ][ QUAD ]
          [ QUAD ][ QUAD ]

5+ images: [ MAIN ][  GRID ]
           [      ][  GRID ]
           "+ N more" overlay
```

---

## 🌓 Dark Mode

All colors invert automatically based on system preference:
- Background: #ffffff → #101010
- Text: #000000 → #ffffff
- Borders: #e5e5e5 → #2a2a2a
- Images: Slight dimming (brightness 0.9)

---

## 📱 Mobile Optimizations

- Bottom safe area padding
- Touch targets min 44x44px
- Swipe gestures:
  - Left on post → Like
  - Right on post → Reply
  - Pull down → Refresh
  - Long press → Context menu
- Haptic feedback on interactions
- Image pinch-to-zoom

---

## 🎯 Accessibility

- WCAG 2.1 AA compliant
- Focus indicators visible
- Alt text for all images
- Keyboard navigation support
- Screen reader optimized
- Reduced motion support

---

## ✅ Checklist

### Phase 1: Core UI
- [ ] Design system setup
- [ ] Feed layout
- [ ] PostCard component
- [ ] Create post modal
- [ ] Thread view

### Phase 2: Interactions
- [ ] Like animation
- [ ] Comment threading
- [ ] Repost flow
- [ ] Share sheet

### Phase 3: Discovery
- [ ] Search UI
- [ ] Trending topics
- [ ] User suggestions
- [ ] Hashtag pages

### Phase 4: Profile
- [ ] Social profile
- [ ] Media grid
- [ ] Stats
- [ ] Settings

---

**Готово к разработке! 🚀**
